import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Eye, Users, Monitor, Tablet, Smartphone, 
  LayoutDashboard, BarChart3, Calendar, Bell, Zap,
  Target, PieChart, TrendingUp, Clock
} from 'lucide-react';

interface PreviewRole {
  key: string;
  name: string;
  dashboard: string;
  widgets: string[];
}

const previewRoles: PreviewRole[] = [
  { key: 'employee', name: 'Mitarbeiter', dashboard: 'Standard-Dashboard', widgets: ['kpi_card', 'calendar_summary', 'quick_actions', 'notification_feed'] },
  { key: 'team_lead', name: 'Teamleiter', dashboard: 'Manager-Dashboard', widgets: ['kpi_card', 'team_status', 'calendar_summary', 'bar_chart', 'quick_actions', 'notification_feed', 'progress_ring'] },
  { key: 'hr_manager', name: 'HR-Manager', dashboard: 'HR-Dashboard', widgets: ['kpi_card', 'team_status', 'absence_overview', 'bar_chart', 'pie_chart', 'quick_actions', 'notification_feed', 'favorites'] },
  { key: 'admin', name: 'Administrator', dashboard: 'Manager-Dashboard', widgets: ['kpi_card', 'team_status', 'system_status', 'bar_chart', 'quick_actions', 'notification_feed'] },
  { key: 'superadmin', name: 'Superadmin', dashboard: 'Executive-Dashboard', widgets: ['kpi_card', 'company_overview', 'trend_chart', 'bar_chart', 'pie_chart', 'system_status', 'ai_insights'] },
];

const widgetMocks: Record<string, { icon: React.ComponentType<any>; name: string; color: string }> = {
  kpi_card: { icon: TrendingUp, name: 'KPI Karte', color: 'bg-blue-500' },
  team_status: { icon: Users, name: 'Team-Status', color: 'bg-green-500' },
  calendar_summary: { icon: Calendar, name: 'Kalender', color: 'bg-purple-500' },
  quick_actions: { icon: Zap, name: 'Schnellaktionen', color: 'bg-yellow-500' },
  notification_feed: { icon: Bell, name: 'Benachrichtigungen', color: 'bg-orange-500' },
  bar_chart: { icon: BarChart3, name: 'Balkendiagramm', color: 'bg-indigo-500' },
  pie_chart: { icon: PieChart, name: 'Kreisdiagramm', color: 'bg-pink-500' },
  progress_ring: { icon: Target, name: 'Fortschritt', color: 'bg-teal-500' },
  favorites: { icon: Target, name: 'Favoriten', color: 'bg-red-500' },
  absence_overview: { icon: Calendar, name: 'Abwesenheiten', color: 'bg-cyan-500' },
  system_status: { icon: Monitor, name: 'Systemstatus', color: 'bg-gray-500' },
  company_overview: { icon: LayoutDashboard, name: 'Unternehmensübersicht', color: 'bg-emerald-500' },
  trend_chart: { icon: TrendingUp, name: 'Trendanalyse', color: 'bg-violet-500' },
  ai_insights: { icon: BarChart3, name: 'KI-Insights', color: 'bg-fuchsia-500' },
};

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export const DashboardPreview: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('employee');
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  const currentRole = previewRoles.find(r => r.key === selectedRole) || previewRoles[0];

  const getDeviceWidth = () => {
    switch (deviceType) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'max-w-full';
    }
  };

  const getGridCols = () => {
    switch (deviceType) {
      case 'mobile': return 'grid-cols-1';
      case 'tablet': return 'grid-cols-2';
      default: return 'grid-cols-4';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <CardTitle>Dashboard-Vorschau als Rolle</CardTitle>
          </div>
          <CardDescription>
            Sehen Sie, wie das Dashboard für verschiedene Rollen und Geräte aussieht
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 mb-6">
            <div className="flex-1">
              <Label>Vorschau als Rolle</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {previewRoles.map((role) => (
                    <SelectItem key={role.key} value={role.key}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {role.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Gerät</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={deviceType === 'desktop' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setDeviceType('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={deviceType === 'tablet' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setDeviceType('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={deviceType === 'mobile' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setDeviceType('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg mb-4">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <div>
              <span className="font-medium">{currentRole.dashboard}</span>
              <span className="text-muted-foreground ml-2">
                ({currentRole.widgets.length} Widgets)
              </span>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {currentRole.name}
            </Badge>
          </div>

          {/* Preview Container */}
          <div className="border rounded-lg bg-muted/30 p-4 min-h-[500px] overflow-auto">
            <div className={`mx-auto transition-all ${getDeviceWidth()}`}>
              <div className={`grid gap-4 ${getGridCols()}`}>
                {currentRole.widgets.map((widgetKey, index) => {
                  const widget = widgetMocks[widgetKey];
                  if (!widget) return null;
                  const WidgetIcon = widget.icon;
                  
                  // Vary widget sizes based on type
                  const isLarge = ['bar_chart', 'pie_chart', 'trend_chart', 'team_status'].includes(widgetKey);
                  const spanClass = isLarge && deviceType === 'desktop' ? 'col-span-2' : '';
                  
                  return (
                    <Card 
                      key={`${widgetKey}-${index}`} 
                      className={`${spanClass} overflow-hidden`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${widget.color}`}>
                            <WidgetIcon className="h-4 w-4 text-white" />
                          </div>
                          <CardTitle className="text-sm">{widget.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Mock Content */}
                        <div className="space-y-2">
                          {widgetKey === 'kpi_card' && (
                            <div>
                              <div className="text-3xl font-bold">87%</div>
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <TrendingUp className="h-4 w-4" />
                                +5.2%
                              </div>
                            </div>
                          )}
                          {widgetKey === 'team_status' && (
                            <div className="space-y-2">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-muted" />
                                  <div className="flex-1">
                                    <div className="h-3 bg-muted rounded w-24" />
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    Anwesend
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                          {widgetKey === 'calendar_summary' && (
                            <div className="space-y-2">
                              {[1, 2].map((i) => (
                                <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <div className="h-3 bg-muted-foreground/20 rounded w-32" />
                                </div>
                              ))}
                            </div>
                          )}
                          {widgetKey === 'quick_actions' && (
                            <div className="flex gap-2">
                              {['Urlaub', 'Krank', 'Stempeln'].map((action) => (
                                <Button key={action} variant="outline" size="sm">
                                  {action}
                                </Button>
                              ))}
                            </div>
                          )}
                          {widgetKey === 'bar_chart' && (
                            <div className="flex items-end gap-2 h-24">
                              {[60, 80, 45, 90, 70, 85, 55].map((h, i) => (
                                <div 
                                  key={i} 
                                  className="flex-1 bg-primary/80 rounded-t"
                                  style={{ height: `${h}%` }}
                                />
                              ))}
                            </div>
                          )}
                          {widgetKey === 'notification_feed' && (
                            <div className="space-y-2">
                              {[1, 2].map((i) => (
                                <div key={i} className="flex items-start gap-2 p-2 bg-muted rounded">
                                  <Bell className="h-4 w-4 text-muted-foreground mt-0.5" />
                                  <div className="space-y-1">
                                    <div className="h-3 bg-muted-foreground/20 rounded w-40" />
                                    <div className="h-2 bg-muted-foreground/10 rounded w-24" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {!['kpi_card', 'team_status', 'calendar_summary', 'quick_actions', 'bar_chart', 'notification_feed'].includes(widgetKey) && (
                            <div className="h-20 flex items-center justify-center text-muted-foreground text-sm">
                              Widget-Vorschau
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rollen-Vergleich */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Rollen-Vergleich</CardTitle>
          </div>
          <CardDescription>
            Vergleichen Sie die Dashboards verschiedener Rollen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {previewRoles.map((role) => (
              <Card 
                key={role.key}
                className={`cursor-pointer transition-all ${
                  selectedRole === role.key ? 'border-primary ring-2 ring-primary/20' : ''
                }`}
                onClick={() => setSelectedRole(role.key)}
              >
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <Badge variant={selectedRole === role.key ? 'default' : 'outline'}>
                      {role.name}
                    </Badge>
                  </div>
                  <div className="text-center text-sm text-muted-foreground mb-2">
                    {role.dashboard}
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {role.widgets.slice(0, 4).map((w) => {
                      const widget = widgetMocks[w];
                      if (!widget) return null;
                      return (
                        <div 
                          key={w}
                          className={`w-6 h-6 rounded ${widget.color} flex items-center justify-center`}
                          title={widget.name}
                        >
                          <widget.icon className="h-3 w-3 text-white" />
                        </div>
                      );
                    })}
                    {role.widgets.length > 4 && (
                      <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs">
                        +{role.widgets.length - 4}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPreview;
