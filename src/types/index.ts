export interface HexagramData {
  [key: string]: number | string;
  upperTrigram: number;
  lowerTrigram: number;
  movingLine: number;
  upperTrigramName: string;
  lowerTrigramName: string;
  mainHexagram: string;
  changedHexagram: string;
  mainHexagramName: string;
  changedHexagramName: string;
}

export interface DivinationInput {
  number1: number;
  number2: number;
  number3: number;
  question: string;
  locale?: string;
}

export interface DivinationResult {
  hexagram: HexagramData;
  interpretation: string;
  advice: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  nameEn: string;
  nameJa?: string;
  nameKo?: string;
  price: number;
  currency: string;
  description: string;
  descriptionEn: string;
  descriptionJa?: string;
  descriptionKo?: string;
  features: string[];
  featuresEn: string[];
  featuresJa?: string[];
  featuresKo?: string[];
  stripePriceId: string;
  interval?: "month" | "year";
}

export interface UserWithSubscription {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: "USER" | "ADMIN";
  locale: string;
  freeUsed: boolean;
  subscription: {
    plan: "PER_USE" | "MONTHLY" | "YEARLY";
    status: "ACTIVE" | "EXPIRED" | "CANCELLED";
    endDate: Date;
    readingsLeft: number | null;
  } | null;
}

export interface AdminStats {
  totalUsers: number;
  totalReadings: number;
  totalRevenue: number;
  activeSubscriptions: number;
  recentUsers: number;
  recentReadings: number;
}

export const TRIGRAM_NAMES: Record<string, Record<number, string>> = {
  zh: {
    0: "坤",
    1: "乾",
    2: "兑",
    3: "离",
    4: "震",
    5: "巽",
    6: "坎",
    7: "艮",
  },
  en: {
    0: "Kun (Earth)",
    1: "Qian (Heaven)",
    2: "Dui (Lake)",
    3: "Li (Fire)",
    4: "Zhen (Thunder)",
    5: "Xun (Wind)",
    6: "Kan (Water)",
    7: "Gen (Mountain)",
  },
};

export const HEXAGRAM_NAMES: Record<string, Record<string, string>> = {
  zh: {
    "111111": "乾为天",
    "000000": "坤为地",
    "010001": "屯",
    "100010": "蒙",
    "010111": "需",
    "111010": "讼",
    "000010": "师",
    "010000": "比",
    "110111": "小畜",
    "111011": "履",
    "000111": "泰",
    "111000": "否",
    "111101": "同人",
    "101111": "大有",
    "000100": "谦",
    "001000": "豫",
    "011001": "随",
    "100110": "蛊",
    "000011": "临",
    "110000": "观",
    "101001": "噬嗑",
    "100101": "贲",
    "100000": "剥",
    "000001": "复",
    "111001": "无妄",
    "100111": "大畜",
    "100001": "颐",
    "011110": "大过",
    "010010": "坎为水",
    "101101": "离为火",
    "011100": "咸",
    "001110": "恒",
    "111100": "遁",
    "001111": "大壮",
    "101000": "晋",
    "000101": "明夷",
    "110101": "家人",
    "101011": "睽",
    "010100": "蹇",
    "001010": "解",
    "100011": "损",
    "110001": "益",
    "011111": "夬",
    "111110": "姤",
    "011000": "萃",
    "000110": "升",
    "011010": "困",
    "010110": "井",
    "011101": "革",
    "101110": "鼎",
    "001001": "震为雷",
    "100100": "艮为山",
    "110100": "渐",
    "001011": "归妹",
    "001101": "丰",
    "101100": "旅",
    "110010": "巽为风",
    "010011": "兑为泽",
    "110110": "涣",
    "011011": "节",
    "110011": "中孚",
    "001100": "小过",
    "010101": "既济",
    "101010": "未济",
  },
  en: {
    "111111": "Qian (The Creative)",
    "000000": "Kun (The Receptive)",
    "010001": "Zhun (Difficulty at Beginning)",
    "100010": "Meng (Youthful Folly)",
    "010111": "Xu (Waiting)",
    "111010": "Song (Conflict)",
    "000010": "Shi (The Army)",
    "010000": "Bi (Holding Together)",
    "110111": "Xiao Xu (Small Taming)",
    "111011": "Lv (Treading)",
    "000111": "Tai (Peace)",
    "111000": "Pi (Standstill)",
    "111101": "Tong Ren (Fellowship)",
    "101111": "Da You (Great Possession)",
    "000100": "Qian (Modesty)",
    "001000": "Yu (Enthusiasm)",
    "011001": "Sui (Following)",
    "100110": "Gu (Decay)",
    "000011": "Lin (Approach)",
    "110000": "Guan (Contemplation)",
    "101001": "Shi He (Biting Through)",
    "100101": "Bi (Grace)",
    "100000": "Bo (Splitting Apart)",
    "000001": "Fu (Return)",
    "111001": "Wu Wang (Innocence)",
    "100111": "Da Xu (Great Taming)",
    "100001": "Yi (Nourishment)",
    "011110": "Da Guo (Preponderance)",
    "010010": "Kan (The Abysmal)",
    "101101": "Li (The Clinging)",
    "011100": "Xian (Influence)",
    "001110": "Heng (Duration)",
    "111100": "Dun (Retreat)",
    "001111": "Da Zhuang (Great Power)",
    "101000": "Jin (Progress)",
    "000101": "Ming Yi (Darkening)",
    "110101": "Jia Ren (The Family)",
    "101011": "Kui (Opposition)",
    "010100": "Jian (Obstruction)",
    "001010": "Xie (Deliverance)",
    "100011": "Sun (Decrease)",
    "110001": "Yi (Increase)",
    "011111": "Guai (Breakthrough)",
    "111110": "Gou (Coming to Meet)",
    "011000": "Cui (Gathering)",
    "000110": "Sheng (Pushing Upward)",
    "011010": "Kun (Oppression)",
    "010110": "Jing (The Well)",
    "011101": "Ge (Revolution)",
    "101110": "Ding (The Cauldron)",
    "001001": "Zhen (The Arousing)",
    "100100": "Gen (Keeping Still)",
    "110100": "Jian (Development)",
    "001011": "Gui Mei (Marrying Maiden)",
    "001101": "Feng (Abundance)",
    "101100": "Lv (The Wanderer)",
    "110010": "Xun (The Gentle)",
    "010011": "Dui (The Joyous)",
    "110110": "Huan (Dispersion)",
    "011011": "Jie (Limitation)",
    "110011": "Zhong Fu (Inner Truth)",
    "001100": "Xiao Guo (Small Exceeding)",
    "010101": "Ji Ji (After Completion)",
    "101010": "Wei Ji (Before Completion)",
  },
};
