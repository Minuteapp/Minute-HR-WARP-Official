import React from 'react';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface MonthGroupProps {
  monthKey: string;
  count: number;
}

export const MonthGroup: React.FC<MonthGroupProps> = ({ monthKey, count }) => {
  const date = parseISO(`${monthKey}-01`);
  const formattedMonth = format(date, 'MMMM yyyy', { locale: de });

  return (
    <div className="flex items-center gap-2 py-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium text-foreground">{formattedMonth}</span>
      <Badge variant="secondary" className="text-xs">
        {count}
      </Badge>
    </div>
  );
};
