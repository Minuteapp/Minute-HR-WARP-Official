import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle, Clock, Plus, TrendingUp, Target, ChevronRight, Loader2 } from "lucide-react";
import { OrgChartSidebar } from "../components/OrgChartSidebar";
import { successionPlanningService } from "@/services/successionPlanningService";

export const SuccessionPlanningTab = () => {
  const [riskFilter, setRiskFilter] = useState('all');

  // Echte Daten aus der Datenbank laden
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['succession-plans', riskFilter],
    queryFn: () => successionPlanningService.getSuccessionPlans({ risk: riskFilter })
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['succession-statistics'],
    queryFn: () => successionPlanningService.getSuccessionStatistics()
  });

  const kpis = stats || { keyPositions: 0, avgReadiness: 0, highRisk: 0, criticalGaps: 0 };
  const isLoading = plansLoading || statsLoading;

  // Positionen für die Anzeige aufbereiten
  const positions = plans.map(plan => {
    const riskColors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };

    return {
      id: plan.id,
      title: plan.position,
      department: plan.department,
      current: plan.currentHolder,
      risk: plan.risk || 'medium',
      riskBadgeColor: riskColors[plan.risk || 'medium'] || riskColors.medium,
      candidates: plan.candidates.map((c: any) => ({
        id: c.id,
        initials: c.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??',
        name: c.name || 'Unbekannt',
        position: c.position || '-',
        readiness: c.readiness || 0,
        status: c.readiness >= 90 ? 'Bereit' : c.readiness >= 70 ? 'Fortgeschritten' : 'In Entwicklung',
        statusColor: c.readiness >= 90 ? 'bg-green-100 text-green-800' : c.readiness >= 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800',
        developmentPlan: c.developmentPlan || []
      })),
      timeToReady: plan.timeToReady || '-',
      businessImpact: plan.businessImpact || 'Medium',
      isVacant: plan.currentHolder === 'Vakant'
    };
  });

  const getRiskBadge = (risk: string, colorClass: string) => {
    return (
      <Badge variant="outline" className={colorClass}>
        {risk === 'kritisch' ? 'Kritisch' : risk === 'gering' ? 'Gering' : 'Mittel'}
      </Badge>
    );
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-6">
        {/* KI-Prognose Alert */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">KI-Prognose:</span> 1 kritische Position(en) ohne Nachfolge. 
            1 Schlüsselrolle(n) mit hohem Risiko. Sofortiges Handeln empfohlen.
          </AlertDescription>
        </Alert>

        {/* Toolbar */}
        <div className="flex justify-between items-center">
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Alle Risikostufen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Risikostufen</SelectItem>
              <SelectItem value="critical">Kritisch</SelectItem>
              <SelectItem value="high">Hoch</SelectItem>
              <SelectItem value="medium">Mittel</SelectItem>
              <SelectItem value="low">Niedrig</SelectItem>
            </SelectContent>
          </Select>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nachfolgepfad erstellen
          </Button>
        </div>

        {/* KPI-Karten */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Schlüsselpositionen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpis.keyPositions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Durchschn. Bereitschaft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div className="text-3xl font-bold">{kpis.avgReadiness}%</div>
              </div>
              <Progress value={kpis.avgReadiness} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Hohe Risiken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <div className="text-3xl font-bold text-orange-600">{kpis.highRisk}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kritische Lücken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div className="text-3xl font-bold text-red-600">{kpis.criticalGaps}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Positions-Karten */}
        <div className="space-y-4">
          {positions.map((position) => (
            <Card key={position.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{position.title}</CardTitle>
                      {getRiskBadge(position.risk, position.riskBadgeColor)}
                      <Badge variant="outline" className="ml-2">{position.candidates.length} Nachfolger</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{position.department}</p>
                    <p className="text-sm font-medium">
                      Aktuell: {position.isVacant ? <span className="text-red-600">Vakant</span> : position.current}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                {position.candidates.length === 0 ? (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Keine Nachfolgekandidaten definiert. Bitte Entwicklungsplan erstellen.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4 mb-4">
                    <h4 className="font-semibold">Nachfolgekandidaten:</h4>
                    {position.candidates.map((candidate) => (
                      <div key={candidate.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {candidate.initials}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{candidate.name}</p>
                                <p className="text-sm text-muted-foreground">{candidate.position}</p>
                              </div>
                              <Badge variant="outline" className={candidate.statusColor}>
                                {candidate.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Bereitschaft</span>
                                <span className="font-semibold">{candidate.readiness}%</span>
                              </div>
                              <Progress value={candidate.readiness} className="h-2 bg-gray-200" />
                            </div>
                            
                            {candidate.developmentPlan && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium flex items-center gap-1">
                                  <span className="text-muted-foreground">📋</span>
                                  Entwicklungsplan:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {candidate.developmentPlan.map((item, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {item}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Zeit bis bereit:</span>
                      <span className="font-medium">{position.timeToReady}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Business Impact:</span>
                      <span className="font-medium">{position.businessImpact}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Rechte Sidebar */}
      <div className="w-80">
        <OrgChartSidebar />
      </div>
    </div>
  );
};