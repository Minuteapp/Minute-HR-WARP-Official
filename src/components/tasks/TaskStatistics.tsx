import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { CheckSquare, Clock, TrendingUp, Users, Target, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const TaskStatistics = () => {
  const { data: statisticsData } = useQuery({
    queryKey: ['task-statistics'],
    queryFn: async () => {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:assigned_to(name),
          creator:created_by(name)
        `);

      if (error) throw error;

      // Status-Verteilung
      const statusData = [
        { name: 'Zu erledigen', value: 0, color: '#6B7280' },
        { name: 'In Bearbeitung', value: 0, color: '#3B82F6' },
        { name: 'Review', value: 0, color: '#F59E0B' },
        { name: 'Erledigt', value: 0, color: '#10B981' }
      ];

      // Prioritäts-Verteilung
      const priorityData = [
        { name: 'Niedrig', value: 0, color: '#10B981' },
        { name: 'Mittel', value: 0, color: '#F59E0B' },
        { name: 'Hoch', value: 0, color: '#EF4444' },
        { name: 'Dringend', value: 0, color: '#DC2626' }
      ];

      // Zähle Tasks
      (tasks || []).forEach(task => {
        // Status
        switch (task.status) {
          case 'todo': statusData[0].value++; break;
          case 'in_progress': statusData[1].value++; break;
          case 'review': statusData[2].value++; break;
          case 'done': statusData[3].value++; break;
        }

        // Priorität
        switch (task.priority) {
          case 'low': priorityData[0].value++; break;
          case 'medium': priorityData[1].value++; break;
          case 'high': priorityData[2].value++; break;
          case 'urgent': priorityData[3].value++; break;
        }
      });

      // Team-Performance (Mitarbeiter mit zugewiesenen Tasks)
      const assigneeMap = new Map();
      (tasks || []).forEach(task => {
        if (task.assigned_to && task.assigned_user?.name) {
          const name = task.assigned_user.name;
          if (!assigneeMap.has(name)) {
            assigneeMap.set(name, { total: 0, completed: 0, inProgress: 0 });
          }
          const stats = assigneeMap.get(name);
          stats.total++;
          if (task.status === 'done') stats.completed++;
          if (task.status === 'in_progress') stats.inProgress++;
        }
      });

      const teamData = Array.from(assigneeMap.entries()).map(([name, stats]) => ({
        name,
        total: stats.total,
        completed: stats.completed,
        inProgress: stats.inProgress,
        completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      }));

      // Wöchliche Task-Erstellung (letzte 7 Tage)
      const weeklyData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dayName = date.toLocaleDateString('de-DE', { weekday: 'short' });
        
        const dayTasks = (tasks || []).filter(task => {
          const taskDate = new Date(task.created_at);
          return taskDate.toDateString() === date.toDateString();
        });

        return {
          day: dayName,
          created: dayTasks.length,
          completed: dayTasks.filter(t => t.status === 'done').length
        };
      });

      // Überfällige Tasks
      const overdueTasks = (tasks || []).filter(task => {
        if (!task.due_date || task.status === 'done') return false;
        return new Date(task.due_date) < new Date();
      });

      // Gesamtstatistiken
      const totalTasks = (tasks || []).length;
      const completedTasks = (tasks || []).filter(t => t.status === 'done').length;
      const inProgressTasks = (tasks || []).filter(t => t.status === 'in_progress').length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        status: statusData,
        priority: priorityData,
        team: teamData,
        weekly: weeklyData,
        totalTasks,
        completedTasks,
        inProgressTasks,
        completionRate,
        overdueTasks: overdueTasks.length,
        activeTeamMembers: teamData.length
      };
    }
  });

  if (!statisticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Lade Statistiken...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Übersicht KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gesamt</p>
                <p className="text-2xl font-bold">{statisticsData.totalTasks}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abgeschlossen</p>
                <p className="text-2xl font-bold">{statisticsData.completedTasks}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Bearbeitung</p>
                <p className="text-2xl font-bold">{statisticsData.inProgressTasks}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Überfällig</p>
                <p className="text-2xl font-bold text-red-600">{statisticsData.overdueTasks}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Erfolgsrate</p>
                <p className="text-2xl font-bold">{statisticsData.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status-Verteilung */}
        <Card>
          <CardHeader>
            <CardTitle>Status-Verteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statisticsData.status.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statisticsData.status.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Prioritäts-Verteilung */}
        <Card>
          <CardHeader>
            <CardTitle>Prioritäts-Verteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statisticsData.priority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Wöchliche Aktivität */}
        <Card>
          <CardHeader>
            <CardTitle>Wöchliche Aktivität</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statisticsData.weekly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="created" stroke="#3B82F6" name="Erstellt" />
                  <Line type="monotone" dataKey="completed" stroke="#10B981" name="Abgeschlossen" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Team-Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Team-Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statisticsData.team.slice(0, 10)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip 
                    formatter={(value, name) => [
                      value, 
                      name === 'total' ? 'Gesamt' : 
                      name === 'completed' ? 'Abgeschlossen' : 'In Bearbeitung'
                    ]}
                  />
                  <Bar dataKey="completed" stackId="a" fill="#10B981" />
                  <Bar dataKey="inProgress" stackId="a" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};