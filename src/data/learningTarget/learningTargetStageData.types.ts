import { LearningTargetConsecutiveDays } from './learningTargetConsecutiveDays.types';

/**
 * 植物（学習目標）の現在のステージ（状態）と、
 * そのステージ固有のデータを統合した型
 */
export type LearningTargetStageData =
  | {
      state: 'SPROUTING';
    }
  | {
      state: 'BUDDING';
      // BUDDINGでは連続日数データが必須（nullではないことが保証される）
      consecutiveDaysData: LearningTargetConsecutiveDays;
    }
  | {
      state: 'BLOOMING';
    }
  | {
      state: 'MASTERED';
    }
  | {
      state: 'HALL_OF_FAME';
      // 自動でMASTEREDになり、温室に入る日時
      masteredSlotExpiresAt: number;
    };
