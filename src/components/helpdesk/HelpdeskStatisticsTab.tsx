import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Clock, CheckCircle, TrendingUp, BarChart3, Activity, Users, Star } from "lucide-react";
import { useHelpdeskStats, useHelpdeskCategoryStats, useHelpdeskAuditLog, useHelpdeskTopAgents } from '@/hooks/useHelpdesk';
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const categoryColors = [
  'bg-blue-500',
  'bg-orange-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-red-500',
];

const getActionLabel = (action: string) => {
  const labels: Record<string, { label: string; color: string }> = {
    'created': { label: 'Erstellt', color: 'bg-green-100 text-green-800 border border-green-300' },
    'updated': { label: 'Aktualisiert', color: 'bg-blue-100 text-blue-800 border border-blue-300' },
    'resolved': { label: 'Gelöst', color: 'bg-purple-100 text-purple-800 border border-purple-300' },
    'assigned': { label: 'Zugewiesen', color: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
    'commented': { label: 'Kommentiert', color: 'bg-gray-100 text-gray-800 border border-gray-300' },
    'closed': { label: 'Geschlossen', color: 'bg-gray-100 text-gray-800 border border-gray-300' },
  };
  return labels[action] || { label: action, color: 'bg-gray-100 text-gray-800 border border-gray-300' };
};

export const HelpdeskStatisticsTab = () => {
  const { data: stats, isLoading: statsLoading } = useHelpdeskStats();
  const { data: categoryData, isLoading: categoryLoading } = useHelpdeskCategoryStats();
  const { data: auditLog, isLoading: auditLoading } = useHelpdeskAuditLog(6);
  const { data: topAgents, isLoading: agentsLoading } = useHelpdeskTopAgents();

  const isLoading = statsLoading || categoryLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const categoryStats = categoryData?.categoryStats || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Statistik & Reporting</h2>
        <p className="text-sm text-muted-foreground">Übersicht über Performance-Kennzahlen und Trends</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Offene Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offene Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.open || 0}</div>
            <div className="flex items-center text-xs mt-1">
              <span className="text-muted-foreground">von {stats?.total || 0} gesamt</span>
            </div>
          </CardContent>
        </Card>

        {/* Ø Reaktionszeit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ø Reaktionszeit</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {categoryData?.avgResponseTimeHours ? `${categoryData.avgResponseTimeHours}h` : '-'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Letzte 30 Tage</div>
          </CardContent>
        </Card>

        {/* Ø Lösungszeit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ø Lösungszeit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {categoryData?.avgResolutionTimeHours ? `${categoryData.avgResolutionTimeHours}h` : '-'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Letzte 30 Tage</div>
          </CardContent>
        </Card>

        {/* Lösungsquote */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lösungsquote</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {categoryData?.resolutionRate ? `${categoryData.resolutionRate}%` : '-'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Letzte 30 Tage</div>
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Layout: Categories + Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets nach Kategorie - Hauptbereich */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Tickets nach Kategorie</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Verteilung der letzten 30 Tage</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryStats.length > 0 ? (
              categoryStats.map((category, index) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{category.count} Tickets</span>
                      <span className="font-semibold">{category.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${categoryColors[index % categoryColors.length]}`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Noch keine Tickets vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        {/* Letzte Aktivitäten - Sidebar */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Letzte Aktivitäten</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Live-Feed</p>
          </CardHeader>
          <CardContent>
            {auditLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : auditLog && auditLog.length > 0 ? (
              <div className="space-y-4">
                {auditLog.map((activity) => {
                  const actionInfo = getActionLabel(activity.action);
                  return (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">
                            {activity.ticket?.ticket_number || 'Ticket'}
                          </span>{' '}
                          {activity.action}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: de })}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${actionInfo.color}`}>
                            {actionInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Noch keine Aktivitäten
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Agenten */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Top Agenten</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">Bestleistende HR-Agenten diesen Monat</p>
        </CardHeader>
        <CardContent>
          {agentsLoading ? (
            <Skeleton className="h-40" />
          ) : topAgents && topAgents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Agent</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Gelöst</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Ø Zeit</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Zufriedenheit</th>
                  </tr>
                </thead>
                <tbody>
                  {topAgents.map((agent) => (
                    <tr key={agent.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-blue-100 text-blue-700">
                            {agent.rank}
                          </div>
                          <span className="font-medium">{agent.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold">{agent.resolved}</td>
                      <td className="py-3 px-4">{agent.avgTime}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">{agent.satisfaction.toFixed(1)}</span>
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Agenten-Daten vorhanden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};