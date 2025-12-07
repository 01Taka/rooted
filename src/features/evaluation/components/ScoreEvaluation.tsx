// ScoreEvaluation.tsx
import React from 'react';
import { IconMaximize, IconTrophy } from '@tabler/icons-react';
import { Grid, NumberInput, rem, Slider, Stack, Text } from '@mantine/core';
import { Quality } from '@/features/app/sm2/constants/sm2-quality-constants';
import { useScoreEvaluation } from '../hooks/use-evaluation-modes';

type ScoreEvaluationProps = {
  onEvaluate: (value: number | null) => void;
  calculatedQuality: Quality | null;
};

export const ScoreEvaluation: React.FC<ScoreEvaluationProps> = ({
  onEvaluate,
  calculatedQuality,
}) => {
  // texts と descriptionText をフックから取得
  const {
    score,
    maxScore,
    calculatedPercentage,
    sliderValue,
    qDisplay,
    displayColor,
    descriptionText,
    handleScoreChange,
    handleMaxScoreChange,
    handleSliderChange,
    handleFocus,
    texts,
  } = useScoreEvaluation(onEvaluate, calculatedQuality);

  return (
    <Stack gap="lg" ta="center">
      <Text size="lg" fw={700}>
        {texts.TITLE}
      </Text>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <NumberInput
            label={texts.SCORE_LABEL}
            value={score}
            onChange={handleScoreChange}
            onFocus={handleFocus}
            min={0}
            step={1}
            size="lg"
            leftSection={<IconTrophy size={30} />}
            placeholder="得点"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <NumberInput
            label={texts.MAX_SCORE_LABEL}
            value={maxScore}
            onChange={handleMaxScoreChange}
            onFocus={handleFocus}
            min={1}
            step={1}
            size="lg"
            leftSection={<IconMaximize size={30} />}
            placeholder="満点"
          />
        </Grid.Col>
      </Grid>

      <Text size="xl" fw={700} c={displayColor}>
        {texts.PERCENTAGE(calculatedPercentage)}
      </Text>

      <Slider
        value={sliderValue}
        onChange={handleSliderChange}
        min={0}
        max={100}
        step={1}
        label={(value) => `${value.toFixed(0)}%`}
        color="teal"
      />

      <Text size="xl" fw={700} c={displayColor}>
        {texts.DISPLAY_Q(qDisplay)}
      </Text>
      <Text size="sm" c="dimmed">
        {descriptionText}
      </Text>
    </Stack>
  );
};
