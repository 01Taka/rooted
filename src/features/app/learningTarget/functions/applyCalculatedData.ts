import { LearningTarget } from '@/data/learningTarget/learningTarget.types';
import {
  LearningTargeMainState,
  SplitModeBlooming,
  SplitModeBudding,
  SplitModeHallOfFame,
  SplitModeMastered,
  TargetModeBlooming,
  TargetModeHallOfFame,
} from '@/data/learningTarget/learningTargetMainState.types';
import { LearningTargetUpdateData } from './calculate-updated-data';
import { createStageTransitionHistoryItem } from './create-stage-transition-history-item';
import { getRepresentativeUnitId } from './get-representative-unit-id';

/**
 * 計算されたデータと現在時刻を受け取り、学習ターゲットの状態を更新した新しいオブジェクトを返します。
 * ステージ移行時の型変換と履歴追加のロジックが含まれます。
 * @param currentLearningTarget 現在の学習ターゲット全体
 * @param calculatedData calculateUpdatedDataの結果
 * @param now 現在時刻 (ミリ秒)
 * @returns 更新された新しい LearningTarget オブジェクト
 */
export function applyCalculatedData(
  currentLearningTarget: LearningTarget,
  calculatedData: LearningTargetUpdateData,
  now: number
): LearningTarget {
  const {
    nextStage,
    newConsecutiveDaysData,
    newAchievedHighQualityUnitIds,
    updatedUnitsWithSM2,
    updatedTargetSM2,
    stagePromotion,
    predictedMasteredSlotExpiresAt,
  } = calculatedData;

  const currentStage = currentLearningTarget.state.stage;

  // 1. 共通の更新: コミットメント情報と基本のstateをコピー
  let updatedLearningTarget: LearningTarget = {
    ...currentLearningTarget,
    lastCommitmentAt: now,
    totalCommitmentCount: currentLearningTarget.totalCommitmentCount + 1,
  };

  let newState: LearningTargeMainState = updatedLearningTarget.state;
  let newStageTransitionHistory = [...updatedLearningTarget.stageTransitionHistory];

  // 2. --- ステージ昇格処理 ---
  if (stagePromotion) {
    // nextStage が存在しない場合はロジックエラーの可能性があるため、チェックを追加 (防御的プログラミング)
    if (!nextStage) {
      console.error('Stage promotion is true but nextStage is missing in calculated data.');
      // エラーを投げるか、現在の状態を返すなど、プロジェクトのポリシーに従う
      return updatedLearningTarget;
    }

    // 2.1. 履歴の追加
    const historyItem = createStageTransitionHistoryItem(
      currentStage,
      nextStage,
      'PROMOTION_SUCCESS',
      now
    );
    newStageTransitionHistory.push(historyItem);

    // 2.2. ステージに応じた状態初期化/移行 (型変換)
    // 必要なデータが存在するかどうかのチェックを強化

    if (currentStage === 'SPROUTING' && nextStage === 'BUDDING') {
      // BUDDING に必要なデータ (consecutiveDaysData, achievedHighQualityUnitIds) のチェック
      if (!newConsecutiveDaysData || !newAchievedHighQualityUnitIds) {
        throw new Error('Missing data for SPROUTING to BUDDING promotion.');
      }
      newState = {
        ...updatedLearningTarget.state,
        stage: 'BUDDING',
        consecutiveDaysData: newConsecutiveDaysData,
        achievedHighQualityUnitIds: newAchievedHighQualityUnitIds,
      } as SplitModeBudding; // or TargetModeBudding
    } else if (currentStage === 'BUDDING' && nextStage === 'BLOOMING') {
      if (updatedLearningTarget.state.managementMode === 'SPLIT') {
        if (!updatedUnitsWithSM2) {
          throw new Error(
            'Missing updatedUnitsWithSM2 for SPLIT mode BUDDING to BLOOMING promotion.'
          );
        }
        // SPLITモード: SM2適用済みユニットに変換
        const representativeUnitId = getRepresentativeUnitId(updatedUnitsWithSM2);
        newState = {
          ...updatedLearningTarget.state,
          stage: 'BLOOMING',
          units: updatedUnitsWithSM2,
          representativeUnitId: representativeUnitId,
        } as SplitModeBlooming;
      } else {
        if (!updatedTargetSM2) {
          throw new Error(
            'Missing updatedTargetSM2 for TARGET mode BUDDING to BLOOMING promotion.'
          );
        }
        // TARGETモード: SM2データを適用
        newState = {
          ...updatedLearningTarget.state,
          stage: 'BLOOMING',
          sm2Data: updatedTargetSM2,
        } as TargetModeBlooming;
      }
    } else if (currentStage === 'BLOOMING' && nextStage === 'HALL_OF_FAME') {
      // HALL_OF_FAMEへの移行 (期限切れデータが存在するかどうかのチェックは getHallOfFameExpiry 側で保証されていると想定)
      newState = {
        ...updatedLearningTarget.state,
        stage: 'HALL_OF_FAME',
        masteredSlotExpiresAt: predictedMasteredSlotExpiresAt, // predictedMasteredSlotExpiresAt が null|number の可能性がある場合は型定義に依存
      } as SplitModeHallOfFame | TargetModeHallOfFame; // HALL_OF_FAME は管理モードに依存しない共通のフィールドを持つことが多いが、ここではUnion型で対応
    }
  } else // 3. --- ステージ昇格なしの場合の、データのインクリメンタル更新 ---
  {
    if (currentStage === 'BUDDING') {
      // BUDDING ステージの更新
      const currentState = updatedLearningTarget.state as SplitModeBudding;
      newState = {
        ...currentState,
        // newConsecutiveDaysData や newAchievedHighQualityUnitIds が null/undefined の場合は既存値を使用
        consecutiveDaysData: newConsecutiveDaysData || currentState.consecutiveDaysData,
        achievedHighQualityUnitIds:
          newAchievedHighQualityUnitIds || currentState.achievedHighQualityUnitIds,
      };
    } else if (
      currentStage === 'BLOOMING' ||
      currentStage === 'MASTERED' ||
      currentStage === 'HALL_OF_FAME'
    ) {
      // SM-2運用ステージの更新
      if (updatedLearningTarget.state.managementMode === 'SPLIT' && updatedUnitsWithSM2) {
        // SPLITモード: ユニットと代表ユニットを更新
        const representativeUnitId = getRepresentativeUnitId(updatedUnitsWithSM2);
        newState = {
          ...updatedLearningTarget.state,
          units: updatedUnitsWithSM2,
          representativeUnitId: representativeUnitId,
        } as SplitModeBlooming | SplitModeMastered | SplitModeHallOfFame;
      } else if (updatedLearningTarget.state.managementMode === 'TARGET' && updatedTargetSM2) {
        // TARGETモード: SM-2データを更新
        // HALL_OF_FAMEはmasteredSlotExpiresAtを持つため、元の値を保持
        if (currentStage === 'HALL_OF_FAME') {
          // 元のコードは管理モードとステージを再設定していたが、currentStateから引き継ぐ形に変更
          const currentState = updatedLearningTarget.state as TargetModeHallOfFame;
          newState = {
            ...currentState, // stage, managementMode は currentState から継承
            sm2Data: updatedTargetSM2,
            masteredSlotExpiresAt: currentState.masteredSlotExpiresAt, // 既存値を保持
          } as TargetModeHallOfFame; // 具体的な型でアサーション
        } else {
          // BLOOMING / MASTERED の場合
          newState = {
            ...updatedLearningTarget.state,
            sm2Data: updatedTargetSM2,
          } as TargetModeBlooming | SplitModeMastered; // 具体的な型でアサーション
        }
      }
    } // SPROUTING ステージは totalCommitmentCount の更新のみで、stateのデータ更新は不要
  }

  // 4. 最終オブジェクトの構築
  return {
    ...updatedLearningTarget,
    state: newState,
    stageTransitionHistory: newStageTransitionHistory,
  };
}
