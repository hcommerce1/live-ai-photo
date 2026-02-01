import Stripe from "stripe";

// Lazy initialization to prevent build-time errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

// Helper to format amount for Stripe (converts PLN to grosze)
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

// Helper to format amount from Stripe (converts grosze to PLN)
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}

// Get or create Stripe customer for user
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string | null
): Promise<string> {
  try {
    const { prisma } = await import("@/lib/db");

    // Check if user has a subscription with stripeCustomerId
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    });

    if (subscription?.stripeCustomerId) {
      return subscription.stripeCustomerId;
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        userId,
      },
    });

    return customer.id;
  } catch (error) {
    console.error("Error getting or creating Stripe customer:", error);
    throw new Error("Failed to get or create Stripe customer");
  }
}

// Calculate order price based on settings and priority
export async function calculateOrderPrice(
  quantity: number,
  priority: "NORMAL" | "EXPRESS" | "URGENT"
): Promise<number> {
  try {
    const { prisma } = await import("@/lib/db");

    const settings = await prisma.systemSettings.findUnique({
      where: { id: "settings" },
    });

    const basePrice = settings?.pricePerGraphic || 4900; // 49 PLN default
    let multiplier = 1;

    switch (priority) {
      case "EXPRESS":
        multiplier = settings?.expressPriceMultiplier || 2.0;
        break;
      case "URGENT":
        multiplier = settings?.urgentPriceMultiplier || 4.0;
        break;
    }

    return Math.round(basePrice * multiplier * quantity);
  } catch (error) {
    console.error("Error calculating order price:", error);
    // Return default price calculation on error
    const basePrice = 4900;
    const multipliers = { NORMAL: 1, EXPRESS: 2.0, URGENT: 4.0 };
    return Math.round(basePrice * multipliers[priority] * quantity);
  }
}
