import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { TrendingUp, Award, CheckCircle } from "lucide-react";

const DepartmentPerformanceTab = () => {
  const trendData: Array<{ month: string; value: number }> = [];

  const metrics: Array<{ label: string; target: number; actual: number }> = [];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-l-4 border-l-blue-500 bg-blue-50/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-muted-foreground">Gesamt Effizienz</p>
          </div>
          <p className="text-3xl font-bold">94.5%</p>
          <p className="text-sm text-emerald-600 mt-1">+2.3% vs letzter Monat</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-400 bg-amber-50/50">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-amber-600" />
            <p className="text-sm font-medium text-muted-foreground">Mitarbeiter-Zufriedenheit</p>
          </div>
          <p className="text-3xl font-bold">4.2/5.0</p>
          <p className="text-sm text-emerald-600 mt-1">Sehr gut</p>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500 bg-emerald-50/50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-medium text-muted-foreground">Projekt Erfolgsrate</p>
          </div>
          <p className="text-3xl font-bold">91%</p>
          <p className="text-sm text-red-500 mt-1">41/45 erfolgreich</p>
        </Card>
      </div>

      {/* Performance Metriken */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Performance Metriken</h3>
        <div className="space-y-5">
          {metrics.map((metric, index) => {
            const isAboveTarget = metric.actual >= metric.target;
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Ziel: {metric.target}%</span>
                    <Badge className={isAboveTarget ? "bg-gray-900 text-white hover:bg-gray-900" : "bg-red-500 text-white hover:bg-red-500"}>
                      {metric.actual}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-900 h-2 rounded-full"
                    style={{ width: `${metric.actual}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Produktivitäts Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Produktivitäts Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              formatter={(value: number) => [`${value}`, 'Produktivität %']}
            />
            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default DepartmentPerformanceTab;
