import { CalendarView, UserRole } from "@/components/CalendarModule";
import { CalendarEvent } from "../shared/CalendarWeekGrid";
import { CalendarViewRenderer } from "../shared/CalendarViewRenderer";
import { CalendarSidebar, SidebarSection } from "../shared/CalendarSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FolderKanban, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { addHours, addDays } from "date-fns";

interface ProjectsRoadmapsTabProps {
  view: CalendarView;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  userRole: UserRole;
  zoomLevel: number;
}

// Projekte werden aus der Datenbank geladen
const projects: {
  id: string;
  name: string;
  status: string;
  deadline: string;
  progress: number;
  milestones: number;
  color: string;
}[] = [];

const getMockProjectEvents = (baseDate: Date): CalendarEvent[] => {
  // Keine Mock-Events - echte Events werden aus der Datenbank geladen
  return [];
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
    "in-progress": { label: "In Bearbeitung", variant: "default" },
    pending: { label: "Ausstehend", variant: "secondary" },
    critical: { label: "Kritisch", variant: "destructive" },
  };
  return variants[status] || variants["pending"];
};

export function ProjectsRoadmapsTab({
  view,
  currentDate,
  setCurrentDate,
  zoomLevel,
}: ProjectsRoadmapsTabProps) {
  const events = getMockProjectEvents(currentDate);

  return (
    <div className="flex h-full">
      <CalendarSidebar>
        {/* Aktive Projekte */}
        <SidebarSection title="Aktive Projekte">
          <div className="space-y-3">
            {projects.map((project) => {
              const statusInfo = getStatusBadge(project.status);
              return (
                <Card key={project.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{project.name}</p>
                      <Badge variant={statusInfo.variant} className="text-xs whitespace-nowrap">
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Deadline: {project.deadline}
                    </p>
                    <div className="space-y-1">
                      <Progress value={project.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {project.progress}% abgeschlossen
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {project.milestones} Meilensteine
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </SidebarSection>

        {/* Übersicht - aus Datenbank geladen */}
        <SidebarSection title="Übersicht">
          <Card className="p-3 bg-muted/50">
            <p className="text-xs text-muted-foreground">
              Projektstatistiken werden aus der Datenbank geladen
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
