
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, TrendingUp, CheckCircle, AlertCircle, 
  Calendar, Users, Building2, BarChart3, Clock, LayoutGrid
} from 'lucide-react';
import { useGoals } from '@/contexts/GoalsContext';
import { Goal } from '@/types/goals';
import { supabase } from '@/integrations/supabase/client';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { calculateDaysRemaining, calculateDateProgress } from '@/lib/dateUtils';

interface GoalStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
  averageProgress: number;
}

const GoalsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [personalStats, setPersonalStats] = useState<GoalStats | null>(null);
  const [teamStats, setTeamStats] = useState<GoalStats | null>(null);
  const [companyStats, setCompanyStats] = useState<GoalStats | null>(null);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Goal[]>([]);
  
  const { goals, loading, loadGoals } = useGoals();
  
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    };
    
    getUser();
    loadGoals();
  }, [loadGoals]);

  useEffect(() => {
    if (goals && currentUserId) {
      calculateStats();
      findUpcomingDeadlines();
    }
  }, [goals, currentUserId]);

  const calculateStats = () => {
    if (!goals) return;

    // Personal Goals Stats
    const personalGoals = goals.filter(goal => 
      goal.category === 'personal' && 
      (goal.created_by === currentUserId || goal.assigned_to === currentUserId)
    );
    
    const personalStatsData = calculateGoalStats(personalGoals);
    setPersonalStats(personalStatsData);

    // Team Goals Stats
    const teamGoals = goals.filter(goal => goal.category === 'team');
    const teamStatsData = calculateGoalStats(teamGoals);
    setTeamStats(teamStatsData);

    // Company Goals Stats
    const companyGoals = goals.filter(goal => goal.category === 'company');
    const companyStatsData = calculateGoalStats(companyGoals);
    setCompanyStats(companyStatsData);
  };

  const calculateGoalStats = (goalList: Goal[]): GoalStats => {
    const total = goalList.length;
    const active = goalList.filter(goal => goal.status === 'active').length;
    const completed = goalList.filter(goal => goal.status === 'completed').length;
    
    const overdue = goalList.filter(goal => {
      if (goal.status === 'completed') return false;
      const daysRemaining = calculateDaysRemaining(goal.due_date);
      return daysRemaining < 0;
    }).length;

    const averageProgress = total > 0 
      ? Math.round(goalList.reduce((sum, goal) => sum + goal.progress, 0) / total)
      : 0;

    return { total, active, completed, overdue, averageProgress };
  };

  const findUpcomingDeadlines = () => {
    if (!goals) return;

    const upcoming = goals
      .filter(goal => {
        if (goal.status === 'completed') return false;
        const daysRemaining = calculateDaysRemaining(goal.due_date);
        return daysRemaining >= 0 && daysRemaining <= 7;
      })
      .sort((a, b) => calculateDaysRemaining(a.due_date) - calculateDaysRemaining(b.due_date))
      .slice(0, 5);

    setUpcomingDeadlines(upcoming);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const StatCard = ({ 
    title, 
    stats, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    stats: GoalStats | null; 
    icon: any; 
    color: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Gesamt</span>
            <span className="font-bold">{stats?.total || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Aktiv</span>
            <span className="text-blue-600">{stats?.active || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Abgeschlossen</span>
            <span className="text-green-600">{stats?.completed || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Überfällig</span>
            <span className="text-red-600">{stats?.overdue || 0}</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted-foreground">Ø Fortschritt</span>
              <span className={`text-xs font-medium ${getProgressColor(stats?.averageProgress || 0)}`}>
                {stats?.averageProgress || 0}%
              </span>
            </div>
            <Progress value={stats?.averageProgress || 0} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
            <Target className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Ziele</h1>
            <p className="text-sm text-muted-foreground">Zielvereinbarungen und Fortschrittsverfolgung</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="personal" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
            Meine Ziele
          </TabsTrigger>
          <TabsTrigger value="team" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
            Team-Ziele
          </TabsTrigger>
          <TabsTrigger value="company" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
            Firmen-Ziele
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 pb-3">
            Berichte
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* Übersichtskarten */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Persönliche Ziele"
          stats={personalStats}
          icon={Target}
          color="text-blue-600"
        />
        <StatCard
          title="Teamziele"
          stats={teamStats}
          icon={Users}
          color="text-green-600"
        />
        <StatCard
          title="Unternehmensziele"
          stats={companyStats}
          icon={Building2}
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kommende Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Kommende Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((goal) => {
                  const daysRemaining = calculateDaysRemaining(goal.due_date);
                  return (
                    <div key={goal.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{goal.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(goal.due_date), 'PPP', { locale: de })}
                        </p>
                        <Progress value={goal.progress} className="h-1 mt-2" />
                      </div>
                      <div className="ml-3">
                        <Badge variant={daysRemaining <= 2 ? "destructive" : "outline"}>
                          {daysRemaining === 0 ? 'Heute' : `${daysRemaining}d`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Keine anstehenden Deadlines</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Zielentwicklung */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Zielentwicklung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gesamt erreichte Ziele</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">
                    {(personalStats?.completed || 0) + (teamStats?.completed || 0) + (companyStats?.completed || 0)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Aktive Ziele</span>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">
                    {(personalStats?.active || 0) + (teamStats?.active || 0) + (companyStats?.active || 0)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Überfällige Ziele</span>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-semibold">
                    {(personalStats?.overdue || 0) + (teamStats?.overdue || 0) + (companyStats?.overdue || 0)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Gesamtfortschritt</span>
                  <span className="text-sm font-medium">
                    {Math.round(((personalStats?.averageProgress || 0) + (teamStats?.averageProgress || 0) + (companyStats?.averageProgress || 0)) / 3)}%
                  </span>
                </div>
                <Progress 
                  value={Math.round(((personalStats?.averageProgress || 0) + (teamStats?.averageProgress || 0) + (companyStats?.averageProgress || 0)) / 3)} 
                  className="h-3" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
        </TabsContent>

        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Meine Ziele</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Persönliche Ziele werden hier angezeigt.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team-Ziele</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Team-Ziele werden hier angezeigt.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Firmen-Ziele</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Unternehmensziele werden hier angezeigt.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Berichte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Zielberichte werden hier angezeigt.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoalsDashboard;
