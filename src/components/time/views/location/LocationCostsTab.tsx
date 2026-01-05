import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const LocationCostsTab = () => {
  const costStats = [
    { label: 'Monatliche Kosten', value: '--', subtext: 'Gesamt Standortkosten', subtextColor: 'text-muted-foreground', bgColor: 'bg-green-50', borderColor: 'border-l-green-500' },
    { label: 'Kosten pro Mitarbeiter', value: '--', subtext: 'Pro Monat', subtextColor: 'text-muted-foreground', bgColor: 'bg-blue-50', borderColor: 'border-l-blue-500' },
    { label: 'Jahreskosten (Prognose)', value: '--', subtext: 'Hochrechnung', subtextColor: 'text-muted-foreground', bgColor: 'bg-orange-50', borderColor: 'border-l-orange-500' },
  ];

  const costBreakdown: Array<{ name: string; amount: number; percentage: number }> = [];

  const costTrendData: Array<{ month: string; cost: number }> = [];

  return (
    <div className="space-y-6">
      {/* Cost Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {costStats.map((stat, index) => (
          <Card key={index} className={`p-5 border-l-4 ${stat.borderColor} ${stat.bgColor}`}>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
            <p className={`text-sm mt-2 ${stat.subtextColor}`}>{stat.subtext}</p>
          </Card>
        ))}
      </div>

      {/* Cost Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Kostenaufschlüsselung</h3>
        <div className="space-y-6">
          {costBreakdown.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{item.name}</span>
                <span className="font-medium">€{item.amount.toLocaleString()} ({item.percentage}%)</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-900 rounded-full"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cost Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Kostenentwicklung (6 Monate)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={costTrendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`€${Number(value).toLocaleString()}`, 'Kosten (€)']}
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#6366f1" 
                strokeWidth={2}
                dot={{ fill: '#6366f1', strokeWidth: 2 }}
                name="Kosten"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default LocationCostsTab;
