import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle2, ClipboardList, AlertTriangle, MapPin, User } from 'lucide-react';

export interface Measure {
  id: string;
  title: string;
  description: string;
  status: 'in-progress' | 'planned' | 'completed';
  priority: 'high' | 'medium' | 'low';
  co2Reduction: string;
  costSavings: string;
  investment: string;
  roi: string;
  responsible: string;
  location: string;
  startDate: string;
  targetDate: string;
  progress: number;
}

interface MeasureCardProps {
  measure: Measure;
  onDetails: (measure: Measure) => void;
  onUpdate: (measure: Measure) => void;
}

export const MeasureCard: React.FC<MeasureCardProps> = ({ measure, onDetails, onUpdate }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'in-progress':
        return {
          icon: Play,
          label: 'In Umsetzung',
          className: 'bg-white border border-border text-foreground',
        };
      case 'planned':
        return {
          icon: ClipboardList,
          label: 'Geplant',
          className: 'bg-white border border-border text-foreground',
        };
      case 'completed':
        return {
          icon: CheckCircle2,
          label: 'Abgeschlossen',
          className: 'bg-green-100 text-green-700 border-green-200',
        };
      default:
        return {
          icon: Play,
          label: status,
          className: 'bg-white border border-border text-foreground',
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          icon: AlertTriangle,
          label: 'HOHE PRIORITÄT',
          className: 'text-red-500',
        };
      case 'medium':
        return {
          icon: null,
          label: 'MITTLERE PRIORITÄT',
          className: 'text-yellow-600',
        };
      default:
        return {
          icon: null,
          label: 'NIEDRIGE PRIORITÄT',
          className: 'text-gray-500',
        };
    }
  };

  const statusConfig = getStatusConfig(measure.status);
  const priorityConfig = getPriorityConfig(measure.priority);
  const StatusIcon = statusConfig.icon;

  const isNegativeSavings = measure.costSavings.startsWith('-') || measure.costSavings.startsWith('€-');

  return (
    <Card>
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{measure.title}</h3>
            <Badge className={statusConfig.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${priorityConfig.className}`}>
            {priorityConfig.icon && <priorityConfig.icon className="h-3 w-3" />}
            {priorityConfig.label}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">{measure.description}</p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-6 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">CO₂-Reduktion</p>
            <p className="text-sm font-semibold text-green-600">{measure.co2Reduction}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Kostenersparnis</p>
            <p className={`text-sm font-semibold ${isNegativeSavings ? 'text-blue-600' : 'text-green-600'}`}>
              {measure.costSavings}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Investition</p>
            <p className="text-sm font-semibold text-foreground">{measure.investment}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">ROI</p>
            <p className="text-sm font-semibold text-foreground">{measure.roi}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Verantwortlich</p>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {measure.responsible}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Standort</p>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {measure.location}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Start: {measure.startDate}</span>
            <span className="font-medium text-foreground">{measure.progress}%</span>
            <span>Ziel: {measure.targetDate}</span>
          </div>
          <Progress value={measure.progress} className="h-2" />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onDetails(measure)}>
            Details
          </Button>
          {measure.status === 'planned' ? (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onUpdate(measure)}>
              Starten
            </Button>
          ) : measure.status !== 'completed' ? (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onUpdate(measure)}>
              Update
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
