"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, User, LogOut, Menu, Sparkles, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

interface HeaderProps {
  locale: string;
}

// 多语言翻译
const translations = {
  zh: {
    brand: "梅花易数",
    navDivination: "占卜",
    navPricing: "价格",
    navAdmin: "后台管理",
    navAccount: "账户",
    navLogout: "退出",
    navSignOut: "退出登录",
    navSignIn: "登录",
  },
  en: {
    brand: "Meihua",
    navDivination: "Divination",
    navPricing: "Pricing",
    navAdmin: "Admin",
    navAccount: "Account",
    navLogout: "Logout",
    navSignOut: "Sign Out",
    navSignIn: "Sign In",
  },
  ja: {
    brand: "梅花易数",
    navDivination: "占い",
    navPricing: "料金",
    navAdmin: "管理画面",
    navAccount: "アカウント",
    navLogout: "ログアウト",
    navSignOut: "ログアウト",
    navSignIn: "ログイン",
  },
  ko: {
    brand: "매화역수",
    navDivination: "점술",
    navPricing: "요금",
    navAdmin: "관리",
    navAccount: "내 계정",
    navLogout: "로그아웃",
    navSignOut: "로그아웃",
    navSignIn: "로그인",
  },
};

const getText = (locale: string) => {
  const t = translations[locale as keyof typeof translations] || translations.en;
  return t;
};

export default function Header({ locale }: HeaderProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = getText(locale);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-purple-200/50 dark:border-gray-700/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-purple-600 dark:text-purple-300 hover:text-purple-500 transition-colors"
        >
          <span className="text-2xl font-serif-cn font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {t.brand}
          </span>
        </Link>

        {/* Navigation links with better quality - more prominent */}
        <nav className="hidden md:flex items-center gap-3">
          <Link
            href={`/${locale}/divination`}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium text-sm shadow-lg shadow-violet-500/30 hover:shadow-violet-700 hover:scale-105 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-violet-200" />
            {t.navDivination}
          </Link>
          <Link
            href={`/${locale}/pricing`}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-700 hover:scale-105 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            {t.navPricing}
          </Link>
          {session?.user?.role === "ADMIN" && (
            <Link
              href={`/${locale}/admin`}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/30 hover:shadow-indigo-700 hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              {t.navAdmin}
            </Link>
          )}
        </nav>

        {/* Theme toggle and language switch */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
          >
            {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>

          {/* Language switch */}
          <div className="flex items-center gap-1">
            {["zh", "en", "ja", "ko"].map((lang) => (
              <Link
                key={lang}
                href={`/${lang}`}
                className={`text-sm px-2.5 py-1 rounded-md font-medium transition-all duration-200 ${
                  locale === lang
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50"
                }`}
              >
                {lang.toUpperCase()}
              </Link>
            ))}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-2 ml-2">
            {session ? (
              <>
                <Link
                  href={`/${locale}/account`}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">{session.user?.name || session.user?.email}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  {t.navSignOut}
                </Button>
              </>
            ) : (
              <Link
                href={`/${locale}/auth/signin?callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}
              >
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-700 hover:scale-105 transition-all duration-200">
                  {t.navSignIn}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 dark:text-gray-200"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-purple-200/50 dark:border-gray-700/50 px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-3">
            <Link
              href={`/${locale}/divination`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium shadow-lg shadow-violet-500/30"
            >
              <Sparkles className="w-5 h-5" />
              {t.navDivination}
            </Link>
            <Link
              href={`/${locale}/pricing`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium shadow-lg shadow-purple-500/30"
            >
              <Sparkles className="w-5 h-5" />
              {t.navPricing}
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link
                href={`/${locale}/admin`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/30"
              >
                <Sparkles className="w-5 h-5" />
                {t.navAdmin}
              </Link>
            )}
          </nav>

          <div className="flex items-center justify-between pt-4 border-t border-purple-200/50 dark:border-gray-700/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>

            <div className="flex items-center gap-1">
              {["zh", "en", "ja", "ko"].map((lang) => (
                <Link
                  key={lang}
                  href={`/${lang}`}
                  className={`text-sm px-2 py-1 rounded ${
                    locale === lang
                      ? "bg-purple-600 text-white"
                      : "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                  }`}
                >
                  {lang.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-purple-200/50 dark:border-gray-700/50">
            {session ? (
              <div className="flex flex-col gap-3">
                <Link
                  href={`/${locale}/account`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
                >
                  <User className="w-5 h-5" />
                  <span>{session.user?.name || session.user?.email}</span>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: `/${locale}` });
                  }}
                  className="justify-start text-gray-600 dark:text-gray-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t.navSignOut}
                </Button>
              </div>
            ) : (
              <Link
                href={`/${locale}/auth/signin?callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '')}`}
                onClick={() => setMenuOpen(false)}
              >
                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  {t.navSignIn}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
