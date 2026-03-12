import Stripe from "stripe";
import { PRICING_PLANS } from "./pricing";

// 延迟初始化 Stripe，避免构建时失败
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

export { getStripe };

export async function createCheckoutSession({
  userId,
  email,
  planId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  email: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const plan = PRICING_PLANS.find((p) => p.id === planId);
  if (!plan || !plan.stripePriceId) {
    throw new Error("Invalid plan or missing Stripe price ID");
  }

  const session = await getStripe().checkout.sessions.create({
    mode: plan.interval ? "subscription" : "payment",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price: plan.stripePriceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      planId,
    },
  });

  return session;
}

export async function handleSubscriptionWebhook(event: Stripe.Event) {
  const stripe = getStripe();
  const prisma = (await import("@/lib/db/prisma")).default;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;

      if (!userId || !planId) break;

      const plan = PRICING_PLANS.find((p) => p.id === planId);
      if (!plan) break;

      const now = new Date();
      let endDate: Date;
      let readingsLeft: number | null = null;

      switch (planId) {
        case "per_use":
          endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          readingsLeft = 1;
          break;
        case "monthly":
          endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        case "yearly":
          endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      }

      await prisma.order.create({
        data: {
          userId,
          stripeSessionId: session.id,
          amount: plan.price,
          currency: plan.currency,
          status: "completed",
          plan: planId.toUpperCase() as "PER_USE" | "MONTHLY" | "YEARLY",
        },
      });

      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { userId },
          data: {
            plan: planId.toUpperCase() as "PER_USE" | "MONTHLY" | "YEARLY",
            status: "ACTIVE",
            startDate: now,
            endDate,
            readingsLeft,
            stripeSubscriptionId: session.subscription as string,
          },
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId,
            plan: planId.toUpperCase() as "PER_USE" | "MONTHLY" | "YEARLY",
            status: "ACTIVE",
            startDate: now,
            endDate,
            readingsLeft,
            stripeSubscriptionId: session.subscription as string,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: "CANCELLED" },
      });
      break;
    }
  }
}
