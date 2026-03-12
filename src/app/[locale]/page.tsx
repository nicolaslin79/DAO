import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, BookOpen, Users } from "lucide-react";

// 多语言翻译
const translations = {
  zh: {
    title: "梅花易数",
    subtitle: "输入三个数字，让古老的周易智慧为您指引方向",
    startDivination: "开始占卜",
    viewPricing: "查看价格",
    features: "特色功能",
    tryQuestions: "试试这些问题",
    freeTrial: "免费体验",
    freeTrialDesc: "首次体验完全免费，立即开始您的占卜之旅",
    featuresList: [
      { title: "梅花易数", description: "源自宋代邵雍的古老占卜术，通过数字推演卦象变化" },
      { title: "周易智慧", description: "结合六十四卦象，解读人生百态" },
      { title: "隐私保护", description: "您的问题仅用于占卜，绝不外泄" },
    ],
    sampleQuestions: [
      "试着测算一下你丢失的钥匙现在在哪里？",
      "想知道你朋友手里藏着什么惊喜吗？",
      "测算一下明天面试的结果会如何？",
      "男朋友这会儿正在家里吗？",
    ],
  },
  en: {
    title: "Plum Blossom Numerology",
    subtitle: "Enter three numbers and let ancient I Ching wisdom guide you",
    startDivination: "Start Divination",
    viewPricing: "View Pricing",
    features: "Features",
    tryQuestions: "Try These Questions",
    freeTrial: "Free Trial",
    freeTrialDesc: "First experience is completely free. Start your divination journey now",
    featuresList: [
      { title: "Plum Blossom Numerology", description: "Ancient divination from Song Dynasty, using numbers to derive hexagrams" },
      { title: "I Ching Wisdom", description: "Combined with 64 hexagrams to interpret life situations" },
      { title: "Privacy Protected", description: "Your questions are only used for divination, never leaked" },
    ],
    sampleQuestions: [
      "Try calculating where your lost keys are now?",
      "Want to know what surprise your friend is hiding?",
      "Calculate how tomorrow's interview will go?",
      "Is my boyfriend at home right now?"
    ],
  },
  ja: {
    title: "梅花易数占い",
    subtitle: "3つの数字を入力し、古代の易経の知恵があなたを導きます",
    startDivination: "占いを始める",
    viewPricing: "料金を見る",
    features: "特徴",
    tryQuestions: "この質問を試してみよう",
    freeTrial: "無料体験",
    freeTrialDesc: "初回体験は完全無料です。今すぐ占いの旅を始めましょう",
    featuresList: [
      { title: "梅花易数", description: "宋代の邵雍から伝わる古代占術、数字から卦象を導く" },
      { title: "易経の知恵", description: "64卦を組み合わせて、人生の様々な状況を解釈" },
      { title: "プライバシー保護", description: "ご質問は占いのみに使用し、外部に漏洩しません" },
    ],
    sampleQuestions: [
      "失くした鍵が今どこにあるか計算してみよう",
      "友達が隠しているサプライズを知りたい？",
      "明日の面接の結果を占ってみよう",
      "彼氏は今家にいるかな？",
    ],
  },
  ko: {
    title: "매화역수",
    subtitle: "세 가지 숫자を 입력하고 고代 주역의 지혜로 인도를 받으세요",
    startDivination: "점술 시작",
    viewPricing: "요금 보기",
    features: "특징",
    tryQuestions: "이런 질문을 시도해 보세요",
    freeTrial: "무료 체험",
    freeTrialDesc: "첫 경험は 완전 무료입니다. 지금 바로 점술 여정を 시작하세요",
    featuresList: [
      { title: "매화역수", description: "송대 소옹에서 전해진 고대 점술, 숫자로 괘상을 도出" },
      { title: "주역의 지혜", description: "64괘를結合하여 인생의 다양한 상황 해석" },
      { title: "개인정보 보호", description: "질문은 점술에만 사용되며, 절대 유출되지 않습니다" },
    ],
    sampleQuestions: [
      "잃어버린 열쇠가 지금 어디 있는지 계산해 보세요",
      "친구가 숨기고 있는 깜짝 선물을 알고 싶으신가요?",
      "내일 면접 결과를 점쳐보세요",
      "남자친구가 지금 집에 있을까요?"
    ],
  },
};

const featureIcons = [Sparkles, BookOpen, Users];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="inline-block mb-6">
          <span className="text-7xl">☯️</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white font-serif-cn">
          {t.title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
          {t.subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/${locale}/divination`}>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-lg px-10 py-6 h-auto shadow-lg shadow-purple-500/30">
              {t.startDivination}
            </Button>
          </Link>
          <Link href={`/${locale}/pricing`}>
            <Button size="lg" variant="outline" className="text-lg px-10 py-6 h-auto border-2 border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20">
              {t.viewPricing}
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section - Horizontal Layout */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-900 dark:text-white">
          {t.features}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.featuresList.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-gray-700 hover:shadow-lg transition-shadow text-center">
                <CardContent className="pt-6 pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Sample Questions Section */}
      <section className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 mb-16 border border-purple-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          {t.tryQuestions}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {t.sampleQuestions.map((question, index) => (
            <div
              key={index}
              className="p-4 bg-purple-50 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-purple-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            >
              {question}
            </div>
          ))}
        </div>
      </section>

      {/* Free Trial Section */}
      <section className="text-center">
        <Card className="inline-block bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 border-purple-300 dark:border-purple-700">
          <CardContent className="p-6">
            <p className="text-lg text-gray-800 dark:text-gray-200 mb-4">
              {t.freeTrialDesc}
            </p>
            <Link href={`/${locale}/divination`}>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30">
                {t.freeTrial}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}