
import { OverviewTabContent } from "./OverviewTabContent";
import { ProfileTabContentWrapper } from "./ProfileTabContentWrapper";
import { EmploymentTabContent } from "./EmploymentTabContent";
import { DocumentsTabContent } from "./DocumentsTabContent";
import { SalaryTabContent } from "./SalaryTabContent";
import { TimeTrackingTabContent } from "./TimeTrackingTabContent";
import { VacationTabContent } from "./VacationTabContent";
import { PlanningTabContent } from "./PlanningTabContent";
import { AbsenceHistoryTabContent } from "./AbsenceHistoryTabContent";
import { WorkTimeAnalysisTabContent } from "./WorkTimeAnalysisTabContent";
import { ProjectsTabContent } from "./ProjectsTabContent";
import { TasksTab } from "../profile/TasksTab";
import { EmployeeSickLeaveTabContent } from "./EmployeeSickLeaveTabContent";
import { EmployeeShiftPlanningTabContent } from "./EmployeeShiftPlanningTabContent";
import { EmployeeBusinessTravelTabContent } from "./EmployeeBusinessTravelTabContent";
import { EmployeeComplianceTabContent } from "./EmployeeComplianceTabContent";
import { SkillsTabContent } from "./SkillsTabContent";
import { FleetTabContent } from "./FleetTabContent";
import { TabsContent } from "@/components/ui/tabs";

// Neue Tab-Komponenten mit Add-Buttons und useEnterprisePermissions
import { CareerTabContentNew } from "./tabs/CareerTabContentNew";
import { OnboardingTabContentNew } from "./tabs/OnboardingTabContentNew";
import { Feedback360TabContentNew } from "./tabs/Feedback360TabContentNew";
import { CertificatesTabContentNew } from "./tabs/CertificatesTabContentNew";
import { HRNotesTabContentNew } from "./tabs/HRNotesTabContentNew";
import { AwardsTabContentNew } from "./tabs/AwardsTabContentNew";
import { BenefitsTabContentNew } from "./tabs/BenefitsTabContentNew";
import { HealthTabContentNew } from "./tabs/HealthTabContentNew";
import { RemoteWorkTabContentNew } from "./tabs/RemoteWorkTabContentNew";
import { SurveysTabContentNew } from "./tabs/SurveysTabContentNew";
import { MiscellaneousTabContentNew } from "./tabs/MiscellaneousTabContentNew";
import { PerformanceTabContentNew } from "./tabs/PerformanceTabContentNew";
import { NotesTab } from "./tabs/NotesTab";
import { GoalsTabNew } from "./tabs/GoalsTabNew";
import { ExpensesTabNew } from "./tabs/ExpensesTabNew";
import { TrainingTabContentNew } from "./tabs/TrainingTabContentNew";
import { CommunicationTabContentNew } from "./tabs/CommunicationTabContentNew";
import { RolesTabContentNew } from "./tabs/RolesTabContentNew";
import { SustainabilityTabContentNew } from "./tabs/SustainabilityTabContentNew";

interface TabContentProps {
  employeeId: string;
}

// Vereinheitlichende Wrapper-Komponente:
export const TabContent = ({ employeeId }: TabContentProps) => {
  return (
    <div className="mt-4">
      <TabsContent value="overview">
        <OverviewTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="profile">
        <ProfileTabContentWrapper employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="employment">
        <EmploymentTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="documents">
        <DocumentsTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="salary">
        <SalaryTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="time">
        <TimeTrackingTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="vacation">
        <VacationTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="planning">
        <PlanningTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="career" className="bg-white p-6 rounded-lg border shadow-sm">
        <CareerTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="onboarding" className="bg-white p-6 rounded-lg border shadow-sm">
        <OnboardingTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="feedback-360" className="bg-white p-6 rounded-lg border shadow-sm">
        <Feedback360TabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="certificates" className="bg-white p-6 rounded-lg border shadow-sm">
        <CertificatesTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="hr-notes" className="bg-white p-6 rounded-lg border shadow-sm">
        <HRNotesTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="absence-history" className="bg-white p-6 rounded-lg border shadow-sm">
        <AbsenceHistoryTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="work-analysis" className="bg-white p-6 rounded-lg border shadow-sm">
        <WorkTimeAnalysisTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="tasks">
        <TasksTab employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="goals" className="bg-white p-6 rounded-lg border shadow-sm">
        <GoalsTabNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="training" className="bg-white p-6 rounded-lg border shadow-sm">
        <TrainingTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="projects">
        <ProjectsTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="expenses" className="bg-white p-6 rounded-lg border shadow-sm">
        <ExpensesTabNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="awards" className="bg-white p-6 rounded-lg border shadow-sm">
        <AwardsTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="benefits" className="bg-white p-6 rounded-lg border shadow-sm">
        <BenefitsTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="health" className="bg-white p-6 rounded-lg border shadow-sm">
        <HealthTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="remote-work" className="bg-white p-6 rounded-lg border shadow-sm">
        <RemoteWorkTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="communication" className="bg-white p-6 rounded-lg border shadow-sm">
        <CommunicationTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="surveys" className="bg-white p-6 rounded-lg border shadow-sm">
        <SurveysTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="roles" className="bg-white p-6 rounded-lg border shadow-sm">
        <RolesTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="notes" className="bg-white p-6 rounded-lg border shadow-sm">
        <NotesTab employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="sustainability" className="bg-white p-6 rounded-lg border shadow-sm">
        <SustainabilityTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="sick-leave" className="bg-white p-6 rounded-lg border shadow-sm">
        <EmployeeSickLeaveTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="shift-planning" className="bg-white p-6 rounded-lg border shadow-sm">
        <EmployeeShiftPlanningTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="business-travel" className="bg-white p-6 rounded-lg border shadow-sm">
        <EmployeeBusinessTravelTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="compliance-hub" className="bg-white p-6 rounded-lg border shadow-sm">
        <EmployeeComplianceTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="miscellaneous" className="bg-white p-6 rounded-lg border shadow-sm">
        <MiscellaneousTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="performance" className="bg-white p-6 rounded-lg border shadow-sm">
        <PerformanceTabContentNew employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="skills" className="bg-white p-6 rounded-lg border shadow-sm">
        <SkillsTabContent employeeId={employeeId} />
      </TabsContent>

      <TabsContent value="fleet" className="bg-white p-6 rounded-lg border shadow-sm">
        <FleetTabContent employeeId={employeeId} />
      </TabsContent>
    </div>
  );
};
