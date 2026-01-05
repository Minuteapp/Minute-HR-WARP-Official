import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Users, 
  Smile,
  UserCheck,
  Download,
  Trophy,
  Zap,
  DollarSign,
  Lightbulb,
  CheckCircle,
  Star
} from "lucide-react";
import { useRewardsAnalytics } from '@/hooks/useRewardsAnalytics';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const RewardsReportsTab = () => {
  const [period, setPeriod] = useState('12');
  const { statistics, isLoading } = useRewardsAnalytics(parseInt(period));

  if (isLoading) {
    return <div className="flex justify-center py-10">Lade Daten...</div>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">Auswertungen & Wirkung</h2>
          <p className="text-sm text-muted-foreground">
            Analysieren Sie die Auswirkungen Ihrer Belohnungsprogramme
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Letzte 3 Monate</SelectItem>
              <SelectItem value="6">Letzte 6 Monate</SelectItem>
              <SelectItem value="12">Letzte 12 Monate</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement-Steigerung</p>
                <p className="text-2xl font-bold text-green-600">+{statistics.kpis.engagementIncrease}%</p>
                <p className="text-xs text-muted-foreground">vs. Vorjahr</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mitarbeiterbindung</p>
                <p className="text-2xl font-bold">{statistics.kpis.retentionRate}%</p>
                <p className="text-xs text-muted-foreground">Retention Rate</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Zufriedenheit</p>
                <p className="text-2xl font-bold">{statistics.kpis.satisfactionScore}/10</p>
                <p className="text-xs text-muted-foreground">Durchschnitt</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Smile className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Teilnahme</p>
                <p className="text-2xl font-bold">{statistics.kpis.participationRate}%</p>
                <p className="text-xs text-muted-foreground">Aktive Beteiligung</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rewards & Engagement Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Belohnungen & Engagement-Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statistics.trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="rewards" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Belohnungen"
                    dot={{ fill: '#10b981' }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Engagement"
                    dot={{ fill: '#8b5cf6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Satisfaction Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zufriedenheitsentwicklung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statistics.satisfactionTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Zufriedenheit"
                    dot={{ fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Abteilungsvergleich</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {statistics.departmentComparison.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Keine Abteilungsdaten vorhanden
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statistics.departmentComparison}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="rewards" fill="#3b82f6" name="Belohnungen" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="engagement" fill="#10b981" name="Engagement" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reward Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Belohnungsarten-Verteilung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {statistics.rewardTypeDistribution.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Keine Daten vorhanden
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statistics.rewardTypeDistribution}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ type, percentage }) => `${percentage}%`}
                    >
                      {statistics.rewardTypeDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers & ROI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statistics.topPerformers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Keine Daten vorhanden</p>
            ) : (
              <div className="space-y-4">
                {statistics.topPerformers.map((performer, index) => (
                  <div key={performer.id} className="flex items-center gap-4">
                    <span className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</span>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={performer.avatar} />
                      <AvatarFallback>{performer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{performer.name}</p>
                      <p className="text-xs text-muted-foreground">{performer.department || 'Keine Abteilung'}</p>
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        <span>{performer.rewardsReceived} Belohnungen</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        <span>{performer.engagementScore}% Engagement</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ROI Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ROI & Wirkungsanalyse</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-muted-foreground">Investition</p>
                <p className="text-xl font-bold">{formatCurrency(statistics.roi.totalInvestment)}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">Produktivität</p>
                <p className="text-xl font-bold">+{statistics.roi.productivityIncrease}%</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(statistics.roi.estimatedValue)}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Zap className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-xl font-bold">{statistics.roi.roiMultiplier}x</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100">Positive Entwicklung</h4>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                  Das Engagement ist um {statistics.kpis.engagementIncrease}% gestiegen
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Empfehlung</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  Peer-Anerkennung zeigt hohe Wirkung
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Star className="h-5 w-5 text-purple-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-purple-900 dark:text-purple-100">Top Kategorie</h4>
                <p className="text-sm text-purple-800 dark:text-purple-200 mt-1">
                  {statistics.rewardTypeDistribution[0]?.type || 'Gutscheine'} sind am beliebtesten
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
