import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only designers can access their availability
    if (session.user.role !== "DESIGNER") {
      return NextResponse.json({ error: "Forbidden - only designers can access this" }, { status: 403 });
    }

    const availability = await prisma.designerAvailability.findMany({
      where: {
        designerId: session.user.id,
        date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ availability });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
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

    // Only designers can save their availability
    if (session.user.role !== "DESIGNER") {
      return NextResponse.json({ error: "Forbidden - only designers can save availability" }, { status: 403 });
    }

    const body = await request.json();
    const { availability } = body;

    if (!availability || !Array.isArray(availability)) {
      return NextResponse.json(
        { error: "Invalid availability data" },
        { status: 400 }
      );
    }

    // Group slots by date
    const slotsByDate: Record<string, typeof availability> = {};
    for (const item of availability) {
      const dateKey = item.date.split("T")[0];
      if (!slotsByDate[dateKey]) {
        slotsByDate[dateKey] = [];
      }
      slotsByDate[dateKey].push(item);
    }

    // For each date: delete existing slots and create new ones
    const results = [];
    for (const [dateKey, slots] of Object.entries(slotsByDate)) {
      const date = new Date(dateKey);
      date.setHours(0, 0, 0, 0);

      // Delete all existing slots for this date
      await prisma.designerAvailability.deleteMany({
        where: {
          designerId: session.user.id,
          date,
        },
      });

      // Create new slots (only if there are available slots)
      const availableSlots = slots.filter((s: any) => s.isAvailable !== false);

      if (availableSlots.length > 0) {
        const created = await prisma.designerAvailability.createMany({
          data: availableSlots.map((slot: any) => ({
            designerId: session.user.id,
            date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isAvailable: true,
          })),
        });
        results.push({ date: dateKey, created: created.count });
      } else {
        results.push({ date: dateKey, created: 0 });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Error saving availability:", error);
    return NextResponse.json(
      { error: "Failed to save availability" },
      { status: 500 }
    );
  }
}
