
import { TemplateTabBase } from './TemplateTabBase';
import { DollarSign } from 'lucide-react';
import { useTemplates } from '@/hooks/useTemplates';

interface PayrollTemplatesTabProps {
  searchTerm: string;
  selectedCategory: string | null;
}

export const PayrollTemplatesTab = ({ searchTerm }: PayrollTemplatesTabProps) => {
  const { data: templates = [] } = useTemplates('payroll');

  return (
    <TemplateTabBase
      title="Lohn & Gehalt Templates"
      description="Vorlagen für Abrechnungen und Gehaltsvereinbarungen"
      icon={DollarSign}
      iconColor="text-green-600"
      templates={templates.map(t => ({ ...t, description: t.description ?? '' })) as any}
      searchTerm={searchTerm}
      createButtonText="Neues Payroll-Template"
    />
  );
};
