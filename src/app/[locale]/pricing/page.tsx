"use client";

import { use, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { PRICING_PLANS, getPlanDisplayInfo } from "@/lib/payment/pricing";

export default function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // 多语言文本
  const t = {
    zh: {
      title: "选择您的方案",
      subtitle: "首次体验免费，选择适合您的方案，开启占卜之旅",
      popular: "最受欢迎",
      subscribe: "立即订阅",
      secure: "安全支付由 Stripe 提供，支持信用卡、借记卡等多种支付方式",
      month: "月",
      year: "年",
    },
    en: {
      title: "Choose Your Plan",
      subtitle: "First experience is free. Choose a plan that suits you and start your divination journey",
      popular: "Most Popular",
      subscribe: "Subscribe Now",
      secure: "Secure payments powered by Stripe. Supports credit cards, debit cards, and more",
      month: "mo",
      year: "yr",
    },
    ja: {
      title: "プランを選択",
      subtitle: "初回体験は無料。あなたに合ったプランを選んで占いの旅を始めましょう",
      popular: "人気No.1",
      subscribe: "今すぐ登録",
      secure: "Stripeによる安全な決済。クレジットカード、デビットカードなどに対応",
      month: "月",
      year: "年",
    },
    ko: {
      title: "플랜 선택",
      subtitle: "첫 경험은 무료입니다. 맞춤 플랜을 선택하고 점술 여정을 시작하세요",
      popular: "가장 인기",
      subscribe: "지금 구독",
      secure: "Stripe를 통한 안전한 결제. 신용카드, 직불카드 등 지원",
      month: "월",
      year: "년",
    },
  };

  const text = t[locale as keyof typeof t] || t.en;

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/pricing`);
      return;
    }

    setLoadingPlan(planId);

    try {
      const response = await fetch("/api/payment/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || text.subscribe);
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Payment error:", error);
      alert(text.subscribe);
      setLoadingPlan(null);
    }
  };

  const plans = PRICING_PLANS.map((plan) => {
    const displayInfo = getPlanDisplayInfo(plan, locale);
    return {
      ...plan,
      displayName: displayInfo.name,
      displayDescription: displayInfo.description,
      displayFeatures: displayInfo.features,
    };
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-serif-cn">
          {text.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {text.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex flex-col min-h-[480px] !overflow-visible border-2 ${
              plan.id === "monthly"
                ? "border-purple-400 dark:border-purple-600 ring-2 ring-purple-400 dark:ring-purple-600"
                : "border-purple-300 dark:border-purple-700"
            }`}
          >
            {plan.id === "monthly" && (
              <Badge className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 whitespace-nowrap px-3 z-10 shadow-md">
                {locale === "zh" ? "最受欢迎" : locale === "ja" ? "人気No.1" : locale === "ko" ? "가장 인기" : "Most Popular"}
              </Badge>
            )}
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-xl font-serif-cn">{plan.displayName}</CardTitle>
              <CardDescription>{plan.displayDescription}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ${plan.price}
                </span>
                {plan.interval && (
                  <span className="text-gray-500">
                    /{plan.interval === "month" ? text.month : text.year}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <ul className="space-y-3 mb-6 flex-grow">
                {plan.displayFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loadingPlan !== null}
                className="w-full mt-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                {loadingPlan === plan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  text.subscribe
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
        <p>{text.secure}</p>
      </div>
    </div>
  );
}
