import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const locales = ["zh", "en", "ja", "ko"] as const;
type Locale = (typeof locales)[number];

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 via-indigo-50 to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header locale={locale} />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
