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
      include: { task: true },
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

    // Check if assignment has expired
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
    });
    const timeout = settings?.confirmationTimeout || 5;
    const expiresAt = new Date(assignment.assignedAt);
    expiresAt.setMinutes(expiresAt.getMinutes() + timeout);

    if (new Date() > expiresAt) {
      // Mark as expired
      await prisma.taskAssignment.update({
        where: { id },
        data: { status: "EXPIRED", expiredAt: new Date() },
      });
      return NextResponse.json(
        { error: "Assignment has expired" },
        { status: 400 }
      );
    }

    // Confirm the assignment
    await prisma.$transaction([
      // Update assignment status
      prisma.taskAssignment.update({
        where: { id },
        data: {
          status: "CONFIRMED",
          confirmedAt: new Date(),
        },
      }),
      // Update task
      prisma.task.update({
        where: { id: assignment.taskId },
        data: {
          status: "ASSIGNED",
          assignedToId: session.user.id,
          assignedAt: new Date(),
          currentAssignmentId: id,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error confirming assignment:", error);
    return NextResponse.json(
      { error: "Failed to confirm assignment" },
      { status: 500 }
    );
  }
}
