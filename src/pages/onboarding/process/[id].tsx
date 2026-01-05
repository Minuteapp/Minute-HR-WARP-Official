
import { useParams } from 'react-router-dom';
import EnhancedOnboardingProcess from '@/components/onboarding/EnhancedOnboardingProcess';

const OnboardingProcessPage = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>Process ID is required</div>;
  }

  return (
    <div className="p-6">
      <EnhancedOnboardingProcess processId={id} />
    </div>
  );
};

export default OnboardingProcessPage;
