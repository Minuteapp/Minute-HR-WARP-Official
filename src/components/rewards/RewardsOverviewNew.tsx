import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Gift, 
  TrendingUp, 
  Users, 
  Zap,
  Plus,
  FileText,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useRewardStatistics } from '@/hooks/useRewardStatistics';
import { useRecentEmployeeRewards, useUpdateEmployeeRewardStatus } from '@/hooks/useEmployeeRewards';
import { AwardRewardDialog } from './AwardRewardDialog';
import { 
  CATEGORY_LABELS, 
  CATEGORY_COLORS, 
  STATUS_LABELS, 
  STATUS_COLORS,
  RewardCategory,
  EmployeeRewardStatus
} from '@/types/reward-catalog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export const RewardsOverviewNew = () => {
  const [isAwardOpen, setIsAwardOpen] = useState(false);
  const { data: stats, isLoading: statsLoading } = useRewardStatistics();
  const { data: recentRewards, isLoading: rewardsLoading } = useRecentEmployeeRewards(10);
  const updateStatus = useUpdateEmployeeRewardStatus();

  const handleApprove = async (id: string) => {
    await updateStatus.mutateAsync({ id, status: 'approved' });
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vergebene Belohnungen</CardTitle>
            <Gift className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.rewardsThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.rewardsChange && stats.rewardsChange > 0 ? '+' : ''}{stats?.rewardsChange || 0}% vs. Vormonat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Incentive-Budget genutzt</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.budgetPercentage || 0}%</div>
            <p className="text-xs text-muted-foreground">
              €{((stats?.budgetUsed || 0) / 1000).toFixed(1)}k von €{((stats?.budgetTotal || 0) / 1000).toFixed(1)}k
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mitarbeiterbeteiligung</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.participation || 0}%</div>
            <p className="text-xs text-muted-foreground">Aktive Teilnahme</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Automatisierte Rewards</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.automatedRewards || 0}</div>
            <p className="text-xs text-muted-foreground">Regel-basiert vergeben</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monatliche Entwicklung</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">Lädt...</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stats?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Belohnungsverteilung nach Kategorie</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">Lädt...</div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats?.categoryDistribution || []}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                    >
                      {stats?.categoryDistribution?.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, CATEGORY_LABELS[name as RewardCategory] || name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {stats?.categoryDistribution?.map((cat, i) => (
                    <div key={cat.category} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span>{CATEGORY_LABELS[cat.category]}</span>
                      <span className="text-muted-foreground">({cat.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Rewards Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Aktuelle Belohnungen</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setIsAwardOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Belohnung vergeben
          </Button>
        </CardHeader>
        <CardContent>
          {rewardsLoading ? (
            <div className="py-8 text-center text-muted-foreground">Lädt...</div>
          ) : !recentRewards?.length ? (
            <div className="py-8 text-center text-muted-foreground">
              <Gift className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Noch keine Belohnungen vergeben</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-2 font-medium">Mitarbeiter</th>
                    <th className="pb-2 font-medium">Belohnung</th>
                    <th className="pb-2 font-medium">Wert</th>
                    <th className="pb-2 font-medium">Kategorie</th>
                    <th className="pb-2 font-medium">Datum</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentRewards.map(reward => (
                    <tr key={reward.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{reward.employee_name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <span>{reward.employee_name || 'Unbekannt'}</span>
                        </div>
                      </td>
                      <td className="py-3">{reward.reward_name}</td>
                      <td className="py-3">{reward.value}</td>
                      <td className="py-3">
                        <Badge className={CATEGORY_COLORS[reward.category as RewardCategory]} variant="secondary">
                          {CATEGORY_LABELS[reward.category as RewardCategory] || reward.category}
                        </Badge>
                      </td>
                      <td className="py-3">{format(new Date(reward.awarded_at), 'dd.MM.yyyy', { locale: de })}</td>
                      <td className="py-3">
                        <Badge className={STATUS_COLORS[reward.status as EmployeeRewardStatus]} variant="secondary">
                          {STATUS_LABELS[reward.status as EmployeeRewardStatus] || reward.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsAwardOpen(true)}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Neue Belohnung vergeben</h4>
              <p className="text-sm text-muted-foreground">Mitarbeiter manuell belohnen</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium">Regel erstellen</h4>
              <p className="text-sm text-muted-foreground">Automatisierte Incentives</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium">Auswertung anzeigen</h4>
              <p className="text-sm text-muted-foreground">Reports & Analytics</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AwardRewardDialog open={isAwardOpen} onOpenChange={setIsAwardOpen} />
    </div>
  );
};
