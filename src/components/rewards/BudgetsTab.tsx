import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Receipt,
  AlertTriangle,
  ArrowUpRight
} from "lucide-react";
import { useRewardBudgets } from '@/hooks/useRewardBudgets';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
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
  Cell
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const BudgetsTab = () => {
  const { budgets, transactions, statistics, isLoading } = useRewardBudgets();

  if (isLoading) {
    return <div className="flex justify-center py-10">Lade Daten...</div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header Budget Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Gesamtbudget {new Date().getFullYear()}</p>
              <p className="text-4xl font-bold mt-1">{formatCurrency(statistics.totalBudget)}</p>
              <div className="flex items-center gap-6 mt-4">
                <div>
                  <p className="text-blue-200 text-xs">Genutzt</p>
                  <p className="text-xl font-semibold">{formatCurrency(statistics.usedBudget)}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs">Verbleibend</p>
                  <p className="text-xl font-semibold">{formatCurrency(statistics.remainingBudget)}</p>
                </div>
              </div>
            </div>
            <div className="relative h-32 w-32">
              <svg className="transform -rotate-90 h-32 w-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="white"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${statistics.utilizationPercentage * 3.52} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{statistics.utilizationPercentage}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monatlich</p>
                <p className="text-2xl font-bold">{formatCurrency(statistics.monthlySpend)}</p>
                <p className="text-xs text-muted-foreground">Aktueller Monat</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ø pro Mitarbeiter</p>
                <p className="text-2xl font-bold">{formatCurrency(statistics.avgPerEmployee)}</p>
                <p className="text-xs text-muted-foreground">Dieser Monat</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Größte Ausgabe</p>
                <p className="text-2xl font-bold">{formatCurrency(statistics.largestExpense.amount)}</p>
                <p className="text-xs text-muted-foreground truncate">{statistics.largestExpense.name}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prognose</p>
                <p className="text-2xl font-bold">{formatCurrency(statistics.yearEndForecast)}</p>
                <p className="text-xs text-muted-foreground">Jahresende</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Budgets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget nach Abteilung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statistics.departmentBudgets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine Abteilungsbudgets definiert
              </p>
            ) : (
              statistics.departmentBudgets.map((dept) => (
                <div key={dept.department} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: dept.color }}
                      />
                      <span className="font-medium">{dept.department}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{dept.percentage}%</span>
                  </div>
                  <Progress value={dept.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(dept.usedBudget)} genutzt</span>
                    <span>{formatCurrency(dept.totalBudget)} gesamt</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Monthly Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monatliche Ausgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.monthlyExpenses}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verteilung nach Kategorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statistics.categoryDistribution}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                  >
                    {statistics.categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aktuelle Transaktionen</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Keine Transaktionen vorhanden
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Datum</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Mitarbeiter</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Belohnung</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Abteilung</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Betrag</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-3 px-4 text-sm">
                        {format(new Date(tx.transaction_date), 'dd.MM.yyyy', { locale: de })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={tx.employee_avatar} />
                            <AvatarFallback>{tx.employee_name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{tx.employee_name || 'Unbekannt'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium">{tx.reward_name}</p>
                          <Badge variant="secondary" className="text-xs">{tx.category}</Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{tx.department || '-'}</td>
                      <td className="py-3 px-4 text-right text-sm font-medium">
                        {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Warning */}
      {statistics.utilizationPercentage > 80 && (
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-100">Budget-Warnung</h4>
                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  Das Jahresbudget ist zu {statistics.utilizationPercentage}% ausgeschöpft. 
                  Basierend auf der aktuellen Ausgabenrate wird das Budget voraussichtlich 
                  vor Jahresende erschöpft sein.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
