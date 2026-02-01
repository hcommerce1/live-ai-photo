import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get dates for the next 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);

    const designers = await prisma.user.findMany({
      where: { role: "DESIGNER" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        customRatePerGraphic: true,
        customRatePerRevision: true,
        _count: {
          select: {
            assignedTasks: true,
          },
        },
        assignedTasks: {
          select: {
            status: true,
          },
        },
        availability: {
          where: {
            date: {
              gte: today,
              lt: endDate,
            },
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
      orderBy: { createdAt: "desc" },
    });

    // Calculate stats for each designer
    const designersWithStats = designers.map((designer) => {
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
      };

      return {
        id: designer.id,
        name: designer.name,
        email: designer.email,
        image: designer.image,
        createdAt: designer.createdAt,
        customRatePerGraphic: designer.customRatePerGraphic,
        customRatePerRevision: designer.customRatePerRevision,
        _count: designer._count,
        stats,
        availability: designer.availability,
      };
    });

    return NextResponse.json({ designers: designersWithStats });
  } catch (error) {
    console.error("Error fetching designers:", error);
    return NextResponse.json(
      { error: "Failed to fetch designers" },
      { status: 500 }
    );
  }
}
