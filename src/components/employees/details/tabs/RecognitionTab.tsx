import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  useEmployeeAwards,
  useEmployeeTenure,
  useTeamAwards,
  useProjectAchievements,
  useEmployeeKudos,
  useKudosSummary,
  usePotentialAwards,
} from "@/integrations/supabase/hooks/useEmployeeRecognition";
import { AwardsOverviewCard } from "./recognition/AwardsOverviewCard";
import { EmployeeAwardsCard } from "./recognition/EmployeeAwardsCard";
import { TenureMilestonesCard } from "./recognition/TenureMilestonesCard";
import { TeamAwardsCard } from "./recognition/TeamAwardsCard";
import { ProjectAchievementsCard } from "./recognition/ProjectAchievementsCard";
import { PeerKudosCard } from "./recognition/PeerKudosCard";
import { PotentialAwardsCard } from "./recognition/PotentialAwardsCard";

export const RecognitionTab = ({ employeeId }: { employeeId: string }) => {
  // Hole das start_date des Mitarbeiters für das startYear
  const { data: employeeData } = useQuery({
    queryKey: ['employee-start-date', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('start_date, joining_date')
        .eq('id', employeeId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });

  const startYear = employeeData?.start_date 
    ? new Date(employeeData.start_date).getFullYear()
    : employeeData?.joining_date 
      ? new Date(employeeData.joining_date).getFullYear()
      : undefined;

  const { data: awards } = useEmployeeAwards(employeeId);
  const { data: tenure } = useEmployeeTenure(employeeId);
  const { data: teamAwards } = useTeamAwards(employeeId);
  const { data: projects } = useProjectAchievements(employeeId);
  const { data: kudos } = useEmployeeKudos(employeeId, 3);
  const { data: kudosSummary } = useKudosSummary(employeeId);
  const { data: potentialAwards } = usePotentialAwards(employeeId);

  return (
    <div className="space-y-6">
      {/* Zeile 1: Overview (Full Width) */}
      <AwardsOverviewCard awards={awards} startYear={startYear} />

      {/* Zeile 2: Employee Awards + Tenure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeeAwardsCard awards={awards} />
        <TenureMilestonesCard tenure={tenure} employeeId={employeeId} />
      </div>

      {/* Zeile 3: Team Awards + Project Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamAwardsCard teamAwards={teamAwards} />
        <ProjectAchievementsCard projects={projects} />
      </div>

      {/* Zeile 4: Peer Kudos (Full Width) */}
      <PeerKudosCard kudos={kudos} summary={kudosSummary} employeeId={employeeId} />

      {/* Zeile 5: Potential Awards (Full Width) */}
      <PotentialAwardsCard potentials={potentialAwards} />
    </div>
  );
};
