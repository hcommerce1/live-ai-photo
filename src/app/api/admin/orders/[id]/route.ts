import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendOrderCompletedSMS, getNotificationPhone } from "@/lib/sms";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            company: {
              select: {
                id: true,
                name: true,
                nip: true,
              },
            },
          },
        },
        tasks: {
          include: {
            designer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        originalImages: true,
        finalImages: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Admin order detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Get the current order to check status change
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            notificationPhone: true,
          },
        },
      },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const previousStatus = currentOrder.status;

    // Update order
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === "COMPLETED" && { deliveredAt: new Date() }),
      },
    });

    // Send SMS notification if status changed to COMPLETED
    if (status === "COMPLETED" && previousStatus !== "COMPLETED") {
      const phone = await getNotificationPhone(
        currentOrder.notificationPhoneOverride,
        currentOrder.user.notificationPhone
      );

      if (phone) {
        // Send SMS asynchronously (don't wait for it)
        sendOrderCompletedSMS(phone, order.id).catch((err) => {
          console.error("Failed to send order completed SMS:", err);
        });
      }
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
