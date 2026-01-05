
import { TemplateTabBase } from './TemplateTabBase';
import { TrendingUp } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';

interface BudgetTemplatesTabProps {
  searchTerm: string;
  selectedCategory: string | null;
}

export const BudgetTemplatesTab = ({ searchTerm }: BudgetTemplatesTabProps) => {
  const { data: templates = [] } = useTemplates('budget');

  return (
    <TemplateTabBase
      title="Budget & Forecast Templates"
      description="Vorlagen für Budgetplanung und Prognosen"
      icon={TrendingUp}
      iconColor="text-orange-600"
      templates={templates.map(t => ({ ...t, description: t.description ?? '' })) as any}
      searchTerm={searchTerm}
      createButtonText="Neues Budget-Template"
    />
  );
};
