// PassFailEvaluation.tsx
import React from 'react';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { Box, Center, rem, SegmentedControl, Stack, Text } from '@mantine/core';
import { Quality } from '@/features/app/sm2/constants/sm2-quality-constants';
import { usePassFailEvaluation } from '../hooks/use-evaluation-modes';

type PassFailEvaluationProps = {
  onEvaluate: (value: boolean | null) => void;
  calculatedQuality: Quality | null;
};

export const PassFailEvaluation: React.FC<PassFailEvaluationProps> = ({
  onEvaluate,
  calculatedQuality,
}) => {
  // texts もフックから取得
  const { value, handleChange, qDisplay, color, texts } = usePassFailEvaluation(
    onEvaluate,
    calculatedQuality
  );

  return (
    <Stack gap="md" ta="center">
      <Text size="lg" fw={700}>
        {texts.TITLE}
      </Text>
      <SegmentedControl
        fullWidth
        value={value}
        onChange={handleChange}
        data={[
          {
            value: 'fail',
            label: (
              <Center p={4}>
                <IconCircleX style={{ width: rem(18), height: rem(18) }} />
                <Box ml={10}>{texts.FAIL}</Box>
              </Center>
            ),
          },
          {
            value: 'pass',
            label: (
              <Center p={4}>
                <IconCircleCheck style={{ width: rem(18), height: rem(18) }} />
                <Box ml={10}>{texts.PASS}</Box>
              </Center>
            ),
          },
        ]}
        size="lg"
        color={color}
      />
      <Text size="xl" fw={700} c={color}>
        {texts.DISPLAY_Q(qDisplay)}
      </Text>
      <Text size="sm" c="dimmed">
        {texts.DESCRIPTION}
      </Text>
    </Stack>
  );
};
