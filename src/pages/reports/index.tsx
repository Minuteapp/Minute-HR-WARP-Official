import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Activity, TrendingUp, DollarSign, Briefcase, Leaf, AlertTriangle, CheckCircle, TrendingDown, Calendar, FileText, Clock, Sparkles, Download, RefreshCw, Loader2 } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ModuleHeader } from '@/components/layout/ModuleHeader';
import { useReportsData, useReportsList } from '@/hooks/useReportsData';
import { Skeleton } from "@/components/ui/skeleton";
import ExecutiveReportsTab from '@/components/reports/executive/ExecutiveReportsTab';
import StandardReportsTab from '@/components/reports/standard/StandardReportsTab';
import ModuleReportsTab from '@/components/reports/modules/ModuleReportsTab';
import AIReportBuilderTab from '@/components/reports/ai-builder/AIReportBuilderTab';
import AdHocAnalysisTab from '@/components/reports/adhoc/AdHocAnalysisTab';
import AIInsightsTab from '@/components/reports/insights/AIInsightsTab';
import ExportDistributionTab from '@/components/reports/export/ExportDistributionTab';
import ArchiveTab from '@/components/reports/archive/ArchiveTab';
import ComplianceAuditTab from '@/components/reports/compliance/ComplianceAuditTab';
import { usePermissionContext } from '@/contexts/PermissionContext';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("executive");
  const { hasPermission } = usePermissionContext();

  // Berechtigungsbasierte Tabs
  const allTabs = [
    { id: 'executive', label: 'Executive', requiredAction: 'view', adminOnly: true },
    { id: 'standard', label: 'Standard', requiredAction: 'view' },
    { id: 'modules', label: 'Module', requiredAction: 'view' },
    { id: 'create', label: 'KI Builder', requiredAction: 'create', adminOnly: true },
    { id: 'adhoc', label: 'Ad-hoc', requiredAction: 'view' },
    { id: 'ai', label: 'KI-Insights', requiredAction: 'view' },
    { id: 'export', label: 'Export', requiredAction: 'export' },
    { id: 'archive', label: 'Archiv', requiredAction: 'view' },
    { id: 'compliance', label: 'Compliance', requiredAction: 'export', adminOnly: true },
  ];

  const tabs = useMemo(() => {
    const canAdmin = hasPermission('reports', 'create');
    return allTabs.filter(tab => {
      if (tab.adminOnly && !canAdmin) return false;
      return hasPermission('reports', tab.requiredAction);
    });
  }, [hasPermission]);
  
  // Übersicht Tab
  const OverviewTab = () => {
    const { 
      employeeCount, 
      sickLeaveRate, 
      activeProjects, 
      departmentData, 
      absenceData, 
      employeeGrowthData,
      isLoading 
    } = useReportsData();

    const kpiData = [
      { label: "Mitarbeiter gesamt", value: employeeCount.toLocaleString('de-DE'), change: "", icon: Users, color: "bg-green-50", iconColor: "text-green-600", trend: "up" },
      { label: "Krankheitsquote", value: `${sickLeaveRate}%`, change: "", icon: AlertTriangle, color: "bg-yellow-50", iconColor: "text-yellow-600", trend: sickLeaveRate > 3 ? "up" : "down" },
      { label: "Aktive Projekte", value: activeProjects.toString(), change: "", icon: Briefcase, color: "bg-green-50", iconColor: "text-green-600", trend: "up" },
    ];

    if (isLoading) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Filter */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter:</span>
            <Select defaultValue="q4-2024">
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="q4-2024">Q4 2024</SelectItem>
                <SelectItem value="q3-2024">Q3 2024</SelectItem>
                <SelectItem value="q2-2024">Q2 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select defaultValue="all-departments">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-departments">Alle Abteilungen</SelectItem>
              <SelectItem value="production">Produktion</SelectItem>
              <SelectItem value="sales">Vertrieb</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-locations">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-locations">Alle Standorte</SelectItem>
              <SelectItem value="berlin">Berlin</SelectItem>
              <SelectItem value="munich">München</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index} className={kpi.color}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Icon className={`h-4 w-4 ${kpi.iconColor}`} />
                        {kpi.label}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{kpi.value}</span>
                        <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {kpi.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* KI-Analyse */}
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              KI-Analyse: Was fällt auf?
            </CardTitle>
            <p className="text-sm text-indigo-700">Die KI hat automatisch Erkenntnisse und Anomalien identifiziert</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900 mb-1">Erhöhte Krankheitsquote in Abteilung Produktion Süd</h4>
                  <p className="text-sm text-yellow-800 mb-2">
                    Die Krankheitsquote ist in den letzten 4 Wochen um 45% gestiegen (von 2.1% auf 3.2%). Empfehlung: Mitarbeiterumfrage zur Arbeitsbelastung durchführen.
                  </p>
                  <Button variant="link" className="text-indigo-600 p-0 h-auto">
                    Details anzeigen →
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 mb-1">Überdurchschnittliche Performance im Vertrieb</h4>
                  <p className="text-sm text-green-800 mb-2">
                    Das Vertriebsteam hat die Ziele um 23% übertroffen. Die durchschnittliche Deal-Größe ist um 18% gestiegen.
                  </p>
                  <Button variant="link" className="text-indigo-600 p-0 h-auto">
                    Analyse exportieren →
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-1">3 Projekte verzögert</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Projekte "Mobile App", "ERP Migration" und "Dashboard v3" liegen 2-3 Wochen hinter dem Zeitplan. Hauptgrund: Ressourcenengpässe im IT-Team.
                  </p>
                  <Button variant="link" className="text-indigo-600 p-0 h-auto">
                    Projektdetails →
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Input 
                placeholder='Fragen Sie die KI etwas... z.B. "Warum ist die Fluktuationsrate gesunken?"'
                className="bg-white"
              />
              <Button className="mt-2" variant="default">
                <Sparkles className="h-4 w-4 mr-2" />
                KI fragen
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mitarbeiterwachstum</CardTitle>
              <p className="text-sm text-muted-foreground">Entwicklung der letzten 6 Monate</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={employeeGrowthData}>
                  <defs>
                    <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[10000, 11000]} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="employees" 
                    stroke="#4F46E5" 
                    fillOpacity={1} 
                    fill="url(#colorEmployees)"
                    name="Gesamt Mitarbeiter"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Abteilungsverteilung</CardTitle>
              <p className="text-sm text-muted-foreground">Mitarbeiter nach Abteilung</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Abwesenheitsstatistik</CardTitle>
              <p className="text-sm text-muted-foreground">Nach Typ und Monat</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={absenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="krankheit" name="Krankheit" fill="#EF4444" />
                  <Bar dataKey="sonstiges" name="Sonstiges" fill="#9CA3AF" />
                  <Bar dataKey="urlaub" name="Urlaub" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gehaltsentwicklung Chart entfernt - keine echten Daten verfügbar */}
        </div>
      </div>
    );
  };

  // Standardberichte Tab
  const StandardReportsTab = () => {
    const reports = [
      { 
        title: "Abwesenheitsbericht", 
        description: "Vollständige Übersicht aller Abwesenheiten nach Typ, Abteilung und Zeitraum",
        icon: Calendar,
        category: "Personal",
        updated: "17.10.2024 08:30",
        frequency: "Täglich",
        size: "3,847",
        sizeUnit: "2.4 MB",
        formats: ["PDF", "Excel", "CSV"]
      },
      { 
        title: "Krankheitsstatistik", 
        description: "Detaillierte Analyse der Krankmeldungen mit Trends und Auffälligkeiten",
        icon: Activity,
        category: "Gesundheit",
        updated: "17.10.2024 07:00",
        frequency: "Täglich",
        size: "1,245",
        sizeUnit: "1.8 MB",
        formats: ["PDF", "Excel"]
      },
      { 
        title: "Lohn & Gehalt Monatsbericht", 
        description: "Monatliche Gehaltsabrechnung mit Kostenstellenaufteilung und Vergleich",
        icon: DollarSign,
        category: "Payroll",
        updated: "01.10.2024 23:59",
        frequency: "Monatlich",
        size: "10,847",
        sizeUnit: "5.2 MB",
        formats: ["PDF", "Excel", "CSV", "JSON"]
      },
      { 
        title: "Performance-Review-Übersicht", 
        description: "Zusammenfassung aller Performance-Reviews mit Zielerreichung",
        icon: TrendingUp,
        category: "Performance",
        updated: "15.10.2024 16:45",
        frequency: "Wöchentlich",
        size: "8,542",
        sizeUnit: "3.1 MB",
        formats: ["PDF", "Excel"]
      },
      { 
        title: "Recruiting Funnel Report", 
        description: "Bewerbungsprozess von der Bewerbung bis zur Einstellung",
        icon: Users,
        category: "Recruiting",
        updated: "17.10.2024 09:15",
        frequency: "Wöchentlich",
        size: "456",
        sizeUnit: "1.5 MB",
        formats: ["PDF", "Excel", "CSV"]
      },
      { 
        title: "Onboarding-Fortschritt", 
        description: "Status aller laufenden Onboarding-Prozesse",
        icon: Briefcase,
        category: "Onboarding",
        updated: "17.10.2024 08:00",
        frequency: "Täglich",
        size: "87",
        sizeUnit: "890 KB",
        formats: ["PDF", "Excel"]
      },
      { 
        title: "Projektzeit-Report", 
        description: "Zeiterfassung nach Projekten mit Auslastungsanalyse",
        icon: Clock,
        category: "Projekte",
        updated: "16.10.2024 18:30",
        frequency: "Wöchentlich",
        size: "12,450",
        sizeUnit: "4.3 MB",
        formats: ["PDF", "Excel", "CSV"]
      },
      { 
        title: "Nachhaltigkeitsreport (ESG)", 
        description: "CO₂-Bilanz, Diversity-Index und soziale Kennzahlen",
        icon: Leaf,
        category: "Nachhaltigkeit",
        updated: "10.10.2024 12:00",
        frequency: "Monatlich",
        size: "348",
        sizeUnit: "2.7 MB",
        formats: ["PDF", "Excel"]
      },
      { 
        title: "Weiterbildungsstatistik", 
        description: "Trainingsaktivitäten und Erfolgsquote nach Abteilung",
        icon: TrendingUp,
        category: "Weiterbildung",
        updated: "12.10.2024 14:20",
        frequency: "Monatlich",
        size: "2,145",
        sizeUnit: "1.9 MB",
        formats: ["PDF", "Excel"]
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Select defaultValue="all-categories">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-categories">Alle Kategorien</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="payroll">Payroll</SelectItem>
              <SelectItem value="recruiting">Recruiting</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="nachhaltigkeit">Nachhaltigkeit</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all-frequencies">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-frequencies">Alle Frequenzen</SelectItem>
              <SelectItem value="daily">Täglich</SelectItem>
              <SelectItem value="weekly">Wöchentlich</SelectItem>
              <SelectItem value="monthly">Monatlich</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="ml-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Alle aktualisieren
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report, index) => {
            const Icon = report.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <Icon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{report.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">{report.category}</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{report.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Zuletzt aktualisiert:</span>
                        <p className="font-medium">{report.updated}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Aktualisierung:</span>
                        <p className="font-medium">{report.frequency}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Datensätze:</span>
                        <p className="font-medium">{report.size}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Größe:</span>
                        <p className="font-medium">{report.sizeUnit}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Formate:</span>
                      {report.formats.map((format) => (
                        <Badge key={format} variant="secondary">{format}</Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1">
                        <FileText className="h-4 w-4 mr-2" />
                        Öffnen
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="ghost" size="icon">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // Bericht erstellen Tab
  const CreateReportTab = () => {
    return (
      <div className="space-y-6">
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  KI-gestützter Report Builder
                </CardTitle>
                <p className="text-sm text-indigo-700 mt-1">Beschreiben Sie Ihren Bericht in natürlicher Sprache</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label className="text-sm font-medium">Beschreibung</label>
              <Input 
                placeholder='Beispiel: Zeig mir die durchschnittliche Krankheitsdauer pro Abteilung im letzten Quartal'
                className="bg-white"
              />
              <Button className="w-full mt-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Bericht automatisch erstellen
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grundeinstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Berichtsname</label>
                  <Input placeholder="z.B. Quartalsanalyse Q4" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Beschreibung</label>
                  <Textarea placeholder="Kurze Beschreibung des Berichts" rows={3} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Datenquelle</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen Sie eine Datenquelle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employees">Mitarbeiterdaten</SelectItem>
                      <SelectItem value="absences">Abwesenheiten</SelectItem>
                      <SelectItem value="projects">Projekte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visualisierung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart className="h-4 w-4 mr-2" />
                  Balkendiagramm
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <LineChart className="h-4 w-4 mr-2" />
                  Liniendiagramm
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <PieChart className="h-4 w-4 mr-2" />
                  Kreisdiagramm
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Tabelle
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Filter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zeitraum</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Zeitraum wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Diese Woche</SelectItem>
                      <SelectItem value="month">Dieser Monat</SelectItem>
                      <SelectItem value="quarter">Dieses Quartal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Abteilung</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Alle Abteilungen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Abteilungen</SelectItem>
                      <SelectItem value="production">Produktion</SelectItem>
                      <SelectItem value="sales">Vertrieb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Standort</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Alle Standorte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Standorte</SelectItem>
                      <SelectItem value="berlin">Berlin</SelectItem>
                      <SelectItem value="munich">München</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="w-full">
                  <span className="mr-2">+</span>
                  Filter hinzufügen
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vorschau</CardTitle>
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Aktualisieren
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Live-Vorschau Ihres benutzerdefinierten Berichts</p>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Wählen Sie eine Datenquelle und Felder aus, um eine Vorschau zu sehen</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Berechtigungen & Freigabe</CardTitle>
                <p className="text-sm text-muted-foreground">Legen Sie fest, wer diesen Bericht sehen kann</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sichtbarkeit</label>
                  <Select defaultValue="private">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Nur ich</SelectItem>
                      <SelectItem value="team">Mein Team</SelectItem>
                      <SelectItem value="company">Gesamtes Unternehmen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Berechtigungen</label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Ansehen erlauben</label>
                      <Checkbox defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Bearbeiten erlauben</label>
                      <Checkbox />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Export erlauben</label>
                      <Checkbox defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm">Teilen erlauben</label>
                      <Checkbox />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Speichern
                  </Button>
                  <Button variant="outline">Als Vorlage speichern</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // Zeitgesteuert Tab
  const ScheduledReportsTab = () => {
    const scheduledReports = [
      {
        title: "Wöchentlicher HR-Report",
        description: "Zusammenfassung aller HR-Kennzahlen der letzten Woche",
        frequency: "Wöchentlich",
        status: "Aktiv",
        schedule: "Jeden Montag um 08:00 Uhr",
        recipients: "hr-team@company.com, management@company.com",
        lastSent: "16.10.2024 08:00",
        nextSend: "21.10.2024 08:00",
        badges: [{ text: "Wöchentlich", variant: "default" as const }, { text: "Aktiv", variant: "default" as const }]
      },
      {
        title: "Monatlicher Lohn & Gehalt Bericht",
        description: "Detaillierte Gehaltsabrechnung mit Kostenstellenanalyse",
        frequency: "Monatlich",
        status: "Aktiv",
        schedule: "Jeden 1. des Monats um 23:59 Uhr",
        recipients: "finance@company.com, cfo@company.com",
        lastSent: "01.10.2024 23:59",
        nextSend: "01.11.2024 23:59",
        badges: [{ text: "Monatlich", variant: "secondary" as const }, { text: "Aktiv", variant: "default" as const }]
      },
      {
        title: "Tägliche Abwesenheitsübersicht",
        description: "Aktuelle Abwesenheiten für das Management",
        frequency: "Täglich",
        status: "Aktiv",
        schedule: "Täglich um 07:00 Uhr",
        recipients: "teamleiter@company.com, hr@company.com",
        lastSent: "17.10.2024 07:00",
        nextSend: "18.10.2024 07:00",
        badges: [{ text: "Täglich", variant: "secondary" as const }, { text: "Aktiv", variant: "default" as const }]
      },
      {
        title: "Quartalsweise Performance-Übersicht",
        description: "Zusammenfassung aller Performance-Reviews",
        frequency: "Quartalsweise",
        status: "Pausiert",
        schedule: "Jeden ersten Montag im Quartal",
        recipients: "management@company.com, board@company.com",
        lastSent: "02.10.2024 09:00",
        nextSend: "06.01.2025 09:00",
        badges: [{ text: "Quartalsweise", variant: "outline" as const }, { text: "Pausiert", variant: "outline" as const }]
      },
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Zeitgesteuerte Berichte</h3>
            <p className="text-sm text-muted-foreground">Automatische Berichterstellung und Versand nach Zeitplan</p>
          </div>
          <Button>
            <span className="mr-2">+</span>
            Neuer Bericht
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4 text-blue-600" />
                Aktive Berichte
              </div>
              <div className="text-2xl font-bold">5</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <FileText className="h-4 w-4 text-green-600" />
                Gesendet (Monat)
              </div>
              <div className="text-2xl font-bold">127</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Calendar className="h-4 w-4 text-indigo-600" />
                Nächste heute
              </div>
              <div className="text-2xl font-bold">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Users className="h-4 w-4 text-purple-600" />
                Empfänger
              </div>
              <div className="text-2xl font-bold">45</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {scheduledReports.map((report, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{report.title}</h4>
                      {report.badges.map((badge, i) => (
                        <Badge key={i} variant={badge.variant}>{badge.text}</Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                  </div>
                  <Switch defaultChecked={report.status === "Aktiv"} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Zeitplan:
                    </span>
                    <p className="font-medium">{report.schedule}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Empfänger:
                    </span>
                    <p className="font-medium">{report.recipients}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Zuletzt gesendet:</span>
                    <p className="font-medium">{report.lastSent}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nächster Versand:</span>
                    <p className="font-medium">{report.nextSend}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <span className="mr-2">▶</span>
                    Jetzt senden
                  </Button>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Zeitplan ändern
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <span className="mr-2">×</span>
                    Löschen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // KI-Analysen Tab
  const AIAnalysisTab = () => {
    const insights = [
      {
        title: "Erhöhte Krankheitsquote in Abteilung Produktion Süd",
        description: "Die Krankheitsquote ist in den letzten 4 Wochen um 45% gestiegen (von 2.1% auf 3.2%).",
        severity: "Hoch",
        severityColor: "text-red-600",
        bgColor: "bg-yellow-50 border-yellow-200",
        icon: AlertTriangle,
        iconColor: "text-yellow-600",
        employees: "245",
        impact: "€48,000",
        confidence: "92%",
        recommendation: "Führen Sie eine Mitarbeiterumfrage zur Arbeitsbelastung durch und prüfen Sie die Arbeitsbedingungen."
      },
      {
        title: "Überdurchschnittliche Performance im Vertrieb",
        description: "Das Vertriebsteam hat die Ziele um 23% übertroffen. Die durchschnittliche Deal-Größe ist um 18% gestiegen.",
        severity: "Hoch",
        severityColor: "text-green-600",
        bgColor: "bg-green-50 border-green-200",
        icon: CheckCircle,
        iconColor: "text-green-600",
        employees: "87",
        impact: "+€320,000",
        confidence: "95%",
        recommendation: "Analysieren Sie die Best-Practices und replizieren Sie diese in anderen Teams."
      },
      {
        title: "Projektverzögerungen in IT-Abteilung",
        description: "3 kritische Projekte liegen 2-3 Wochen hinter dem Zeitplan. Hauptgrund: Ressourcenengpässe im IT-Team.",
        severity: "Mittel",
        severityColor: "text-orange-600",
        bgColor: "bg-orange-50 border-orange-200",
        icon: AlertTriangle,
        iconColor: "text-orange-600",
        employees: "34",
        impact: "€75,000",
        confidence: "88%",
        recommendation: "Erwägen Sie temporäre Verstärkung durch Freelancer oder Umverteilung von Ressourcen."
      },
      {
        title: "Rückgang bei Weiterbildungsteilnahme",
        description: "Die Teilnahme an Weiterbildungsmaßnahmen ist im letzten Quartal um 15% zurückgegangen.",
        severity: "Mittel",
        severityColor: "text-blue-600",
        bgColor: "bg-blue-50 border-blue-200",
        icon: TrendingDown,
        iconColor: "text-blue-600",
        employees: "1240",
        impact: "-€42,000",
        confidence: "86%",
        recommendation: "Verstärken Sie die interne Kommunikation zu Weiterbildungsangeboten und bieten Sie flexiblere Zeitmolde an."
      },
    ];

    return (
      <div className="space-y-6">
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  KI-Analyse Engine
                </CardTitle>
                <p className="text-sm text-indigo-700 mt-1">
                  Die KI analysiert kontinuierlich Ihre HR-Daten und identifiziert Muster, Trends und Anomalien. Letzte Aktualisierung: 17.10.2024 um 09:15 Uhr
                </p>
              </div>
              <Button variant="outline" className="bg-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Analyse neu starten
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div>
          <h3 className="text-lg font-semibold mb-4">Aktuelle Erkenntnisse</h3>
          <p className="text-sm text-muted-foreground mb-4">4 Insights gefunden</p>
        </div>

        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <Card key={index} className={`border ${insight.bgColor}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-white rounded-lg`}>
                      <Icon className={`h-6 w-6 ${insight.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-lg">{insight.title}</h4>
                        <Badge className={insight.severityColor}>{insight.severity}</Badge>
                      </div>
                      <p className="text-sm mb-4">{insight.description}</p>

                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Betroffene Mitarbeiter:</span>
                          <p className="font-bold">{insight.employees}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Geschätzte Auswirkung:</span>
                          <p className="font-bold">{insight.impact}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Konfidenz:</span>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-600" 
                                style={{ width: insight.confidence }}
                              />
                            </div>
                            <span className="font-bold">{insight.confidence}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium mb-1">Empfehlung:</p>
                        <p className="text-sm">{insight.recommendation}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm">
                          Details anzeigen
                          <span className="ml-2">→</span>
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Bericht exportieren
                        </Button>
                        <Button size="sm" variant="outline">
                          Als erledigt markieren
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full py-6 px-6">
      <div className="min-h-screen bg-background">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Berichte & Analysen</h1>
                <p className="text-sm text-muted-foreground">Analysezentrum Ihrer HR-Plattform mit KI-gestützten Auswertungen</p>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex items-center gap-6 border-b bg-transparent h-auto p-0 overflow-x-auto w-full justify-start rounded-none">
              {tabs.map(tab => (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3 flex items-center gap-2"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="executive" className="mt-6">
              <ExecutiveReportsTab />
            </TabsContent>

            <TabsContent value="standard" className="mt-6">
              <StandardReportsTab />
            </TabsContent>

            <TabsContent value="modules" className="mt-6">
              <ModuleReportsTab />
            </TabsContent>

            <TabsContent value="create" className="mt-6">
              <AIReportBuilderTab />
            </TabsContent>

            <TabsContent value="adhoc" className="mt-6">
              <AdHocAnalysisTab />
            </TabsContent>

            <TabsContent value="ai" className="mt-6">
              <AIInsightsTab />
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <ExportDistributionTab />
            </TabsContent>

            <TabsContent value="archive" className="mt-6">
              <ArchiveTab />
            </TabsContent>

            <TabsContent value="compliance" className="mt-6">
              <ComplianceAuditTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
