import { LearningTargetUnitWithSM2 } from '@/data/learningTarget/learningTargetUnit.types';
import { updateSM2TargetData } from '../../../../sm2/functions/calculate-sm2-state';
import { UserEvaluation } from '../../../types/user-evaluation.types';

/**
 * SPLITモードでSM-2運用中のユニット群に対し、評価結果に基づいてSM-2データを更新します。
 *
 * @param units SM2データを持つユニットのレコード (BLOOMING以降を想定)
 * @param evaluations ユニットIDをキーとする評価結果のレコード
 * @param now 現在時刻
 * @returns SM2データが更新された新しいユニットのレコード
 */
export const updateUnitsSM2State = (
  // ユニットはすべてSM2データを持つことを前提とする
  units: Record<string, LearningTargetUnitWithSM2>,
  evaluations: Record<string, UserEvaluation>,
  now: number
): Record<string, LearningTargetUnitWithSM2> => {
  return Object.keys(units).reduce(
    (acc, unitId) => {
      const unit = units[unitId];
      const evaluation = evaluations[unitId];

      // 評価が行われていないユニットは、そのまま返す
      if (!evaluation) {
        acc[unitId] = unit;
        return acc;
      }

      // SM2データを更新
      const newSM2 = updateSM2TargetData(unit.sm2Data, evaluation, now);

      // 新しいユニットオブジェクトを作成し、アキュムレータに追加
      acc[unitId] = {
        ...unit,
        sm2Data: newSM2,
      };

      return acc;
    },
    {} as Record<string, LearningTargetUnitWithSM2>
  );
};
