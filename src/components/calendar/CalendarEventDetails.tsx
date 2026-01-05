
import { CalendarEvent } from '@/types/calendar';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useCalendar } from '@/hooks/calendar/useCalendar';

interface CalendarEventDetailsProps {
  event: CalendarEvent;
}

const CalendarEventDetails = ({ event }: CalendarEventDetailsProps) => {
  const { handleDeleteEvent, isDeleting } = useCalendar();

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      meeting: 'Besprechung',
      personal: 'Persönlich',
      appointment: 'Termin',
      training: 'Schulung',
      holiday: 'Feiertag'
    };
    return labels[type] || type;
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      meeting: 'bg-blue-100 text-blue-800',
      personal: 'bg-green-100 text-green-800',
      appointment: 'bg-orange-100 text-orange-800',
      training: 'bg-purple-100 text-purple-800',
      holiday: 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleDelete = async () => {
    if (window.confirm('Möchten Sie diesen Termin wirklich löschen?')) {
      await handleDeleteEvent(event.id);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
            <Badge className={getEventTypeColor(event.type)}>
              {getEventTypeLabel(event.type)}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {/* Datum und Zeit */}
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
          <div>
            <div className="font-medium">
              {format(new Date(event.start), 'EEEE, d. MMMM yyyy', { locale: de })}
            </div>
            <div className="text-sm text-gray-600">
              {event.allDay ? (
                'Ganztägig'
              ) : (
                `${format(new Date(event.start), 'HH:mm')} - ${format(new Date(event.end), 'HH:mm')}`
              )}
            </div>
          </div>
        </div>

        {/* Ort */}
        {event.location && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium">Ort</div>
              <div className="text-sm text-gray-600">{event.location}</div>
            </div>
          </div>
        )}

        {/* Teilnehmer */}
        {event.participants && event.participants.length > 0 && (
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium">Teilnehmer ({event.participants.length})</div>
              <div className="text-sm text-gray-600 space-y-1">
                {event.participants.map((participant, index) => (
                  <div key={index}>{participant}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Beschreibung */}
        {event.description && (
          <div>
            <div className="font-medium mb-2">Beschreibung</div>
            <div className="text-sm text-gray-600 whitespace-pre-wrap">
              {event.description}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t space-y-2">
          <Button className="w-full" variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            In externem Kalender öffnen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarEventDetails;
