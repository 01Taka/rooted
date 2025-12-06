import { LearningTargetConsecutiveDays } from './learningTargetConsecutiveDays.types';
import { LearningTargetManagementMode, LearningTargetStage } from './learningTargetLiteral.types';
import { LearningTargetSM2TargetData } from './learningTargetSM2.types';
import {
  LearningTargetUnitWithoutSM2,
  LearningTargetUnitWithSM2,
} from './learningTargetUnit.types';

// --- 共通のデータ構造 ---

/**
 * 学習ターゲットのBudding (開花前) ステージで共有されるデータ。
 */
export interface LearningTargetBuddingStageData {
  /** 連続学習日のデータ */
  consecutiveDaysData: LearningTargetConsecutiveDays;
  /** 高品質と評価されたユニットIDのリスト */
  achievedHighQualityUnitIds: string[];
}

/**
 * SPLITモードでSM2データを持つ場合に共通する情報。
 * どのユニットが代表として表示されているか、および以前のSM2データの一時保存。
 */
export interface SplitModeSM2Data {
  /** メインの植物の状態として表示されるユニットID (nextReviewDateが最も小さいUnit) */
  representativeUnitId: string;
  /** 移行元TARGETモードのSM2データを一時保存するプロパティ */
  previousSm2Data?: LearningTargetSM2TargetData;
}

// --- ユニットの型をSM2データの有無で分ける ---

// --- ベースとなるインターフェース ---

/**
 * LearningTargetMainStateBaseの基本構造。
 * すべてのモード/ステートの組み合わせで共有されるプロパティ (managementMode, stage) を持つ。
 * これを他の型が拡張する。
 */
export interface LearningTargetMainStateBase {
  managementMode: LearningTargetManagementMode;
  stage: LearningTargetStage;
}

// --- TARGET モードの型定義 ---

/** TARGETモードのすべての型を包含する共用体 */
export type TargetModeData =
  | TargetModeSprouting
  | TargetModeBudding
  | TargetModeBlooming
  | TargetModeMastered
  | TargetModeHallOfFame;

/** stage: SPROUTING, sm2Data: なし */
export interface TargetModeSprouting extends LearningTargetMainStateBase {
  managementMode: 'TARGET';
  stage: 'SPROUTING';
  sm2Data?: undefined;
}

/** stage: BUDDING, sm2Data: なし, + BuddingStageData */
export interface TargetModeBudding
  extends LearningTargetMainStateBase, LearningTargetBuddingStageData {
  managementMode: 'TARGET';
  stage: 'BUDDING';
  sm2Data?: undefined;
}

/** stage: BLOOMING, sm2Data: あり */
export interface TargetModeBlooming extends LearningTargetMainStateBase {
  managementMode: 'TARGET';
  stage: 'BLOOMING';
  sm2Data: LearningTargetSM2TargetData;
}

/** stage: MASTERED, sm2Data: あり */
export interface TargetModeMastered extends LearningTargetMainStateBase {
  managementMode: 'TARGET';
  stage: 'MASTERED';
  sm2Data: LearningTargetSM2TargetData;
}

/** stage: HALL_OF_FAME, sm2Data: あり, + 期限 */
export interface TargetModeHallOfFame extends LearningTargetMainStateBase {
  managementMode: 'TARGET';
  stage: 'HALL_OF_FAME';
  sm2Data: LearningTargetSM2TargetData;
  masteredSlotExpiresAt: number;
}

// --- SPLIT モードの型定義 ---

/** SPLITモードのすべての型を包含する共用体 */
export type SplitModeData =
  | SplitModeSprouting
  | SplitModeBudding
  | SplitModeBlooming
  | SplitModeMastered
  | SplitModeHallOfFame;

/** stage: SPROUTING, units: SM2なし */
export interface SplitModeSprouting extends LearningTargetMainStateBase {
  managementMode: 'SPLIT';
  stage: 'SPROUTING';
  units: Record<string, LearningTargetUnitWithoutSM2>;
}

/** stage: BUDDING, units: SM2なし, + BuddingStageData */
export interface SplitModeBudding
  extends LearningTargetMainStateBase, LearningTargetBuddingStageData {
  managementMode: 'SPLIT';
  stage: 'BUDDING';
  units: Record<string, LearningTargetUnitWithoutSM2>;
}

/** stage: BLOOMING, units: SM2あり, + SplitModeSM2Data */
export interface SplitModeBlooming extends LearningTargetMainStateBase, SplitModeSM2Data {
  managementMode: 'SPLIT';
  stage: 'BLOOMING';
  units: Record<string, LearningTargetUnitWithSM2>;
}

/** stage: MASTERED, units: SM2あり, + SplitModeSM2Data */
export interface SplitModeMastered extends LearningTargetMainStateBase, SplitModeSM2Data {
  managementMode: 'SPLIT';
  stage: 'MASTERED';
  units: Record<string, LearningTargetUnitWithSM2>;
}

/** stage: HALL_OF_FAME, units: SM2あり, + 期限, + SplitModeSM2Data */
export interface SplitModeHallOfFame extends LearningTargetMainStateBase, SplitModeSM2Data {
  managementMode: 'SPLIT';
  stage: 'HALL_OF_FAME';
  units: Record<string, LearningTargetUnitWithSM2>;
  masteredSlotExpiresAt: number;
}

// --- メインの型 ---

/**
 * 学習ターゲットのメインデータ型。
 * TARGETモードかSPLITモードのいずれかとなる。
 */
export type LearningTargeMainState = TargetModeData | SplitModeData;
