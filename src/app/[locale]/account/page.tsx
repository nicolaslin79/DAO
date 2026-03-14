"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Loader2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

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
    prevPage: "上一页",
    nextPage: "下一页",
    page: "第{current}/{total}页",
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
    prevPage: "Previous",
    nextPage: "Next",
    page: "Page {current}/{total}",
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
    prevPage: "前へ",
    nextPage: "次へ",
    page: "{current}/{total}ページ",
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
    noReadings: "기록이 없습니다",
    view: "보기",
    validUntil: "유효기간",
    monthly: "월간",
    yearly: "연간",
    perUse: "1회",
    freeUser: "무료",
    confirmDelete: "이 기록을 삭제하시겠습니까?",
    deleteFailed: "삭제 실패",
    prevPage: "이전",
    nextPage: "다음",
    page: "{current}/{total}페이지",
  },
};

function getText(locale: string) {
  if (locale === "zh") return translations.zh;
  if (locale === "ja") return translations.ja;
  if (locale === "ko") return translations.ko;
  return translations.en;
}

function formatDate(date: string | Date, locale: string) {
  const d = new Date(date);
  const localeMap: Record<string, string> = {
    zh: "zh-CN",
    ja: "ja-JP",
    ko: "ko-KR",
    en: "en-US",
  };
  return d.toLocaleDateString(localeMap[locale] || "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function AccountContent({ locale }: { locale: string }) {
  const t = getText(locale);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReadings, setTotalReadings] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/auth/signin`);
      return;
    }

    if (status === "authenticated") {
      fetchReadings(currentPage);
    }
  }, [status, currentPage]);

  const fetchReadings = async (page: number) => {
    try {
      const response = await fetch(`/api/divination?page=${page}&limit=${pageSize}`);
      const data = await response.json();

      if (response.ok) {
        setReadings(data.readings || []);
        setTotalReadings(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch readings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/divination?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReadings(readings.filter((r) => r.id !== id));
        setTotalReadings(totalReadings - 1);
        if (readings.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchReadings(currentPage);
        }
      } else {
        alert(t.deleteFailed);
      }
    } catch (error) {
      alert(t.deleteFailed);
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-4" />
      </div>
    );
  }

  const subscription = session?.user?.subscription;
  const readingsLeft = subscription?.readingsLeft;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* 账户状态卡片 */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-gray-700 mb-6">
        <CardHeader>
          <CardTitle>{t.accountStatus}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300">{t.divinationCount}</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-purple-600">{totalReadings}</span>
                <span className="text-gray-500">{t.totalReadings}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-gray-600 dark:text-gray-300">{t.accountStatus}</span>
              <Badge variant={subscription?.status === "ACTIVE" ? "default" : "secondary"} className="bg-purple-500">
                {subscription?.status === "ACTIVE" ? (
                  <>
                    {subscription.plan === "MONTHLY"
                      ? t.monthly
                      : subscription.plan === "YEARLY"
                        ? t.yearly
                        : subscription.plan === "PER_USE"
                          ? t.perUse
                          : t.freeUser}
                    {readingsLeft !== null && `(${readingsLeft})`}
                  </>
                ) : (
                  t.freeUser
                )}
              </Badge>
            </div>
          </div>
          {subscription?.status === "ACTIVE" && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                {t.validUntil}: {formatDate(subscription.endDate, locale)}
              </p>
            </div>
          )}
          <div className="mt-6">
            <Button
              onClick={() => router.push(`/${locale}/pricing`)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {t.viewPlans}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 占卜历史卡片 */}
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
            <>
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
                          {formatDate(reading.createdAt, locale)}
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

              {/* 分页控件 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {t.prevPage}
                  </Button>
                  <span className="text-sm text-gray-600">
                    {t.page.replace("{current}", String(currentPage)).replace("{total}", String(totalPages))}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {t.nextPage}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600" /></div>}>
      <AccountContent locale={locale} />
    </Suspense>
  );
}
