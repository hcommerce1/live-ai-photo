import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Props) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "DESIGNER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the assignment
    const assignment = await prisma.taskAssignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (assignment.designerId !== session.user.id) {
      return NextResponse.json(
        { error: "This assignment is not for you" },
        { status: 403 }
      );
    }

    if (assignment.status !== "PENDING") {
      return NextResponse.json(
        { error: "Assignment is no longer pending" },
        { status: 400 }
      );
    }

    // Reject the assignment
    await prisma.taskAssignment.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
      },
    });

    // TODO: Trigger queue processing to assign to next available designer
    // This would typically be handled by a cron job or background worker

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error rejecting assignment:", error);
    return NextResponse.json(
      { error: "Failed to reject assignment" },
      { status: 500 }
    );
  }
}
