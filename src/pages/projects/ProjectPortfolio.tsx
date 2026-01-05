import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Target, AlertTriangle, CheckCircle2, Clock, Users } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, BarChart, Bar } from "recharts";

export default function ProjectPortfolio() {
  const kpis = [
    { 
      label: "Aktive Projekte", 
      value: "47", 
      change: "+5",
      icon: Target,
      trend: "up"
    },
    { 
      label: "Fortschritt Ø", 
      value: "68%", 
      change: "+12%",
      icon: TrendingUp,
      trend: "up"
    },
    { 
      label: "Budgetverbrauch", 
      value: "€2.4M", 
      change: "-8%",
      icon: DollarSign,
      trend: "down"
    },
    { 
      label: "Risikoindex", 
      value: "2.3", 
      change: "-0.4",
      icon: AlertTriangle,
      trend: "down"
    },
    { 
      label: "Pünktliche Meilensteine", 
      value: "89%", 
      change: "+3%",
      icon: CheckCircle2,
      trend: "up"
    },
    { 
      label: "Überfällige Tasks", 
      value: "23", 
      change: "-7",
      icon: Clock,
      trend: "down"
    },
  ];

  const portfolioData = [
    { name: "Projekt 1", impact: 85, effort: 92, status: "Aktiv", budget: 850 },
    { name: "Projekt 2", impact: 95, effort: 88, status: "Planung", budget: 1200 },
    { name: "Projekt 3", impact: 78, effort: 65, status: "Aktiv", budget: 450 },
    { name: "Projekt 4", impact: 92, effort: 72, status: "Review", budget: 980 },
    { name: "Projekt 5", impact: 65, effort: 45, status: "Planung", budget: 320 },
    { name: "Projekt 6", impact: 88, effort: 95, status: "Aktiv", budget: 1450 },
    { name: "Projekt 7", impact: 72, effort: 55, status: "Aktiv", budget: 620 },
    { name: "Projekt 8", impact: 55, effort: 48, status: "Planung", budget: 280 },
  ];

  const okrData = [
    { quarter: "Q1 2025 - Digital Transformation", projects: 3, progress: 85, color: "#3b82f6" },
    { quarter: "Q2 2025 - Customer Experience", projects: 2, progress: 72, color: "#10b981" },
    { quarter: "Q3 2025 - Employee Engagement", projects: 1, progress: 60, color: "#8b5cf6" },
    { quarter: "Q2 2025 - Data Strategy", projects: 1, progress: 88, color: "#f59e0b" },
  ];

  const topRisks = [
    { name: "ERP Migration", description: "Hohes Risiko", severity: 75, color: "#ef4444" },
    { name: "Cloud Infrastructure", description: "Mittleres Risiko", severity: 65, color: "#f97316" },
    { name: "Security Audit", description: "Mittleres Risiko", severity: 60, color: "#f59e0b" },
    { name: "API Gateway", description: "Niedriges Risiko", severity: 40, color: "#eab308" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktiv": return "#10b981";
      case "Planung": return "#3b82f6";
      case "Review": return "#8b5cf6";
      default: return "#6b7280";
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <Icon className="w-5 h-5 text-muted-foreground" />
                {kpi.trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="text-sm text-muted-foreground mb-1">{kpi.label}</div>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className={`text-sm font-medium ${kpi.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {kpi.change}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Portfolio Matrix */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-1">Portfolio Matrix: Impact vs. Aufwand vs. Risiko</h3>
          <p className="text-sm text-muted-foreground">Größe = Projektbudget | Farbe = Status</p>
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#10b981]" />
            <span className="text-sm">Aktiv</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
            <span className="text-sm">Planung</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
            <span className="text-sm">Review</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="impact" name="Impact" unit="%" domain={[0, 100]} />
            <YAxis type="number" dataKey="effort" name="Aufwand" unit="%" domain={[0, 100]} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Projekte" data={portfolioData}>
              {portfolioData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* OKR-Beitrag */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">OKR-Beitrag nach Programm</h3>
          <div className="space-y-4">
            {okrData.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.quarter}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.projects} Projekte · {item.progress}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${item.progress}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Risiken */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Risiken</h3>
          <div className="space-y-4">
            {topRisks.map((risk, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">{risk.name}</div>
                  <div className="text-xs text-muted-foreground">{risk.description}</div>
                </div>
                <Badge
                  style={{ backgroundColor: risk.color }}
                  className="text-white"
                >
                  {risk.severity}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
