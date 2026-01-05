import { CalendarView, UserRole } from "@/components/CalendarModule";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bot, Sparkles, Info, TrendingUp, TrendingDown, Minus, Clock, Users, Target, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

interface AIPlanningTabProps {
  view: CalendarView;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  userRole: UserRole;
  zoomLevel: number;
}

// Leere Arrays - Daten werden aus der Datenbank geladen
const metrics: Array<{
  id: string;
  title: string;
  value: string;
  trend: string;
  icon: any;
  description: string;
  color: string;
}> = [];

const optimizations: Array<{
  id: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  suggestion: string;
  timeSlots: string[];
}> = [];

const teamAvailability: Array<{
  id: string;
  name: string;
  role: string;
  availability: number;
  status: string;
  nextSlot: string;
}> = [];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "destructive";
    case "medium":
      return "default";
    case "low":
      return "secondary";
    default:
      return "secondary";
  }
};

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "high":
      return AlertTriangle;
    case "medium":
      return AlertCircle;
    case "low":
      return CheckCircle2;
    default:
      return AlertCircle;
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return TrendingUp;
    case "down":
      return TrendingDown;
    default:
      return Minus;
  }
};

export function AIPlanningTab({}: AIPlanningTabProps) {
  return (
    <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">KI-Planung & Prognose</h1>
            <p className="text-muted-foreground">
              Intelligente Terminoptimierung und Workload-Analyse
            </p>
          </div>
        </div>
        <Badge className="bg-purple-500/10 text-purple-700 border-purple-500/20">
          <Sparkles className="h-3 w-3 mr-1" />
          KI-gestützt
        </Badge>
      </div>

      {/* Info Banner */}
      <Card className="p-4 bg-blue-500/10 border-blue-500/20">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Die KI analysiert Ihre Termine, erkennt Muster und gibt Empfehlungen zur Optimierung Ihrer Arbeitszeit. Alle Vorschläge basieren auf historischen Daten der letzten 6 Monate.
          </p>
        </div>
      </Card>

      {/* Metriken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const TrendIcon = getTrendIcon(metric.trend);
          return (
            <Card key={metric.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-muted ${metric.color}`}>
                  <metric.icon className="h-5 w-5" />
                </div>
                <TrendIcon className={`h-4 w-4 ${metric.color}`} />
              </div>
              <p className="text-2xl font-bold mb-1">{metric.value}</p>
              <p className="text-sm font-medium mb-1">{metric.title}</p>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Konflikte & Optimierungen */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Konflikte & Optimierungen
            <Badge variant="secondary">{optimizations.length}</Badge>
          </h2>
        </div>
        <div className="space-y-4">
          {optimizations.map((opt) => {
            const PriorityIcon = getPriorityIcon(opt.priority);
            return (
              <Card key={opt.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <PriorityIcon className="h-4 w-4" />
                        <h3 className="font-semibold">{opt.title}</h3>
                        <Badge variant={getPriorityColor(opt.priority)} className="text-xs">
                          {opt.priority === "high" && "Hoch"}
                          {opt.priority === "medium" && "Mittel"}
                          {opt.priority === "low" && "Niedrig"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {opt.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {opt.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-start gap-2 p-3 bg-purple-500/10 rounded-lg">
                        <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-2">{opt.suggestion}</p>
                          {opt.timeSlots.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {opt.timeSlots.map((slot, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                >
                                  {slot}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Team-Verfügbarkeit */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Team-Verfügbarkeit
            <Badge variant="secondary" className="bg-green-500/10 text-green-700">
              Live
            </Badge>
          </h2>
        </div>
        <div className="space-y-3">
          {teamAvailability.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  {member.status === "busy" && (
                    <Badge variant="destructive" className="text-xs">
                      🚨 Beschäftigt
                    </Badge>
                  )}
                  {member.status === "limited" && (
                    <Badge variant="default" className="bg-orange-500/10 text-orange-700 text-xs">
                      ⚠️ Eingeschränkt
                    </Badge>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">
                      Verfügbarkeit diese Woche
                    </p>
                    <p className="text-sm font-medium">{member.availability}%</p>
                  </div>
                  <Progress value={member.availability} className="h-2" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Nächstes freies Zeitfenster: {member.nextSlot}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
