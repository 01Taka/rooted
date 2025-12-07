// use-evaluation-modes.ts
import { useEffect, useMemo, useState } from 'react';
import { Quality } from '@/features/app/sm2/constants/sm2-quality-constants';
import { EVALUATION_TEXTS, QUALITY_COLORS } from '../constants/evaluation-constants';
import { useQualityColor } from './use-evaluation-theme';

// --- Hook: TapEvaluation ---
export const useTapEvaluation = (
  onEvaluate: (value: undefined | null) => void,
  calculatedQuality: Quality | null
) => {
  const [isToggled, setIsToggled] = useState(false);

  useEffect(() => {
    onEvaluate(isToggled ? undefined : null);
  }, [isToggled, onEvaluate]);

  const toggleHandler = () => setIsToggled((t) => !t);

  const qDisplay = calculatedQuality ?? '?';
  const color = isToggled ? 'green' : QUALITY_COLORS.UNKNOWN;
  const label = isToggled
    ? EVALUATION_TEXTS.TAP.LABEL_TOGGLED(qDisplay)
    : EVALUATION_TEXTS.TAP.LABEL_DEFAULT;

  return { isToggled, toggleHandler, color, qDisplay, label, texts: EVALUATION_TEXTS.TAP };
};

// --- Hook: PassFailEvaluation ---
export const usePassFailEvaluation = (
  onEvaluate: (value: boolean | null) => void,
  calculatedQuality: Quality | null
) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    onEvaluate(isCorrect);
  }, [isCorrect, onEvaluate]);

  const handleChange = (val: string) => {
    setIsCorrect(val === 'pass');
  };

  const value = isCorrect === null ? '' : isCorrect ? 'pass' : 'fail';
  const qDisplay = calculatedQuality ?? '?';

  const color =
    isCorrect === null
      ? QUALITY_COLORS.UNKNOWN
      : isCorrect
        ? QUALITY_COLORS.PASS
        : QUALITY_COLORS.FAIL;

  return { value, handleChange, qDisplay, color, texts: EVALUATION_TEXTS.PASS_FAIL };
};

// --- Hook: StarEvaluation ---
type StarValue = 0 | 1 | 2 | 3 | 4 | 5;

export const useStarEvaluation = (
  onEvaluate: (value: StarValue | null) => void,
  calculatedQuality: Quality | null
) => {
  const [level, setLevel] = useState<StarValue | null>(null);

  useEffect(() => {
    onEvaluate(level);
  }, [level, onEvaluate]);

  const displayLevel = level ?? 0;
  const qDisplay = calculatedQuality ?? '?';

  const descriptionText =
    level === null
      ? EVALUATION_TEXTS.STAR.DESCRIPTION_DEFAULT
      : EVALUATION_TEXTS.STAR.RATINGS[displayLevel];

  const handleZeroClick = () => setLevel(0 as StarValue);
  const handleRatingChange = (v: number) => setLevel(v as StarValue);

  const qualityColor = useQualityColor(calculatedQuality);
  const displayColor = level === null ? QUALITY_COLORS.UNKNOWN : qualityColor;

  return {
    level,
    displayLevel,
    qDisplay,
    descriptionText,
    displayColor,
    handleZeroClick,
    handleRatingChange,
    texts: EVALUATION_TEXTS.STAR,
  };
};

// --- Hook: ScoreEvaluation ---
export const useScoreEvaluation = (
  onEvaluate: (value: number | null) => void,
  calculatedQuality: Quality | null
) => {
  const [score, setScore] = useState<number | ''>(0);
  const [maxScore, setMaxScore] = useState<number | ''>(100);
  const [isTouched, setIsTouched] = useState(false);

  const calculatedPercentage = useMemo(() => {
    // ロジックは省略
    const currentScore = Number(score);
    const currentMaxScore = Number(maxScore);
    if (isNaN(currentScore) || isNaN(currentMaxScore) || currentMaxScore <= 0 || currentScore < 0)
      return 0;
    const percentage = Math.min(100, (currentScore / currentMaxScore) * 100);
    return Math.round(percentage * 10) / 10;
  }, [score, maxScore]);

  useEffect(() => {
    if (!isTouched) {
      onEvaluate(null);
    } else {
      onEvaluate(calculatedPercentage);
    }
  }, [onEvaluate, calculatedPercentage, isTouched]);

  const handleScoreChange = (v: number | string) => {
    setScore(v === '' ? '' : Math.max(0, Number(v)));
    if (!isTouched) setIsTouched(true);
  };

  const handleMaxScoreChange = (v: number | string) => {
    setMaxScore(v === '' ? '' : Math.max(1, Number(v)));
    if (!isTouched) setIsTouched(true);
  };

  const handleSliderChange = (percentage: number) => {
    const currentMaxScore = Number(maxScore) || 100;
    const newScore = Math.round((percentage / 100) * currentMaxScore);
    setScore(newScore);
    if (!isTouched) setIsTouched(true);
  };

  const handleFocus = () => setIsTouched(true);

  const qDisplay = calculatedQuality ?? '?';
  const sliderValue = Math.round(calculatedPercentage);
  const isReady = isTouched && Number(maxScore) > 0 && Number(score) !== Number.NaN;

  const qualityColor = useQualityColor(calculatedQuality);
  const displayColor = isReady ? qualityColor : QUALITY_COLORS.UNKNOWN;

  const descriptionText = isReady
    ? EVALUATION_TEXTS.SCORE.DESCRIPTION_READY
    : EVALUATION_TEXTS.SCORE.DESCRIPTION_DEFAULT;

  return {
    score,
    maxScore,
    calculatedPercentage,
    sliderValue,
    qDisplay,
    isReady,
    displayColor,
    descriptionText,
    handleScoreChange,
    handleMaxScoreChange,
    handleSliderChange,
    handleFocus,
    texts: EVALUATION_TEXTS.SCORE,
  };
};
