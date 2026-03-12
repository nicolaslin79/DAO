import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/config";
import { performDivination } from "@/lib/ai";
import { canUserPerformReading, decrementReadingCount } from "@/lib/user/service";
import prisma from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { number1, number2, number3, question } = body;

    // 输入验证 - 数字范围
    const MAX_NUMBER = 999999999;
    const MIN_NUMBER = 0;
    if (
      typeof number1 !== "number" ||
      typeof number2 !== "number" ||
      typeof number3 !== "number" ||
      !Number.isInteger(number1) ||
      !Number.isInteger(number2) ||
      !Number.isInteger(number3) ||
      number1 < MIN_NUMBER || number1 > MAX_NUMBER ||
      number2 < MIN_NUMBER || number2 > MAX_NUMBER ||
      number3 < MIN_NUMBER || number3 > MAX_NUMBER
    ) {
      return NextResponse.json(
        { error: "Invalid numbers. Please provide 3 integers between 0 and 999999999." },
        { status: 400 }
      );
    }

    // 输入验证 - 问题文本
    const MAX_QUESTION_LENGTH = 500;
    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }
    if (question.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json(
        { error: `Question must be less than ${MAX_QUESTION_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const accessCheck = await canUserPerformReading(session.user.id, session.user.locale || "zh");
    if (!accessCheck.allowed) {
      return NextResponse.json(
        { error: accessCheck.reason },
        { status: 403 }
      );
    }

    // 先执行AI占卜
    const result = await performDivination({
      number1,
      number2,
      number3,
      question: question.trim(),
      locale: session.user.locale || "zh",
    });

    // 使用事务安全的扣减函数 - 在创建记录之前
    const decrementResult = await decrementReadingCount(session.user.id);
    if (!decrementResult.success) {
      return NextResponse.json(
        { error: decrementResult.error || "Failed to update reading count" },
        { status: 403 }
      );
    }

    // 检查用户的记录数量，如果超过5条则删除最旧的
    const existingCount = await prisma.reading.count({
      where: { userId: session.user.id },
    });

    if (existingCount >= 5) {
      // 找到最旧的记录并删除
      const oldestReadings = await prisma.reading.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "asc" },
        take: existingCount - 4, // 保留4条，新加1条就是5条
        select: { id: true },
      });

      if (oldestReadings.length > 0) {
        await prisma.reading.deleteMany({
          where: {
            id: { in: oldestReadings.map((r) => r.id) },
          },
        });
      }
    }

    const reading = await prisma.reading.create({
      data: {
        userId: session.user.id,
        number1,
        number2,
        number3,
        question: question.trim(),
        hexagram: result.hexagram,
        result: JSON.stringify({
          interpretation: result.interpretation,
          advice: result.advice,
        }),
      },
    });

    return NextResponse.json({
      id: reading.id,
      hexagram: result.hexagram,
      interpretation: result.interpretation,
      advice: result.advice,
    });
  } catch (error) {
    console.error("Divination error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const readings = await prisma.reading.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.reading.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      readings: readings.map((r) => ({
        id: r.id,
        number1: r.number1,
        number2: r.number2,
        number3: r.number3,
        question: r.question,
        hexagram: r.hexagram,
        result: JSON.parse(r.result),
        createdAt: r.createdAt,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get readings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const readingId = searchParams.get("id");

    if (!readingId) {
      return NextResponse.json({ error: "Reading ID is required" }, { status: 400 });
    }

    // 验证该记录属于当前用户
    const reading = await prisma.reading.findFirst({
      where: {
        id: readingId,
        userId: session.user.id,
      },
    });

    if (!reading) {
      return NextResponse.json({ error: "Reading not found" }, { status: 404 });
    }

    await prisma.reading.delete({
      where: { id: readingId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete reading error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
