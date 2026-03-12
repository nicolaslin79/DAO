import prisma from "@/lib/db/prisma";
import { UserWithSubscription } from "@/types";

// 多语言错误消息
const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  zh: {
    userNotFound: "用户不存在",
    noReadingsLeft: "按次付费次数已用完",
    noActiveSubscription: "没有有效订阅且免费试用已使用",
    firstFreeReading: "首次免费占卜",
    unlimitedActive: "无限订阅有效",
    transactionFailed: "事务执行失败",
  },
  en: {
    userNotFound: "User not found",
    noReadingsLeft: "No readings left in per-use plan",
    noActiveSubscription: "No active subscription and free trial used",
    firstFreeReading: "First free reading",
    unlimitedActive: "Unlimited subscription active",
    transactionFailed: "Transaction failed",
  },
};

export async function getUserWithSubscription(userId: string): Promise<UserWithSubscription | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    locale: user.locale,
    freeUsed: user.freeUsed,
    subscription: user.subscription
      ? {
          plan: user.subscription.plan,
          status: user.subscription.status,
          endDate: user.subscription.endDate,
          readingsLeft: user.subscription.readingsLeft,
        }
      : null,
  };
}

export async function canUserPerformReading(
  userId: string,
  locale: string = "zh"
): Promise<{ allowed: boolean; reason: string }> {
  const user = await getUserWithSubscription(userId);
  const messages = ERROR_MESSAGES[locale] || ERROR_MESSAGES.zh;

  if (!user) {
    return { allowed: false, reason: messages.userNotFound };
  }

  if (user.subscription?.status === "ACTIVE" && user.subscription.endDate > new Date()) {
    if (user.subscription.plan === "PER_USE") {
      if (user.subscription.readingsLeft && user.subscription.readingsLeft > 0) {
        return { allowed: true, reason: messages.unlimitedActive };
      }
      return { allowed: false, reason: messages.noReadingsLeft };
    }
    return { allowed: true, reason: messages.unlimitedActive };
  }

  if (!user.freeUsed) {
    return { allowed: true, reason: messages.firstFreeReading };
  }

  return { allowed: false, reason: messages.noActiveSubscription };
}

export async function decrementReadingCount(
  userId: string,
  locale: string = "zh"
): Promise<{ success: boolean; error?: string }> {
  const messages = ERROR_MESSAGES[locale] || ERROR_MESSAGES.zh;

  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          freeUsed: true,
          subscription: {
            select: {
              id: true,
              plan: true,
              readingsLeft: true,
              status: true,
              endDate: true,
            },
          },
        },
      });

      if (!user) {
        return { success: false, error: messages.userNotFound };
      }

      // 检查免费次数
      if (!user.freeUsed) {
        await tx.user.update({
          where: { id: userId },
          data: { freeUsed: true },
        });
        return { success: true };
      }

      // 检查按次付费
      if (user.subscription?.plan === "PER_USE" && user.subscription.readingsLeft) {
        if (user.subscription.readingsLeft <= 0) {
          return { success: false, error: messages.noReadingsLeft };
        }
        await tx.subscription.update({
          where: { id: user.subscription.id },
          data: { readingsLeft: { decrement: 1 } },
        });
        return { success: true };
      }

      // 检查无限订阅
      if (
        user.subscription?.status === "ACTIVE" &&
        user.subscription.endDate > new Date() &&
        (user.subscription.plan === "MONTHLY" || user.subscription.plan === "YEARLY")
      ) {
        return { success: true };
      }

      return { success: false, error: messages.noActiveSubscription };
    }, {
      maxWait: 5000,
      timeout: 10000,
    });
  } catch (error) {
    console.error("decrementReadingCount error:", error);
    return { success: false, error: messages.transactionFailed };
  }
}

export async function getUsers(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        subscription: true,
        _count: { select: { readings: true, orders: true } },
      },
    }),
    prisma.user.count(),
  ]);

  return {
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      subscription: u.subscription,
      readingsCount: u._count.readings,
      ordersCount: u._count.orders,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
