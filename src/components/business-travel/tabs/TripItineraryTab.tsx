import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Plane, 
  Hotel, 
  Users,
  MapPin,
  Clock
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { TripAgendaItem, TripHotel, FlightDetail } from "@/types/business-travel-extended";

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  type: 'flight_departure' | 'flight_arrival' | 'hotel_checkin' | 'hotel_checkout' | 'meeting' | 'other';
  dayNumber: number;
  date: Date;
}

interface TripItineraryTabProps {
  startDate: string;
  endDate: string;
  flightDetails: FlightDetail[];
  hotels: TripHotel[];
  agendaItems: TripAgendaItem[];
}

const TripItineraryTab = ({ 
  startDate, 
  endDate, 
  flightDetails, 
  hotels, 
  agendaItems 
}: TripItineraryTabProps) => {
  const tripStart = new Date(startDate);
  const tripEnd = new Date(endDate);
  const totalDays = differenceInDays(tripEnd, tripStart) + 1;

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "";
    return timeStr.substring(0, 5);
  };

  const getTypeIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'flight_departure':
      case 'flight_arrival':
        return <Plane className="h-4 w-4" />;
      case 'hotel_checkin':
      case 'hotel_checkout':
        return <Hotel className="h-4 w-4" />;
      case 'meeting':
        return <Users className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'flight_departure':
      case 'flight_arrival':
        return 'bg-blue-500';
      case 'hotel_checkin':
      case 'hotel_checkout':
        return 'bg-orange-500';
      case 'meeting':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Build timeline events
  const buildTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];

    // Add flight departures/arrivals
    flightDetails.forEach((flight, index) => {
      if (flight.departure_time) {
        events.push({
          id: `flight-dep-${flight.id}`,
          time: formatTime(flight.departure_time),
          title: index === 0 ? 'Abflug' : 'Rückflug',
          subtitle: `${flight.airline || ''} ${flight.flight_number || ''} • ${flight.departure_airport || ''} → ${flight.arrival_airport || ''}`,
          type: 'flight_departure',
          dayNumber: index === 0 ? 1 : totalDays,
          date: index === 0 ? tripStart : tripEnd
        });
      }
      if (flight.arrival_time && index === 0) {
        events.push({
          id: `flight-arr-${flight.id}`,
          time: formatTime(flight.arrival_time),
          title: 'Ankunft am Zielort',
          subtitle: `${flight.arrival_airport || ''} • ${flight.airline || ''}`,
          type: 'flight_arrival',
          dayNumber: 1,
          date: tripStart
        });
      }
    });

    // Add hotel check-in/check-out
    hotels.forEach((hotel) => {
      if (hotel.check_in) {
        const checkInDate = new Date(hotel.check_in);
        const dayNum = differenceInDays(checkInDate, tripStart) + 1;
        events.push({
          id: `hotel-in-${hotel.id}`,
          time: hotel.check_in_time || '15:00',
          title: 'Hotel Check-in',
          subtitle: hotel.hotel_name,
          type: 'hotel_checkin',
          dayNumber: dayNum,
          date: checkInDate
        });
      }
      if (hotel.check_out) {
        const checkOutDate = new Date(hotel.check_out);
        const dayNum = differenceInDays(checkOutDate, tripStart) + 1;
        events.push({
          id: `hotel-out-${hotel.id}`,
          time: hotel.check_out_time || '11:00',
          title: 'Hotel Check-out',
          subtitle: hotel.hotel_name,
          type: 'hotel_checkout',
          dayNumber: dayNum,
          date: checkOutDate
        });
      }
    });

    // Add agenda items (meetings)
    agendaItems.forEach((item) => {
      const itemDate = new Date(item.agenda_date);
      const dayNum = differenceInDays(itemDate, tripStart) + 1;
      events.push({
        id: `agenda-${item.id}`,
        time: formatTime(item.agenda_time) || '09:00',
        title: item.title,
        subtitle: item.location || item.description || 'Termin',
        type: (item.item_type as TimelineEvent['type']) || 'meeting',
        dayNumber: dayNum,
        date: itemDate
      });
    });

    // Sort by day and time
    return events.sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
      return a.time.localeCompare(b.time);
    });
  };

  const timelineEvents = buildTimelineEvents();

  // Group events by day
  const groupEventsByDay = () => {
    const grouped: { [key: number]: TimelineEvent[] } = {};
    timelineEvents.forEach(event => {
      if (!grouped[event.dayNumber]) {
        grouped[event.dayNumber] = [];
      }
      grouped[event.dayNumber].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByDay();
  const dayKeys = Object.keys(groupedEvents).map(Number).sort((a, b) => a - b);

  const getDayLabel = (dayNum: number) => {
    if (dayNum === 1) return 'Tag 1';
    if (dayNum === totalDays) return `Tag ${totalDays}`;
    const nextDayWithEvents = dayKeys.find(d => d > dayNum);
    if (nextDayWithEvents && nextDayWithEvents - dayNum > 1) {
      return `Tag ${dayNum}-${nextDayWithEvents - 1}`;
    }
    return `Tag ${dayNum}`;
  };

  const getDayDate = (dayNum: number) => {
    return format(addDays(tripStart, dayNum - 1), "dd. MMMM yyyy", { locale: de });
  };

  if (timelineEvents.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Keine Reiseverlauf-Daten vorhanden</p>
          <p className="text-sm mt-2">Fügen Sie Flüge, Hotels oder Termine hinzu</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Reiseverlauf</h2>
      </div>

      {/* Timeline by Days */}
      <div className="space-y-4">
        {dayKeys.map((dayNum) => (
          <Card key={dayNum}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-purple-600 hover:bg-purple-700">
                  {getDayLabel(dayNum)}
                </Badge>
                <span className="text-sm text-muted-foreground">{getDayDate(dayNum)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {dayNum === 1 ? 'Anreise' : dayNum === totalDays ? 'Abreise' : 'Geschäftstermine'}
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-muted" />
                
                {/* Events */}
                <div className="space-y-4">
                  {groupedEvents[dayNum].map((event, idx) => (
                    <div key={event.id} className="relative flex items-start gap-4 pl-6">
                      {/* Timeline Dot */}
                      <div className={`absolute left-0 w-4 h-4 rounded-full ${getTypeColor(event.type)} flex items-center justify-center`}>
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                      
                      {/* Event Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Clock className="h-3 w-3" />
                          <span>{event.time} Uhr</span>
                        </div>
                        <h4 className="font-medium flex items-center gap-2">
                          {getTypeIcon(event.type)}
                          {event.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{event.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TripItineraryTab;