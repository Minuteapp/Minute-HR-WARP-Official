
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

export const AIInsightsPanel = () => {
  const insights = [
    {
      type: "optimization",
      title: "Budget-Optimierung erkannt",
      description: "IT-Kosten können um 15% reduziert werden",
      impact: "high",
      confidence: 87
    },
    {
      type: "risk",
      title: "Kostenüberschreitung droht",
      description: "Marketing-Budget wird voraussichtlich um 8% überschritten",
      impact: "medium",
      confidence: 93
    },
    {
      type: "opportunity",
      title: "Ungenutzte Budgets",
      description: "Schulungsbudget ist nur zu 45% ausgeschöpft",
      impact: "low",
      confidence: 76
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'risk': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'opportunity': return <Lightbulb className="h-4 w-4 text-blue-600" />;
      default: return <Brain className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          KI-Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <h4 className="font-medium">{insight.title}</h4>
                </div>
                <Badge className={getImpactColor(insight.impact)}>
                  {insight.impact === 'high' ? 'Hoch' : 
                   insight.impact === 'medium' ? 'Mittel' : 'Niedrig'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Vertrauen: {insight.confidence}%
                </span>
                <Button variant="outline" size="sm">
                  Details anzeigen
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
