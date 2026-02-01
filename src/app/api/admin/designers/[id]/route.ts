import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const designer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        customRatePerGraphic: true,
        customRatePerRevision: true,
        assignedTasks: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            order: {
              select: {
                id: true,
                quantity: true,
                priority: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        availability: {
          where: {
            date: { gte: new Date() },
            isAvailable: true,
          },
          select: {
            date: true,
            startTime: true,
            endTime: true,
          },
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!designer || designer.role !== "DESIGNER") {
      return NextResponse.json({ error: "Designer not found" }, { status: 404 });
    }

    // Calculate stats
    const stats = {
      pending: designer.assignedTasks.filter((t) =>
        ["PENDING", "ASSIGNED"].includes(t.status)
      ).length,
      inProgress: designer.assignedTasks.filter(
        (t) => t.status === "IN_PROGRESS"
      ).length,
      completed: designer.assignedTasks.filter(
        (t) => t.status === "COMPLETED"
      ).length,
      complaints: designer.assignedTasks.filter(
        (t) => t.status === "COMPLAINT"
      ).length,
    };

    return NextResponse.json({
      designer: {
        ...designer,
        stats,
      },
    });
  } catch (error) {
    console.error("Error fetching designer:", error);
    return NextResponse.json(
      { error: "Failed to fetch designer" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { customRatePerGraphic, customRatePerRevision, name } = body;

    // Verify designer exists
    const existingDesigner = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!existingDesigner || existingDesigner.role !== "DESIGNER") {
      return NextResponse.json({ error: "Designer not found" }, { status: 404 });
    }

    const designer = await prisma.user.update({
      where: { id },
      data: {
        customRatePerGraphic,
        customRatePerRevision,
        ...(name && { name }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        customRatePerGraphic: true,
        customRatePerRevision: true,
      },
    });

    return NextResponse.json({ designer });
  } catch (error) {
    console.error("Error updating designer:", error);
    return NextResponse.json(
      { error: "Failed to update designer" },
      { status: 500 }
    );
  }
}
