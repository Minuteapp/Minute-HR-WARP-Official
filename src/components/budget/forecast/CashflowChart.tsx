
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp } from "lucide-react";
import { useCashflowProjection } from '@/hooks/useBudgetScenarios';

interface CashflowChartProps {
  budgetPlanId: string;
  scenarioId?: string;
}

export const CashflowChart = ({ budgetPlanId, scenarioId }: CashflowChartProps) => {
  const { data: cashflowData, isLoading } = useCashflowProjection(budgetPlanId, scenarioId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cashflow-Projektion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!cashflowData || cashflowData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cashflow-Projektion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Cashflow-Daten verfügbar</p>
            <p className="text-sm">Erstellen Sie zuerst einen Budget-Plan mit Cashflow-Projektionen.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = cashflowData.map(item => ({
    period: item.period.split('-')[1], // Nur Monat anzeigen
    fullPeriod: item.period,
    inflows: item.total_inflows,
    outflows: -item.total_outflows, // Negativ für bessere Visualisierung
    balance: item.closing_balance,
    netFlow: item.total_inflows - item.total_outflows
  }));

  const formatCurrency = (value: number) => {
    return `€${(value / 1000).toFixed(0)}k`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.fullPeriod}</p>
          <p className="text-green-600">Einnahmen: {formatCurrency(data.inflows)}</p>
          <p className="text-red-600">Ausgaben: {formatCurrency(Math.abs(data.outflows))}</p>
          <p className="text-blue-600">Netto: {formatCurrency(data.netFlow)}</p>
          <p className="font-medium">Saldo: {formatCurrency(data.balance)}</p>
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
          Cashflow-Projektion
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
              
              <Area
                type="monotone"
                dataKey="inflows"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Einnahmen"
              />
              <Area
                type="monotone"
                dataKey="outflows"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Ausgaben"
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                fill="transparent"
                strokeWidth={2}
                name="Saldo"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Einnahmen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Ausgaben</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
            <span>Kumulierter Saldo</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
