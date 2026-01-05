import { TabsContent } from "@/components/ui/tabs";
import { useEmployeeData } from "@/hooks/useEmployeeData";
import { CurrentPositionSection } from "../profile/employment/CurrentPositionSection";
import { HierarchyTeamSection } from "../profile/employment/HierarchyTeamSection";
import { QualificationsSkillsSection } from "../profile/employment/QualificationsSkillsSection";
import { CertificatesSection } from "../profile/employment/CertificatesSection";
import { CareerHistorySection } from "../profile/employment/CareerHistorySection";
import { CostCenterSection } from "../profile/employment/CostCenterSection";
import { ITAssetsSection } from "../profile/employment/ITAssetsSection";
import { ComplianceFooter } from "../profile/sections/ComplianceFooter";
import { EmployeeTabEditProps } from "@/types/employee-tab-props.types";

interface EmploymentTabContentProps extends EmployeeTabEditProps {}

export const EmploymentTabContent = ({ 
  employeeId, 
  isEditing = false, 
  onFieldChange, 
  pendingChanges 
}: EmploymentTabContentProps) => {
  const { employee, isLoading } = useEmployeeData(employeeId);

  if (isLoading) {
    return (
      <TabsContent value="employment" className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="employment" className="bg-white p-6 rounded-lg border shadow-sm">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CurrentPositionSection 
            employee={employee} 
            isEditing={isEditing} 
            onFieldChange={onFieldChange} 
          />
          <HierarchyTeamSection 
            employee={employee} 
            isEditing={isEditing} 
            onFieldChange={onFieldChange} 
          />
        </div>
        
        <QualificationsSkillsSection 
          employee={employee} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CertificatesSection employee={employee} />
          <CareerHistorySection 
            employee={employee} 
          />
        </div>
        
        <CostCenterSection 
          employee={employee} 
        />
        
        <ITAssetsSection 
          employee={employee} 
        />
        
        <ComplianceFooter activeRole="HR-Manager" totalTabs={35} activeTabs={35} />
      </div>
    </TabsContent>
  );
};
