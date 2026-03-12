import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// 需要管理员权限的路由
const adminRoutes = ["/admin"];

// 需要登录的路由
const protectedRoutes = ["/divination", "/result", "/account", "/pricing"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl?.pathname || "";

  // 检查是否是管理员路由
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute) {
    const token = await getToken({ req: request });

    // 未登录
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // 非管理员
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = await getToken({ req: request });

    // 未登录
    if (!token) {
      const signInUrl = new URL("/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     * - public 文件夹中的文件
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|api/|public/).*)",
  ],
};
