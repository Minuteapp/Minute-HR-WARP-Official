
import { useState, useEffect } from "react";
import { ProjectFormData } from "./types";

export const useProjectFormState = (initialData?: ProjectFormData) => {
  const defaultFormData: ProjectFormData = {
    name: '',
    description: '',
    startDate: '',
    dueDate: '',
    start_date: '',
    end_date: '',
    priority: 'medium',
    status: 'pending',
    budget: undefined,
    costCenter: '',
    category: '',
    responsiblePerson: '',
    tags: [],
    team: [],
    tasks: [],
    milestones: [],
    taskView: 'kanban',
    enableTimeTracking: false,
    useTaskTemplate: '',
    enableNotifications: true,
    integrateExternalTools: false,
    saveAsTemplate: false,
    currency: 'EUR',
    project_type: 'standard',
    progress: 0
  };
  
  const [formData, setFormData] = useState<ProjectFormData>(
    initialData || defaultFormData
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("useProjectForm initialized");
    console.log("Initial data:", initialData);
    console.log("Form data state:", formData);
  }, []);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    console.log(`Field changed: ${field}`, value);
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    handleFieldChange
  };
};
