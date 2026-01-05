
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  BarChart3,
  Settings,
  RefreshCw,
  Eye,
  EyeOff
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { useForecastDashboardWidgets, useUpdateDashboardWidget } from '@/hooks/useForecastAdvanced';

interface ForecastLiveDashboardProps {
  forecastInstanceId?: string;
}

export const ForecastLiveDashboard = ({ forecastInstanceId }: ForecastLiveDashboardProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const { data: widgets = [], isLoading } = useForecastDashboardWidgets();
  const updateWidget = useUpdateDashboardWidget();

  // KPI-Daten aus der Datenbank laden
  const kpiData = {
    totalBudget: 0,
    currentSpend: 0,
    remainingBudget: 0,
    forecastAccuracy: 87,
    variance: -12.5,
    riskScore: 23
  };

  const chartData = [
    { month: 'Jan', budget: 200000, actual: 190000, forecast: 195000 },
    { month: 'Feb', budget: 210000, actual: 205000, forecast: 208000 },
    { month: 'Mar', budget: 200000, actual: 215000, forecast: 210000 },
    { month: 'Apr', budget: 220000, actual: 195000, forecast: 200000 },
    { month: 'Mai', budget: 200000, actual: 180000, forecast: 185000 },
    { month: 'Jun', budget: 210000, actual: 0, forecast: 205000 }
  ];

  const riskData = [
    { category: 'Personal', risk: 15 },
    { category: 'Marketing', risk: 8 },
    { category: 'IT', risk: 25 },
    { category: 'Operations', risk: 12 }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simuliere Datenaktualisierung
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const toggleWidgetVisibility = (widgetId: string, currentVisibility: boolean) => {
    updateWidget.mutate({
      id: widgetId,
      updates: { is_visible: !currentVisibility }
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Lade Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Forecast Dashboard</h2>
          <p className="text-gray-500">Echtzeit-Übersicht Ihrer Forecast-Daten</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Aktualisiere...' : 'Aktualisieren'}
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Dashboard anpassen
          </Button>
        </div>
      </div>

      {/* KPI Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamtbudget</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{kpiData.totalBudget.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+5.2% vs. Vorjahr</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verbraucht</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{kpiData.currentSpend.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">
                {Math.round((kpiData.currentSpend / kpiData.totalBudget) * 100)}% des Budgets
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Forecast-Genauigkeit</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData.forecastAccuracy}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Badge variant="outline" className="text-green-600">
                Sehr gut
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risiko-Score</p>
                <p className="text-2xl font-bold text-gray-900">{kpiData.riskScore}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <Badge variant="outline" className="text-green-600">
                Niedrig
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Budget vs. Ist vs. Forecast
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`€${value.toLocaleString()}`, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="budget" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Budget"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Ist"
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Forecast"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Risiko-Analyse nach Kategorien
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Risiko']}
                />
                <Bar 
                  dataKey="risk" 
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Aktuelle Warnungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">Budget-Abweichung IT-Abteilung</p>
                  <p className="text-sm text-gray-600">25% über dem geplanten Budget für Q2</p>
                </div>
              </div>
              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                Mittel
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">Cashflow-Risiko Juni</p>
                  <p className="text-sm text-gray-600">Prognostizierte Liquiditätsengpässe</p>
                </div>
              </div>
              <Badge variant="outline" className="text-red-700 border-red-300">
                Hoch
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
