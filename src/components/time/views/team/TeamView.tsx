import TeamStatsCards from "./TeamStatsCards";
import TeamMembersTable from "./TeamMembersTable";
import TeamQuickOverview from "./TeamQuickOverview";

interface TeamViewProps {
  onSelectMember: (memberId: string) => void;
}

const TeamView = ({ onSelectMember }: TeamViewProps) => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <TeamStatsCards />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Team Members Table - 3/4 width */}
        <div className="lg:col-span-3">
          <TeamMembersTable onSelectMember={onSelectMember} />
        </div>

        {/* Quick Overview - 1/4 width */}
        <div className="lg:col-span-1">
          <TeamQuickOverview />
        </div>
      </div>
    </div>
  );
};

export default TeamView;
