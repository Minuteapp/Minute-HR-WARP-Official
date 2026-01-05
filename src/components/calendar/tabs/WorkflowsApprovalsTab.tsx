import { CalendarView, UserRole } from "@/components/CalendarModule";
import { CalendarEvent } from "../shared/CalendarWeekGrid";
import { CalendarViewRenderer } from "../shared/CalendarViewRenderer";
import { CalendarSidebar, SidebarSection } from "../shared/CalendarSidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Info, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar as CalendarIcon } from "lucide-react";
import { addHours, addDays } from "date-fns";

interface WorkflowsApprovalsTabProps {
  view: CalendarView;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  userRole: UserRole;
  zoomLevel: number;
}

// Leere Daten - werden aus der Datenbank geladen
const approvals: Array<{
  id: string;
  type: string;
  requester: string;
  details: string;
  submitted: string;
  deadline: string;
  priority: string;
}> = [];

const getWorkflowEvents = (): CalendarEvent[] => {
  // Echte Events werden aus der Datenbank geladen
  return [];
};

const getPriorityBadge = (priority: string) => {
  const variants: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
    urgent: { label: "Dringend", variant: "destructive" },
    normal: { label: "Normal", variant: "default" },
    low: { label: "Niedrig", variant: "secondary" },
  };
  return variants[priority] || variants.normal;
};

export function WorkflowsApprovalsTab({
  view,
  currentDate,
  setCurrentDate,
  zoomLevel,
}: WorkflowsApprovalsTabProps) {
  const events = getWorkflowEvents();

  return (
    <div className="flex h-full">
      <CalendarSidebar>
        {/* Info Box */}
        <Card className="p-3 bg-muted/50">
          <p className="text-xs text-muted-foreground">
            Sie sehen alle Genehmigungen im Unternehmen
          </p>
        </Card>

        {/* Offene Genehmigungen - aus Datenbank geladen */}
        <SidebarSection title="Offene Genehmigungen">
          <Card className="p-3 bg-muted/50">
            <p className="text-xs text-muted-foreground">
              Genehmigungsstatistiken werden aus der Datenbank geladen
            </p>
          </Card>
        </SidebarSection>

        {/* Genehmigungsanfragen */}
        <SidebarSection title="Genehmigungsanfragen">
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {approvals.map((approval) => {
              const priorityInfo = getPriorityBadge(approval.priority);
              return (
                <Card key={approval.id} className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{approval.type}</p>
                      <Badge variant={priorityInfo.variant} className="text-xs whitespace-nowrap">
                        {priorityInfo.label}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {approval.requester}
                      </div>
                      <div>{approval.details}</div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Eingereicht {approval.submitted}
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        Frist: {approval.deadline}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1 h-7 text-xs">
                        Genehmigen
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                        Ablehnen
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </SidebarSection>
      </CalendarSidebar>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Info Banner */}
        <Card className="m-4 p-4 bg-primary/10">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold mb-1">Workflow-Kalender</p>
              <p className="text-xs text-muted-foreground">
                Dieser Kalender zeigt Fristen für ausstehende Genehmigungen. Klicken Sie auf einen Termin, um direkt zur Genehmigung zu gelangen.
              </p>
            </div>
          </div>
        </Card>

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
