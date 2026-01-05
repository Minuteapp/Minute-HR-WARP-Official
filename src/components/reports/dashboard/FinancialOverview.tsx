
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', expenses: 4200, revenue: 6800 },
  { month: 'Feb', expenses: 3800, revenue: 5900 },
  { month: 'Mar', expenses: 5100, revenue: 7200 },
  { month: 'Apr', expenses: 4800, revenue: 6500 },
  { month: 'Mai', expenses: 5500, revenue: 8100 },
  { month: 'Jun', expenses: 4900, revenue: 7400 },
];

const FinancialOverview = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Finanzübersicht</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="expenses" name="Ausgaben" fill="#ff4d4f" />
              <Bar dataKey="revenue" name="Einnahmen" fill="#52c41a" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialOverview;
