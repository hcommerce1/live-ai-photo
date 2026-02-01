import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, calculateOrderPrice } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: { company: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.isPaid) {
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 400 }
      );
    }

    // Check for free credits
    const company = order.user.company;
    if (company && company.freeCredits > 0 && order.quantity <= company.freeCredits) {
      // Use free credits
      await prisma.$transaction([
        prisma.company.update({
          where: { id: company.id },
          data: { freeCredits: { decrement: order.quantity } },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: {
            isPaid: true,
            usedFreeCredit: true,
            creditsUsed: order.quantity,
            priceInCents: 0,
            status: "GENERATING",
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        usedFreeCredits: true,
        message: "Wykorzystano darmowe kredyty",
      });
    }

    // Check for package credits
    const packagePurchase = await prisma.packagePurchase.findFirst({
      where: {
        userId: session.user.id,
        creditsLeft: { gte: order.quantity },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    if (packagePurchase) {
      // Use package credits
      await prisma.$transaction([
        prisma.packagePurchase.update({
          where: { id: packagePurchase.id },
          data: { creditsLeft: { decrement: order.quantity } },
        }),
        prisma.order.update({
          where: { id: orderId },
          data: {
            isPaid: true,
            creditsUsed: order.quantity,
            priceInCents: 0,
            status: "GENERATING",
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        usedPackageCredits: true,
        message: "Wykorzystano kredyty z pakietu",
      });
    }

    // Calculate price
    const priceInCents = await calculateOrderPrice(
      order.quantity,
      order.priority as "NORMAL" | "EXPRESS" | "URGENT"
    );

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "blik", "p24"],
      customer_email: order.user.email,
      line_items: [
        {
          price_data: {
            currency: "pln",
            product_data: {
              name: `Zamówienie #${order.id.slice(-6)}`,
              description: `${order.quantity} grafik${order.quantity > 1 ? "i" : "a"} - ${order.priority}`,
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order.id,
        userId: session.user.id,
        type: "order",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${order.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${order.id}?canceled=true`,
    });

    // Update order with price
    await prisma.order.update({
      where: { id: orderId },
      data: { priceInCents },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
