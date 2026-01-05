
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart, TrendingUp, Download } from "lucide-react";

export const BudgetVisualizationCenter = () => {
  const visualizations = [
    {
      name: "Budget-Übersicht",
      type: "pie",
      icon: PieChart,
      description: "Verteilung nach Kostenstellen"
    },
    {
      name: "Zeitlicher Verlauf",
      type: "line",
      icon: TrendingUp,
      description: "Budget-Entwicklung über Zeit"
    },
    {
      name: "Vergleichsanalyse",
      type: "bar",
      icon: BarChart3,
      description: "Plan vs. Ist-Vergleich"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Visualisierungen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visualizations.map((viz, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <viz.icon className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">{viz.name}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">{viz.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Anzeigen
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
