import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "DESIGNER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get system settings for confirmation timeout
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
    });

    const confirmationTimeout = settings?.confirmationTimeout || 5;

    // Get pending assignments for this designer
    const assignments = await prisma.taskAssignment.findMany({
      where: {
        designerId: session.user.id,
        status: "PENDING",
        // Only show assignments that haven't expired yet
        assignedAt: {
          gte: new Date(Date.now() - confirmationTimeout * 60 * 1000),
        },
      },
      include: {
        task: {
          include: {
            order: {
              include: {
                user: {
                  include: {
                    company: {
                      select: { name: true },
                    },
                  },
                },
                originalImages: {
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { assignedAt: "asc" },
    });

    return NextResponse.json({
      assignments,
      confirmationTimeout,
    });
  } catch (error) {
    console.error("Error fetching pending assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending assignments" },
      { status: 500 }
    );
  }
}
