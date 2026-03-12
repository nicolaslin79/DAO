"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Share2, Download, Loader2 } from "lucide-react";
import { HexagramData } from "@/types";

interface ReadingResult {
  id: string;
  hexagram: HexagramData;
  interpretation: string;
  advice: string;
  question: string;
  createdAt: string;
}

function ResultContent({ locale }: { locale: string }) {
  const isZh = locale === "zh";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [reading, setReading] = useState<ReadingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const readingId = searchParams.get("id");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/auth/signin`);
      return;
    }

    if (!readingId) {
      setError(isZh ? "未找到占卜记录" : "Reading not found");
      setLoading(false);
      return;
    }

    const fetchReading = async () => {
      try {
        const response = await fetch(`/api/divination`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || (isZh ? "获取记录失败" : "Failed to fetch reading"));
        }

        const found = data.readings?.find((r: ReadingResult) => r.id === readingId);
        if (found) {
          setReading({
            ...found,
            interpretation: found.result.interpretation,
            advice: found.result.advice,
          });
        } else {
          setError(isZh ? "未找到占卜记录" : "Reading not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : (isZh ? "获取记录失败" : "Failed to fetch reading"));
      } finally {
        setLoading(false);
      }
    };

    fetchReading();
  }, [readingId, status, router, locale, isZh]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-pulse">
          <div className="text-6xl mb-4">☯️</div>
          <p className="text-gray-600 dark:text-gray-300">
            {isZh ? "正在解读卦象..." : "Interpreting hexagram..."}
          </p>
        </div>
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">❌</div>
        <p className="text-red-600 dark:text-red-400 mb-4">{error || (isZh ? "加载失败" : "Loading failed")}</p>
        <Button onClick={() => router.push(`/${locale}/divination`)}>
          {isZh ? "重新占卜" : "Divine Again"}
        </Button>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: isZh ? "梅花易数占卜结果" : "Meihua Divination Result",
          text: `${isZh ? "我的问题是" : "My question"}: ${reading.question}\n${isZh ? "主卦" : "Main Hexagram"}: ${reading.hexagram.mainHexagramName}`,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">☯️</span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-serif-cn">
          {isZh ? "占卜结果" : "Divination Result"}
        </h1>
      </div>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{isZh ? "您的问题" : "Your Question"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-200 text-lg">{reading.question}</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-300 dark:border-purple-700 mb-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-serif-cn">
            {isZh ? "卦象" : "Hexagram"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <Badge variant="secondary" className="mb-2">
                {isZh ? "主卦" : "Main"}
              </Badge>
              <p className="text-3xl font-bold text-purple-800 dark:text-purple-300 font-serif-cn">
                {reading.hexagram.mainHexagramName}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {isZh ? "上卦" : "Upper"}: {reading.hexagram.upperTrigramName} |{" "}
                {isZh ? "下卦" : "Lower"}: {reading.hexagram.lowerTrigramName}
              </p>
            </div>
            <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <Badge variant="secondary" className="mb-2">
                {isZh ? "变卦" : "Changed"}
              </Badge>
              <p className="text-3xl font-bold text-indigo-800 dark:text-indigo-300 font-serif-cn">
                {reading.hexagram.changedHexagramName}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {isZh ? "动爻" : "Moving Line"}: {isZh ? "第" : "Line "} {reading.hexagram.movingLine} {isZh ? "爻" : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-gray-700 mb-6">
        <CardHeader>
          <CardTitle>{isZh ? "卦象解读" : "Hexagram Interpretation"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            {reading.interpretation.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 dark:text-gray-200 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-gray-700 mb-6">
        <CardHeader>
          <CardTitle className="text-purple-700 dark:text-purple-400">
            {isZh ? "大师建议" : "Master's Advice"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            {reading.advice.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-2 text-gray-700 dark:text-gray-200">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" onClick={() => router.push(`/${locale}/divination`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isZh ? "再次占卜" : "Divine again"}
        </Button>
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          {isZh ? "分享结果" : "Share Result"}
        </Button>
        <Button variant="outline" onClick={() => router.push(`/${locale}/account`)}>
          <Download className="mr-2 h-4 w-4" />
          {isZh ? "查看历史" : "View History"}
        </Button>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-4" />
      <p className="text-gray-600 dark:text-gray-300">Loading...</p>
    </div>
  );
}

export default function ResultPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResultContent locale={locale} />
    </Suspense>
  );
}
