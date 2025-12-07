// StarEvaluation.tsx
import React from 'react';
import { IconCircleX } from '@tabler/icons-react';
import { ActionIcon, Group, Rating, rem, Stack, Text } from '@mantine/core';
import { Quality } from '@/features/app/sm2/constants/sm2-quality-constants';
import { useStarEvaluation } from '../hooks/use-evaluation-modes';

type StarValue = 0 | 1 | 2 | 3 | 4 | 5;

type StarEvaluationProps = {
  onEvaluate: (value: StarValue | null) => void;
  calculatedQuality: Quality | null;
};

export const StarEvaluation: React.FC<StarEvaluationProps> = ({
  onEvaluate,
  calculatedQuality,
}) => {
  const {
    level,
    displayLevel,
    qDisplay,
    descriptionText,
    displayColor,
    handleZeroClick,
    handleRatingChange,
    texts,
  } = useStarEvaluation(onEvaluate, calculatedQuality);

  const isZeroSelected = level === 0;

  return (
    <Stack align="center" ta="center" gap="md">
      <Text size="lg" fw={700}>
        {texts.TITLE}
      </Text>

      <Group gap={1} align="center">
        <ActionIcon
          variant={'transparent'}
          color={isZeroSelected ? 'red' : 'gray'}
          size={rem(48)}
          onClick={handleZeroClick}
          aria-label="0点を選択"
        >
          <IconCircleX size={rem(28)} />
        </ActionIcon>

        <Rating value={displayLevel} onChange={handleRatingChange} count={5} size={rem(48)} />
      </Group>

      <Text size="xl" fw={700} c={displayColor}>
        {texts.DISPLAY_Q(qDisplay)}
      </Text>
      <Text size="sm" c="dimmed">
        {descriptionText}
      </Text>
    </Stack>
  );
};
