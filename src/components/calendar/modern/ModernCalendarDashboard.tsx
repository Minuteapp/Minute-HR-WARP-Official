import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Plus, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Brain,
  Zap,
  MessageSquare,
  FileText,
  Settings,
  Video,
  MapPin,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { calendarService } from '@/services/calendarService';
import { CalendarQuickActions } from './CalendarQuickActions';
import { CalendarSmartWidget } from './CalendarSmartWidget';
import { CalendarAIPanel } from './CalendarAIPanel';
import { CalendarResourcesPanel } from './CalendarResourcesPanel';
import { CalendarInsightsPanel } from './CalendarInsightsPanel';
import { CalendarView } from './CalendarView';

export const ModernCalendarDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAIPanel, setShowAIPanel] = useState(false);

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ['calendar-dashboard-stats'],
    queryFn: calendarService.getDashboardStats
  });

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => calendarService.getEvents(
      new Date().toISOString(),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    )
  });

  const { data: aiInsights = [] } = useQuery({
    queryKey: ['calendar-ai-insights'],
    queryFn: calendarService.getAIInsights
  });

  const quickStats = [
    {
      title: 'Heutige Termine',
      value: dashboardStats?.todayEvents || 0,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+5%'
    },
    {
      title: 'Diese Woche',
      value: dashboardStats?.weekEvents || 0,
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+12%'
    },
    {
      title: 'Konflikte',
      value: dashboardStats?.unresolvedConflicts || 0,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '-2%'
    },
    {
      title: 'AI Insights',
      value: dashboardStats?.newAIInsights || 0,
      icon: Brain,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+8%'
    }
  ];

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return Users;
      case 'presentation':
        return FileText;
      case 'training':
        return Brain;
      case 'interview':
        return MessageSquare;
      default:
        return Calendar;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-500';
      case 'presentation':
        return 'bg-red-500';
      case 'training':
        return 'bg-purple-500';
      case 'interview':
        return 'bg-cyan-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            Kalender-Management
          </h1>
          <p className="text-slate-600 mt-2">
            Intelligente Terminplanung und Ressourcenverwaltung
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            AI Assistant
          </Button>
          <CalendarQuickActions />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.trend}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Panel */}
      {showAIPanel && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Calendar Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarAIPanel />
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Kalender
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Ressourcen
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analyse
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Kommende Termine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 5).map((event: any) => {
                      const EventIcon = getEventTypeIcon(event.type);
                      return (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${getEventTypeColor(event.type)}`}>
                              <EventIcon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{event.title}</p>
                              <p className="text-sm text-slate-600">
                                {format(new Date(event.start_time), 'dd.MM.yyyy HH:mm', { locale: de })}
                                {event.location && ` • ${event.location}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {event.meeting_url && (
                              <Button variant="outline" size="sm">
                                <Video className="h-4 w-4" />
                              </Button>
                            )}
                            <Badge variant={event.priority === 'high' ? 'destructive' : 'secondary'}>
                              {event.priority === 'high' ? 'Hoch' : 
                               event.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Empfehlungen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiInsights.slice(0, 3).map((insight: any) => (
                      <div key={insight.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-2 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                        <div className="flex-1">
                          <h4 className="font-medium">{insight.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              {insight.confidence_score * 100}% Genauigkeit
                            </Badge>
                            <Button variant="ghost" size="sm">
                              Anwenden
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <CalendarSmartWidget />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Schnellaktionen
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Neuer Termin
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Meeting planen
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Raum buchen
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Einstellungen
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Heute im Überblick
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Termine heute</span>
                      <span className="font-medium">{dashboardStats?.todayEvents || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Freie Zeit</span>
                      <span className="font-medium text-green-600">4h 30min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fokuszeit</span>
                      <span className="font-medium text-blue-600">2h 15min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <CalendarView />
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <CalendarResourcesPanel />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Kalender-Analyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">Analyse-Dashboard wird geladen...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <CalendarInsightsPanel />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Kalender-Integrationen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Google Calendar', status: 'connected', icon: '🔵' },
                  { name: 'Outlook', status: 'disconnected', icon: '🔷' },
                  { name: 'Apple Calendar', status: 'connected', icon: '⚫' },
                  { name: 'Zoom', status: 'connected', icon: '🔵' },
                  { name: 'Microsoft Teams', status: 'disconnected', icon: '🔷' },
                  { name: 'Slack', status: 'connected', icon: '🔵' }
                ].map((integration, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{integration.icon}</span>
                          <div>
                            <h4 className="font-medium">{integration.name}</h4>
                            <p className="text-sm text-slate-600">
                              {integration.status === 'connected' ? 'Verbunden' : 'Nicht verbunden'}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={integration.status === 'connected' ? 'default' : 'secondary'}
                        >
                          {integration.status === 'connected' ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};