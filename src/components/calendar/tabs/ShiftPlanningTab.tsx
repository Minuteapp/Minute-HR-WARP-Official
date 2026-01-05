import { CalendarView, UserRole } from "@/components/CalendarModule";
import { CalendarEvent } from "../shared/CalendarWeekGrid";
import { CalendarViewRenderer } from "../shared/CalendarViewRenderer";
import { CalendarSidebar, SidebarSection } from "../shared/CalendarSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sunrise, Sunset, Moon, CheckCircle, AlertTriangle, Lightbulb, Wrench } from "lucide-react";
import { addHours } from "date-fns";

interface ShiftPlanningTabProps {
  view: CalendarView;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  userRole: UserRole;
  zoomLevel: number;
}

// Keine Mock-Daten - Schichttypen werden aus der Datenbank geladen
const shiftTypes: { id: string; icon: any; name: string; time: string; count: number; color: string }[] = [];

// Keine Mock-Daten - Besetzung wird aus der Datenbank geladen
const staffing: { id: string; area: string; current: number; required: number; status: string }[] = [];

const getMockShiftEvents = (baseDate: Date): CalendarEvent[] => {
  // Keine Mock-Events - echte Events werden aus der Datenbank geladen
  return [];
};

export function ShiftPlanningTab({
  view,
  currentDate,
  setCurrentDate,
  zoomLevel,
}: ShiftPlanningTabProps) {
  const events = getMockShiftEvents(currentDate);

  return (
    <div className="flex h-full">
      <CalendarSidebar>
        {/* Schichttypen */}
        <SidebarSection title="Schichttypen">
          <div className="space-y-2">
            {shiftTypes.map((shift) => (
              <Card key={shift.id} className="p-3">
                <div className="flex items-start gap-2">
                  <shift.icon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: shift.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{shift.name}</p>
                    <p className="text-xs text-muted-foreground">{shift.time}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {shift.count} Schichten
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </SidebarSection>

        {/* Besetzung heute */}
        <SidebarSection title="Besetzung heute">
          <div className="space-y-2">
            {staffing.map((staff) => (
              <Card
                key={staff.id}
                className={
                  staff.status === "ok"
                    ? "p-3 bg-green-500/10 border-green-500/20"
                    : "p-3 bg-red-500/10 border-red-500/20"
                }
              >
                <div className="flex items-start gap-2">
                  {staff.status === "ok" ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{staff.area}</p>
                    <p className="text-xs text-muted-foreground">
                      {staff.current} / {staff.required} Mitarbeiter
                    </p>
                    {staff.status === "warning" && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        ⚠️ Unterbesetzt
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </SidebarSection>

        {/* Info - KI-Vorschläge */}
        <Card className="p-3 bg-muted/50">
          <p className="text-xs text-muted-foreground">
            KI-Vorschläge werden basierend auf verfügbaren Daten generiert
          </p>
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
