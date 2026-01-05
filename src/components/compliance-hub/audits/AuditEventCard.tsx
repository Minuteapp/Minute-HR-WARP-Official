import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export interface AuditEvent {
  id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'planned';
  type: 'external' | 'internal';
  date: Date;
  auditor: string;
  findings: { count: number; severity: 'low' | 'medium' | 'high' };
  measures: { completed: number; total: number };
  nextReview?: Date;
  progressPercent: number;
}

interface AuditEventCardProps {
  audit: AuditEvent;
  onViewDetails?: (auditId: string) => void;
}

export const AuditEventCard: React.FC<AuditEventCardProps> = ({ audit, onViewDetails }) => {
  const getStatusBadge = (status: AuditEvent['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Abgeschlossen</Badge>;
      case 'in_progress':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">In Bearbeitung</Badge>;
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Geplant</Badge>;
    }
  };

  const getTypeBadge = (type: AuditEvent['type']) => {
    switch (type) {
      case 'external':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Extern</Badge>;
      case 'internal':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Intern</Badge>;
    }
  };

  const getSeverityText = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return 'niedrig';
      case 'medium': return 'mittel';
      case 'high': return 'hoch';
    }
  };

  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-muted rounded-lg">
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="font-semibold">{audit.name}</h3>
                {getStatusBadge(audit.status)}
                {getTypeBadge(audit.type)}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(audit.date, 'dd.MM.yyyy', { locale: de })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{audit.auditor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{audit.findings.count} {getSeverityText(audit.findings.severity)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>{audit.measures.completed}/{audit.measures.total} erledigt</span>
                </div>
              </div>

              {audit.nextReview && (
                <p className="text-sm text-muted-foreground mb-3">
                  <span className="font-medium">Nächste Prüfung:</span> {format(audit.nextReview, 'dd.MM.yyyy', { locale: de })}
                </p>
              )}

              <div className="flex items-center gap-4">
                <Progress value={audit.progressPercent} className="flex-1 h-2" />
                <span className="text-sm font-medium">{audit.progressPercent}%</span>
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails?.(audit.id)}
          >
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
