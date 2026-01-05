// Compliance Hub - Einzelne Risiko-Karte für Liste
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, MapPin, Calendar, Lightbulb } from 'lucide-react';

export interface ComplianceRisk {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'in_review' | 'in_progress' | 'completed';
  isAutomatic: boolean;
  employeeName?: string;
  location?: string;
  date: Date;
  assignedTeam?: string;
  aiRecommendation?: string;
  riskScore: number;
}

interface RiskCardProps {
  risk: ComplianceRisk;
}

const severityConfig = {
  critical: { label: 'Kritisch', className: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400' },
  high: { label: 'Hoch', className: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400' },
  medium: { label: 'Mittel', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400' },
  low: { label: 'Niedrig', className: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' }
};

const statusConfig = {
  new: { label: 'Neu', className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  in_review: { label: 'In Prüfung', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400' },
  in_progress: { label: 'In Bearbeitung', className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' },
  completed: { label: 'Abgeschlossen', className: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' }
};

export const RiskCard: React.FC<RiskCardProps> = ({ risk }) => {
  const severity = severityConfig[risk.severity];
  const status = statusConfig[risk.status];

  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{risk.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge className={severity.className}>{severity.label}</Badge>
                  <Badge className={status.className}>{status.label}</Badge>
                  {risk.isAutomatic && (
                    <Badge variant="outline" className="border-purple-500 text-purple-700 dark:text-purple-400">
                      Automatisch
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Beschreibung */}
            <p className="text-sm text-muted-foreground">{risk.description}</p>

            {/* Info-Zeile */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {risk.employeeName && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{risk.employeeName}</span>
                </div>
              )}
              {risk.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{risk.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{risk.date.toLocaleDateString('de-DE')}</span>
              </div>
            </div>

            {/* Zuständig */}
            {risk.assignedTeam && (
              <div className="text-sm">
                <span className="text-muted-foreground">Zuständig: </span>
                <span className="font-medium text-foreground">{risk.assignedTeam}</span>
              </div>
            )}

            {/* KI-Empfehlung */}
            {risk.aiRecommendation && (
              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-300">KI-Empfehlung:</span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">{risk.aiRecommendation}</p>
              </div>
            )}
          </div>

          {/* Risiko-Score */}
          <div className="flex-shrink-0 ml-6">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-muted/20"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(risk.riskScore / 100) * 175.93} 175.93`}
                  className="text-red-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-foreground">{risk.riskScore}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
