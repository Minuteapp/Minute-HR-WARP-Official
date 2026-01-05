
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseItem } from '@/types/expenses';
import { formatCurrency } from '@/utils/currencyUtils';

interface ExpenseChartProps {
  expenses: ExpenseItem[];
  isLoading: boolean;
}

const ExpenseChart = ({ expenses, isLoading }: ExpenseChartProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Prepare data for category breakdown
  const categoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.category === expense.category);
    if (existing) {
      existing.amount += expense.amount;
      existing.count += 1;
    } else {
      acc.push({
        category: expense.category,
        amount: expense.amount,
        count: 1
      });
    }
    return acc;
  }, [] as { category: string; amount: number; count: number }[]);

  // Prepare data for monthly trend
  const monthlyData = expenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleDateString('de-DE', { 
      month: 'short', 
      year: 'numeric' 
    });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.amount += expense.amount;
      existing.count += 1;
    } else {
      acc.push({
        month,
        amount: expense.amount,
        count: 1
      });
    }
    return acc;
  }, [] as { month: string; amount: number; count: number }[]);

  // Prepare data for status distribution
  const statusData = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.status === expense.status);
    if (existing) {
      existing.count += 1;
      existing.amount += expense.amount;
    } else {
      acc.push({
        status: expense.status,
        count: 1,
        amount: expense.amount
      });
    }
    return acc;
  }, [] as { status: string; count: number; amount: number }[]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'travel': 'Reisekosten',
      'accommodation': 'Unterkunft',
      'meals': 'Verpflegung',
      'training': 'Weiterbildung',
      'equipment': 'Ausrüstung',
      'office_supplies': 'Büromaterial',
      'software': 'Software',
      'other': 'Sonstiges'
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'draft': 'Entwurf',
      'submitted': 'Eingereicht',
      'approved': 'Genehmigt',
      'rejected': 'Abgelehnt',
      'paid': 'Bezahlt'
    };
    return labels[status] || status;
  };

  return (
    <Tabs defaultValue="category" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="category">Nach Kategorie</TabsTrigger>
        <TabsTrigger value="monthly">Monatstrend</TabsTrigger>
        <TabsTrigger value="status">Nach Status</TabsTrigger>
        <TabsTrigger value="overview">Übersicht</TabsTrigger>
      </TabsList>

      <TabsContent value="category" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ausgaben nach Kategorie (Betrag)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={getCategoryLabel}
                  />
                  <YAxis tickFormatter={(value) => formatCurrency(value, 'EUR')} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value, 'EUR'), 'Betrag']}
                    labelFormatter={getCategoryLabel}
                  />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verteilung nach Kategorien</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => 
                      `${getCategoryLabel(category)} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, 'EUR')} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="monthly" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Monatlicher Ausgabentrend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value, 'EUR')} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value, 'EUR'), 'Betrag']}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="status" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ausgaben nach Status (Anzahl)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="status" 
                    tickFormatter={getStatusLabel}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={getStatusLabel}
                    formatter={(value: number) => [value, 'Anzahl']}
                  />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status-Verteilung nach Betrag</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => 
                      `${getStatusLabel(status)} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value, 'EUR')} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Kategorie vs. Monat</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="category" 
                    tickFormatter={getCategoryLabel}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffc658" name="Anzahl" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Durchschnittlicher Ausgabenbetrag</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {formatCurrency(
                    expenses.length > 0 
                      ? expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length 
                      : 0, 
                    'EUR'
                  )}
                </div>
                <p className="text-gray-600">Durchschnitt pro Ausgabe</p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-green-600">
                      {formatCurrency(
                        Math.max(...expenses.map(exp => exp.amount), 0), 
                        'EUR'
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Höchste Ausgabe</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-semibold text-blue-600">
                      {formatCurrency(
                        Math.min(...expenses.map(exp => exp.amount), 0), 
                        'EUR'
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Niedrigste Ausgabe</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ExpenseChart;
