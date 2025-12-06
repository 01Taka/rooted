import { LearningTarget } from '@/data/learningTarget/learningTarget.types';
import { LearningTargetActivity } from '@/data/learningTarget/learningTargetActivity.types';
import {
  ActivityHistoryItemBase,
  ActivityHistorySplitItem,
  ActivityHistoryTargetItem,
  LearningHistoryActivityHistoryItem,
} from '@/data/learningTarget/learningTargetActivityHistory.types';
import { LearningTargetStage } from '@/data/learningTarget/learningTargetLiteral.types';
import { UserEvaluation } from '../../../types/user-evaluation.types';

/**
 * 今回のアクティビティ履歴アイテムを作成します。
 * @param currentTarget 更新前の学習ターゲット
 * @param evaluations ユーザーの評価入力
 * @param nextStage 更新後のステージ (遷移判定用)
 * @param now 現在時刻
 */
export function createActivityHistoryItem(
  currentTarget: LearningTarget,
  evaluations: Record<string, UserEvaluation>,
  nextStage: LearningTargetStage,
  now: number
): LearningHistoryActivityHistoryItem {
  const { state } = currentTarget;
  const didStateTransition = state.stage !== nextStage;

  // 1. 共通プロパティの作成
  const baseProps: ActivityHistoryItemBase = {
    isInGreenhouse: currentTarget.isInGreenhouse,
    stageAtActivity: state.stage,
    didStateTransition,
    ...(didStateTransition ? { newStage: nextStage } : { didStateTransition: false }),
  } as ActivityHistoryItemBase;

  // 2. モード別のアイテム作成
  if (state.managementMode === 'TARGET') {
    // TARGETモード: 単一のActivityを作成
    const rootEvaluation = Object.values(evaluations)[0];
    const activity = mapEvaluationToActivity(rootEvaluation, now);

    return {
      ...baseProps,
      managementMode: 'TARGET',
      activity,
    } as ActivityHistoryTargetItem;
  } else {
    // SPLITモード: ユニットごとのActivityリストを作成
    const activeUnits = Object.entries(evaluations).map(([unitId, evaluation]) => {
      // 現在のUnit情報を取得してパスを特定 (履歴にはその時点のパスを残す)
      const unit = state.units ? state.units[unitId] : null;
      // unitPathが存在しない場合のフォールバック (通常ありえないが安全性確保)
      const unitPath = unit?.unitPath ?? 'unknown-path';

      return {
        id: unitId,
        unitPath,
        activity: mapEvaluationToActivity(evaluation, now),
      };
    });

    return {
      ...baseProps,
      managementMode: 'SPLIT',
      activeUnits,
    } as ActivityHistorySplitItem;
  }
}

/**
 * UserEvaluation (入力) を LearningTargetActivity (保存用データ) に変換するヘルパー
 */
function mapEvaluationToActivity(
  evaluation: UserEvaluation,
  timestamp: number
): LearningTargetActivity {
  const base = { timestamp };

  switch (evaluation.mode) {
    case 'TAP':
      return { ...base, evaluationMode: 'TAP' };
    case 'PASS_FAIL':
      return { ...base, evaluationMode: 'PASS_FAIL', isCorrect: evaluation.value };
    case 'STAR':
      return { ...base, evaluationMode: 'STAR', level: evaluation.value };
    case 'SCORE':
      return { ...base, evaluationMode: 'SCORE', percentage: evaluation.value };
    default:
      throw new Error(`Unknown evaluation mode: ${(evaluation as any).mode}`);
  }
}
