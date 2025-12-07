import { useEffect, useState } from 'react';
import { Box, Button, Modal, rem, Tabs, Title } from '@mantine/core';
// UserEvaluationの型は、user-evaluation.typesからインポートされていると仮定
import { UserEvaluation } from '@/features/app/learningTarget/types/user-evaluation.types';
import { Quality } from '@/features/app/sm2/constants/sm2-quality-constants';
import { calculateSM2Quality } from '@/features/app/sm2/functions/calculate-sm2-quality';
import { PassFailEvaluation } from './PassFailEvaluation';
import { ScoreEvaluation } from './ScoreEvaluation';
import { StarEvaluation } from './StarEvaluation';
import { TapEvaluation } from './TapEvaluation';

// TAPモードの value は undefined、その他は boolean/number。
// 未選択/未トグルの状態を null で統一して扱う。
type EvaluationValue = UserEvaluation['value'] | null;

type UserEvaluationModalProps = {
  opened: boolean;
  onClose: () => void;
  targetTitle: string;
  onSubmit: (evaluation: UserEvaluation) => void;
};

export const UserEvaluationModal: React.FC<UserEvaluationModalProps> = ({
  opened,
  onClose,
  targetTitle,
  onSubmit,
}) => {
  const [mode, setMode] = useState<UserEvaluation['mode']>('TAP');
  // 初期状態は全てのモードで未評価 (null)
  const [value, setValue] = useState<EvaluationValue>(null);

  // Q値を保持する状態
  const [quality, setQuality] = useState<Quality | null>(null);

  // mode または value が変更されたときに Quality を再計算する
  useEffect(() => {
    if (value === null) {
      // 未選択/未トグルの場合、Q値も未確定
      setQuality(null);
      return;
    }

    // 確定した評価オブジェクトを作成
    const evaluation: UserEvaluation =
      mode === 'TAP' && value === undefined
        ? ({ mode, value: undefined } as UserEvaluation) // TAPモード
        : ({ mode, value } as UserEvaluation); // その他

    // Q値を計算して状態に保存
    const calculatedQ = calculateSM2Quality(evaluation);
    setQuality(calculatedQ);
  }, [mode, value]);

  const handleModeChange = (newMode: UserEvaluation['mode']) => {
    setMode(newMode);
    // モード切り替え時、評価値を未評価 (null) にリセット
    setValue(null);
  };

  const handleEvaluationSubmit = () => {
    // value が null ではない (Q値が計算されている) 場合にのみ送信
    if (value !== null && quality !== null) {
      // value が undefined の場合は TAP モードと見なす
      onSubmit({ mode, value: value === undefined ? undefined : value } as UserEvaluation);
      onClose();
    } else {
      alert('評価モードを選択するか、評価値を設定してから確定してください。');
    }
  };

  // 評価ボタンの disabled 制御: value が null の場合、確定できない
  const isSubmitDisabled = value === null;

  return (
    <Modal opened={opened} onClose={onClose} title={`評価の入力: ${targetTitle}`} centered>
      <Tabs value={mode} onChange={(v) => handleModeChange(v as UserEvaluation['mode'])}>
        <Tabs.List grow>
          <Tabs.Tab value="TAP">ワンタップ</Tabs.Tab>
          <Tabs.Tab value="PASS_FAIL">正誤</Tabs.Tab>
          <Tabs.Tab value="STAR">スター評価</Tabs.Tab>
          <Tabs.Tab value="SCORE">得点率</Tabs.Tab>
        </Tabs.List>

        <Box pt="md">
          {/* Q値を子コンポーネントに渡して表示させる */}
          {mode === 'TAP' && <TapEvaluation onEvaluate={setValue} calculatedQuality={quality} />}
          {mode === 'PASS_FAIL' && (
            <PassFailEvaluation onEvaluate={setValue} calculatedQuality={quality} />
          )}
          {mode === 'STAR' && <StarEvaluation onEvaluate={setValue} calculatedQuality={quality} />}
          {mode === 'SCORE' && (
            <ScoreEvaluation onEvaluate={setValue} calculatedQuality={quality} />
          )}
        </Box>
      </Tabs>

      <Button
        fullWidth
        mt="lg"
        onClick={handleEvaluationSubmit}
        disabled={isSubmitDisabled}
        color={quality !== null && quality >= 3 ? 'teal' : 'gray'}
      >
        {quality === null
          ? '評価を設定してください'
          : `Q=${quality} で評価を確定し、植物を成長させる`}
      </Button>
    </Modal>
  );
};
