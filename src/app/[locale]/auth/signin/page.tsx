"use client";

import { Suspense, use, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

function SignInContent({ locale }: { locale: string }) {
  const isZh = locale === "zh";
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}`;

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || (isZh ? "注册失败" : "Registration failed"));
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(isZh ? "邮箱或密码错误" : "Invalid email or password");
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : (isZh ? "操作失败" : "Operation failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 block">☯️</span>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-serif-cn">
          {isZh ? (isRegister ? "注册账户" : "登录") : (isRegister ? "Create Account" : "Sign In")}
        </h1>
      </div>

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>{isZh ? (isRegister ? "创建新账户" : "欢迎回来") : (isRegister ? "Create New Account" : "Welcome Back")}</CardTitle>
          <CardDescription>
            {isZh
              ? (isRegister ? "注册即可开始您的占卜之旅" : "登录以继续您的占卜之旅")
              : (isRegister ? "Sign up to start your divination journey" : "Sign in to continue your journey")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">{isZh ? "姓名" : "Name"}</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{isZh ? "邮箱" : "Email"}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{isZh ? "密码" : "Password"}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                isZh ? (isRegister ? "注册" : "登录") : (isRegister ? "Sign Up" : "Sign In")
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              {isRegister
                ? (isZh ? "已有账户？立即登录" : "Already have an account? Sign in")
                : (isZh ? "没有账户？立即注册" : "Don't have an account? Sign up")}
            </button>
          </div>

          <Separator className="my-6" />

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isZh ? "使用 Google 登录" : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
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

export default function SignInPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignInContent locale={locale} />
    </Suspense>
  );
}
