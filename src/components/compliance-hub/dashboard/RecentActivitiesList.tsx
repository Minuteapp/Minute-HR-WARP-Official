// Compliance Hub - Aktuelle Aktivitäten Liste
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, CheckCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export interface ActivityItem {
  id: string;
  type: 'warning' | 'overdue' | 'completed' | 'info';
  title: string;
  description: string;
  timestamp: Date;
}

interface RecentActivitiesListProps {
  activities?: ActivityItem[];
  isLoading?: boolean;
}

export const RecentActivitiesList: React.FC<RecentActivitiesListProps> = ({
  activities,
  isLoading = false
}) => {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'overdue':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBgColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-red-100 dark:bg-red-950/30';
      case 'overdue':
        return 'bg-orange-100 dark:bg-orange-950/30';
      case 'completed':
        return 'bg-green-100 dark:bg-green-950/30';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-950/30';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Aktuelle Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-3">
                <div className="h-8 w-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Aktuelle Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            Keine aktuellen Aktivitäten vorhanden
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Aktuelle Aktivitäten</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${getBgColor(activity.type)}`}>
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: de })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
