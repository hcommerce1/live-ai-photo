import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// Allowed MIME types for uploads
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"];

// Max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Valid priority values
const VALID_PRIORITIES = ["NORMAL", "EXPRESS", "URGENT"] as const;

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename: string): string {
  // Remove path components and keep only the filename
  const basename = path.basename(filename);
  // Remove any potentially dangerous characters
  return basename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // "all" | "mine"

    // Get user with company info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    });

    // Build where clause based on filter and company membership
    let whereClause: { userId?: string; user?: { companyId: string } };

    if (user?.companyId && filter === "all") {
      // User belongs to company - show all company orders
      whereClause = {
        user: { companyId: user.companyId },
      };
    } else {
      // Show only user's own orders
      whereClause = { userId: session.user.id };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        originalImages: true,
        finalImages: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: {
          include: {
            designer: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      orders,
      hasCompany: !!user?.companyId,
      companyName: user?.company?.name || null,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    // Extract and validate form fields
    const quantityRaw = parseInt(formData.get("quantity") as string);
    const quantity = isNaN(quantityRaw) || quantityRaw < 1 || quantityRaw > 100 ? 5 : quantityRaw;
    const instructions = formData.get("instructions") as string || "";
    const style = formData.get("style") as string || null;
    const platform = formData.get("platform") as string || null;
    const background = formData.get("background") as string || null;
    const format = formData.get("format") as string || "1:1";
    const constraintsStr = formData.get("constraints") as string || "[]";
    const priorityRaw = formData.get("priority") as string || "NORMAL";
    const priority = VALID_PRIORITIES.includes(priorityRaw as typeof VALID_PRIORITIES[number])
      ? priorityRaw
      : "NORMAL";

    // Validate constraints JSON
    try {
      JSON.parse(constraintsStr);
    } catch {
      return NextResponse.json(
        { error: "Invalid constraints format" },
        { status: 400 }
      );
    }

    // Dane dostawy (nadpisanie wartości z profilu)
    const deliveryEmailsOverride = formData.get("deliveryEmailsOverride") as string || null;
    const notificationPhoneOverride = formData.get("notificationPhoneOverride") as string || null;

    // Get all uploaded files with validation
    const files: File[] = [];
    const fileErrors: string[] = [];

    formData.forEach((value, key) => {
      if (key.startsWith("image") && value instanceof File) {
        // Validate file size
        if (value.size > MAX_FILE_SIZE) {
          fileErrors.push(`File ${value.name} exceeds maximum size of 10MB`);
          return;
        }

        // Validate MIME type
        if (!ALLOWED_MIME_TYPES.includes(value.type)) {
          fileErrors.push(`File ${value.name} has invalid type: ${value.type}`);
          return;
        }

        // Validate file extension
        const ext = path.extname(value.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          fileErrors.push(`File ${value.name} has invalid extension: ${ext}`);
          return;
        }

        files.push(value);
      }
    });

    if (fileErrors.length > 0) {
      return NextResponse.json(
        { error: "Invalid files", details: fileErrors },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // Get system settings for pricing
    let settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: "settings",
          pricePerGraphic: 4900,
          expressPriceMultiplier: 2.0,
          urgentPriceMultiplier: 4.0,
          designerRatePerGraphic: 2000,
          designerRatePerRevision: 500,
          minutesPerGraphic: 30,
          confirmationTimeout: 5,
          queueMode: "round_robin",
        },
      });
    }

    // Calculate price based on priority
    let priceMultiplier = 1.0;
    if (priority === "EXPRESS") {
      priceMultiplier = settings.expressPriceMultiplier;
    } else if (priority === "URGENT") {
      priceMultiplier = settings.urgentPriceMultiplier;
    }
    const priceInCents = Math.round(settings.pricePerGraphic * quantity * priceMultiplier);

    // Check for free credits using transaction to prevent race condition
    let usedFreeCredit = false;
    let creditsUsed = 0;

    // Check company free credits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    });

    if (user?.company && user.company.freeCredits > 0) {
      // Use transaction to atomically check and decrement credits
      const result = await prisma.$transaction(async (tx) => {
        const company = await tx.company.findUnique({
          where: { id: user.company!.id },
          select: { freeCredits: true },
        });

        if (company && company.freeCredits > 0) {
          await tx.company.update({
            where: { id: user.company!.id },
            data: { freeCredits: { decrement: 1 } },
          });
          return true;
        }
        return false;
      });

      if (result) {
        usedFreeCredit = true;
        creditsUsed = 1;
      }
    }

    // Create upload directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Save uploaded files and prepare image records
    const imageData: Array<{
      url: string;
      type: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
    }> = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitize and generate unique filename
      const sanitizedOriginalName = sanitizeFilename(file.name);
      const ext = path.extname(sanitizedOriginalName).toLowerCase() || ".jpg";
      // Validate extension again after sanitization
      const safeExt = ALLOWED_EXTENSIONS.includes(ext) ? ext : ".jpg";
      const filename = `${randomUUID()}${safeExt}`;
      const filepath = path.join(uploadsDir, filename);

      await writeFile(filepath, buffer);

      imageData.push({
        url: `/uploads/${filename}`,
        type: "ORIGINAL",
        filename: sanitizedOriginalName,
        mimeType: file.type,
        sizeBytes: file.size,
      });
    }

    // Create order with images and task
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: "PENDING_INPUT",
        sourceType: "UPLOAD",
        quantity,
        instructions,
        style,
        platform,
        background,
        format,
        constraints: constraintsStr,
        priority,
        priceInCents,
        usedFreeCredit,
        creditsUsed,
        deliveryEmailsOverride,
        notificationPhoneOverride,
        originalImages: {
          create: imageData,
        },
        tasks: {
          create: {
            status: "PENDING",
          },
        },
      },
      include: {
        originalImages: true,
        tasks: true,
      },
    });

    // Try to auto-assign to available designer
    await tryAutoAssignTask(order.tasks[0].id, settings.queueMode);

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

async function tryAutoAssignTask(taskId: string, queueMode: string) {
  try {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find available designers based on queue mode
    let designers;

    if (queueMode === "least_loaded") {
      // Get designers sorted by number of active tasks
      designers = await prisma.user.findMany({
        where: {
          role: "DESIGNER",
          availability: {
            some: {
              date: today,
              isAvailable: true,
              startTime: { lte: currentTime },
              endTime: { gte: currentTime },
            },
          },
        },
        include: {
          assignedTasks: {
            where: {
              status: { in: ["PENDING", "ASSIGNED", "IN_PROGRESS"] },
            },
          },
        },
        orderBy: {
          assignedTasks: { _count: "asc" },
        },
      });
    } else {
      // Round robin or priority - just get available designers
      designers = await prisma.user.findMany({
        where: {
          role: "DESIGNER",
          availability: {
            some: {
              date: today,
              isAvailable: true,
              startTime: { lte: currentTime },
              endTime: { gte: currentTime },
            },
          },
        },
      });
    }

    if (designers.length === 0) {
      console.log("No available designers found");
      return;
    }

    // Pick the first available designer
    const designer = designers[0];

    // Create assignment
    await prisma.taskAssignment.create({
      data: {
        taskId,
        designerId: designer.id,
        status: "PENDING",
      },
    });

    // Update task with assignment
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "ASSIGNED",
        assignedToId: designer.id,
        assignedAt: new Date(),
      },
    });

    console.log(`Task ${taskId} assigned to designer ${designer.email}`);
  } catch (error) {
    console.error("Error auto-assigning task:", error);
    // Don't throw - task will remain unassigned
  }
}
