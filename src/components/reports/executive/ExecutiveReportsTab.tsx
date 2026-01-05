import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, TrendingUp, TrendingDown, Clock, Heart, 
  RefreshCw, Sparkles, AlertTriangle, CheckCircle, Info,
  Download, Calendar
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { useExecutiveReportsData } from '@/hooks/useExecutiveReportsData';

const ExecutiveReportsTab = () => {
  const { 
    headcount,
    timeToHire,
    goalAchievement,
    sickLeaveRate,
    fluctuationRate,
    headcountTrend,
    newHires,
    terminations,
    isLoading
  } = useExecutiveReportsData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Headcount',
      value: headcount.toLocaleString('de-DE'),
      change: headcountTrend >= 0 ? `+${headcountTrend}` : `${headcountTrend}`,
      changeLabel: 'vs. Vormonat',
      trend: headcountTrend >= 0 ? 'up' : 'down',
      icon: Users,
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Time-to-Hire',
      value: timeToHire > 0 ? `${timeToHire} Tage` : 'N/A',
      change: '',
      changeLabel: 'Durchschnitt',
      trend: 'neutral',
      icon: Clock,
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Zielerreichung',
      value: goalAchievement > 0 ? `${goalAchievement}%` : 'N/A',
      change: '',
      changeLabel: 'Performance Reviews',
      trend: goalAchievement >= 80 ? 'up' : 'down',
      icon: TrendingUp,
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
    },
    {
      title: 'Neueinstellungen',
      value: newHires.toString(),
      change: '',
      changeLabel: 'Letzte 30 Tage',
      trend: 'up',
      icon: Users,
      color: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600',
    },
    {
      title: 'Krankenstand',
      value: `${sickLeaveRate}%`,
      change: '',
      changeLabel: 'Letzte 30 Tage',
      trend: sickLeaveRate > 5 ? 'down' : 'up',
      icon: Heart,
      color: sickLeaveRate > 5 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200',
      iconColor: sickLeaveRate > 5 ? 'text-red-600' : 'text-yellow-600',
    },
    {
      title: 'Fluktuation',
      value: `${fluctuationRate}%`,
      change: `${terminations} Abgänge`,
      changeLabel: 'Letzte 12 Monate',
      trend: fluctuationRate > 10 ? 'down' : 'up',
      icon: TrendingDown,
      color: fluctuationRate > 10 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200',
      iconColor: fluctuationRate > 10 ? 'text-red-600' : 'text-gray-600',
    },
  ];

  // Generiere dynamische Insights basierend auf echten Daten
  const insights = [];
  
  if (sickLeaveRate > 5) {
    insights.push({
      type: 'warning',
      title: 'Erhöhter Krankenstand',
      description: `Der Krankenstand liegt bei ${sickLeaveRate}% und ist damit überdurchschnittlich. Empfehlung: Mitarbeiterumfrage zur Arbeitsbelastung durchführen.`,
    });
  }
  
  if (fluctuationRate > 10) {
    insights.push({
      type: 'warning',
      title: 'Hohe Fluktuationsrate',
      description: `Die Fluktuationsrate von ${fluctuationRate}% liegt über dem Branchendurchschnitt. Exit-Interviews analysieren.`,
    });
  }
  
  if (goalAchievement >= 90) {
    insights.push({
      type: 'success',
      title: 'Überdurchschnittliche Zielerreichung',
      description: `Die durchschnittliche Zielerreichung liegt bei ${goalAchievement}%. Das Team performt ausgezeichnet.`,
    });
  }
  
  if (newHires > 0) {
    insights.push({
      type: 'info',
      title: 'Wachstum im Team',
      description: `${newHires} neue Mitarbeiter in den letzten 30 Tagen eingestellt. Onboarding-Prozesse prüfen.`,
    });
  }

  return (
    <div className="space-y-6">
      {/* KI Executive Summary Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">KI Executive Summary</h3>
              <p className="text-white/90 mb-3">
                {headcount > 0 
                  ? `Ihr Unternehmen hat aktuell ${headcount.toLocaleString('de-DE')} aktive Mitarbeiter. `
                  : 'Keine Mitarbeiterdaten verfügbar. '}
                {newHires > 0 && `In den letzten 30 Tagen wurden ${newHires} Neueinstellungen vorgenommen. `}
                {sickLeaveRate > 0 && `Der Krankenstand liegt bei ${sickLeaveRate}%. `}
                {fluctuationRate > 0 && `Die Fluktuationsrate beträgt ${fluctuationRate}%.`}
              </p>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Datenstand: {new Date().toLocaleDateString('de-DE')}
                </span>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Aktualisieren
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className={`${kpi.color} border`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Icon className={`h-4 w-4 ${kpi.iconColor}`} />
                      {kpi.title}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">{kpi.value}</span>
                      {kpi.change && (
                        <span className={`text-sm font-medium ${
                          kpi.trend === 'up' ? 'text-green-600' : 
                          kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {kpi.change}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.changeLabel}</p>
                  </div>
                  {kpi.trend === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
                  {kpi.trend === 'down' && <TrendingDown className="h-5 w-5 text-red-500" />}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Risikoindikatoren & Handlungsempfehlungen */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Risikoindikatoren & Handlungsempfehlungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                  insight.type === 'success' ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {insight.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />}
                  {insight.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                  {insight.type === 'info' && <Info className="h-5 w-5 text-blue-600 mt-0.5" />}
                  <div>
                    <h4 className={`font-medium ${
                      insight.type === 'warning' ? 'text-amber-900' :
                      insight.type === 'success' ? 'text-green-900' :
                      'text-blue-900'
                    }`}>
                      {insight.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      insight.type === 'warning' ? 'text-amber-800' :
                      insight.type === 'success' ? 'text-green-800' :
                      'text-blue-800'
                    }`}>
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Wenn keine Daten vorhanden */}
      {headcount === 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Daten verfügbar</h3>
            <p className="text-muted-foreground">
              Es wurden noch keine Mitarbeiterdaten erfasst. Fügen Sie Mitarbeiter hinzu, um Executive Reports zu sehen.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExecutiveReportsTab;
