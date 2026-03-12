import Link from "next/link";

interface FooterProps {
  locale: string;
}

// 多语言翻译
const translations = {
  zh: {
    brand: "梅花易数",
    description: "融合古老周易智慧与现代AI技术，为您提供精准的人生指引",
    quickLinks: "快速链接",
    language: "语言",
    navDivination: "开始占卜",
    navPricing: "价格方案",
    navAccount: "我的账户",
    copyright: "保留所有权利",
    disclaimer: "本站仅供娱乐参考，不构成任何实际建议",
  },
  en: {
    brand: "Meihua Divination",
    description: "Combining ancient I Ching wisdom with modern AI technology for precise life guidance",
    quickLinks: "Quick Links",
    language: "Language",
    navDivination: "Start Divination",
    navPricing: "Pricing Plans",
    navAccount: "My Account",
    copyright: "All rights reserved",
    disclaimer: "This site is for entertainment purposes only and does not constitute actual advice",
  },
  ja: {
    brand: "梅花易数",
    description: "古代の易経の知恵と現代のAI技術を融合し、的確な人生の指針を提供します",
    quickLinks: "クイックリンク",
    language: "言語",
    navDivination: "占いを始める",
    navPricing: "料金プラン",
    navAccount: "マイアカウント",
    copyright: "無断転載禁止",
    disclaimer: "当サイトは娯楽目的のみであり、実際のアドバイスを構成するものではありません",
  },
  ko: {
    brand: "매화역수",
    description: "고대 주역의 지혜와 현대 AI 기술을 결합하여 정확한 인생 가이드를 제공합니다",
    quickLinks: "빠른 링크",
    language: "언어",
    navDivination: "점술 시작",
    navPricing: "요금제",
    navAccount: "내 계정",
    copyright: "모든 권리 보유",
    disclaimer: "이 사이트는 오락 목적이며 실제 조언을 구성하지 않습니다",
  },
}

function getText(locale: string) {
  if (locale === "zh") return translations.zh;
  if (locale === "ja") return translations.ja;
  if (locale === "ko") return translations.ko;
  return translations.en;
}

export default function Footer({ locale }: FooterProps) {
  const year = new Date().getFullYear();
  const t = getText(locale);

  return (
    <footer className="bg-gray-900 text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">☯️</span>
              <span className="text-xl font-bold text-white font-serif-cn">
                {t.brand}
              </span>
            </div>
            <p className="text-sm text-gray-400">
              {t.description}
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              {t.quickLinks}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link href={`/${locale}/divination`} className="hover:text-purple-400 transition-colors">
                {t.navDivination}
              </Link>
              <Link href={`/${locale}/pricing`} className="hover:text-purple-400 transition-colors">
                {t.navPricing}
              </Link>
              <Link href={`/${locale}/account`} className="hover:text-purple-400 transition-colors">
                {t.navAccount}
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">
              {t.language}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link href="/zh" className="hover:text-purple-400 transition-colors">
                中文
              </Link>
              <Link href="/en" className="hover:text-purple-400 transition-colors">
                English
              </Link>
              <Link href="/ja" className="hover:text-purple-400 transition-colors">
                日本語
              </Link>
              <Link href="/ko" className="hover:text-purple-400 transition-colors">
                한국어
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p>
            © {year} {t.brand}. {t.copyright}.
          </p>
          <p className="mt-2 text-xs">
            {t.disclaimer}
          </p>
        </div>
      </div>
    </footer>
  );
}
