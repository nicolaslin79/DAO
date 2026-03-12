import { DivinationInput, DivinationResult, HexagramData, TRIGRAM_NAMES, HEXAGRAM_NAMES } from "@/types";

const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

function calculateHexagram(num1: number, num2: number, num3: number): HexagramData {
  const upperTrigram = num1 % 8;
  const lowerTrigram = num2 % 8;
  const movingLine = num3 % 6;

  if (movingLine === 0) {
    (num3 % 6) + 1;
  }

  const actualMovingLine = movingLine === 0 ? 6 : movingLine;

  const mainHexagramBinary = [
    (upperTrigram >> 2) & 1,
    (upperTrigram >> 1) & 1,
    upperTrigram & 1,
    (lowerTrigram >> 2) & 1,
    (lowerTrigram >> 1) & 1,
    lowerTrigram & 1,
  ].join("");

  const changedBits = mainHexagramBinary.split("");
  changedBits[6 - actualMovingLine] = changedBits[6 - actualMovingLine] === "0" ? "1" : "0";
  const changedHexagramBinary = changedBits.join("");

  const locale = "zh";

  return {
    upperTrigram,
    lowerTrigram,
    movingLine: actualMovingLine,
    upperTrigramName: TRIGRAM_NAMES[locale]?.[upperTrigram] || TRIGRAM_NAMES.en[upperTrigram],
    lowerTrigramName: TRIGRAM_NAMES[locale]?.[lowerTrigram] || TRIGRAM_NAMES.en[lowerTrigram],
    mainHexagram: mainHexagramBinary,
    changedHexagram: changedHexagramBinary,
    mainHexagramName: HEXAGRAM_NAMES[locale]?.[mainHexagramBinary] || HEXAGRAM_NAMES.en[mainHexagramBinary] || "未知卦象",
    changedHexagramName: HEXAGRAM_NAMES[locale]?.[changedHexagramBinary] || HEXAGRAM_NAMES.en[changedHexagramBinary] || "未知卦象",
  };
}

function buildSystemPrompt(locale: string = "zh"): string {
  if (locale === "zh") {
    return `你是一位精通中国周易梅花易数的大师。你的任务是根据用户提供的数字和问题进行占卜解读。

梅花易数起卦规则：
1. 上卦 = 第1个数字 % 8 （结果0-7对应八卦：坤、乾、兑、离、震、巽、坎、艮）
2. 下卦 = 第2个数字 % 8
3. 动爻 = 第3个数字 % 6 （结果1-6，如果为0则取6）

八卦对应数字：
- 0: 坤（地）
- 1: 乾（天）
- 2: 兑（泽）
- 3: 离（火）
- 4: 震（雷）
- 5: 巽（风）
- 6: 坎（水）
- 7: 艮（山）

解读要求：
1. 先说明主卦和变卦的卦象含义
2. 结合用户的问题，分析卦象的吉凶
3. 给出具体的建议和指引
4. 语言要通俗易懂，但保留周易的哲学内涵
5. 最后用一句话总结预测结果

请用JSON格式返回结果，格式如下：
{
  "interpretation": "详细的卦象解读（包括主卦变卦含义、吉凶分析）",
  "advice": "具体的建议和指引"
}`;
  }

  return `You are a master of Chinese I Ching (Book of Changes) and Plum Blossom Numerology. Your task is to interpret divination readings based on numbers provided by the user.

Plum Blossom Numerology Rules:
1. Upper Trigram = 1st number % 8 (0-7 corresponds to: Kun, Qian, Dui, Li, Zhen, Xun, Kan, Gen)
2. Lower Trigram = 2nd number % 8
3. Moving Line = 3rd number % 6 (1-6, if 0 then 6)

Eight Trigrams:
- 0: Kun (Earth)
- 1: Qian (Heaven)
- 2: Dui (Lake)
- 3: Li (Fire)
- 4: Zhen (Thunder)
- 5: Xun (Wind)
- 6: Kan (Water)
- 7: Gen (Mountain)

Interpretation Requirements:
1. Explain the meaning of the main hexagram and changed hexagram
2. Analyze the fortune based on the user's question
3. Provide specific advice and guidance
4. Use accessible language while preserving I Ching's philosophical depth
5. End with a one-sentence summary

Return the result in JSON format:
{
  "interpretation": "Detailed hexagram interpretation (including meanings, fortune analysis)",
  "advice": "Specific advice and guidance"
}`;
}

function buildUserPrompt(input: DivinationInput, hexagram: HexagramData, locale: string = "zh"): string {
  if (locale === "zh") {
    // 新的提示词格式：简洁直接
    return `用${input.number1}、${input.number2}、${input.number3}这三个数起卦，用周易算数测算一下，${input.question}`;

    // 旧的提示词格式（保留备用）：
    // return `用户问题：${input.question}
    //
    // 起卦数字：${input.number1}、${input.number2}、${input.number3}
    //
    // 卦象信息：
    // - 上卦：${hexagram.upperTrigramName}（${hexagram.upperTrigram}）
    // - 下卦：${hexagram.lowerTrigramName}（${hexagram.lowerTrigram}）
    // - 动爻：第${hexagram.movingLine}爻
    // - 主卦：${hexagram.mainHexagramName}
    // - 变卦：${hexagram.changedHexagramName}
    //
    // 请根据以上信息进行解读。`;
  }

  // 新的提示词格式（英文）
  return `Use the numbers ${input.number1}, ${input.number2}, and ${input.number3} to cast a hexagram and divine using I Ching numerology: ${input.question}`;

  // Old prompt format (kept for reference):
  // return `User Question: ${input.question}
  //
  // Numbers: ${input.number1}, ${input.number2}, ${input.number3}
  //
  // Hexagram Information:
  // - Upper Trigram: ${hexagram.upperTrigramName} (${hexagram.upperTrigram})
  // - Lower Trigram: ${hexagram.lowerTrigramName} (${hexagram.lowerTrigram})
  // - Moving Line: Line ${hexagram.movingLine}
  // - Main Hexagram: ${hexagram.mainHexagramName}
  // - Changed Hexagram: ${hexagram.changedHexagramName}
  //
  // Please interpret based on the above information.`;
}

export async function performDivination(input: DivinationInput): Promise<DivinationResult> {
  const hexagram = calculateHexagram(input.number1, input.number2, input.number3);
  const locale = input.locale || "zh";

  if (!DEEPSEEK_API_KEY) {
    return {
      hexagram,
      interpretation: locale === "zh"
        ? `${hexagram.mainHexagramName}变${hexagram.changedHexagramName}。主卦${hexagram.mainHexagramName}象征着事物的开始，变卦${hexagram.changedHexagramName}预示着未来的发展。此卦象显示需要耐心等待，时机成熟自然水到渠成。`
        : `${hexagram.mainHexagramName} changes to ${hexagram.changedHexagramName}. The main hexagram symbolizes the beginning of things, while the changed hexagram预示着预示 future developments. This hexagram suggests patience - success will come when the time is right.`,
      advice: locale === "zh"
        ? "建议保持平和心态，静待时机。凡事不宜操之过急，稳中求进方为上策。"
        : "Maintain a calm mindset and wait for the right moment. Avoid rushing things - steady progress is the best strategy.",
    };
  }

  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(locale),
          },
          {
            role: "user",
            content: buildUserPrompt(input, hexagram, locale),
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from DeepSeek API");
    }

    const parsed = JSON.parse(content);

    return {
      hexagram,
      interpretation: parsed.interpretation || "",
      advice: parsed.advice || "",
    };
  } catch (error) {
    console.error("DeepSeek API error:", error);
    return {
      hexagram,
      interpretation: locale === "zh"
        ? `${hexagram.mainHexagramName}变${hexagram.changedHexagramName}。卦象显示事物正在变化之中，需要审时度势，把握机遇。`
        : `${hexagram.mainHexagramName} changes to ${hexagram.changedHexagramName}. The hexagram indicates things are in flux - assess the situation and seize opportunities.`,
      advice: locale === "zh"
        ? "建议谨慎行事，顺势而为。保持开放心态，积极应对变化。"
        : "Proceed with caution and go with the flow. Stay open-minded and adapt to changes positively.",
    };
  }
}

export { calculateHexagram };
