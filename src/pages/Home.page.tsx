import { createEmptyLearningTarget } from '@/features/app/learningTarget/functions/create/create-empty-learning-target';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Welcome } from '../components/Welcome/Welcome';

export function HomePage() {
  console.log(createEmptyLearningTarget('id', 'title'));

  return (
    <>
      <Welcome />
      <ColorSchemeToggle />
    </>
  );
}
