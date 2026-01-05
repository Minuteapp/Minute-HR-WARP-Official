import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock,
  MapPin,
  Video,
  Coffee,
  FileText,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useCompany } from "@/contexts/CompanyContext";
import { format, addDays, subDays } from "date-fns";
import { de } from "date-fns/locale";

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tenantCompany } = useTenant();
  const { currentCompany } = useCompany();
  const effectiveCompanyId = tenantCompany?.id || currentCompany?.id;

  // Lade Kalender-Events für heute
  const { data: todayEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['calendar-events-today', effectiveCompanyId, currentDate.toISOString().split('T')[0]],
    enabled: !!effectiveCompanyId,
    queryFn: async () => {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('company_id', effectiveCompanyId)
        .gte('start_time', `${dateStr}T00:00:00`)
        .lte('start_time', `${dateStr}T23:59:59`)
        .order('start_time', { ascending: true })
        .limit(5);
      
      return (data || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        time: format(new Date(event.start_time), 'HH:mm'),
        location: event.location || 'Nicht angegeben',
        participants: null,
        duration: event.end_time 
          ? `${Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000)} Min`
          : '—',
        icon: event.event_type === 'meeting' ? Video : event.event_type === 'break' ? Coffee : FileText,
        bgColor: event.event_type === 'meeting' ? 'bg-blue-50' : event.event_type === 'break' ? 'bg-green-50' : 'bg-purple-50',
        iconColor: event.event_type === 'meeting' ? 'text-blue-600' : event.event_type === 'break' ? 'text-green-600' : 'text-purple-600'
      }));
    }
  });

  // Lade anstehende Abwesenheiten
  const { data: absences = [], isLoading: absencesLoading } = useQuery({
    queryKey: ['upcoming-absences', effectiveCompanyId],
    enabled: !!effectiveCompanyId,
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = addDays(new Date(), 30).toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('absence_requests')
        .select('id, user_id, employee_name, start_date, end_date, type, status')
        .eq('company_id', effectiveCompanyId)
        .eq('status', 'approved')
        .gte('start_date', today)
        .lte('start_date', nextMonth)
        .order('start_date', { ascending: true })
        .limit(5);
      
      return (data || []).map((absence: any) => {
        const startDate = new Date(absence.start_date);
        const endDate = new Date(absence.end_date);
        const period = startDate.toISOString().split('T')[0] === endDate.toISOString().split('T')[0]
          ? format(startDate, 'd. MMM', { locale: de })
          : `${format(startDate, 'd. MMM', { locale: de })} - ${format(endDate, 'd. MMM', { locale: de })}`;
        
        let badgeColor = 'bg-yellow-100 text-yellow-800';
        if (absence.type === 'sick' || absence.type === 'Krankheit') {
          badgeColor = 'bg-red-100 text-red-800';
        } else if (absence.type === 'vacation' || absence.type === 'Urlaub') {
          badgeColor = 'bg-green-100 text-green-800';
        }
        
        return {
          id: absence.id,
          name: absence.employee_name || 'Unbekannt',
          period,
          type: absence.type === 'sick' || absence.type === 'Krankheit' ? 'Krank' : 'Urlaub',
          badgeColor
        };
      });
    }
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handlePrevDay = () => setCurrentDate(prev => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate(prev => addDays(prev, 1));

  const isLoading = eventsLoading || absencesLoading;

  return (
    <Card className="h-full">
      <CardContent className="p-3 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Kalender & Termine</h3>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
            {todayEvents.length} Events
          </Badge>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between py-1">
          <span className="text-xs font-medium text-muted-foreground">
            {formatDate(currentDate)}
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handlePrevDay}>
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleNextDay}>
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : todayEvents.length > 0 ? (
          <div className="space-y-2">
            {todayEvents.map((event: any) => {
              const IconComponent = event.icon;
              return (
                <div key={event.id} className={`${event.bgColor} rounded-lg p-2 border border-gray-100`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <IconComponent className={`h-4 w-4 mt-0.5 flex-shrink-0 ${event.iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-foreground truncate">{event.title}</h4>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>{event.time}</span>
                          <span>•</span>
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        {event.participants && (
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                            <Users className="h-3 w-3 flex-shrink-0" />
                            <span>{event.participants} Teilnehmer</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5 flex-shrink-0">
                      {event.duration}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Keine Termine für diesen Tag</p>
          </div>
        )}

        {/* Absences Section */}
        <div className="pt-2 border-t">
          <h4 className="text-xs font-semibold mb-2">Anstehende Abwesenheiten</h4>
          {absences.length > 0 ? (
            <div className="space-y-1.5">
              {absences.map((absence: any) => (
                <div key={absence.id} className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-foreground">{absence.name}</p>
                    <p className="text-muted-foreground text-[10px]">{absence.period}</p>
                  </div>
                  <Badge className={`${absence.badgeColor} text-[10px] px-1.5 py-0.5`}>
                    {absence.type}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Keine anstehenden Abwesenheiten</p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t">
          <Link to="/calendar">
            <Button variant="outline" size="sm" className="w-full h-8 text-xs">
              Kalender öffnen
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
