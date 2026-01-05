import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plane, Heart, Calendar, AlertCircle, Info } from "lucide-react";

interface VacationTabContentProps {
  employeeId: string;
}

export const VacationTabContent = ({ employeeId }: VacationTabContentProps) => {
  // Keine Mock-Daten: solange keine echten Daten angebunden sind, bleiben die Listen leer.
  const plannedAbsences: Array<{
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    status: "genehmigt" | "beantragt";
  }> = [];

  const absenceHistory: Array<{
    type: "Urlaub" | "Krankheit";
    period: string;
    days: number;
    status: string;
  }> = [];

  const annualOverview: Array<{
    label: string;
    value: string;
    unit: string;
    highlight?: boolean;
  }> = [];

  const vacationUsed = 0;
  const vacationTotal = 0;
  const vacationRemaining = Math.max(vacationTotal - vacationUsed, 0);
  const vacationProgress = vacationTotal > 0 ? (vacationRemaining / vacationTotal) * 100 : 0;
  const plannedDays = plannedAbsences.reduce((sum, a) => sum + a.days, 0);

  const sickDaysYtd = 0;
  const sickDaysLastMonth = 0;

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
      {/* Top Section - Vacation & Sick Days */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vacation Claim 2025 */}
        <Card className="bg-green-50/50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Urlaubsanspruch 2025
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Resturlaub</span>
                <span className="text-sm font-medium">von {vacationTotal} Tagen verfügbar</span>
              </div>
              <div className="mb-2">
                <div className="text-4xl font-bold text-green-600">{vacationRemaining} Tage</div>
              </div>
              <Progress value={vacationProgress} className="h-3 bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Jahresanspruch</p>
                <p className="text-lg font-bold">{vacationTotal} Tage</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Genommen</p>
                <p className="text-lg font-bold">{vacationUsed} Tage</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Geplant</p>
                <p className="text-lg font-bold">{plannedDays} Tage</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Übertrag 2024</p>
                <p className="text-lg font-bold">0 Tage</p>
              </div>
            </div>

            <Button className="w-full bg-black hover:bg-black/90 text-white">Urlaub beantragen</Button>
          </CardContent>
        </Card>

        {/* Sick Days 2025 */}
        <Card className="bg-red-50/50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Krankheitstage 2025
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Krankheitstage (YTD)</p>
              <div className="text-4xl font-bold mb-1">{sickDaysYtd} Tage</div>
              <p className="text-sm text-muted-foreground">Keine Vergleichsdaten verfügbar</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Letzter Monat</p>
                <p className="text-lg font-bold">{sickDaysLastMonth} Tage</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Durchschnitt</p>
                <p className="text-lg font-bold">—</p>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800">Bei Krankheit bitte Krankmeldung hochladen und HR informieren.</p>
            </div>

            <Button variant="outline" className="w-full">
              Krankmeldung einreichen
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Planned Absences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Geplante Abwesenheiten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {plannedAbsences.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Keine geplanten Abwesenheiten vorhanden</p>
              <p className="text-xs text-muted-foreground">Sobald Abwesenheiten erfasst sind, erscheinen sie hier.</p>
            </div>
          ) : (
            plannedAbsences.map((absence, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50/50">
                <Plane className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{absence.type}</p>
                  <p className="text-xs text-muted-foreground">
                    {absence.startDate} - {absence.endDate} ({absence.days} Tage)
                  </p>
                </div>
                <Badge
                  variant={absence.status === "genehmigt" ? "default" : "secondary"}
                  className={absence.status === "genehmigt" ? "bg-black text-white" : ""}
                >
                  {absence.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Absence History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Abwesenheits-Historie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Typ</th>
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Zeitraum</th>
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Dauer</th>
                  <th className="text-left py-2 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {absenceHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium">Keine Historie vorhanden</p>
                        <p className="text-xs text-muted-foreground">Es wurden noch keine Abwesenheiten protokolliert.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  absenceHistory.map((entry, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {entry.type === "Urlaub" ? (
                            <Plane className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Heart className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm">{entry.type}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm">{entry.period}</td>
                      <td className="py-3 text-sm">{entry.days} Tage</td>
                      <td className="py-3">
                        <Badge variant="outline">{entry.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Annual Overview 2025 */}
      <Card className="bg-blue-50/30 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Jahresübersicht 2025
          </CardTitle>
        </CardHeader>
        <CardContent>
          {annualOverview.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Keine Jahresübersicht verfügbar</p>
              <p className="text-xs text-muted-foreground">Sobald Kennzahlen vorliegen, werden sie hier angezeigt.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {annualOverview.map((item, index) => (
                <div key={index} className="bg-white p-4 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.highlight ? "text-green-600" : ""}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.unit}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
