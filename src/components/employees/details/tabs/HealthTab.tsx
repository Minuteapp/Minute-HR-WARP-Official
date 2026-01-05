import {
  useOccupationalHealthExams,
  usePreventiveMedicalExams,
  useHealthPrograms,
  useWorkplaceErgonomics,
  useEAPAccess,
  useHealthMetrics,
} from "@/integrations/supabase/hooks/useEmployeeHealth";
import { OccupationalHealthExamsCard } from "./health/OccupationalHealthExamsCard";
import { PreventiveMedicalExamsCard } from "./health/PreventiveMedicalExamsCard";
import { HealthProgramsCard } from "./health/HealthProgramsCard";
import { WorkplaceErgonomicsCard } from "./health/WorkplaceErgonomicsCard";
import { EAPCard } from "./health/EAPCard";
import { HealthDashboardCard } from "./health/HealthDashboardCard";

export const HealthTab = ({ employeeId }: { employeeId: string }) => {
  const { data: occupationalExams } = useOccupationalHealthExams(employeeId);
  const { data: preventiveExams } = usePreventiveMedicalExams(employeeId);
  const { data: healthPrograms } = useHealthPrograms(employeeId);
  const { data: ergonomics } = useWorkplaceErgonomics(employeeId);
  const { data: eap } = useEAPAccess(employeeId);
  const { data: metrics } = useHealthMetrics(employeeId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupationalHealthExamsCard data={occupationalExams} />
        <PreventiveMedicalExamsCard exams={preventiveExams} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthProgramsCard programs={healthPrograms} />
        <WorkplaceErgonomicsCard ergonomics={ergonomics} />
      </div>
      <EAPCard eap={eap} />
      <HealthDashboardCard metrics={metrics} />
    </div>
  );
};
