import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const designerId = searchParams.get("designer");
    const companyId = searchParams.get("company");

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.order = { ...where.order, priority };
    }

    if (designerId) {
      where.assignedToId = designerId;
    }

    if (companyId) {
      where.order = {
        ...where.order,
        user: { companyId },
      };
    }

    const [tasks, stats] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          order: {
            include: {
              user: {
                include: {
                  company: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          designer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      // Get stats
      prisma.task.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    // Format stats
    const formattedStats = {
      pending: 0,
      assigned: 0,
      inProgress: 0,
      qaPending: 0,
      completed: 0,
      complaint: 0,
      total: 0,
    };

    stats.forEach((s) => {
      formattedStats.total += s._count.status;
      switch (s.status) {
        case "PENDING":
          formattedStats.pending = s._count.status;
          break;
        case "ASSIGNED":
          formattedStats.assigned = s._count.status;
          break;
        case "IN_PROGRESS":
          formattedStats.inProgress = s._count.status;
          break;
        case "QA_PENDING":
          formattedStats.qaPending = s._count.status;
          break;
        case "COMPLETED":
          formattedStats.completed = s._count.status;
          break;
        case "COMPLAINT":
          formattedStats.complaint = s._count.status;
          break;
      }
    });

    return NextResponse.json({ tasks, stats: formattedStats });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
