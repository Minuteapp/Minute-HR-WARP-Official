import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface BudgetInfoSectionProps {
  budget: {
    level?: string;
    budget_type?: string;
    period?: string;
    status?: string;
    responsible_person?: string;
    created_at?: string;
  };
}

export const BudgetInfoSection: React.FC<BudgetInfoSectionProps> = ({ budget }) => {
  const getLevelLabel = (level?: string) => {
    const labels: { [key: string]: string } = {
      company: 'Unternehmen',
      subsidiary: 'Gesellschaft',
      location: 'Standort',
      department: 'Abteilung',
      team: 'Team',
      project: 'Projekt',
      cost_center: 'Kostenstelle',
    };
    return labels[level || ''] || level || '-';
  };

  const getBudgetTypeLabel = (type?: string) => {
    const labels: { [key: string]: string } = {
      annual: 'Jahresbudget',
      quarterly: 'Quartalsbudget',
      project: 'Projektbudget',
      personnel: 'Personalbudget',
      investment: 'Investitionsbudget',
      esg: 'ESG-Budget',
    };
    return labels[type || ''] || type || '-';
  };

  const getStatusLabel = (status?: string) => {
    const labels: { [key: string]: string } = {
      approved: 'Freigegeben',
      draft: 'Entwurf',
      pending: 'Ausstehend',
      locked: 'Gesperrt',
    };
    return labels[status || ''] || status || '-';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy', { locale: de });
    } catch {
      return '-';
    }
  };

  const infoItems = [
    { label: 'Ebene', value: getLevelLabel(budget.level) },
    { label: 'Typ', value: getBudgetTypeLabel(budget.budget_type) },
    { label: 'Zeitraum', value: budget.period || '-' },
    { label: 'Status', value: getStatusLabel(budget.status) },
    { label: 'Verantwortlich', value: budget.responsible_person || '-' },
    { label: 'Erstellt', value: formatDate(budget.created_at) },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Budget-Informationen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {infoItems.map((item, index) => (
            <div key={index}>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="font-medium text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
