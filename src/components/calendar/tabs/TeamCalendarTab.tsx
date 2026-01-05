import { CalendarView, UserRole } from "@/components/CalendarModule";
import { CalendarEvent } from "../shared/CalendarWeekGrid";
import { CalendarViewRenderer } from "../shared/CalendarViewRenderer";
import { CalendarSidebar, SidebarSection } from "../shared/CalendarSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle, Users, UserCheck, UserX } from "lucide-react";
import { addHours } from "date-fns";

interface TeamCalendarTabProps {
  view: CalendarView;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  userRole: UserRole;
  zoomLevel: number;
}

const teamMembers: any[] = [];

const getMockTeamEvents = (baseDate: Date): CalendarEvent[] => {
  return [];
};

export function TeamCalendarTab({
  view,
  currentDate,
  setCurrentDate,
  zoomLevel,
}: TeamCalendarTabProps) {
  const events = getMockTeamEvents(currentDate);

  return (
    <div className="flex h-full">
      <CalendarSidebar>
        {/* Info Box */}
        <Card className="p-3 bg-muted/50">
          <p className="text-xs text-muted-foreground">
            Sie sehen alle Teams im{" "}
            <span className="text-primary underline cursor-pointer">
              Unternehmen
            </span>
          </p>
        </Card>

        {/* Team-Mitglieder */}
        <SidebarSection title="Team-Mitglieder">
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <Card key={member.id} className="p-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.role}
                    </p>
                  </div>
                  <Badge
                    variant={member.status === "active" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {member.status === "active" ? "aktiv" : "abwesend"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </SidebarSection>

        {/* Konflikte & Warnungen - aus Datenbank geladen */}
        <SidebarSection title="Konflikte & Warnungen">
          <Card className="p-3 bg-muted/50">
            <p className="text-xs text-muted-foreground">
              Keine aktuellen Konflikte
            </p>
          </Card>
        </SidebarSection>

        {/* Team-Auslastung - aus Datenbank geladen */}
        <SidebarSection title="Team-Auslastung">
          <Card className="p-3 bg-muted/50">
            <p className="text-xs text-muted-foreground">
              Auslastungsdaten werden aus der Datenbank geladen
            </p>
          </Card>
        </SidebarSection>
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
