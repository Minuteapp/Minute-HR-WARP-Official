
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

export const AIInsightsPanel = () => {
  const insights = [
    {
      type: "optimization",
      title: "Budget-Optimierung erkannt",
      description: "Marketing-Budget kann um 15% reduziert werden ohne Leistungseinbußen",
      confidence: 87,
      severity: "medium",
      icon: Lightbulb
    },
    {
      type: "forecast",
      title: "Trend-Vorhersage",
      description: "IT-Ausgaben werden voraussichtlich um 22% steigen in Q2",
      confidence: 94,
      severity: "high",
      icon: TrendingUp
    },
    {
      type: "alert",
      title: "Budget-Überschreitung",
      description: "Personalkosten überschreiten geplantes Budget um 8%",
      confidence: 99,
      severity: "high",
      icon: AlertTriangle
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          KI-Einblicke
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <insight.icon className={`h-4 w-4 ${
                  insight.severity === 'high' ? 'text-red-500' : 
                  insight.severity === 'medium' ? 'text-yellow-500' : 
                  'text-blue-500'
                }`} />
                <h4 className="font-semibold text-sm">{insight.title}</h4>
              </div>
              <Badge variant={insight.severity === 'high' ? 'destructive' : 'secondary'}>
                {insight.confidence}% Sicherheit
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{insight.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
