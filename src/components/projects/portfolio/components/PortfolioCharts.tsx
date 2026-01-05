
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, BarChart3, TrendingUp } from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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

interface PortfolioChartsProps {
  projects: Project[];
}

export const PortfolioCharts: React.FC<PortfolioChartsProps> = ({ projects }) => {
  // Status-Verteilung für Pie Chart
  const statusData = [
    { name: 'Aktiv', value: projects.filter(p => p.status === 'active').length, color: '#10B981' },
    { name: 'Abgeschlossen', value: projects.filter(p => p.status === 'completed').length, color: '#3B82F6' },
    { name: 'Geplant', value: projects.filter(p => p.status === 'pending').length, color: '#F59E0B' },
    { name: 'Pausiert', value: projects.filter(p => p.status === 'on_hold').length, color: '#EF4444' }
  ].filter(item => item.value > 0);

  // Prioritäts-Verteilung für Bar Chart
  const priorityData = [
    { name: 'Hoch', value: projects.filter(p => p.priority === 'high').length, color: '#EF4444' },
    { name: 'Mittel', value: projects.filter(p => p.priority === 'medium').length, color: '#F59E0B' },
    { name: 'Niedrig', value: projects.filter(p => p.priority === 'low').length, color: '#10B981' }
  ];

  // Fortschritts-Verteilung
  const progressRanges = [
    { name: '0-25%', count: projects.filter(p => p.progress >= 0 && p.progress <= 25).length },
    { name: '26-50%', count: projects.filter(p => p.progress > 25 && p.progress <= 50).length },
    { name: '51-75%', count: projects.filter(p => p.progress > 50 && p.progress <= 75).length },
    { name: '76-100%', count: projects.filter(p => p.progress > 75 && p.progress <= 100).length }
  ];

  // Budget-Analyse
  const budgetData = projects
    .filter(p => p.budget && p.budget > 0)
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      budget: p.budget || 0,
      spent: p.budget_spent || 0,
      remaining: (p.budget || 0) - (p.budget_spent || 0)
    }))
    .slice(0, 6); // Top 6 Projekte

  return (
    <>
      {/* Status-Verteilung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Status-Verteilung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <RechartsPieChart data={statusData}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Prioritäts-Verteilung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Prioritäts-Verteilung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Fortschritts-Verteilung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Fortschritts-Verteilung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressRanges.map((range, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium">{range.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(range.count / projects.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-muted-foreground">{range.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget-Analyse */}
      {budgetData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Budget-Analyse (Top 6)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
                  <Bar dataKey="spent" fill="#EF4444" name="Ausgegeben" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
