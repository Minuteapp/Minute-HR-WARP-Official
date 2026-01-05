
import { useProjectForm, ProjectFormData } from "@/hooks/projects/useProjectForm";
import { FormTabsNavigation } from "@/components/projects/form/FormTabsNavigation";
import { BasicInfoTab } from "@/components/projects/form/BasicInfoTab";
import { TeamTab } from "@/components/projects/form/TeamTab";
import { TimelineTab } from "@/components/projects/form/TimelineTab";
import { ResourcesTab } from "@/components/projects/form/ResourcesTab";
import { TasksTab } from "@/components/projects/form/TasksTab";
import { GoalsTab } from "@/components/projects/form/GoalsTab";
import { FinancialTab } from "@/components/projects/form/FinancialTab";
import { useEffect } from "react";
import { Tabs } from "@/components/ui/tabs";
import { Project } from "@/types/project.types";

interface ProjectFormProps {
  onSubmit: () => void;
  initialData?: ProjectFormData;
  mode: 'create' | 'edit';
  projectId?: string;
  onLoadingChange?: (loading: boolean) => void;
  existingProject?: Project;
}

export const ProjectForm = ({ 
  onSubmit, 
  initialData, 
  mode, 
  projectId, 
  onLoadingChange,
  existingProject
}: ProjectFormProps) => {
  const {
    formData,
    handleFieldChange,
    handleSubmit,
    isSubmitting,
    isFormValid,
    activeTab,
    setActiveTab
  } = useProjectForm({ onSubmit, initialData, mode, projectId });

  // Update loading state when isSubmitting changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isSubmitting);
    }
  }, [isSubmitting, onLoadingChange]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto w-full"> 
      <div className="space-y-4">
        <FormTabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <Tabs value={activeTab} className="mt-4">
          <BasicInfoTab
            formData={formData}
            onChange={handleFieldChange}
            onNext={() => setActiveTab("team")}
            active={activeTab === "basic-info"}
            forceMount={true}
            mode={mode}
          />
          
          <TeamTab
            formData={formData}
            onChange={handleFieldChange}
            onBack={() => setActiveTab("basic-info")}
            onNext={() => setActiveTab("timeline")}
            active={activeTab === "team"}
            forceMount={true}
            mode={mode}
          />
          
          <TimelineTab
            formData={formData}
            onChange={handleFieldChange}
            onBack={() => setActiveTab("team")}
            onNext={() => setActiveTab("tasks")}
            active={activeTab === "timeline"}
            forceMount={true}
            mode={mode}
          />
          
          <TasksTab
            formData={formData}
            onChange={handleFieldChange}
            onBack={() => setActiveTab("timeline")}
            onNext={() => setActiveTab("goals")}
            active={activeTab === "tasks"}
            forceMount={true}
            mode={mode}
          />

          <GoalsTab
            formData={formData}
            onChange={handleFieldChange}
            onBack={() => setActiveTab("tasks")}
            onNext={() => setActiveTab("financial")}
            active={activeTab === "goals"}
            forceMount={true}
            mode={mode}
          />

          <FinancialTab
            formData={formData}
            onChange={handleFieldChange}
            onBack={() => setActiveTab("goals")}
            onNext={() => setActiveTab("resources")}
            active={activeTab === "financial"}
            forceMount={true}
            mode={mode}
          />
          
          <ResourcesTab
            formData={formData}
            onChange={handleFieldChange}
            onBack={() => setActiveTab("financial")}
            isSubmitting={isSubmitting}
            isFormValid={isFormValid()}
            mode={mode}
            active={activeTab === "resources"}
            forceMount={true}
          />
        </Tabs>
      </div>
    </form>
  );
};
