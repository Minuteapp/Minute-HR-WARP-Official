import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy,
  Clock,
  CheckCircle,
  Gift,
  TrendingUp,
  Target,
  ListTodo,
  Calendar,
  ClipboardList,
  LayoutGrid,
  Sparkles,
  Info
} from 'lucide-react';
import { useModuleAchievements } from '@/hooks/useModuleAchievements';
import { 
  moduleLabels, 
  moduleColors, 
  impactLabels, 
  impactColors,
  achievementStatusLabels,
  achievementStatusColors,
  type ModuleAchievement
} from '@/types/incentive-rules';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const moduleIcons: Record<string, any> = {
  performance: TrendingUp,
  goals_okrs: Target,
  tasks: ListTodo,
  shifts: Calendar,
  surveys: ClipboardList
};

export const PerformanceBasedTab = () => {
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const { achievements, isLoading, statistics, moduleStats, updateAchievementStatus } = useModuleAchievements(selectedModule);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const getEmployeeName = (achievement: ModuleAchievement) => {
    if (achievement.employee) {
      return `${achievement.employee.first_name || ''} ${achievement.employee.last_name || ''}`.trim() || 'Unbekannt';
    }
    return 'Unbekannt';
  };

  const getEmployeeInitials = (achievement: ModuleAchievement) => {
    if (achievement.employee) {
      const first = achievement.employee.first_name?.[0] || '';
      const last = achievement.employee.last_name?.[0] || '';
      return `${first}${last}`.toUpperCase() || '?';
    }
    return '?';
  };

  const handleApprove = async (achievement: ModuleAchievement) => {
    await updateAchievementStatus.mutateAsync({ id: achievement.id, status: 'approved' });
  };

  const handleComplete = async (achievement: ModuleAchievement) => {
    await updateAchievementStatus.mutateAsync({ id: achievement.id, status: 'completed' });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-10">Lade Achievements...</div>;
  }

  const totalAchievements = Object.values(moduleStats || {}).reduce((sum, m) => sum + m.count, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erkannte Achievements</p>
                <p className="text-2xl font-bold">{statistics?.totalAchievements || 0}</p>
                <p className="text-xs text-muted-foreground">Aus allen Modulen</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Genehmigte Belohnungen</p>
                <p className="text-2xl font-bold">{statistics?.approvedCount || 0}</p>
                <p className="text-xs text-muted-foreground">Bereit zur Ausgabe</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ausstehend</p>
                <p className="text-2xl font-bold">{statistics?.pendingCount || 0}</p>
                <p className="text-xs text-muted-foreground">Warten auf Genehmigung</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ausgegeben</p>
                <p className="text-2xl font-bold">{statistics?.completedCount || 0}</p>
                <p className="text-xs text-muted-foreground">Belohnungen verteilt</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Gift className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Filter Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Nach Modul filtern</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* All Modules Card */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedModule === 'all' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedModule('all')}
          >
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">Alle Module</p>
              <p className="text-xs text-muted-foreground">{totalAchievements} Achievements</p>
            </CardContent>
          </Card>

          {/* Module Cards */}
          {Object.entries(moduleLabels).map(([key, label]) => {
            const Icon = moduleIcons[key];
            const stats = moduleStats?.[key] || { count: 0, highImpact: 0 };
            
            return (
              <Card 
                key={key}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedModule === key ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedModule(key)}
              >
                <CardContent className="p-4 text-center">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium truncate">{label}</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{stats.count}</span>
                    {stats.highImpact > 0 && (
                      <Badge variant="secondary" className="text-xs px-1">
                        {stats.highImpact} High
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Achievements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aktuelle Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Achievements gefunden.</p>
              <p className="text-sm">Achievements werden automatisch aus verknüpften Modulen erkannt.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>Quelle</TableHead>
                  <TableHead>Achievement</TableHead>
                  <TableHead>Belohnung</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>KI-Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {achievements.map((achievement) => {
                  const ModuleIcon = moduleIcons[achievement.source_module] || Sparkles;
                  
                  return (
                    <TableRow key={achievement.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={achievement.employee?.avatar_url || ''} />
                            <AvatarFallback className="text-xs">
                              {getEmployeeInitials(achievement)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{getEmployeeName(achievement)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${moduleColors[achievement.source_module]}`}>
                          <ModuleIcon className="h-3 w-3 mr-1" />
                          {moduleLabels[achievement.source_module]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{achievement.achievement_title}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(achievement.achievement_date)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {achievement.suggested_reward_name || '-'}
                      </TableCell>
                      <TableCell>
                        {achievement.impact_level && (
                          <Badge className={`text-xs ${impactColors[achievement.impact_level]}`}>
                            {impactLabels[achievement.impact_level]}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {achievement.ai_score !== null && (
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Progress value={achievement.ai_score} className="h-2" />
                            <span className="text-xs font-medium">{achievement.ai_score}%</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${achievementStatusColors[achievement.status]}`}>
                          {achievementStatusLabels[achievement.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {achievement.status === 'pending' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleApprove(achievement)}
                            >
                              Genehmigen
                            </Button>
                          )}
                          {achievement.status === 'approved' && (
                            <Button 
                              size="sm"
                              onClick={() => handleComplete(achievement)}
                            >
                              Ausgeben
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">Automatische Belohnungserkennung</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Das System analysiert automatisch Leistungsdaten aus verknüpften Modulen (Performance, Ziele, Aufgaben, etc.) 
                und schlägt basierend auf KI-Algorithmen passende Belohnungen vor. Der KI-Score zeigt die Konfidenz 
                der Empfehlung an.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
