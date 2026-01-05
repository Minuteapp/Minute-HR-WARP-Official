
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useActualVsBudget } from '@/hooks/useBudgetScenarios';

interface ActualVsBudgetChartProps {
  budgetPlanId: string;
}

export const ActualVsBudgetChart = ({ budgetPlanId }: ActualVsBudgetChartProps) => {
  const { data: analysisData, isLoading } = useActualVsBudget(budgetPlanId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            IST vs SOLL Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysisData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            IST vs SOLL Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine IST vs SOLL Daten verfügbar</p>
            <p className="text-sm">Erstellen Sie zuerst einen Budget-Plan mit IST-Daten.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = analysisData.period_analysis.map(period => ({
    period: period.period.split('-')[1], // Nur Monat
    budget: period.budget / 1000, // In Tausend
    actual: period.actual / 1000,
    variance: period.variance / 1000
  }));

  const overallVariancePercentage = analysisData.variance_percentage;
  const isPositiveVariance = analysisData.variance >= 0;

  const formatCurrency = (value: number) => {
    return `€${value.toFixed(0)}k`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Monat ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          IST vs SOLL Analyse
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Übersicht */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                €{(analysisData.budget_amount / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-gray-600">Geplant (SOLL)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                €{(analysisData.actual_amount / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-gray-600">Tatsächlich (IST)</div>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              isPositiveVariance ? 'bg-red-50' : 'bg-green-50'
            }`}>
              <div className={`text-2xl font-bold flex items-center justify-center gap-2 ${
                isPositiveVariance ? 'text-red-600' : 'text-green-600'
              }`}>
                {isPositiveVariance ? 
                  <AlertCircle className="h-6 w-6" /> : 
                  <CheckCircle className="h-6 w-6" />
                }
                {overallVariancePercentage >= 0 ? '+' : ''}{overallVariancePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Abweichung</div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="budget" 
                  fill="#3b82f6" 
                  name="Geplant (SOLL)"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="actual" 
                  fill="#10b981" 
                  name="Tatsächlich (IST)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Periode-Details */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Periodenübersicht</h4>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {analysisData.period_analysis.map((period, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <span>{period.period}</span>
                  <div className="flex gap-4">
                    <span>SOLL: €{(period.budget / 1000).toFixed(0)}k</span>
                    <span>IST: €{(period.actual / 1000).toFixed(0)}k</span>
                    <span className={period.variance >= 0 ? 'text-red-600' : 'text-green-600'}>
                      {period.variance >= 0 ? '+' : ''}€{(period.variance / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
