"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";

// 多语言翻译
const translations = {
  zh: {
    title: "梅花易数占卜",
    subtitle: "静心冥想，输入三个数字和您想问之事",
    castHexagram: "起卦",
    description: "在心中默念您想问之事，然后输入任意三个数字",
    firstNumber: "第一数",
    secondNumber: "第二数",
    thirdNumber: "第三数",
    generateRandom: "随机生成数字",
    yourQuestion: "您想问之事",
    questionPlaceholder: "例如：我的事业发展如何？最近会遇见什么人？...",
    divining: "正在占卜...",
    startDivination: "开始占卜",
    enterValidNumbers: "请输入有效的数字",
    enterQuestion: "请输入您想测算的问题",
    divinationFailed: "占卜失败",
    tryAgain: "占卜失败，请重试",
    footer: "梅花易数由宋代邵雍所创，通过数字起卦，结合周易六十四卦进行预测",
  },
  en: {
    title: "Plum Blossom Divination",
    subtitle: "Clear your mind, enter three numbers and your question",
    castHexagram: "Cast Hexagram",
    description: "Focus on your question in your mind, then enter any three numbers",
    firstNumber: "First Number",
    secondNumber: "Second Number",
    thirdNumber: "Third Number",
    generateRandom: "Generate Random Numbers",
    yourQuestion: "Your Question",
    questionPlaceholder: "E.g., How will my career develop? Who will I meet soon?...",
    divining: "Divining...",
    startDivination: "Start Divination",
    enterValidNumbers: "Please enter valid numbers",
    enterQuestion: "Please enter your question",
    divinationFailed: "Divination failed",
    tryAgain: "Divination failed, please try again",
    footer: "Plum Blossom Numerology was created by Shao Yong in the Song Dynasty, using numbers to derive hexagrams from the I Ching",
  },
  ja: {
    title: "梅花易数占い",
    subtitle: "心を静めて、3つの数字と質問を入力してください",
    castHexagram: "卦を立てる",
    description: "心の中で質問を念じながら、任意の3つの数字を入力してください",
    firstNumber: "第一の数",
    secondNumber: "第二の数",
    thirdNumber: "第三の数",
    generateRandom: "ランダム生成",
    yourQuestion: "あなたの質問",
    questionPlaceholder: "例：私の仕事の運命はどうなりますか？いつ誰に会えますか？...",
    divining: "占い中...",
    startDivination: "占いを始める",
    enterValidNumbers: "有効な数字を入力してください",
    enterQuestion: "質問を入力してください",
    divinationFailed: "占いに失敗しました",
    tryAgain: "占いに失敗しました。もう一度お試しください",
    footer: "梅花易数は宋代の邵雍によって創始され、数字から卦を導き出し、易経の六十四卦を用いて占います",
  },
  ko: {
    title: "매화역수 점술",
    subtitle: "마음을 가라앉히고 세 개의 숫자와 질문을 입력하세요",
    castHexagram: "괘 세우기",
    description: "마음속으로 질문을 생각하면서 세 개의 숫자를 입력하세요",
    firstNumber: "첫 번째 수",
    secondNumber: "두 번째 수",
    thirdNumber: "세 번째 수",
    generateRandom: "무작위 생성",
    yourQuestion: "당신의 질문",
    questionPlaceholder: "예: 내 경력은 어떻게 될까요? 누구를 만나게 될까요?...",
    divining: "점술 중...",
    startDivination: "점술 시작",
    enterValidNumbers: "유효한 숫자를 입력하세요",
    enterQuestion: "질문을 입력하세요",
    divinationFailed: "점술 실패",
    tryAgain: "점술에 실패했습니다. 다시 시도하세요",
    footer: "매화역수는 송대 소옹이 창시했으며, 숫자로 괘를 도출하고 주역 64괘를 사용하여 점을 봅니다",
  },
};

function getText(locale: string) {
  if (locale === "zh") return translations.zh;
  if (locale === "ja") return translations.ja;
  if (locale === "ko") return translations.ko;
  return translations.en;
}

export default function DivinationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = getText(locale);
  const router = useRouter();
  const { data: session, status } = useSession();

  const [number1, setNumber1] = useState("");
  const [number2, setNumber2] = useState("");
  const [number3, setNumber3] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (status === "unauthenticated") {
    router.push(`/${locale}/auth/signin?callbackUrl=/${locale}/divination`);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const n1 = parseInt(number1);
      const n2 = parseInt(number2);
      const n3 = parseInt(number3);

      if (isNaN(n1) || isNaN(n2) || isNaN(n3)) {
        throw new Error(t.enterValidNumbers);
      }

      if (!question.trim()) {
        throw new Error(t.enterQuestion);
      }

      const response = await fetch("/api/divination", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number1: n1,
          number2: n2,
          number3: n3,
          question: question.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.divinationFailed);
      }

      router.push(`/${locale}/result?id=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.tryAgain);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomNumbers = () => {
    setNumber1(Math.floor(Math.random() * 1000).toString());
    setNumber2(Math.floor(Math.random() * 1000).toString());
    setNumber3(Math.floor(Math.random() * 100).toString());
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">☯️</span>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 font-serif-cn">
          {t.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t.subtitle}
        </p>
      </div>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>{t.castHexagram}</CardTitle>
          <CardDescription>
            {t.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="number1">
                  {t.firstNumber}
                </Label>
                <Input
                  id="number1"
                  type="number"
                  value={number1}
                  onChange={(e) => setNumber1(e.target.value)}
                  placeholder="0-999"
                  required
                  className="text-center text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number2">
                  {t.secondNumber}
                </Label>
                <Input
                  id="number2"
                  type="number"
                  value={number2}
                  onChange={(e) => setNumber2(e.target.value)}
                  placeholder="0-999"
                  required
                  className="text-center text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number3">
                  {t.thirdNumber}
                </Label>
                <Input
                  id="number3"
                  type="number"
                  value={number3}
                  onChange={(e) => setNumber3(e.target.value)}
                  placeholder="0-99"
                  required
                  className="text-center text-lg"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateRandomNumbers}
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t.generateRandom}
            </Button>

            <div className="space-y-2">
              <Label htmlFor="question">
                {t.yourQuestion}
              </Label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t.questionPlaceholder}
                required
                className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg py-6 shadow-lg shadow-purple-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t.divining}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t.startDivination}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          {t.footer}
        </p>
      </div>
    </div>
  );
}
