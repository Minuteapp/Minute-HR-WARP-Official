
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ResourceUsageChartProps {
  projectId: string;
}

const resourceData = [
  { name: 'Jan', budget: 4000, spent: 2400 },
  { name: 'Feb', budget: 3000, spent: 1398 },
  { name: 'Mär', budget: 2000, spent: 9800 },
  { name: 'Apr', budget: 2780, spent: 3908 },
  { name: 'Mai', budget: 1890, spent: 4800 },
  { name: 'Jun', budget: 2390, spent: 3800 }
];

const teamData = [
  { name: 'Entwicklung', value: 40, color: '#3B82F6' },
  { name: 'Design', value: 25, color: '#10B981' },
  { name: 'Testing', value: 20, color: '#F59E0B' },
  { name: 'Management', value: 15, color: '#EF4444' }
];

export const ResourceUsageChart: React.FC<ResourceUsageChartProps> = ({ projectId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Ressourcenverbrauch
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-4">Budget vs. Ausgaben</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={resourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`€${value}`, '']} />
                <Bar dataKey="budget" fill="#E5E7EB" name="Budget" />
                <Bar dataKey="spent" fill="#3B82F6" name="Ausgegeben" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Team-Ressourcen</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={teamData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {teamData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">€24.5k</p>
            <p className="text-sm text-gray-600">Gesamtausgaben</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">€5.5k</p>
            <p className="text-sm text-gray-600">Verbleibendes Budget</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">320h</p>
            <p className="text-sm text-gray-600">Arbeitsstunden</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">82%</p>
            <p className="text-sm text-gray-600">Ressourcenauslastung</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
