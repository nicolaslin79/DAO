import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/config";
import { createCheckoutSession, PRICING_PLANS } from "@/lib/payment";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId } = body;

    if (!planId || !PRICING_PLANS.find((p) => p.id === planId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const locale = session.user.locale || "zh";
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await createCheckoutSession({
      userId: session.user.id,
      email: session.user.email,
      planId,
      successUrl: `${baseUrl}/${locale}/account?payment=success`,
      cancelUrl: `${baseUrl}/${locale}/pricing?payment=cancelled`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Create checkout session error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
