import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Users,
  TrendingUp,
  CheckCircle2,
  Lightbulb,
  Clock,
  AlertCircle,
} from "lucide-react";

interface PlanningTabContentProps {
  employeeId: string;
}

export const PlanningTabContent = ({ employeeId }: PlanningTabContentProps) => {
  // Keine Mock-Daten: solange keine echten Daten angebunden sind, bleiben die Listen leer.
  const weeklySchedule: Array<{
    day: string;
    date: string;
    location: string;
    hours: string;
    completed: boolean;
  }> = [];

  const teamCapacity: Array<{
    name: string;
    initials: string;
    utilization: number;
    total: number;
    free: number;
  }> = [];

  const plannedAbsences: Array<{
    name: string;
    initials: string;
    type: string;
    period: string;
  }> = [];

  const avgUtilization = teamCapacity.length
    ? teamCapacity.reduce((sum, t) => sum + t.utilization, 0) / teamCapacity.length
    : 0;
  const avgAvailable = teamCapacity.length ? 100 - avgUtilization : 0;
  const totalHours = teamCapacity.reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
      {/* Top Section - Weekly Schedule & Team Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Weekly Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Meine Wochenplanung
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                —
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {weeklySchedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Keine Planungsdaten vorhanden</p>
                <p className="text-xs text-muted-foreground">Sobald eine Wochenplanung erfasst ist, erscheint sie hier.</p>
              </div>
            ) : (
              weeklySchedule.map((day, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-sm font-medium w-8">{day.day}</div>
                    <div className="text-xs text-muted-foreground">{day.date}</div>
                    <Badge variant="secondary" className="text-xs">
                      {day.location}
                    </Badge>
                    <span className="text-sm">{day.hours}</span>
                  </div>
                  {day.completed && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Team Capacity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team-Kapazität (diese Woche)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamCapacity.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Keine Kapazitätsdaten vorhanden</p>
                <p className="text-xs text-muted-foreground">Sobald Kapazitäten erfasst sind, erscheinen sie hier.</p>
              </div>
            ) : (
              <>
                {teamCapacity.map((member, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{member.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {member.utilization}% / {member.total}%
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {member.free}% frei
                        </Badge>
                      </div>
                    </div>
                    <Progress value={member.utilization} className="h-2" />
                  </div>
                ))}

                <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{Math.round(avgUtilization)}%</p>
                    <p className="text-xs text-muted-foreground">Ø Auslastung</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{Math.round(avgAvailable)}%</p>
                    <p className="text-xs text-muted-foreground">Verfügbar</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{totalHours}h</p>
                    <p className="text-xs text-muted-foreground">Gesamt</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Planned Absences */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Geplante Abwesenheiten (nächste 8 Wochen)
            </CardTitle>
            <Button variant="outline" size="sm">
              Kalenderansicht
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {plannedAbsences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Keine geplanten Abwesenheiten vorhanden</p>
              <p className="text-xs text-muted-foreground">Sobald Abwesenheiten erfasst sind, erscheinen sie hier.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plannedAbsences.map((absence, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm bg-primary/10 text-primary">
                        {absence.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{absence.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {absence.type}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{absence.period}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resource Planning & Forecast */}
      <Card className="bg-purple-50/50 border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Ressourcenplanung & Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Keine Forecast-Daten verfügbar</p>
            <p className="text-xs text-muted-foreground">Sobald Forecast/Kennzahlen vorliegen, werden sie hier angezeigt.</p>
          </div>
        </CardContent>
      </Card>

      {/* Shift Planning (Optional) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schichtplanung (Optional)
            </CardTitle>
            <Button variant="outline" size="sm">
              Schicht tauschen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">Keine Schichtarbeit für diese Position konfiguriert.</p>
            <p className="text-sm text-muted-foreground">Bei Bedarf können Schichtmodelle durch HR eingerichtet werden.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
