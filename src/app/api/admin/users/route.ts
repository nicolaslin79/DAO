import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/config";
import { getUsers } from "@/lib/user/service";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // 安全解析分页参数，防止无效输入和过大值
    const pageParam = parseInt(searchParams.get("page") || "1");
    const limitParam = parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT));

    const page = Math.max(1, isNaN(pageParam) ? 1 : pageParam);
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, isNaN(limitParam) ? DEFAULT_LIMIT : limitParam)
    );

    const result = await getUsers(page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
