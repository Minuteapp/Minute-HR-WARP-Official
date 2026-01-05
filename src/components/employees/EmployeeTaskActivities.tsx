
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';
import { useEmployeeTaskActivities } from '@/hooks/useEmployeeTaskActivities';

interface EmployeeTaskActivitiesProps {
  employeeId: string;
}

const EmployeeTaskActivities: React.FC<EmployeeTaskActivitiesProps> = ({ employeeId }) => {
  const { activities, stats, isLoading, error } = useEmployeeTaskActivities(employeeId);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'assigned':
        return <Users className="h-4 w-4 text-blue-500" />;
      case 'status_changed':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'completed':
        return 'Aufgabe erledigt';
      case 'assigned':
        return 'Aufgabe zugewiesen';
      case 'status_changed':
        return 'Status geändert';
      default:
        return 'Aktivität';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Lädt Task-Aktivitäten...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Fehler beim Laden der Task-Aktivitäten
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistik-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abgeschlossene Tasks</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedTasksCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Zugewiesene Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{stats.assignedTasksCount}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt Aktivitäten</p>
                <p className="text-2xl font-bold text-gray-600">{stats.totalActivities}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aktivitäten-Liste */}
      <Card>
        <CardHeader>
          <CardTitle>Task-Aktivitäten</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Keine Task-Aktivitäten vorhanden
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getActivityIcon(activity.activity_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {getActivityLabel(activity.activity_type)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {activity.metadata?.task_title || 'Unbekannte Aufgabe'}
                        </Badge>
                      </div>
                      
                      {activity.activity_type === 'status_changed' && (
                        <p className="text-sm text-gray-600 mb-1">
                          Status geändert von "{activity.previous_status}" zu "{activity.new_status}"
                        </p>
                      )}
                      
                      {activity.completion_date && (
                        <p className="text-sm text-gray-600 mb-1">
                          Abgeschlossen am: {formatDate(activity.completion_date)}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeTaskActivities;
