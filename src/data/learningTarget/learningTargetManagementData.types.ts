import { LearningTargetSM2TargetData } from './learningTargetSM2.types';
import { LearningTargetUnit } from './learningTargetUnit.types';

export type LearningTargetManagementData =
  | {
      managementMode: 'TARGET';
      // TARGETモードに必要なデータ（ここではSM-2の本体データ）
      sm2Data: LearningTargetSM2TargetData;
      // ユニットは存在しないことが保証される
      units: null;
    }
  | {
      managementMode: 'SPLIT';
      // SPLITモードに必要なデータ（ここではユニットのコレクション）
      units: Record<string, LearningTargetUnit>;
      // どのユニットの状態を、メインの植物の状態として表示しているか
      // 最もsm2Data.nextReviewDateが小さいUnitに対応する
      representativeUnitId: string;
      // SM2TargetDataはユニットに分散するため、本体には存在しないことが保証される
      sm2Data: null;
      /** 移行元TARGETモードのSM2データを一時保存するプロパティ */
      previousSm2Data?: LearningTargetSM2TargetData;
    };
