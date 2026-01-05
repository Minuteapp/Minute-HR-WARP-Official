import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  ArrowLeft, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  Users,
  Clock,
  Target,
  BarChart3,
  PieChart,
  FileBarChart,
  Share2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StandardPageLayout from "@/components/layout/StandardPageLayout";

export default function ProjectReportsPage() {
  const navigate = useNavigate();

  const actions = (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Projekten
      </Button>
      <Button className="flex items-center gap-2">
        <Share2 className="h-4 w-4" />
        Dashboard teilen
      </Button>
    </div>
  );

  const downloadReport = (reportType: string) => {
    // Simuliere Download
    const fileName = `projekt-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
    console.log(`Downloading: ${fileName}`);
    // Hier würde die tatsächliche Download-Logik implementiert werden
  };

  const exportData = (dataType: string, format: string) => {
    const fileName = `projekt-${dataType}-${new Date().toISOString().split('T')[0]}.${format}`;
    console.log(`Exporting: ${fileName}`);
    // Hier würde die tatsächliche Export-Logik implementiert werden
  };

  const kpiData = [
    { 
      title: "Projekt-Erfolgsrate", 
      value: "87%", 
      trend: "up", 
      change: "+5%", 
      description: "Projekte erfolgreich abgeschlossen"
    },
    { 
      title: "Durchschnittliche Projektdauer", 
      value: "127 Tage", 
      trend: "down", 
      change: "-8 Tage", 
      description: "Gegenüber dem Vorquartal"
    },
    { 
      title: "Budget-Einhaltung", 
      value: "92%", 
      trend: "up", 
      change: "+3%", 
      description: "Projekte im Budget"
    },
    { 
      title: "Team-Auslastung", 
      value: "73%", 
      trend: "up", 
      change: "+7%", 
      description: "Durchschnittliche Kapazität"
    }
  ];

  const projectHealth: any[] = [];

  const financialData = [
    { category: "Entwicklung", budget: 450000, spent: 378000, remaining: 72000 },
    { category: "Design", budget: 180000, spent: 156000, remaining: 24000 },
    { category: "Testing", budget: 120000, spent: 89000, remaining: 31000 },
    { category: "Marketing", budget: 200000, spent: 167000, remaining: 33000 }
  ];

  const teamPerformance = [
    { name: "Frontend Team", efficiency: 94, tasksCompleted: 156, avgTime: "3.2h" },
    { name: "Backend Team", efficiency: 87, tasksCompleted: 134, avgTime: "4.1h" },
    { name: "Design Team", efficiency: 91, tasksCompleted: 89, avgTime: "2.8h" },
    { name: "QA Team", efficiency: 89, tasksCompleted: 112, avgTime: "1.9h" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on-track": return "bg-green-500";
      case "at-risk": return "bg-yellow-500";
      case "delayed": return "bg-red-500";
      case "completed": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "on-track": return "Im Plan";
      case "at-risk": return "Risiko";
      case "delayed": return "Verspätet";
      case "completed": return "Abgeschlossen";
      default: return "Unbekannt";
    }
  };

  return (
    <StandardPageLayout
      title="Projekt Reports & Analysen"
      subtitle="Umfassende Berichte und detaillierte Analysen für alle Projekte"
      actions={actions}
    >
      <div className="space-y-6">
        {/* KPI Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Key Performance Indicators
              <Button 
                size="sm" 
                variant="outline" 
                className="ml-auto flex items-center gap-2"
                onClick={() => downloadReport('kpi-dashboard')}
              >
                <Download className="h-4 w-4" />
                KPI Report
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiData.map((kpi, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{kpi.title}</p>
                      <p className="text-2xl font-bold">{kpi.value}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {kpi.change}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{kpi.description}</p>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Projekt-Übersicht</TabsTrigger>
            <TabsTrigger value="financial">Finanzen</TabsTrigger>
            <TabsTrigger value="performance">Team-Performance</TabsTrigger>
            <TabsTrigger value="timeline">Zeitanalyse</TabsTrigger>
            <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Projekt-Gesundheit */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Projekt-Gesundheit
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="ml-auto flex items-center gap-2"
                    onClick={() => exportData('project-health', 'xlsx')}
                  >
                    <Download className="h-4 w-4" />
                    Excel Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectHealth.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(project.status)}`}></div>
                        <div className="flex-1">
                          <p className="font-medium">{project.name}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <Progress value={project.progress} className="w-24" />
                              <span className="text-sm text-muted-foreground">{project.progress}%</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <DollarSign className="h-4 w-4" />
                              {project.budget}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {project.team} Mitglieder
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">{getStatusText(project.status)}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Finanzanalyse
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="ml-auto flex items-center gap-2"
                    onClick={() => downloadReport('financial-analysis')}
                  >
                    <Download className="h-4 w-4" />
                    Finanzbericht
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {financialData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-sm text-muted-foreground">
                          €{(item.spent / 1000).toFixed(1)}K / €{(item.budget / 1000).toFixed(1)}K
                        </span>
                      </div>
                      <Progress value={(item.spent / item.budget) * 100} className="h-2" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Verbraucht: {((item.spent / item.budget) * 100).toFixed(1)}%</span>
                        <span>Verbleibend: €{(item.remaining / 1000).toFixed(1)}K</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team-Performance Analyse
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="ml-auto flex items-center gap-2"
                    onClick={() => exportData('team-performance', 'csv')}
                  >
                    <Download className="h-4 w-4" />
                    CSV Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teamPerformance.map((team, index) => (
                    <Card key={index} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{team.name}</h3>
                        <Badge>{team.efficiency}% Effizienz</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Abgeschlossene Tasks</span>
                          <span className="font-medium">{team.tasksCompleted}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Durchschnittliche Zeit</span>
                          <span className="font-medium">{team.avgTime}</span>
                        </div>
                        <Progress value={team.efficiency} className="h-2" />
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Zeitanalyse & Trends
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="ml-auto flex items-center gap-2"
                    onClick={() => downloadReport('timeline-analysis')}
                  >
                    <Download className="h-4 w-4" />
                    Zeitbericht
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-2">Projektlaufzeit</h3>
                    <p className="text-2xl font-bold text-blue-600 mb-2">127 Tage</p>
                    <p className="text-sm text-muted-foreground">Durchschnittlich</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Min: 45 Tage</span>
                        <span>Max: 365 Tage</span>
                      </div>
                      <Progress value={35} className="h-2" />
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h3 className="font-semibold mb-2">Verzögerungen</h3>
                    <p className="text-2xl font-bold text-orange-600 mb-2">18%</p>
                    <p className="text-sm text-muted-foreground">Projekte verspätet</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Ziel: &lt;10%</span>
                        <span>Trend: -3%</span>
                      </div>
                      <Progress value={18} className="h-2" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-2">Vorlaufzeit</h3>
                    <p className="text-2xl font-bold text-green-600 mb-2">12 Tage</p>
                    <p className="text-sm text-muted-foreground">Durchschnittlich früher</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Best: 45 Tage</span>
                        <span>Trend: +2 Tage</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileBarChart className="h-5 w-5" />
                  Benutzerdefinierte Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-2">Executive Summary</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Führungskräfte-Bericht mit wichtigsten KPIs
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => downloadReport('executive-summary')}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportData('executive-summary', 'pptx')}>
                        PowerPoint
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-2">Stakeholder Report</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Detaillierter Bericht für alle Stakeholder
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => downloadReport('stakeholder-report')}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportData('stakeholder-report', 'xlsx')}>
                        Excel
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-2">Resource Utilization</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Analyse der Ressourcennutzung
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => downloadReport('resource-utilization')}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportData('resource-utilization', 'csv')}>
                        CSV
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-2">Risk Assessment</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Risikobewertung aller Projekte
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => downloadReport('risk-assessment')}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportData('risk-assessment', 'xlsx')}>
                        Excel
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-2">Quality Metrics</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Qualitätskennzahlen und -trends
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => downloadReport('quality-metrics')}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportData('quality-metrics', 'csv')}>
                        CSV
                      </Button>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-2">Forecast Analysis</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Prognosen und Projektionen
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => downloadReport('forecast-analysis')}>
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => exportData('forecast-analysis', 'xlsx')}>
                        Excel
                      </Button>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StandardPageLayout>
  );
}