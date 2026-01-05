
import { useParams } from 'react-router-dom';
import EnhancedOnboardingProcess from './EnhancedOnboardingProcess';

interface OnboardingProcessDetailProps {
  processId: string;
}

const OnboardingProcessDetail = ({ processId }: OnboardingProcessDetailProps) => {
  return <EnhancedOnboardingProcess processId={processId} />;
};

export default OnboardingProcessDetail;
