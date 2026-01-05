import SettingsHeader from './SettingsHeader';
import EnterpriseScalingBox from './sections/EnterpriseScalingBox';
import PerformanceSection from './sections/PerformanceSection';
import ProjectTypesSection from './sections/ProjectTypesSection';
import WorkflowsSection from './sections/WorkflowsSection';
import AIFunctionsSection from './sections/AIFunctionsSection';
import NotificationsSection from './sections/NotificationsSection';
import IntegrationsSection from './sections/IntegrationsSection';

const EnterpriseSettingsTab = () => {
  return (
    <div>
      <SettingsHeader />
      <EnterpriseScalingBox />
      <PerformanceSection />
      <ProjectTypesSection />
      <WorkflowsSection />
      <AIFunctionsSection />
      <NotificationsSection />
      <IntegrationsSection />
    </div>
  );
};

export default EnterpriseSettingsTab;
