
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetPlan } from "@/types/business-travel";
import { formatCurrency } from "@/utils/currencyUtils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp } from "lucide-react";

interface BudgetDashboardViewProps {
  budgetPlans: BudgetPlan[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const BudgetDashboardView: React.FC<BudgetDashboardViewProps> = ({ budgetPlans }) => {
  const totalBudget = budgetPlans.reduce((sum, budget) => sum + budget.amount, 0);
  const totalUsed = budgetPlans.reduce((sum, budget) => sum + budget.used_amount, 0);
  const totalReserved = budgetPlans.reduce((sum, budget) => sum + budget.reserved_amount, 0);
  const totalRemaining = budgetPlans.reduce((sum, budget) => sum + budget.remaining_amount, 0);
  
  const usagePercentage = totalBudget > 0 ? Math.round((totalUsed / totalBudget) * 100) : 0;

  const budgetByTypeData = [
    { name: 'Abteilungen', value: budgetPlans.filter(b => b.type === 'department').reduce((sum, b) => sum + b.amount, 0) },
    { name: 'Projekte', value: budgetPlans.filter(b => b.type === 'project').reduce((sum, b) => sum + b.amount, 0) },
    { name: 'Teams', value: budgetPlans.filter(b => b.type === 'team').reduce((sum, b) => sum + b.amount, 0) },
    { name: 'Kostenstellen', value: budgetPlans.filter(b => b.type === 'cost_center').reduce((sum, b) => sum + b.amount, 0) }
  ].filter(item => item.value > 0);

  const budgetUsageData = budgetPlans.map(budget => ({
    name: budget.name.length > 20 ? budget.name.substring(0, 20) + '...' : budget.name,
    gesamtBudget: budget.amount,
    verwendet: budget.used_amount,
    reserviert: budget.reserved_amount,
    verbleibend: budget.remaining_amount
  }));

  if (budgetPlans.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-medium">Keine Budgetdaten vorhanden</h3>
          <p className="text-muted-foreground mt-1">
            Erstellen Sie Budgetpläne, um die Dashboard-Ansicht zu nutzen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Übersichts-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamtbudget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(totalBudget, 'EUR')}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verwendet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{formatCurrency(totalUsed, 'EUR')}</div>
              <div className="ml-2 text-sm text-muted-foreground">({usagePercentage}%)</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reserviert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalReserved, 'EUR')}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verbleibend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(totalRemaining, 'EUR')}</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Diagramme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budgetverteilung nach Typ */}
        <Card>
          <CardHeader>
            <CardTitle>Budgetverteilung nach Typ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetByTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {budgetByTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number, 'EUR')} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Budgetnutzung pro Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Budgetnutzung pro Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetUsageData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                >
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number, 'EUR')} />
                  <Legend />
                  <Bar dataKey="verwendet" stackId="a" fill="#0088FE" name="Verwendet" />
                  <Bar dataKey="reserviert" stackId="a" fill="#FFBB28" name="Reserviert" />
                  <Bar dataKey="verbleibend" stackId="a" fill="#00C49F" name="Verbleibend" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetDashboardView;
