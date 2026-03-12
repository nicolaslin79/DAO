import type { Metadata } from "next";
import { Noto_Serif_SC, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-serif-cn",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "梅花易数 - AI占卜",
  description: "基于中国古老梅花易数的AI智能占卜，为您解答人生疑惑",
  keywords: ["梅花易数", "占卜", "周易", "易经", "AI占卜", "八卦"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        className={`${notoSerifSC.variable} ${inter.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
