"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, CreditCard, History, Loader2, Crown, Trash2 } from "lucide-react";

// 多语言翻译
const translations = {
  zh: {
    title: "我的账户",
    accountStatus: "账户状态",
    divinationCount: "占卜次数",
    totalReadings: "累计占卜",
    upgradeSubscription: "升级订阅",
    viewPlans: "查看方案",
    readingHistory: "占卜历史",
    recentReadings: "您最近的占卜记录",
    noReadings: "暂无占卜记录",
    view: "查看",
    validUntil: "有效期至",
    monthly: "月度会员",
    yearly: "年度会员",
    perUse: "按次付费",
    freeUser: "免费用户",
    confirmDelete: "确定要删除这条记录吗？",
    deleteFailed: "删除失败",
  },
  en: {
    title: "My Account",
    accountStatus: "Account Status",
    divinationCount: "Divination Count",
    totalReadings: "Total readings",
    upgradeSubscription: "Upgrade Subscription",
    viewPlans: "View Plans",
    readingHistory: "Reading History",
    recentReadings: "Your recent divination readings",
    noReadings: "No readings yet",
    view: "View",
    validUntil: "Valid until",
    monthly: "Monthly",
    yearly: "Yearly",
    perUse: "Per-Use",
    freeUser: "Free User",
    confirmDelete: "Are you sure you want to delete this reading?",
    deleteFailed: "Failed to delete",
  },
  ja: {
    title: "マイアカウント",
    accountStatus: "アカウント状態",
    divinationCount: "占い回数",
    totalReadings: "累計占い",
    upgradeSubscription: "プランをアップグレード",
    viewPlans: "プランを見る",
    readingHistory: "占い履歴",
    recentReadings: "最近の占い記録",
    noReadings: "占い記録がありません",
    view: "見る",
    validUntil: "有効期限",
    monthly: "月額会員",
    yearly: "年額会員",
    perUse: "単発購入",
    freeUser: "無料ユーザー",
    confirmDelete: "この記録を削除しますか？",
    deleteFailed: "削除に失敗しました",
  },
  ko: {
    title: "내 계정",
    accountStatus: "계정 상태",
    divinationCount: "점술 횟수",
    totalReadings: "총 점술",
    upgradeSubscription: "구독 업그레이드",
    viewPlans: "플랜 보기",
    readingHistory: "점술 기록",
    recentReadings: "최근 점술 기록",
    noReadings: "점술 기록 없음",
    view: "보기",
    validUntil: "유효 기간",
    monthly: "월간 회원",
    yearly: "연간 회원",
    perUse: "단발 구매",
    freeUser: "무료 사용자",
    confirmDelete: "이 기록을 삭제하시겠습니까?",
    deleteFailed: "삭제 실패",
  },
};

function getText(locale: string) {
  if (locale === "zh") return translations.zh;
  if (locale === "ja") return translations.ja;
  if (locale === "ko") return translations.ko;
  return translations.en;
}

interface UserSubscription {
  plan: string;
  status: string;
  endDate: string;
  readingsLeft: number | null;
}

interface ReadingHistory {
  id: string;
  question: string;
  hexagram: {
    mainHexagramName: string;
    changedHexagramName: string;
  };
  createdAt: string;
}

export default function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = getText(locale);
  const router = useRouter();
  const { data: session, status } = useSession();

  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [readings, setReadings] = useState<ReadingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync subscription from session
  useEffect(() => {
    if (session?.user?.subscription) {
      const sub = session.user.subscription;
      setSubscription({
        plan: sub.plan,
        status: sub.status,
        endDate: sub.endDate instanceof Date ? sub.endDate.toISOString() : sub.endDate,
        readingsLeft: sub.readingsLeft,
      });
    } else {
      setSubscription(null);
    }
  }, [session?.user?.subscription]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/account`);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch("/api/divination?limit=5");
        const data = await response.json();

        if (response.ok) {
          setReadings(data.readings || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, status, router, locale]);

  const handleDelete = async (readingId: string) => {
    if (!confirm(t.confirmDelete)) {
      return;
    }

    setDeletingId(readingId);
    try {
      const response = await fetch(`/api/divination?id=${readingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReadings((prev) => prev.filter((r) => r.id !== readingId));
      } else {
        alert(t.deleteFailed);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(t.deleteFailed);
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" />
      </div>
    );
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "MONTHLY":
        return <Badge className="bg-blue-500">{t.monthly}</Badge>;
      case "YEARLY":
        return <Badge className="bg-purple-500">{t.yearly}</Badge>;
      case "PER_USE":
        return <Badge className="bg-green-500">{t.perUse}</Badge>;
      default:
        return <Badge variant="outline">{t.freeUser}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const dateLocale = locale === "zh" ? "zh-CN" : locale === "ja" ? "ja-JP" : locale === "ko" ? "ko-KR" : "en-US";
    return new Date(dateString).toLocaleDateString(dateLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 font-serif-cn">
        {t.title}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.accountStatus}
            </CardTitle>
            <Crown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription ? getPlanBadge(subscription.plan) : getPlanBadge("FREE")}
            </div>
            {subscription?.status === "ACTIVE" && (
              <p className="text-xs text-gray-500 mt-2">
                {t.validUntil}: {formatDate(subscription.endDate)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.divinationCount}
            </CardTitle>
            <History className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readings.length}</div>
            <p className="text-xs text-gray-500">
              {t.totalReadings}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t.upgradeSubscription}
            </CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push(`/${locale}/pricing`)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {t.viewPlans}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>{t.readingHistory}</CardTitle>
          <CardDescription>
            {t.recentReadings}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {readings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t.noReadings}
            </div>
          ) : (
            <div className="space-y-4">
              {readings.map((reading, index) => (
                <div key={reading.id}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                        {reading.question}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {reading.hexagram.mainHexagramName} → {reading.hexagram.changedHexagramName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(reading.createdAt)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/${locale}/result?id=${reading.id}`)}
                      >
                        {t.view}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(reading.id)}
                        disabled={deletingId === reading.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        {deletingId === reading.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
