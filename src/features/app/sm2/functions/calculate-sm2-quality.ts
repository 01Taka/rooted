import { UserEvaluation } from '../../learningTarget/types/user-evaluation.types';

/**
 * SM-2アルゴリズムのQuality (Q値: 0〜5) を計算する
 * @param evaluation ユーザーの評価オブジェクト
 * @returns SM-2 Quality (0〜5)
 */
export const calculateSM2Quality = (evaluation: UserEvaluation): Quality => {
  switch (evaluation.mode) {
    case 'TAP':
      // ワンタップ: Q=4 (FIXED_QUALITY_MAP.TAP)
      return FIXED_QUALITY_MAP.TAP;

    case 'PASS_FAIL':
      if (typeof evaluation.value === 'boolean') {
        // 正誤チェック: ○(true) -> Q=4, ×(false) -> Q=1
        return evaluation.value
          ? FIXED_QUALITY_MAP.PASS_FAIL_CORRECT
          : FIXED_QUALITY_MAP.PASS_FAIL_INCORRECT;
      }
      console.error('PASS_FAILモードで不正なvalue型:', evaluation['value']);
      return FIXED_QUALITY_MAP.SCORE_UNRATED;

    case 'STAR':
      // スターLevel: 0〜5がそのままQ値
      const starValue = evaluation.value as number;
      if (typeof starValue === 'number' && starValue >= 0 && starValue <= STAR_MAX_QUALITY) {
        // 念のため整数に丸める（STARの型定義から整数が保証されているはずだが、防御的に）
        return Math.round(starValue) as Quality;
      }
      console.error('STARモードで不正なvalue:', evaluation.value);
      return FIXED_QUALITY_MAP.SCORE_UNRATED;

    case 'SCORE':
      const score = evaluation.value as number;

      // 1. 基本的なバリデーション
      if (typeof score !== 'number' || isNaN(score) || score < 0 || score > 100) {
        console.error('SCOREモードで不正なscore:', evaluation.value);
        return FIXED_QUALITY_MAP.SCORE_UNRATED;
      }

      // 2. 閾値に基づくQ値の決定 (Q5から降順にチェック)
      for (const threshold of SCORE_QUALITY_THRESHOLDS) {
        // Q5は「100点 のみ」なので特別扱い
        if (threshold.quality === 5) {
          if (score === threshold.minScore) {
            return threshold.quality;
          }
          continue;
        }

        // Q4〜Q1の判定: 下限点数 (minScore) 以上かどうか
        if (score >= threshold.minScore) {
          return threshold.quality;
        }
      }

      // 3. どの条件にも該当しない場合 (score=0 の場合)
      return FIXED_QUALITY_MAP.SCORE_UNRATED; // Q0: 未評価 (0点)

    default:
      console.error('未対応の評価モード:', (evaluation as any).mode);
      return FIXED_QUALITY_MAP.SCORE_UNRATED;
  }
};
