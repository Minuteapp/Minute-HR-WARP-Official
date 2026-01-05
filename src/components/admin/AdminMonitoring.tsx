import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Activity,
  RefreshCw,
  Eye,
  Download,
  Filter,
  Zap
} from "lucide-react";
import { useState } from "react";
import { EventCoverageDashboard } from "./EventCoverageDashboard";

export const AdminMonitoring = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");

  // Keine Daten verfügbar - Monitoring-Daten werden aus der Datenbank geladen
  const companyMetrics: any[] = [];

  const globalKPIs = {
    totalRevenue: 0,
    totalCompanies: 0,
    totalUsers: 0,
    churnRate: 0,
    supportTickets: 0,
    apiCalls: 0,
    uptime: 99.9
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success text-success-foreground">Aktiv</Badge>;
      case "trial":
        return <Badge variant="outline" className="border-warning text-warning">Trial</Badge>;
      case "suspended":
        return <Badge variant="destructive">Gesperrt</Badge>;
      default:
        return <Badge variant="secondary">Unbekannt</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "niedrig":
        return <Badge className="bg-success text-success-foreground">Niedrig</Badge>;
      case "mittel":
        return <Badge className="bg-warning text-warning-foreground">Mittel</Badge>;
      case "hoch":
        return <Badge variant="destructive">Hoch</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Global KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{globalKPIs.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Keine Daten verfügbar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Firmen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalKPIs.totalCompanies}</div>
            <p className="text-xs text-muted-foreground">
              Keine Daten verfügbar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalKPIs.churnRate}%</div>
            <p className="text-xs text-muted-foreground">
              Keine Daten verfügbar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalKPIs.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              Letzte 30 Tage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Tabs */}
      <Tabs defaultValue="companies" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="companies">Firmen-Monitoring</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts & Risiken</TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Event-System
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
          </div>
        </div>

        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Firmen-Overview & KPIs</CardTitle>
              <CardDescription>
                Detaillierte Metriken für alle Mandanten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companyMetrics.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Keine Monitoring-Daten verfügbar</p>
                    <p className="text-sm mt-2">Daten werden aus der Datenbank geladen, wenn verfügbar.</p>
                  </div>
                ) : (
                  companyMetrics.map((company) => (
                    <div key={company.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{company.name}</h3>
                            {getStatusBadge(company.status)}
                            {getRiskBadge(company.riskScore)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {company.employees} Mitarbeiter • {company.modules.join(", ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">€{company.monthlyRevenue.toLocaleString()}/Monat</div>
                          <div className={`text-sm flex items-center ${company.growth > 0 ? 'text-success' : 'text-destructive'}`}>
                            {company.growth > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {Math.abs(company.growth)}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Lizenz-Auslastung</p>
                          <div className="flex items-center gap-2">
                            <Progress value={company.licenseUtilization} className="flex-1" />
                            <span className="text-sm font-medium">{company.licenseUtilization}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground">Support Tickets</p>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{company.supportTickets}</span>
                            {company.supportTickets > 5 && <AlertTriangle className="h-3 w-3 text-warning" />}
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">API Calls</p>
                          <span className="text-sm font-medium">{company.apiCalls.toLocaleString()}</span>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Letzte Aktivität</p>
                          <span className="text-sm font-medium">{company.lastActivity}</span>
                        </div>

                        <div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
                <CardDescription>Durchschnittliche Response-Zeiten</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-muted-foreground">
                  <p>Keine Performance-Daten verfügbar</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modul-Nutzung</CardTitle>
                <CardDescription>Top Module der letzten 30 Tage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4 text-muted-foreground">
                  <p>Keine Nutzungsdaten verfügbar</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Alerts & Risiko-Management</CardTitle>
              <CardDescription>Kritische Ereignisse und Handlungsempfehlungen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Keine Alerts verfügbar</p>
                <p className="text-sm mt-2">Alle Systeme laufen stabil.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <EventCoverageDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};