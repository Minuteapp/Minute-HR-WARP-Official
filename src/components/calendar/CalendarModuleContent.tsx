import { CalendarTab, CalendarView, UserRole } from "../CalendarModule";
import { MyAppointmentsTab } from "./tabs/MyAppointmentsTab";
import { TeamCalendarTab } from "./tabs/TeamCalendarTab";
import { CompanyCalendarTab } from "./tabs/CompanyCalendarTab";
import { ProjectsRoadmapsTab } from "./tabs/ProjectsRoadmapsTab";
import { ShiftPlanningTab } from "./tabs/ShiftPlanningTab";
import { AbsencesTravelTab } from "./tabs/AbsencesTravelTab";
import { WorkflowsApprovalsTab } from "./tabs/WorkflowsApprovalsTab";
import { AIPlanningTab } from "./tabs/AIPlanningTab";

interface CalendarModuleContentProps {
  activeTab: CalendarTab;
  view: CalendarView;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  userRole: UserRole;
  zoomLevel: number;
}

export function CalendarModuleContent({
  activeTab,
  view,
  currentDate,
  setCurrentDate,
  userRole,
  zoomLevel,
}: CalendarModuleContentProps) {
  
  const commonProps = {
    view,
    currentDate,
    setCurrentDate,
    userRole,
    zoomLevel,
  };

  switch (activeTab) {
    case "my-appointments":
      return <MyAppointmentsTab {...commonProps} />;
    case "team-calendar":
      return <TeamCalendarTab {...commonProps} />;
    case "company-calendar":
      return <CompanyCalendarTab {...commonProps} />;
    case "projects-roadmaps":
      return <ProjectsRoadmapsTab {...commonProps} />;
    case "shift-planning":
      return <ShiftPlanningTab {...commonProps} />;
    case "absences-travel":
      return <AbsencesTravelTab {...commonProps} />;
    case "workflows-approvals":
      return <WorkflowsApprovalsTab {...commonProps} />;
    case "ai-planning":
      return <AIPlanningTab {...commonProps} />;
    default:
      return <MyAppointmentsTab {...commonProps} />;
  }
}
