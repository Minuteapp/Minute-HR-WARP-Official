import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import { useCalendarStats } from '@/hooks/calendar/useCalendarStats';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TodayTimelineStrip from '../TodayTimelineStrip';

const CalendarOverview = () => {
  const { stats, insights, isLoading } = useCalendarStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Lädt Kalenderübersicht...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Termine Heute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.todayEvents || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.upcomingInNext2Hours || 0} in den nächsten 2h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Diese Woche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.thisWeekEvents || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.weeklyMeetingHours || 0}h Meeting-Zeit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Konflikte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats?.conflicts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.resolvedToday || 0} heute gelöst
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#3B44F6]" />
              KI-Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#3B44F6]">{stats?.aiSuggestions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Smart-Vorschläge verfügbar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today-Strip: Horizontale Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Heutige Termine</CardTitle>
            <Button variant="outline" size="sm">Zur Tagesansicht</Button>
          </div>
        </CardHeader>
        <CardContent>
          <TodayTimelineStrip events={stats?.todayEventsList || []} />
        </CardContent>
      </Card>

      {/* KI-Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#3B44F6]" />
            KI-Vorschläge & Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights && insights.length > 0 ? (
            insights.map((insight, index) => (
              <Alert key={index} className={insight.severity === 'high' ? 'border-destructive' : ''}>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium">{insight.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{insight.message}</div>
                  {insight.action && (
                    <Button variant="link" size="sm" className="mt-2 px-0">
                      {insight.action}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Keine KI-Vorschläge verfügbar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kommende Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>Kommende Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.upcomingHighlights && stats.upcomingHighlights.length > 0 ? (
              stats.upcomingHighlights.map((event: any) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full`} style={{ backgroundColor: event.color }} />
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.start).toLocaleString('de-DE')}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{event.type}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Keine anstehenden Termine
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarOverview;