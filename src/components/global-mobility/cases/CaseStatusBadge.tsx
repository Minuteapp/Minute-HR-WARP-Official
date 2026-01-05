
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface CaseStatusBadgeProps {
  status: string;
}

export const CaseStatusBadge = ({ status }: CaseStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Entwurf', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' };
      case 'submitted':
        return { label: 'Eingereicht', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
      case 'under_review':
        return { label: 'In Prüfung', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
      case 'approved':
        return { label: 'Genehmigt', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
      case 'in_progress':
        return { label: 'Aktiv', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' };
      case 'completed':
        return { label: 'Beendet', className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' };
      case 'rejected':
        return { label: 'Abgelehnt', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
      case 'cancelled':
        return { label: 'Storniert', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
      default:
        return { label: status, className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  );
};
