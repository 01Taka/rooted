// 評価モードとそれに対応する固定Q値
const FIXED_QUALITY_MAP = {
  TAP: 4 as const,
  PASS_FAIL_CORRECT: 4 as const,
  PASS_FAIL_INCORRECT: 1 as const,
  SCORE_UNRATED: 0 as const, // 0点や不正な値の場合
};

// 得点率 (SCORE) モードのQ値算出のための閾値定義
// キーはQ値、値は対応する得点率の下限 (minScore)
// 評価は降順でチェックするため、Q5からQ1の順で定義
const SCORE_QUALITY_THRESHOLDS = [
  { quality: 5 as const, minScore: 100 }, // Q5: 完璧 (100点 のみ)
  { quality: 4 as const, minScore: 90 }, // Q4: 優秀 (90点以上)
  { quality: 3 as const, minScore: 80 }, // Q3: 及第 (80点以上)
  { quality: 2 as const, minScore: 30 }, // Q2: 要注意 (30点以上)
  { quality: 1 as const, minScore: 1 }, // Q1: 欠落 (0点超 = 1点以上)
];

// STARモードの最大値（厳密な型定義で使用）
const STAR_MAX_QUALITY = 5 as const;

type Quality = 0 | 1 | 2 | 3 | 4 | 5;
