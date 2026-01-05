import React from 'react';
import { Badge } from '@/components/ui/badge';

interface DepartmentBadgeProps {
  department: string;
}

const departmentColors: Record<string, string> = {
  'Produktion': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'R&D': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'IT': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Vertrieb': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Marketing': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'HR': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Finance': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Logistik': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Einkauf': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Qualität': 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
};

export const DepartmentBadge: React.FC<DepartmentBadgeProps> = ({ department }) => {
  const colorClass = departmentColors[department] || 'bg-muted text-muted-foreground';

  return (
    <Badge variant="outline" className={colorClass}>
      {department}
    </Badge>
  );
};
