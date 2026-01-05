
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, isToday, isTomorrow, isThisWeek, isThisMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemo } from "react";

interface Event {
  id: string;
  title: string;
  start_time: string;
  location?: string;
  type?: string;
  metadata?: {
    duration?: string;
  };
}

interface CalendarCardProps {
  events?: Event[];
  darkMode?: boolean;
  view?: 'today' | 'week' | 'month';
  onToggleVisibility?: () => void;
}

const CalendarCard = ({ 
  events = [], // Standardwert für events
  darkMode = false, 
  view = 'today', 
  onToggleVisibility 
}: CalendarCardProps) => {
  const navigate = useNavigate();
  
  const getEventIcon = (type?: string) => {
    switch(type) {
      case 'meeting': return '📅';
      case 'training': return '🎓';
      case 'holiday': return '🏖️';
      case 'birthday': return '🎂';
      case 'deadline': return '⏰';
      default: return '📌';
    }
  };
  
  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Ungültiges Datum';
      }
      
      if (isToday(date)) {
        return `Heute, ${format(date, 'HH:mm', { locale: de })}`;
      } else if (isTomorrow(date)) {
        return `Morgen, ${format(date, 'HH:mm', { locale: de })}`;
      } else if (isThisWeek(date)) {
        return format(date, 'EEEE, HH:mm', { locale: de });
      } else {
        return format(date, 'dd.MM.yyyy, HH:mm', { locale: de });
      }
    } catch (error) {
      console.error('Fehler beim Formatieren des Datums:', error, dateString);
      return 'Ungültiges Datum';
    }
  };
  
  const viewTitle = () => {
    switch(view) {
      case 'today': return 'Termine heute';
      case 'week': return 'Termine diese Woche';
      case 'month': return 'Termine diesen Monat';
    }
  };

  // Sortierte Events
  const sortedEvents = useMemo(() => {
    if (!events || !Array.isArray(events)) return [];
    
    return [...events]
      .filter(event => {
        try {
          return isToday(new Date(event.start_time));
        } catch {
          return false;
        }
      })
      .sort((a, b) => {
        try {
          const dateA = new Date(a.start_time).getTime();
          const dateB = new Date(b.start_time).getTime();
          return dateA - dateB;
        } catch (error) {
          return 0;
        }
      })
      .slice(0, 4);
  }, [events]);
  
  return (
    <Card id="calendar-card" className="today-card h-full flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Calendar className="h-5 w-5 text-primary" />
          {viewTitle()}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/calendar')}>
              Zum Kalender
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/calendar?new=true')}>
              Termin erstellen
            </DropdownMenuItem>
            {onToggleVisibility && (
              <DropdownMenuItem onClick={onToggleVisibility}>
                Card ausblenden
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-3 pr-1">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => {
              const eventDate = new Date(event.start_time);
              const duration = event.metadata?.duration || '30 Min';
              
              return (
                <div
                  key={event.id}
                  className="p-3 rounded-md flex items-start gap-3 bg-gray-50"
                >
                  <div className="flex flex-col items-center min-w-[50px]">
                    <span className="text-sm font-medium">{format(eventDate, 'HH:mm', { locale: de })}</span>
                    <span className="text-xs text-gray-500">{duration}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium truncate">{event.title}</h4>
                      {event.type === 'meeting' && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">📹</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-gray-500">
              Keine Termine heute
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 flex-shrink-0">
        <Button
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => navigate('/calendar')}
        >
          Alle anzeigen
        </Button>
        <Button
          variant="default"
          size="sm"
          className="w-full ml-2"
          onClick={() => navigate('/calendar', { state: { newEvent: true } })}
        >
          <Plus className="h-4 w-4 mr-1" />
          Neu
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CalendarCard;
