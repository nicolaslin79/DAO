import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 安全头部配置
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // 防止点击劫持
          { key: "X-Frame-Options", value: "DENY" },
          // 防止MIME类型嗅探
          { key: "X-Content-Type-Options", value: "nosniff" },
          // XSS保护
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // 引用策略
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // 权限策略
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // 内容安全策略（根据需要调整）
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.deepseek.com https://api.stripe.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // 实验性功能
  experimental: {
    // 优化包大小
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
