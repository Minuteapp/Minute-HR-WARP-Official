
import { TemplateTabBase } from './TemplateTabBase';
import { Settings } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';

interface CustomTemplatesTabProps {
  searchTerm: string;
  selectedCategory: string | null;
}

export const CustomTemplatesTab = ({ searchTerm }: CustomTemplatesTabProps) => {
  const { data: templates = [] } = useTemplates('custom');

  return (
    <TemplateTabBase
      title="Custom Templates"
      description="Benutzerdefinierte und angepasste Vorlagen"
      icon={Settings}
      iconColor="text-gray-600"
      templates={templates.map(t => ({ ...t, description: t.description ?? '' })) as any}
      searchTerm={searchTerm}
      createButtonText="Neues Custom-Template"
    />
  );
};
