import { LearningTargetStage } from '@/data/learningTarget/learningTargetLiteral.types';
import {
  BUDDING_TO_BLOOMING_CONSECUTIVE_DAYS,
  HALL_OF_FAME_DAYS_THRESHOLD,
  ONE_DAY_MS,
  SPROUTING_TO_BUDDING_COUNT,
} from '../../../constants/main-constants';

export interface PromotionCheckArgs {
  currentStage: LearningTargetStage;
  // SPROUTING用
  sproutingCount?: number;
  // BUDDING用
  consecutiveDays?: number;
  isBuddingSuccessPath?: boolean; // 成果パス達成済みか
  // BLOOMING用
  sm2NextReviewDates?: number[];
  now: number;
}

export function checkPromotionConditions(args: PromotionCheckArgs): LearningTargetStage | null {
  const { currentStage, now } = args;

  switch (currentStage) {
    case 'SPROUTING':
      if ((args.sproutingCount ?? 0) >= SPROUTING_TO_BUDDING_COUNT) {
        return 'BUDDING';
      }
      return null;

    case 'BUDDING':
      // 継続パス
      if ((args.consecutiveDays ?? 0) >= BUDDING_TO_BLOOMING_CONSECUTIVE_DAYS) {
        return 'BLOOMING';
      }
      // 成果パス
      if (args.isBuddingSuccessPath) {
        return 'BLOOMING';
      }
      return null;

    case 'BLOOMING':
      // 殿堂入り判定 (全ユニットが閾値を超えているか)
      if (!args.sm2NextReviewDates || args.sm2NextReviewDates.length === 0) {
        return null;
      }
      const thresholdDate = now + HALL_OF_FAME_DAYS_THRESHOLD * ONE_DAY_MS;
      const allFarEnough = args.sm2NextReviewDates.every((d) => d >= thresholdDate);

      if (allFarEnough) {
        return 'HALL_OF_FAME';
      }
      return null;

    default:
      return null;
  }
}
