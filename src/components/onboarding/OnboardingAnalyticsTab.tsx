import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Globe,
  BarChart3,
  Eye,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Timer,
  Download,
  ChevronRight
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

// Mock Data
const trendData = [
  { month: "Jan", onboardings: 850, avgDuration: 10 },
  { month: "Feb", onboardings: 780, avgDuration: 8 },
  { month: "Mär", onboardings: 950, avgDuration: 12 },
  { month: "Apr", onboardings: 1150, avgDuration: 15 },
  { month: "Mai", onboardings: 1350, avgDuration: 20 },
  { month: "Jun", onboardings: 1280, avgDuration: 18 }
];

const departmentData = [
  { name: "IT", value: 23, color: "#3b82f6" },
  { name: "Produktion", value: 20, color: "#ec4899" },
  { name: "Vertrieb", value: 19, color: "#22c55e" },
  { name: "Marketing", value: 14, color: "#f472b6" },
  { name: "Customer Success", value: 9, color: "#06b6d4" },
  { name: "Finance", value: 9, color: "#f97316" },
  { name: "Personal", value: 5, color: "#a855f7" }
];

const locationData = [
  { name: "Zürich", onboardings: 2500, avgDuration: 50 },
  { name: "Berlin", onboardings: 2200, avgDuration: 45 },
  { name: "Wien", onboardings: 1600, avgDuration: 40 },
  { name: "München", onboardings: 1400, avgDuration: 35 },
  { name: "Hamburg", onboardings: 1100, avgDuration: 30 },
  { name: "Frankfurt", onboardings: 850, avgDuration: 25 },
  { name: "Genf", onboardings: 200, avgDuration: 15 }
];

const predictions = [
  { 
    label: "Onboardings nächster Monat", 
    value: "1687", 
    change: "+15.9%", 
    changePositive: true,
    progress: 94, 
    confidence: "94% Konfidenz" 
  },
  { 
    label: "Durchschnittliche Dauer", 
    value: "7.3", 
    unit: "Tage",
    change: "-0.6 Tage", 
    changePositive: true,
    progress: 87, 
    confidence: "87% Konfidenz" 
  },
  { 
    label: "Zufriedenheit", 
    value: "4.5", 
    unit: "/5",
    change: "+2.3%", 
    changePositive: true,
    progress: 91, 
    confidence: "91% Konfidenz" 
  }
];

const bottlenecks = [
  { title: "IT-Zugang Aktivierung", department: "IT", cases: 3421, delay: 2.3, progress: 80 },
  { title: "Hardware-Bereitstellung", department: "IT", cases: 2187, delay: 1.8, progress: 60 },
  { title: "Compliance-Training", department: "L&D", cases: 1876, delay: 3.1, progress: 50 },
  { title: "Arbeitsplatz-Setup", department: "Facilities", cases: 1543, delay: 1.2, progress: 40 }
];

const insights = [
  { 
    icon: TrendingUp, 
    iconBg: "bg-background",
    cardBg: "bg-background",
    title: "Exzellente Performance in Q2", 
    impact: "Hoch", 
    impactColor: "bg-muted text-muted-foreground",
    description: "Die Onboarding-Dauer wurde um 15% reduziert (von 9,2 auf 7,9 Tage). Hauptgrund: Automatisierung von IT-Zugängen.",
    recommendation: "Diese Best Practices auf alle Standorte ausrollen"
  },
  { 
    icon: AlertTriangle, 
    iconBg: "bg-background",
    cardBg: "bg-background",
    title: "Standort Wien benötigt Unterstützung", 
    impact: "Mittel", 
    impactColor: "bg-muted text-muted-foreground",
    description: "Überdurchschnittliche Onboarding-Dauer (8,9 Tage vs. 8,1 Tage Durchschnitt). 23% der Fälle sind verzögert.",
    recommendation: "Prozessanalyse und Ressourcen-Check empfohlen"
  },
  { 
    icon: Users, 
    iconBg: "bg-background",
    cardBg: "bg-background",
    title: "IT-Abteilung hat höchstes Volumen", 
    impact: "Niedrig", 
    impactColor: "bg-muted text-muted-foreground",
    description: "2.345 Onboardings in IT (23,5% aller Fälle). Zufriedenheit liegt bei 4,5/5 - über dem Durchschnitt.",
    recommendation: "Best Practices dokumentieren und teilen"
  },
  { 
    icon: Timer, 
    iconBg: "bg-background",
    cardBg: "bg-background",
    title: "Buddy-Programm zeigt Wirkung", 
    impact: "Hoch", 
    impactColor: "bg-muted text-muted-foreground",
    description: "Mitarbeiter mit Buddy-Support haben 34% höhere Zufriedenheit und 28% schnellere Produktivität.",
    recommendation: "Buddy-Programm auf 100% der Onboardings ausweiten"
  },
  { 
    icon: AlertTriangle, 
    iconBg: "bg-red-100",
    cardBg: "bg-red-50",
    iconColor: "text-red-600",
    title: "Compliance-Schulungen verzögern sich", 
    impact: "Kritisch", 
    impactColor: "bg-red-100 text-red-700",
    description: "1.432 Mitarbeiter haben noch keine Compliance-Schulung abgeschlossen. Rechtliche Risiken möglich.",
    recommendation: "Sofortige Eskalation an L&D Team und automatische Reminder aktivieren"
  }
];

const kpiCards = [
  { 
    label: "Gesamt-Onboardings", 
    value: "10.000", 
    subtitle: "Alle Abteilungen", 
    icon: BarChart3, 
    iconBg: "bg-blue-100", 
    iconColor: "text-blue-600",
    borderColor: "border-l-blue-500"
  },
  { 
    label: "Ø Zufriedenheit", 
    value: "4.2/5", 
    subtitle: "+7,3% vs. Vorjahr", 
    subtitleColor: "text-green-600",
    subtitleIcon: TrendingUp,
    icon: Eye, 
    iconBg: "bg-green-100", 
    iconColor: "text-green-600",
    borderColor: "border-l-green-500"
  },
  { 
    label: "Ø Onboarding-Dauer", 
    value: "7,9 Tage", 
    subtitle: "-15% in Q2", 
    subtitleColor: "text-violet-600",
    subtitleIcon: TrendingDown,
    icon: Clock, 
    iconBg: "bg-blue-100", 
    iconColor: "text-blue-600",
    borderColor: "border-l-violet-500"
  },
  { 
    label: "Optimierungspotenzial", 
    value: "23%", 
    subtitle: "~2.300 Fälle", 
    icon: Zap, 
    iconBg: "bg-orange-100", 
    iconColor: "text-orange-600",
    borderColor: "border-l-orange-500"
  }
];

export const OnboardingAnalyticsTab = () => {
  return (
    <div className="space-y-6">
      {/* Header Box */}
      <Card className="bg-slate-100 border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-200 rounded-full">
              <Globe className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">KI-Analytics für 10.000 Onboardings</h3>
              <p className="text-sm text-muted-foreground">
                Analysiert: Trends, Bottlenecks, Predictions und Optimierungspotenziale über alle Standorte und Abteilungen hinweg
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className={`border-l-4 ${kpi.borderColor}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.subtitleIcon && <kpi.subtitleIcon className={`h-3 w-3 ${kpi.subtitleColor}`} />}
                    <p className={`text-xs ${kpi.subtitleColor || 'text-muted-foreground'}`}>
                      {kpi.subtitle}
                    </p>
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${kpi.iconBg}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Onboarding-Trend LineChart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Onboarding-Trend (6 Monate)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="onboardings" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Anzahl Onboardings"
                    dot={{ fill: '#8b5cf6' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgDuration" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Ø Dauer (Tage)"
                    dot={{ fill: '#22c55e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span>Anzahl Onboardings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Ø Dauer (Tage)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verteilung nach Abteilung PieChart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Verteilung nach Abteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2 text-xs">
              {departmentData.map((dept, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                  <span>{dept.name} {dept.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance nach Standort BarChart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance nach Standort</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis dataKey="name" type="category" fontSize={11} width={60} />
                  <Tooltip />
                  <Bar dataKey="onboardings" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KI-Vorhersagen */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            KI-Vorhersagen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {predictions.map((pred, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">{pred.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold">{pred.value}</span>
                    {pred.unit && <span className="text-lg text-muted-foreground">{pred.unit}</span>}
                    <span className={`text-sm ${pred.changePositive ? 'text-green-600' : 'text-red-600'}`}>
                      {pred.change}
                    </span>
                  </div>
                  <div className="mt-3">
                    <Progress value={pred.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{pred.confidence}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Identifizierte Bottlenecks */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Identifizierte Bottlenecks
            </CardTitle>
            <Badge className="bg-red-100 text-red-700 border-red-200">Kritisch</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bottlenecks.map((bottleneck, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-medium">{bottleneck.title}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {bottleneck.department} • {bottleneck.cases.toLocaleString()} Fälle betroffen
                      </span>
                    </div>
                    <span className="text-sm text-red-600 font-medium">
                      {bottleneck.delay} Tage Ø Verzögerung
                    </span>
                  </div>
                  <Progress value={bottleneck.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KI-generierte Insights & Empfehlungen */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">KI-generierte Insights & Empfehlungen</h3>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Alle Insights exportieren
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {insights.map((insight, index) => (
            <Card key={index} className={insight.cardBg}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${insight.iconBg}`}>
                    <insight.icon className={`h-5 w-5 ${insight.iconColor || 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge className={insight.impactColor}>{insight.impact}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    <p className="text-sm mt-2">
                      <span className="font-medium">→ Empfehlung:</span> {insight.recommendation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
