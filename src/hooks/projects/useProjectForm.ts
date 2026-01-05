import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useProjects } from './useProjects';
import { ProjectFormData } from './types';
import { Project, ProjectStatus, ProjectPriority } from '@/types/project.types';

interface UseProjectFormProps {
  onSubmit: () => void;
  initialData?: Partial<ProjectFormData>;
  mode: 'create' | 'edit';
  projectId?: string;
}

export const useProjectForm = ({ onSubmit, initialData, mode, projectId }: UseProjectFormProps) => {
  const navigate = useNavigate();
  const { createProject, updateProject } = useProjects();

  const [activeTab, setActiveTab] = useState('basic-info');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultFormData: ProjectFormData = {
    name: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    start_date: '',
    end_date: '',
    startDate: '',
    dueDate: '',
    budget: 0,
    currency: 'EUR',
    project_type: 'standard',
    costCenter: '',
    category: '',
    responsiblePerson: '',
    tags: [],
    team: [],
    tasks: [],
    milestones: [],
    goals: [],
    taskView: 'kanban',
    enableTimeTracking: false,
    useTaskTemplate: '',
    enableNotifications: true,
    integrateExternalTools: false,
    saveAsTemplate: false,
    progress: 0,
    
    // Finanzielle Felder
    capexAmount: 0,
    opexAmount: 0,
    expectedRevenue: 0,
    discountRate: 5.0,
    enableFinancialCalculations: false,
    investmentType: 'MIXED',
    roiPercentage: 0,
    npvValue: 0,
    irrPercentage: 0,
    
    // Compliance & Risiko
    complianceRequired: false,
    riskLevel: 'medium',
    complianceNotes: '',
    
    // Dokumentation
    attachments: [],
    documentationRequired: false,
    
    // Automatisierung
    enableAutomatedReporting: false,
    reportingFrequency: 'monthly',
    enableSlackIntegration: false,
    enableEmailNotifications: true,
    
    // Verknüpfungen
    relatedBudgets: [],
    relatedProjects: [],
    linkedModules: [],
    
    // Genehmigung
    approvalRequired: false,
    approvers: [],
    approvalDeadline: '',
  };

  const [formData, setFormData] = useState<ProjectFormData>({
    ...defaultFormData,
    ...initialData,
  });

  const handleFieldChange = useCallback((field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const isFormValid = useCallback(() => {
    return formData.name && formData.name.trim() !== '';
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!isFormValid()) {
      toast.error("Bitte geben Sie mindestens einen Projektnamen ein");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        console.log('Creating new project...');
        
        // Konvertiere FormData zu Project-Format
        const projectData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || '',
          status: formData.status as ProjectStatus,
          priority: formData.priority as ProjectPriority,
          start_date: formData.startDate || formData.start_date || null,
          end_date: formData.dueDate || formData.end_date || null,
          budget: typeof formData.budget === 'string' ? parseFloat(formData.budget) || 0 : formData.budget || 0,
          currency: formData.currency || 'EUR',
          project_type: formData.project_type || 'standard',
          progress: formData.progress || 0,
          visibility: 'internal' as const,
          is_template: formData.saveAsTemplate || false,
          owner_id: formData.responsiblePerson || '', // Projektleiter
          team_members: formData.team?.map(member => member.id) || [],
          tags: formData.tags?.map(tag => typeof tag === 'string' ? { id: tag, name: tag } : tag) || [],
          custom_fields: {
            complianceRequired: formData.complianceRequired,
            riskLevel: formData.riskLevel,
            complianceNotes: formData.complianceNotes,
            enableAutomatedReporting: formData.enableAutomatedReporting,
            reportingFrequency: formData.reportingFrequency,
            approvalRequired: formData.approvalRequired,
            approvers: formData.approvers,
            approvalDeadline: formData.approvalDeadline,
          },
          milestone_data: formData.milestones || [],
          dependencies: [],
          createdAt: new Date().toISOString()
        };
        
        await createProject.mutateAsync(projectData);
        toast.success("Projekt erfolgreich erstellt");

      } else if (mode === 'edit' && projectId) {
        console.log('Updating existing project...');
        
        const updateData = {
          name: formData.name.trim(),
          description: formData.description?.trim() || '',
          status: formData.status as ProjectStatus,
          priority: formData.priority as ProjectPriority,
          start_date: formData.startDate || formData.start_date || null,
          end_date: formData.dueDate || formData.end_date || null,
          budget: typeof formData.budget === 'string' ? parseFloat(formData.budget) || 0 : formData.budget || 0,
          currency: formData.currency || 'EUR',
          project_type: formData.project_type || 'standard',
          progress: formData.progress || 0,
          team_members: formData.team?.map(member => member.id) || [],
          tags: formData.tags?.map(tag => typeof tag === 'string' ? { id: tag, name: tag } : tag) || [],
          updated_at: new Date().toISOString()
        };

        console.log('Prepared update data:', updateData);

        // Verwende die korrekte Update-Funktion mit id als erstem Parameter
        await updateProject.mutateAsync({ id: projectId, ...updateData });
        toast.success("Projekt erfolgreich aktualisiert");
      }

      onSubmit();
    } catch (error: any) {
      console.error('Fehler beim Speichern des Projekts:', error);
      
      const errorMessage = error?.message || 'Beim Speichern des Projekts ist ein Fehler aufgetreten';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    handleFieldChange,
    handleSubmit,
    isSubmitting,
    isFormValid,
    activeTab,
    setActiveTab,
  };
};

export type { ProjectFormData };
