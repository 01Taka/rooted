// TapEvaluation.tsx
import React from 'react';
import { IconCircleCheck, IconCircleDotted } from '@tabler/icons-react';
import { Button, rem, Stack, Text, ThemeIcon } from '@mantine/core';
import { Quality } from '@/features/app/sm2/constants/sm2-quality-constants';
import { useTapEvaluation } from '../hooks/use-evaluation-modes';

type TapEvaluationProps = {
  onEvaluate: (value: undefined | null) => void;
  calculatedQuality: Quality | null;
};

export const TapEvaluation: React.FC<TapEvaluationProps> = ({ onEvaluate, calculatedQuality }) => {
  const { isToggled, toggleHandler, color, label, texts } = useTapEvaluation(
    onEvaluate,
    calculatedQuality
  );

  const Icon = isToggled ? IconCircleCheck : IconCircleDotted;

  return (
    <Stack align="center" ta="center" gap="md">
      <ThemeIcon variant="light" size={rem(72)} radius="xl" color={color}>
        <Icon style={{ width: rem(36), height: rem(36) }} />
      </ThemeIcon>
      <Text size="lg" fw={700}>
        {texts.TITLE}
      </Text>
      <Text size="sm" c="dimmed">
        {texts.DESCRIPTION}
      </Text>

      <Button
        variant={isToggled ? 'filled' : 'outline'}
        color={color}
        size="lg"
        leftSection={<Icon size={20} />}
        onClick={toggleHandler}
        fullWidth
      >
        {label}
      </Button>
    </Stack>
  );
};
