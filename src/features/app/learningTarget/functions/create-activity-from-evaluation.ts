import { LearningTargetActivity } from '@/data/learningTarget/learningTargetActivity.types';
import { UserEvaluation } from '../types/user-evaluation.types';

/**
 * UserEvaluationから保存用のアクティビティデータを生成します。
 */
export function createActivityFromEvaluation(
  evaluation: UserEvaluation,
  now: number
): LearningTargetActivity {
  switch (evaluation.mode) {
    case 'TAP':
      return { evaluationMode: 'TAP', timestamp: now };
    case 'PASS_FAIL':
      return { evaluationMode: 'PASS_FAIL', timestamp: now, isCorrect: evaluation.value };
    case 'STAR':
      return { evaluationMode: 'STAR', timestamp: now, level: evaluation.value };
    case 'SCORE':
      return { evaluationMode: 'SCORE', timestamp: now, percentage: evaluation.value };
  }
}
