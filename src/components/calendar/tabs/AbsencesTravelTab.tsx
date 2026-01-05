import { CalendarView, UserRole } from "@/components/CalendarModule";
import { CalendarEvent } from "../shared/CalendarWeekGrid";
import { CalendarViewRenderer } from "../shared/CalendarViewRenderer";
import { CalendarSidebar, SidebarSection } from "../shared/CalendarSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Thermometer, Plane, Baby, MapPin, Clock } from "lucide-react";
import { addHours, addDays } from "date-fns";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AbsencesTravelTabProps {
  view: CalendarView;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  userRole: UserRole;
  zoomLevel: number;
}

const absenceTypeLabels: Record<string, string> = {
  vacation: "Urlaub",
  sick_leave: "Krankheit",
  parental: "Elternzeit",
  business_trip: "Dienstreise",
  other: "Sonstige"
};

const statusColors: Record<string, string> = {
  pending: "#f59e0b",    // Gelb/Orange für ausstehend
  approved: "#22c55e",   // Grün für genehmigt
  rejected: "#ef4444",   // Rot für abgelehnt
  archived: "#6b7280"    // Grau für archiviert
};

const statusLabels: Record<string, string> = {
  pending: "Ausstehend",
  approved: "Genehmigt",
  rejected: "Abgelehnt",
  archived: "Archiviert"
};

export function AbsencesTravelTab({
  view,
  currentDate,
  setCurrentDate,
  zoomLevel,
}: AbsencesTravelTabProps) {
  const { user } = useAuth();

  // Abwesenheitsanträge aus der Datenbank laden
  const { data: absenceRequests } = useQuery({
    queryKey: ["calendar-absence-requests", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("absence_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("start_date", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Abwesenheitsanträge in CalendarEvents umwandeln
  const events: CalendarEvent[] = (absenceRequests || []).map((absence) => ({
    id: absence.id,
    title: `${absenceTypeLabels[absence.type] || absence.type} (${statusLabels[absence.status || 'pending']})`,
    start: new Date(absence.start_date),
    end: new Date(absence.end_date),
    color: statusColors[absence.status || 'pending'],
    category: absence.type,
    description: absence.reason || undefined,
  }));

  // Statistiken für die Sidebar berechnen
  const pendingCount = (absenceRequests || []).filter(a => a.status === 'pending').length;
  const approvedCount = (absenceRequests || []).filter(a => a.status === 'approved').length;
  const rejectedCount = (absenceRequests || []).filter(a => a.status === 'rejected').length;

  return (
    <div className="flex h-full">
      <CalendarSidebar>
        {/* Info Box */}
        <Card className="p-3 bg-muted/50">
          <p className="text-xs text-muted-foreground">
            Ihre Abwesenheitsanträge und deren Status
          </p>
        </Card>

        {/* Status-Übersicht */}
        <SidebarSection title="Meine Anträge">
          <div className="space-y-2">
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" style={{ color: statusColors.pending }} />
                  <span className="text-sm font-medium">Ausstehend</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {pendingCount}
                </Badge>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" style={{ color: statusColors.approved }} />
                  <span className="text-sm font-medium">Genehmigt</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {approvedCount}
                </Badge>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" style={{ color: statusColors.rejected }} />
                  <span className="text-sm font-medium">Abgelehnt</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {rejectedCount}
                </Badge>
              </div>
            </Card>
          </div>
        </SidebarSection>

        {/* Kommende Abwesenheiten */}
        <SidebarSection title="Kommende Abwesenheiten">
          <div className="space-y-2">
            {(absenceRequests || [])
              .filter(a => new Date(a.end_date) >= new Date())
              .slice(0, 5)
              .map((absence) => (
                <Card key={absence.id} className="p-3">
                  <div className="flex items-start gap-2">
                    <div 
                      className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" 
                      style={{ backgroundColor: statusColors[absence.status || 'pending'] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {absenceTypeLabels[absence.type] || absence.type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(absence.start_date), "dd.MM.yyyy", { locale: de })} - {format(new Date(absence.end_date), "dd.MM.yyyy", { locale: de })}
                      </p>
                      <Badge 
                        variant="outline" 
                        className="text-xs mt-1"
                        style={{ borderColor: statusColors[absence.status || 'pending'], color: statusColors[absence.status || 'pending'] }}
                      >
                        {statusLabels[absence.status || 'pending']}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            {(!absenceRequests || absenceRequests.filter(a => new Date(a.end_date) >= new Date()).length === 0) && (
              <Card className="p-3 bg-muted/50">
                <p className="text-xs text-muted-foreground text-center">
                  Keine kommenden Abwesenheiten
                </p>
              </Card>
            )}
          </div>
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
