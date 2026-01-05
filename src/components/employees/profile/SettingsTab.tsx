
import { PersonalDataCard } from './settings/PersonalDataCard';
import { NotificationsCard } from './settings/NotificationsCard';
import { DocumentsCard } from './settings/DocumentsCard';

interface SettingsTabProps {
  employeeId: string;
}

export const SettingsTab = ({ employeeId }: SettingsTabProps) => {
  return (
    <div className="space-y-6">
      <NotificationsCard employeeId={employeeId} />
      <PersonalDataCard employeeId={employeeId} />
      <DocumentsCard employeeId={employeeId} />
    </div>
  );
};
