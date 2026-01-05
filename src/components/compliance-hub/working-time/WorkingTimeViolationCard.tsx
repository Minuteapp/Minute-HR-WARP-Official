// Compliance Hub - Einzelne Arbeitszeitverstoß-Karte
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Calendar, MapPin } from 'lucide-react';

export interface WorkingTimeViolation {
  id: string;
  type: 'rest_time' | 'max_hours' | 'breaks' | 'sunday_holiday';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  description: string;
  employeeName?: string;
  date: Date;
  location?: string;
}

interface WorkingTimeViolationCardProps {
  violation: WorkingTimeViolation;
}

const typeLabels: Record<WorkingTimeViolation['type'], string> = {
  rest_time: 'Ruhezeit',
  max_hours: 'Maximalarbeitszeit',
  breaks: 'Pausen',
  sunday_holiday: 'Sonntag/Feiertag'
};

const severityConfig = {
  critical: { label: 'Kritisch', className: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' },
  high: { label: 'Hoch', className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400' },
  medium: { label: 'Mittel', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400' },
  low: { label: 'Niedrig', className: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' }
};

const statusConfig = {
  open: { label: 'offen', className: 'border border-purple-500 text-purple-700 dark:text-purple-400 bg-transparent' },
  in_progress: { label: 'in Bearbeitung', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' },
  resolved: { label: 'erledigt', className: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' }
};

export const WorkingTimeViolationCard: React.FC<WorkingTimeViolationCardProps> = ({ violation }) => {
  const severity = severityConfig[violation.severity];
  const status = statusConfig[violation.status];
  const typeLabel = typeLabels[violation.type];

  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{typeLabel}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className={severity.className}>{severity.label}</Badge>
                <Badge className={status.className}>{status.label}</Badge>
              </div>
            </div>
          </div>

          {/* Beschreibung */}
          <p className="text-sm text-muted-foreground">{violation.description}</p>

          {/* Info-Zeilen */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {violation.employeeName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Mitarbeiter: <span className="text-foreground">{violation.employeeName}</span></span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Datum: <span className="text-foreground">{violation.date.toLocaleDateString('de-DE')}</span></span>
            </div>
            {violation.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Standort: <span className="text-foreground">{violation.location}</span></span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
