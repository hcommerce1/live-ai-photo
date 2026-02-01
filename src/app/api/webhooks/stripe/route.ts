import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { metadata } = session;

  if (!metadata) {
    console.error("No metadata in checkout session");
    return;
  }

  const type = metadata.type;

  if (type === "order") {
    // Handle order payment
    const orderId = metadata.orderId;

    if (!orderId) {
      console.error("No orderId in metadata");
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        stripePaymentIntentId: session.payment_intent as string,
        status: "GENERATING", // Move to next status
      },
    });

    console.log(`Order ${orderId} marked as paid`);
  } else if (type === "package") {
    // Handle package purchase
    const packageId = metadata.packageId;
    const userId = metadata.userId;
    const photoCount = parseInt(metadata.photoCount || "0");

    if (!packageId || !userId) {
      console.error("Missing packageId or userId in metadata");
      return;
    }

    await prisma.packagePurchase.create({
      data: {
        userId,
        packageId,
        creditsLeft: photoCount,
        stripePaymentIntentId: session.payment_intent as string,
      },
    });

    console.log(`Package purchase created for user ${userId}`);
  }
}

// Next.js App Router configuration
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
