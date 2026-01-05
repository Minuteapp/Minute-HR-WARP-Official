
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar as CalendarIcon, CheckSquare, RefreshCw } from "lucide-react";
import { useCalendarTaskIntegration } from "@/hooks/useCalendarTaskIntegration";
import { CalendarEvent } from '@/types/calendar';

interface CalendarTasksWidgetProps {
  upcomingEvents?: CalendarEvent[];
  onSyncComplete?: () => void;
}

export function CalendarTasksWidget({ 
  upcomingEvents = [], 
  onSyncComplete 
}: CalendarTasksWidgetProps) {
  const { 
    isSyncing, 
    syncWithCalendar, 
    createTaskFromEvent,
    importEventsAsTasks 
  } = useCalendarTaskIntegration();

  const handleSyncCalendar = async () => {
    await syncWithCalendar();
    if (onSyncComplete) onSyncComplete();
  };

  const handleImportEvents = async () => {
    await importEventsAsTasks();
    if (onSyncComplete) onSyncComplete();
  };

  const handleCreateTask = async (event: CalendarEvent) => {
    await createTaskFromEvent(event);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Kalender & Aufgaben Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div className="text-sm">
            <p>Synchronisieren Sie Ihre Aufgaben mit dem Kalender oder erstellen Sie Aufgaben aus Kalenderereignissen.</p>
          </div>

          {upcomingEvents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Anstehende Ereignisse</h3>
              {upcomingEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="flex justify-between items-center border rounded-md p-2 text-sm">
                  <span>{event.title}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCreateTask(event)}
                  >
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Als Aufgabe
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex flex-col sm:flex-row gap-2">
        <Button 
          variant="outline" 
          className="w-full" 
          disabled={isSyncing}
          onClick={handleSyncCalendar}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          Aufgaben im Kalender anzeigen
        </Button>
        <Button 
          variant="outline" 
          className="w-full" 
          disabled={isSyncing}
          onClick={handleImportEvents}
        >
          <CheckSquare className="h-4 w-4 mr-2" />
          Ereignisse als Aufgaben
        </Button>
      </CardFooter>
    </Card>
  );
}
