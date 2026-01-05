
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import { useCrossModuleEvents } from '@/hooks/useCrossModuleEvents';
import { CrossModuleEvent } from '@/services/crossModuleEventService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const CrossModuleEventDashboard = () => {
  const { events, shiftConflicts, statistics, isLoading, updateEventStatus, resolveEvent } = useCrossModuleEvents();

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'absence':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'sick_leave':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'shift_conflict':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'absence':
        return 'Abwesenheit';
      case 'sick_leave':
        return 'Krankschreibung';
      case 'shift_conflict':
        return 'Schichtkonflikt';
      default:
        return eventType;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'conflict':
        return 'bg-red-100 text-red-800';
      case 'resolved':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const handleResolveConflict = (event: CrossModuleEvent) => {
    resolveEvent({ 
      eventId: event.id, 
      resolution: 'Schichtkonflikt manuell aufgelöst' 
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Lädt Cross-Module-Events...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cross-Module-Events</h1>
        <div className="text-sm text-gray-500">
          Automatische Synchronisation zwischen Modulen
        </div>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt Events</p>
                <p className="text-2xl font-bold">{statistics.totalEvents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ungelöste Konflikte</p>
                <p className="text-2xl font-bold text-red-600">{statistics.unresolvedConflicts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Diese Woche</p>
                <p className="text-2xl font-bold text-green-600">{statistics.recentEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abwesenheiten</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.eventsByType.absence || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schichtkonflikte */}
      {shiftConflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Aktuelle Schichtkonflikte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {shiftConflicts.filter(e => e.status === 'conflict').map((conflict) => (
                <div key={conflict.id} className="border rounded-lg p-4 bg-red-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{conflict.employee_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {conflict.department}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Konflikt am {format(new Date(conflict.start_date), 'dd.MM.yyyy', { locale: de })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {conflict.metadata?.conflict_type === 'absence_approved' 
                          ? 'Genehmigte Abwesenheit kollidiert mit geplanter Schicht'
                          : 'Schichtkonflikt'
                        }
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleResolveConflict(conflict)}
                      className="ml-4"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Auflösen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alle Events */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Cross-Module-Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Keine Events vorhanden
            </div>
          ) : (
            <div className="space-y-3">
              {events.slice(0, 20).map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getEventIcon(event.event_type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {getEventTypeLabel(event.event_type)}
                          </span>
                          <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          {event.employee_name} - {event.department}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(event.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(event.end_date), 'dd.MM.yyyy', { locale: de })}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Erstellt: {format(new Date(event.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </p>
                      </div>
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

export default CrossModuleEventDashboard;
