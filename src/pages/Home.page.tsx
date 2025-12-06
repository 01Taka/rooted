import { useEffect } from 'react';
import { createEmptyLearningTarget } from '@/features/app/learningTarget/functions/create/create-empty-learning-target';
import { updateLearningTargetMainState } from '@/features/app/learningTarget/functions/update/update-main-state';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';

export function HomePage() {
  useEffect(() => {
    let target = createEmptyLearningTarget('id', 'title');
    for (let index = 0; index < 5; index++) {
      target = updateLearningTargetMainState(
        target,
        {
          '': { mode: 'STAR', value: 4 },
        },
        Date.now()
      );
      console.log(target);
    }
  }, []);

  return (
    <>
      <Welcome />
      <ColorSchemeToggle />
    </>
  );
}
