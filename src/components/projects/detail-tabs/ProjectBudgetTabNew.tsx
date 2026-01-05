import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProjectBudgetTabNewProps {
  project: any;
}

export const ProjectBudgetTabNew: React.FC<ProjectBudgetTabNewProps> = ({ project }) => {
  const budgetCategories = [
    { name: 'Personal', percentage: 61, amount: '€518.5K', color: 'bg-blue-500' },
    { name: 'Infrastruktur', percentage: 25, amount: '€212.5K', color: 'bg-green-500' },
    { name: 'Software', percentage: 10, amount: '€85K', color: 'bg-purple-500' },
    { name: 'Sonstiges', percentage: 4, amount: '€34K', color: 'bg-gray-400' },
  ];

  const trendData = [
    { month: 'M1', cost: 45 },
    { month: 'M2', cost: 85 },
    { month: 'M3', cost: 120 },
    { month: 'M4', cost: 180 },
    { month: 'M5', cost: 250 },
    { month: 'M6', cost: 320 },
  ];

  const totalBudget = project.budget || 850000;
  const budgetSpent = project.budget_spent || 527000;
  const budgetRemaining = totalBudget - budgetSpent;
  const budgetPercentage = Math.round((budgetSpent / totalBudget) * 100);

  return (
    <div className="space-y-6">
      {/* Budget-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-sm text-muted-foreground">Gesamtbudget</span>
            </div>
            <p className="text-2xl font-bold">€{(totalBudget / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="text-sm text-muted-foreground">Verbraucht</span>
            </div>
            <p className="text-2xl font-bold">{budgetPercentage}%</p>
            <Progress value={budgetPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-sm text-muted-foreground">Verbleibend</span>
            </div>
            <p className="text-2xl font-bold text-green-600">€{(budgetRemaining / 1000).toFixed(0)}K</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget-Verteilung */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Budget-Verteilung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgetCategories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{category.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{category.amount}</span>
                  <span className="text-sm font-medium">{category.percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${category.color}`} 
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Budget-Warnung */}
      <Card className="border-yellow-300 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800">Budget-Warnung</p>
              <p className="text-sm text-yellow-700 mt-1">
                Das Budget für Personal nähert sich dem Limit. Es wurden bereits 85% des geplanten Personalbudgets verbraucht.
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-yellow-400 text-yellow-700 hover:bg-yellow-100">
              Review anfordern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Kostentrend Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Kostentrend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" tickFormatter={(value) => `€${value}K`} />
                <Tooltip 
                  formatter={(value: number) => [`€${value}K`, 'Kosten']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};