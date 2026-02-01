import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get dates for the next 14 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 14);

    // Get all designers with their availability
    const designers = await prisma.user.findMany({
      where: { role: "DESIGNER" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        availability: {
          where: {
            date: {
              gte: today,
              lte: endDate,
            },
            isAvailable: true,
          },
          orderBy: [
            { date: "asc" },
            { startTime: "asc" },
          ],
        },
      },
    });

    return NextResponse.json({ designers });
  } catch (error) {
    console.error("Error fetching calendar:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar" },
      { status: 500 }
    );
  }
}
