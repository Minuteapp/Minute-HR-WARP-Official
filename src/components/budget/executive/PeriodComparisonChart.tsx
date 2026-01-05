import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Loader2
} from "lucide-react";

export const PeriodComparisonChart = () => {
  const [comparisonType, setComparisonType] = useState<'yoy' | 'mom' | 'qoq'>('yoy');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');

  // Echte Budget-Daten aus der Datenbank laden
  const { data: budgetData = [], isLoading } = useQuery({
    queryKey: ['period-comparison-budgets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select('id, name, total_amount, allocated_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    }
  });

  // Vergleichsdaten aus echten Budgets generieren
  const comparisonData = budgetData.length > 0 
    ? budgetData.slice(0, 5).map(budget => ({
        category: budget.name || 'Budget',
        current: budget.allocated_amount || 0,
        previous: budget.total_amount || 0,
        change: budget.total_amount && budget.total_amount > 0 
          ? Math.round(((budget.allocated_amount || 0) - budget.total_amount) / budget.total_amount * 100 * 10) / 10
          : 0,
        changeAbs: (budget.allocated_amount || 0) - (budget.total_amount || 0)
      }))
    : [];

  // Trend-Daten aus echten Budgets
  const trendData = budgetData.length > 0
    ? budgetData.slice(0, 6).map((budget, index) => ({
        period: `Budget ${index + 1}`,
        revenue: budget.total_amount || 0,
        costs: budget.allocated_amount || 0,
        ebit: (budget.total_amount || 0) - (budget.allocated_amount || 0)
      }))
    : [];

  const getPeriodLabel = () => {
    switch (comparisonType) {
      case 'yoy': return 'Vorjahr';
      case 'mom': return 'Vormonat';
      case 'qoq': return 'Vorquartal';
      default: return 'Vorperiode';
    }
  };

  const formatCurrency = (value: number) => {
    return value >= 1000000 
      ? `€${(value / 1000000).toFixed(1)}M`
      : `€${(value / 1000).toFixed(0)}K`;
  };

  const renderChart = () => {
    const chartData = comparisonData.map(item => ({
      category: item.category,
      current: item.current / 1000, // In Tausend für bessere Lesbarkeit
      previous: item.previous / 1000
    }));

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis tickFormatter={(value) => `€${value}K`} />
            <Tooltip formatter={(value: number) => [`€${value.toFixed(0)}K`, '']} />
            <Line type="monotone" dataKey="current" stroke="#2563eb" strokeWidth={2} name="Aktuell" />
            <Line type="monotone" dataKey="previous" stroke="#64748b" strokeWidth={2} name={getPeriodLabel()} />
          </LineChart>
        );
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis tickFormatter={(value) => `€${value}K`} />
            <Tooltip formatter={(value: number) => [`€${value.toFixed(0)}K`, '']} />
            <Area type="monotone" dataKey="previous" stackId="1" stroke="#64748b" fill="#64748b" fillOpacity={0.3} name={getPeriodLabel()} />
            <Area type="monotone" dataKey="current" stackId="2" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} name="Aktuell" />
          </AreaChart>
        );
      
      default:
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis tickFormatter={(value) => `€${value}K`} />
            <Tooltip formatter={(value: number) => [`€${value.toFixed(0)}K`, '']} />
            <Bar dataKey="previous" fill="#64748b" name={getPeriodLabel()} />
            <Bar dataKey="current" fill="#2563eb" name="Aktuell" />
          </BarChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Periodenvergleiche</h2>
        <div className="flex gap-2">
          <Select value={comparisonType} onValueChange={(value: 'yoy' | 'mom' | 'qoq') => setComparisonType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yoy">Jahr zu Jahr</SelectItem>
              <SelectItem value="qoq">Quartal zu Quartal</SelectItem>
              <SelectItem value="mom">Monat zu Monat</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={(value: 'bar' | 'line' | 'area') => setChartType(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Balken
                </div>
              </SelectItem>
              <SelectItem value="line">
                <div className="flex items-center">
                  <LineChartIcon className="h-4 w-4 mr-2" />
                  Linie
                </div>
              </SelectItem>
              <SelectItem value="area">
                <div className="flex items-center">
                  <AreaChartIcon className="h-4 w-4 mr-2" />
                  Fläche
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hauptchart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Vergleich: Aktuell vs. {getPeriodLabel()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : comparisonData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Keine Budget-Daten für Vergleich vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kennzahlen-Übersicht */}
        <Card>
          <CardHeader>
            <CardTitle>Veränderungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : comparisonData.length > 0 ? (
              comparisonData.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{item.category}</span>
                    <Badge variant={item.change >= 0 ? 'default' : 'destructive'}>
                      {item.change >= 0 ? '+' : ''}{item.change}%
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Aktuell: {formatCurrency(item.current)}</span>
                    <span>{getPeriodLabel()}: {formatCurrency(item.previous)}</span>
                  </div>
                  
                  <div className="flex items-center text-xs">
                    {item.change >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <span className={item.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {item.changeAbs >= 0 ? '+' : ''}{formatCurrency(Math.abs(item.changeAbs))}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                Keine Daten vorhanden
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend-Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Jahrestrend 2025</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : trendData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `€${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `€${(value / 1000000).toFixed(1)}M`, 
                      name === 'revenue' ? 'Budget' : name === 'costs' ? 'Allokiert' : 'Differenz'
                    ]} 
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} name="Budget" />
                  <Line type="monotone" dataKey="costs" stroke="#dc2626" strokeWidth={2} name="Allokiert" />
                  <Line type="monotone" dataKey="ebit" stroke="#16a34a" strokeWidth={2} name="Differenz" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Keine Trend-Daten vorhanden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Varianzanalyse</CardTitle>
        </CardHeader>
        <CardContent>
          {comparisonData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Positive Entwicklungen</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  {comparisonData.filter(i => i.change >= 0).length > 0 ? (
                    comparisonData.filter(i => i.change >= 0).slice(0, 3).map((i, idx) => (
                      <li key={idx}>• {i.category}: +{i.change}%</li>
                    ))
                  ) : (
                    <li>• Keine positiven Entwicklungen</li>
                  )}
                </ul>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-2">Zu beobachten</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Budget-Auslastung prüfen</li>
                  <li>• Allokierung optimieren</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Handlungsempfehlungen</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Regelmäßige Überprüfung</li>
                  <li>• Prognosegenauigkeit erhöhen</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
              Keine Daten für Varianzanalyse vorhanden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};