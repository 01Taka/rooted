import { LearningTargetStage } from '@/data/learningTarget/learningTargetLiteral.types';
import {
  BUDDING_TO_BLOOMING_CONSECUTIVE_DAYS,
  HALL_OF_FAME_DAYS_THRESHOLD,
  ONE_DAY_MS,
  SPROUTING_TO_BUDDING_COUNT,
} from '../constants/main-constants';

/**
 * 昇格条件の判定に必要なデータ構造
 * これらのデータは、SM-2更新やカウントアップ処理の後に計算・抽出されることを前提とする。
 */
export interface PromotionCheckArgs {
  /** 現在のステージ ('SPROUTING', 'BUDDING', 'BLOOMING') */
  currentStage: LearningTargetStage;

  // SPROUTING -> BUDDING 判定用
  /** 今回の評価でインクリメント後の合計コミットメント回数 */
  newTotalCommitmentCount: number;

  // BUDDING -> BLOOMING 判定用 (継続パス)
  /** 今回の評価で更新された連続日数 */
  newConsecutiveDays: number;

  // BUDDING -> BLOOMING 判定用 (成果パス)
  /** * TARGET: 今回の評価がQ>=3だったか (boolean)
   * SPLIT: 全ユニットが高得点達成済みか (allUnitIds.length === achievedIds.length)
   */
  isSuccessPathAchieved: boolean;

  // BLOOMING -> HALL OF FAME 判定用
  /** * SM-2更新後の全Unit/Targetの nextReviewDate のリスト
   * (TARGETモードなら1つ、SPLITモードならユニット数分)
   */
  sm2NextReviewDates: number[];

  /** 判定を行う現在の時刻 (ミリ秒) */
  now: number;
}

/**
 * 学習目標の現在のステージに基づき、昇格条件を満たしたかチェックします。
 * @param args - 昇格判定に必要なすべてのデータ
 * @returns 昇格する場合の次のステージ ('BUDDING' | 'BLOOMING' | 'HALL_OF_FAME')、満たさない場合は null
 */
export function checkPromotionConditions(args: PromotionCheckArgs): LearningTargetStage | null {
  const {
    currentStage,
    newTotalCommitmentCount,
    newConsecutiveDays,
    isSuccessPathAchieved,
    sm2NextReviewDates,
    now,
  } = args;

  switch (currentStage) {
    // --- 🌱 SPROUTING -> 🌸 BUDDING のチェック ---
    case 'SPROUTING': {
      // 進化条件: 任意の評価の入力を3回達成 (1時間経過制約は外部で処理済み)
      if (newTotalCommitmentCount >= SPROUTING_TO_BUDDING_COUNT) {
        return 'BUDDING';
      }
      return null;
    }

    // --- 🌸 BUDDING -> 🌼 BLOOMING のチェック ---
    case 'BUDDING': {
      // 1. 継続パスチェック: 4日連続で取り組んだか
      if (newConsecutiveDays >= BUDDING_TO_BLOOMING_CONSECUTIVE_DAYS) {
        return 'BLOOMING';
      }

      // 2. 成果パスチェック
      // isSuccessPathAchievedは、ターゲットモードならQ>=3、スプリットモードなら全ユニット高得点達成済みかを、
      // 呼び出し元で判定した結果が渡される
      if (isSuccessPathAchieved) {
        return 'BLOOMING';
      }

      return null;
    }

    // --- 🌼 BLOOMING -> 👑 HALL OF FAME のチェック (絶対日時ベース) ---
    case 'BLOOMING': {
      // 進化条件: すべてのUnitの nextReviewDate が、現在時刻から100日以上後である

      const thresholdDate = now + HALL_OF_FAME_DAYS_THRESHOLD * ONE_DAY_MS;

      // ユニットが一つもない場合 (空の配列) は昇格しない
      if (sm2NextReviewDates.length === 0) {
        return null;
      }

      // 判定ロジック: チェック対象の全復習日が閾値を超えているか
      const allReviewsFarEnough = sm2NextReviewDates.every((date) => date >= thresholdDate);

      if (allReviewsFarEnough) {
        return 'HALL_OF_FAME';
      }
      return null;
    }

    // MASTEREDとHALL_OF_FAMEは、通常の評価による昇格はない
    case 'MASTERED':
    case 'HALL_OF_FAME':
    default:
      return null;
  }
}
