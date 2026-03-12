import { PricingPlan } from "@/types";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "per_use",
    name: "单次测算",
    nameEn: "Single Reading",
    nameJa: "単発占い",
    nameKo: "단발 점술",
    price: 9,
    currency: "usd",
    description: "一次深度占卜解读",
    descriptionEn: "One in-depth divination reading",
    descriptionJa: "1回の詳細な占い鑑定",
    descriptionKo: "1회 심층 점술 해석",
    features: ["一次完整解读", "详细卦象分析", "AI智能解读", "永久保存记录"],
    featuresEn: ["One complete reading", "Detailed hexagram analysis", "AI-powered interpretation", "Permanent record storage"],
    featuresJa: ["1回完全鑑定", "詳細な卦象分析", "AI搭載解釈", "記録の永久保存"],
    featuresKo: ["1회 완전 해석", "상세 괘상 분석", "AI 기반 해석", "영구 기록 저장"],
    stripePriceId: process.env.STRIPE_PER_USE_PRICE_ID || "",
  },
  {
    id: "monthly",
    name: "月度会员",
    nameEn: "Monthly Subscription",
    nameJa: "月額会員",
    nameKo: "월간 회원",
    price: 19,
    currency: "usd",
    description: "每日50次占卜解读",
    descriptionEn: "50 readings per day",
    descriptionJa: "毎日50回の占い鑑定",
    descriptionKo: "매일 50회 점술 해석",
    features: ["每日50次解读", "优先响应", "详细卦象分析", "AI智能解读", "永久保存记录", "专属客服"],
    featuresEn: ["50 readings per day", "Priority response", "Detailed hexagram analysis", "AI-powered interpretation", "Permanent record storage", "Dedicated support"],
    featuresJa: ["毎日50回鑑定", "優先対応", "詳細な卦象分析", "AI搭載解釈", "記録の永久保存", "専用サポート"],
    featuresKo: ["매일 50회 해석", "우선 응답", "상세 괘상 분석", "AI 기반 해석", "영구 기록 저장", "전용 지원"],
    stripePriceId: process.env.STRIPE_MONTHLY_PRICE_ID || "",
    interval: "month",
  },
  {
    id: "yearly",
    name: "年度会员",
    nameEn: "Yearly Subscription",
    nameJa: "年額会員",
    nameKo: "연간 회원",
    price: 199,
    currency: "usd",
    description: "每日100次最佳性价比",
    descriptionEn: "100 readings per day, best value",
    descriptionJa: "毎日100回、最もお得な選択",
    descriptionKo: "매일 100회, 최고 가성비",
    features: ["每日100次解读", "优先响应", "详细卦象分析", "AI智能解读", "永久保存记录", "专属客服", "省$100+"],
    featuresEn: ["100 readings per day", "Priority response", "Detailed hexagram analysis", "AI-powered interpretation", "Permanent record storage", "Dedicated support", "Save $100+"],
    featuresJa: ["毎日100回鑑定", "優先対応", "詳細な卦象分析", "AI搭載解釈", "記録の永久保存", "専用サポート", "$100以上お得"],
    featuresKo: ["매일 100회 해석", "우선 응답", "상세 괘상 분석", "AI 기반 해석", "영구 기록 저장", "전용 지원", "$100+ 절약"],
    stripePriceId: process.env.STRIPE_YEARLY_PRICE_ID || "",
    interval: "year",
  },
];

export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.id === planId);
}

export function getPlanByStripePriceId(priceId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.stripePriceId === priceId);
}

// 根据语言获取计划显示信息
export function getPlanDisplayInfo(plan: PricingPlan, locale: string) {
  switch (locale) {
    case "zh":
      return {
        name: plan.name,
        description: plan.description,
        features: plan.features,
      };
    case "ja":
      return {
        name: plan.nameJa || plan.nameEn,
        description: plan.descriptionJa || plan.descriptionEn,
        features: plan.featuresJa || plan.featuresEn,
      };
    case "ko":
      return {
        name: plan.nameKo || plan.nameEn,
        description: plan.descriptionKo || plan.descriptionEn,
        features: plan.featuresKo || plan.featuresEn,
      };
    default:
      return {
        name: plan.nameEn,
        description: plan.descriptionEn,
        features: plan.featuresEn,
      };
  }
}
