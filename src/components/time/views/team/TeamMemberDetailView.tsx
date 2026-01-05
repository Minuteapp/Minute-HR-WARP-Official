import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, User, Clock, Briefcase, Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TeamMemberOverviewTab from "./TeamMemberOverviewTab";
import TeamMemberTimeTab from "./TeamMemberTimeTab";
import TeamMemberProjectsTab from "./TeamMemberProjectsTab";
import TeamMemberVacationTab from "./TeamMemberVacationTab";

interface TeamMemberDetailViewProps {
  memberId: string;
  onBack: () => void;
}

type DetailTab = 'overview' | 'timetracking' | 'projects' | 'vacation';

const getMemberData = (memberId: string) => {
  return { name: "--", role: "--", employeeId: memberId, initials: "--" };
};

const TeamMemberDetailView = ({ memberId, onBack }: TeamMemberDetailViewProps) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  const member = getMemberData(memberId);

  const tabs = [
    { id: 'overview' as DetailTab, label: 'Übersicht', icon: User },
    { id: 'timetracking' as DetailTab, label: 'Zeiterfassung', icon: Clock },
    { id: 'projects' as DetailTab, label: 'Projekte', icon: Briefcase },
    { id: 'vacation' as DetailTab, label: 'Urlaub', icon: Calendar },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'timetracking':
        return <TeamMemberTimeTab />;
      case 'projects':
        return <TeamMemberProjectsTab />;
      case 'vacation':
        return <TeamMemberVacationTab />;
      default:
        return <TeamMemberOverviewTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
          <Avatar className="h-12 w-12 bg-primary/20">
            <AvatarFallback className="bg-primary/20 text-primary font-medium">
              {member.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{member.name}</h2>
            <p className="text-sm text-muted-foreground">{member.role} • {member.employeeId}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Heute</SelectItem>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default TeamMemberDetailView;
