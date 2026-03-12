import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalReadings,
      activeSubscriptions,
      recentUsers,
      recentReadings,
      totalRevenueResult,
      recentRevenueResult,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.reading.count(),
      prisma.subscription.count({
        where: { status: "ACTIVE", endDate: { gt: now } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.reading.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.order.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
      prisma.order.aggregate({
        where: {
          status: "completed",
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { amount: true },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalReadings,
      activeSubscriptions,
      recentUsers,
      recentReadings,
      totalRevenue: totalRevenueResult._sum.amount || 0,
      recentRevenue: recentRevenueResult._sum.amount || 0,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
