
import { TemplateTabBase } from './TemplateTabBase';
import { GraduationCap } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';

interface TrainingTemplatesTabProps {
  searchTerm: string;
  selectedCategory: string | null;
}

export const TrainingTemplatesTab = ({ searchTerm }: TrainingTemplatesTabProps) => {
  const { data: templates = [] } = useTemplates('training');

  return (
    <TemplateTabBase
      title="Weiterbildung Templates"
      description="Vorlagen für Schulungen und Zertifikate"
      icon={GraduationCap}
      iconColor="text-blue-600"
      templates={templates.map(t => ({ ...t, description: t.description ?? '' })) as any}
      searchTerm={searchTerm}
      createButtonText="Neues Training-Template"
    />
  );
};
