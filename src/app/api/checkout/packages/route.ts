import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { packageId } = body;

    if (!packageId) {
      return NextResponse.json(
        { error: "Package ID is required" },
        { status: 400 }
      );
    }

    // Get package
    const pkg = await prisma.photoPackage.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    if (!pkg.isActive) {
      return NextResponse.json(
        { error: "Package is not available" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "blik", "p24"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "pln",
            product_data: {
              name: `Pakiet ${pkg.name}`,
              description: `${pkg.photoCount} grafik - ${(pkg.pricePerPhoto / 100).toFixed(0)} PLN/szt.`,
            },
            unit_amount: pkg.totalPrice,
          },
          quantity: 1,
        },
      ],
      metadata: {
        packageId: pkg.id,
        userId: session.user.id,
        photoCount: pkg.photoCount.toString(),
        type: "package",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/packages?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/packages?canceled=true`,
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Package checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
