
import { TemplateTabBase } from './TemplateTabBase';
import { UserPlus } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';

interface RecruitingTemplatesTabProps {
  searchTerm: string;
  selectedCategory: string | null;
}

export const RecruitingTemplatesTab = ({ searchTerm }: RecruitingTemplatesTabProps) => {
  const { data: templates = [] } = useTemplates('recruiting');

  return (
    <TemplateTabBase
      title="Recruiting & Onboarding Templates"
      description="Vorlagen für Stellenausschreibungen und Einarbeitung"
      icon={UserPlus}
      iconColor="text-purple-600"
      templates={templates.map(t => ({ ...t, description: t.description ?? '' })) as any}
      searchTerm={searchTerm}
      createButtonText="Neues Recruiting-Template"
    />
  );
};
