
import { TemplateTabBase } from './TemplateTabBase';
import { BarChart3 } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';

interface PerformanceTemplatesTabProps {
  searchTerm: string;
  selectedCategory: string | null;
}

export const PerformanceTemplatesTab = ({ searchTerm }: PerformanceTemplatesTabProps) => {
  const { data: templates = [] } = useTemplates('performance');

  return (
    <TemplateTabBase
      title="Performance Templates"
      description="Bewertungsvorlagen und Feedback-Systeme"
      icon={BarChart3}
      iconColor="text-green-600"
      templates={templates.map(t => ({ ...t, description: t.description ?? '' })) as any}
      searchTerm={searchTerm}
      createButtonText="Neues Performance-Template"
    />
  );
};
