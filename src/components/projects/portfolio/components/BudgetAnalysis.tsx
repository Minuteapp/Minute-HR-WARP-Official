
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  priority: string;
  progress: number;
  budget?: number;
  budget_spent?: number;
  created_at: string;
}

interface BudgetAnalysisProps {
  projects: Project[];
}

export const BudgetAnalysis: React.FC<BudgetAnalysisProps> = ({ projects }) => {
  // Projekte mit Budget filtern
  const projectsWithBudget = projects.filter(p => p.budget && p.budget > 0);

  // Budget-Übersicht Daten
  const budgetOverview = projectsWithBudget.map(project => ({
    name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
    budget: project.budget || 0,
    spent: project.budget_spent || 0,
    remaining: (project.budget || 0) - (project.budget_spent || 0),
    usage: project.budget ? ((project.budget_spent || 0) / project.budget) * 100 : 0
  }));

  // Budget-Status Verteilung
  const budgetStatusData = [
    {
      name: 'Unter Budget',
      value: projectsWithBudget.filter(p => (p.budget_spent || 0) < (p.budget || 0) * 0.8).length,
      color: '#10B981'
    },
    {
      name: 'Warnung',
      value: projectsWithBudget.filter(p => {
        const usage = (p.budget_spent || 0) / (p.budget || 0);
        return usage >= 0.8 && usage < 1;
      }).length,
      color: '#F59E0B'
    },
    {
      name: 'Überschritten',
      value: projectsWithBudget.filter(p => (p.budget_spent || 0) >= (p.budget || 0)).length,
      color: '#EF4444'
    }
  ].filter(item => item.value > 0);

  // Gesamtstatistiken
  const totalBudget = projectsWithBudget.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = projectsWithBudget.reduce((sum, p) => sum + (p.budget_spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const averageUsage = projectsWithBudget.length > 0 
    ? projectsWithBudget.reduce((sum, p) => sum + ((p.budget_spent || 0) / (p.budget || 0)), 0) / projectsWithBudget.length * 100
    : 0;

  if (projectsWithBudget.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget-Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Keine Projekte mit Budget-Informationen gefunden.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget-Übersicht Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gesamtbudget</p>
                <p className="text-2xl font-bold">€{totalBudget.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ausgegeben</p>
                <p className="text-2xl font-bold">€{totalSpent.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verbleibt</p>
                <p className="text-2xl font-bold">€{totalRemaining.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ø Nutzung</p>
                <p className="text-2xl font-bold">{averageUsage.toFixed(1)}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget-Vergleich Balkendiagramm */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs. Ausgaben</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetOverview.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `€${value.toLocaleString()}`} />
                  <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
                  <Bar dataKey="spent" fill="#EF4444" name="Ausgegeben" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Budget-Status Kreisdiagramm */}
        <Card>
          <CardHeader>
            <CardTitle>Budget-Status Verteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {budgetStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detaillierte Projektliste */}
      <Card>
        <CardHeader>
          <CardTitle>Projekt Budget-Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetOverview.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{project.name}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Budget: €{project.budget.toLocaleString()}</span>
                    <span>Ausgegeben: €{project.spent.toLocaleString()}</span>
                    <span>Verbleibt: €{project.remaining.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {project.usage.toFixed(1)}%
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${
                        project.usage < 80 ? 'bg-green-500' : 
                        project.usage < 100 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(project.usage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
