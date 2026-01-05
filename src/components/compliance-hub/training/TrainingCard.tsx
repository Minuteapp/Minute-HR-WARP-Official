import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, AlertTriangle, Clock, MapPin, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface Training {
  id: string;
  name: string;
  category: string;
  isMandatory: boolean;
  frequency: string;
  certificateValidity: string;
  targetGroups: number;
  locations: string[];
  completedCount: number;
  overdueCount: number;
  pendingCount: number;
  completionPercent: number;
}

interface TrainingCardProps {
  training: Training;
}

export const TrainingCard: React.FC<TrainingCardProps> = ({ training }) => {
  const getCompletionColor = (percent: number) => {
    if (percent >= 90) return 'border-green-500 text-green-600';
    if (percent >= 70) return 'border-orange-500 text-orange-600';
    return 'border-red-500 text-red-600';
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-green-500';
    if (percent >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-muted rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="font-semibold">{training.name}</h3>
                {training.isMandatory && (
                  <Badge className="bg-red-500 text-white hover:bg-red-600">Pflicht</Badge>
                )}
                <Badge variant="secondary">{training.category}</Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                <div>
                  <span className="font-medium">Frequenz:</span> {training.frequency}
                </div>
                <div>
                  <span className="font-medium">Zertifikat gültig:</span> {training.certificateValidity}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{training.targetGroups} Zielgruppen</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{training.locations.join(', ')}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm mb-3">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {training.completedCount} abgeschlossen
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  {training.overdueCount} überfällig
                </span>
                <span className="flex items-center gap-1 text-orange-600">
                  <Clock className="h-4 w-4" />
                  {training.pendingCount} anstehend
                </span>
              </div>

              <Progress value={training.completionPercent} className={`h-2 ${getProgressColor(training.completionPercent)}`} />
            </div>
          </div>

          <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center font-bold ${getCompletionColor(training.completionPercent)}`}>
            {training.completionPercent}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
