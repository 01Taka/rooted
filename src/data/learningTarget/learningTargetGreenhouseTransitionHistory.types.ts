import { GreenhouseTransitionReason } from './learningTargetLiteral.types';

/**
 * 温室への出入り履歴
 */
export interface GreenhouseTransitionHistoryItem {
  movedInAt: number; // 温室に入れた時刻
  movedOutAt: number | null; // 温室から戻した時刻 (現在温室にある場合は null)
  reason: GreenhouseTransitionReason;
}
