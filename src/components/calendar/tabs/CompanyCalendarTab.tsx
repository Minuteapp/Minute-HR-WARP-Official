import { CalendarView, UserRole } from "@/components/CalendarModule";
import { CalendarEvent } from "../shared/CalendarWeekGrid";
import { CalendarViewRenderer } from "../shared/CalendarViewRenderer";
import { CalendarSidebar, SidebarSection } from "../shared/CalendarSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, GraduationCap, Users, Info } from "lucide-react";
import { addHours, addDays } from "date-fns";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CompanyCalendarTabProps {
  view: CalendarView;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  userRole: UserRole;
  zoomLevel: number;
}

const eventCategories: { id: string; icon: any; name: string; count: number; color: string }[] = [];

const upcomingEvents: { id: string; title: string; date: Date }[] = [];

// Company events will be loaded from database
const getMockCompanyEvents = (baseDate: Date): CalendarEvent[] => {
  return [];
};

export function CompanyCalendarTab({
  view,
  currentDate,
  setCurrentDate,
  zoomLevel,
}: CompanyCalendarTabProps) {
  const events = getMockCompanyEvents(currentDate);

  return (
    <div className="flex h-full">
      <CalendarSidebar>
        {/* Event-Kategorien */}
        <SidebarSection title="Event-Kategorien">
          <div className="space-y-2">
            {eventCategories.map((category) => (
              <Card
                key={category.id}
                className="p-3 cursor-pointer hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <category.icon className="h-4 w-4" style={{ color: category.color }} />
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {category.count} Events
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </SidebarSection>

        {/* Anstehende Events */}
        <SidebarSection title="Anstehende Events">
          <div className="space-y-2">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="p-3 cursor-pointer hover:bg-accent transition-colors">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(event.date, "d. MMM.", { locale: de })}
                </p>
              </Card>
            ))}
          </div>
        </SidebarSection>

        {/* Info Box */}
        <Card className="p-4 bg-primary/10">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">Unternehmens-Kalender</p>
              <p className="text-xs text-muted-foreground">
                Hier finden Sie alle firmenweiten Events, Feiertage und Pflichtschulungen.
              </p>
            </div>
          </div>
        </Card>
      </CalendarSidebar>

      <div className="flex-1 overflow-hidden">
        <CalendarViewRenderer
          view={view}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          events={events}
          zoomLevel={zoomLevel}
        />
      </div>
    </div>
  );
}
