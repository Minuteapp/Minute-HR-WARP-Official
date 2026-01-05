import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Plus, Grid, Save, Eye, Settings2, Trash2, ChevronLeft, Zap, Calendar, Bell, Code, 
  Palette, Layout, Users, Monitor, Smartphone, Copy, Download, Upload, Play, Pause,
  Edit, BarChart3, PieChart, TrendingUp, Activity, Target, Clock, FileText, User,
  UserCog, Lock, AlertTriangle, Brain, History, ClipboardList
} from 'lucide-react';
import { VisualDashboardEditor } from '@/components/settings/dashboard/VisualDashboardEditor';
import { DashboardRoleAssignment } from '@/components/settings/dashboard/DashboardRoleAssignment';
import { WidgetPermissions } from '@/components/settings/dashboard/WidgetPermissions';
import { DashboardAlerts } from '@/components/settings/dashboard/DashboardAlerts';
import { DashboardAISettings } from '@/components/settings/dashboard/DashboardAISettings';
import { DashboardVersionHistory } from '@/components/settings/dashboard/DashboardVersionHistory';
import { DashboardAuditLog } from '@/components/settings/dashboard/DashboardAuditLog';
import { DashboardBuilder } from '@/components/settings/DashboardBuilder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  layout_config: any;
  is_default: boolean;
  visibility_rules: {
    roles: string[];
  };
  created_at: string;
  updated_at: string;
}

interface WidgetType {
  id: string;
  widget_type: string;
  title: string;
  icon: string;
  data_source_id?: string;
  config: any;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  is_active: boolean;
  visibility_rules: {
    roles?: string[];
    departments?: string[];
    teams?: string[];
  };
}

const DashboardConfigPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dashboardLayouts, setDashboardLayouts] = useState<DashboardLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<DashboardLayout | null>(null);
  const [availableWidgets, setAvailableWidgets] = useState<WidgetType[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [newLayoutDevice, setNewLayoutDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [currentTab, setCurrentTab] = useState('overview');
  const [previewMode, setPreviewMode] = useState<'admin' | 'hr' | 'manager' | 'employee'>('admin');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [isLoading, setIsLoading] = useState(true);

  // Widget-Kategorien für die Bibliothek
  const widgetCategories = [
    { id: 'kpi', name: 'KPI & Metriken', icon: BarChart3, color: 'bg-blue-500' },
    { id: 'charts', name: 'Charts & Grafiken', icon: PieChart, color: 'bg-green-500' },
    { id: 'lists', name: 'Listen & Tabellen', icon: FileText, color: 'bg-orange-500' },
    { id: 'calendar', name: 'Kalender & Zeit', icon: Calendar, color: 'bg-purple-500' },
    { id: 'actions', name: 'Schnellaktionen', icon: Zap, color: 'bg-yellow-500' },
    { id: 'hr', name: 'HR-Module', icon: Users, color: 'bg-pink-500' }
  ];

  // Verfügbare Widget-Typen
  const defaultWidgets = [
    // KPI Widgets
    { id: 'kpi_card', category: 'kpi', name: 'KPI Karte', icon: TrendingUp, description: 'Einzelne Kennzahl mit Trend' },
    { id: 'progress_ring', category: 'kpi', name: 'Fortschrittsring', icon: Activity, description: 'Kreisförmiger Fortschritt' },
    
    // Chart Widgets
    { id: 'bar_chart', category: 'charts', name: 'Balkendiagramm', icon: BarChart3, description: 'Vergleich von Werten' },
    { id: 'line_chart', category: 'charts', name: 'Liniendiagramm', icon: TrendingUp, description: 'Trends über Zeit' },
    
    // Listen Widgets
    { id: 'list_compact', category: 'lists', name: 'Kompakte Liste', icon: FileText, description: 'Kurze Elementliste' },
    { id: 'team_status', category: 'lists', name: 'Team-Status', icon: Users, description: 'Überblick Teammitglieder' },
    
    // Kalender & Zeit
    { id: 'calendar_summary', category: 'calendar', name: 'Kalender-Übersicht', icon: Calendar, description: 'Kommende Termine' },
    
    // Aktionen
    { id: 'quick_actions', category: 'actions', name: 'Schnellaktionen', icon: Zap, description: 'Wichtige Aktionen' },
    
    // HR Module
    { id: 'notification_feed', category: 'hr', name: 'Benachrichtigungen', icon: Bell, description: 'Aktuelle Mitteilungen' },
    { id: 'favorites', category: 'hr', name: 'Favoriten', icon: Target, description: 'Häufig genutzte Funktionen' }
  ];

  // Vorgefertigte Vorlagen
  const templateLayouts = [
    {
      id: 'admin_template',
      name: 'Administrator Dashboard',
      description: 'Vollständige Übersicht mit allen KPIs und Systemmetriken',
      roles: ['admin'],
      widgets: ['kpi_card', 'bar_chart', 'team_status', 'notification_feed', 'quick_actions']
    },
    {
      id: 'hr_template', 
      name: 'HR Manager Dashboard',
      description: 'Fokus auf Personalmanagement und Recruiting',
      roles: ['hr', 'hr_manager'],
      widgets: ['team_status', 'kpi_card', 'calendar_summary', 'notification_feed']
    },
    {
      id: 'manager_template',
      name: 'Team Manager Dashboard', 
      description: 'Team-Übersicht und Projektfortschritt',
      roles: ['manager', 'team_lead'],
      widgets: ['team_status', 'progress_ring', 'calendar_summary', 'quick_actions']
    },
    {
      id: 'employee_template',
      name: 'Mitarbeiter Dashboard',
      description: 'Persönliche Aufgaben und Terminübersicht',
      roles: ['employee'],
      widgets: ['calendar_summary', 'quick_actions', 'favorites', 'notification_feed']
    }
  ];

  const stats = [
    { title: 'Dashboard-Layouts', value: dashboardLayouts.length.toString(), trend: 'Aktive Layouts', color: 'bg-blue-100 text-blue-700' },
    { title: 'Verfügbare Widgets', value: defaultWidgets.length.toString(), trend: 'Widget-Typen', color: 'bg-green-100 text-green-700' },
    { title: 'Aktive Rollen', value: '4', trend: 'RBAC-Konfiguration', color: 'bg-purple-100 text-purple-700' },
    { title: 'Vorlagen', value: templateLayouts.length.toString(), trend: 'Vorgefertigte Layouts', color: 'bg-orange-100 text-orange-700' },
  ];

  useEffect(() => {
    loadDashboardLayouts();
  }, [user]);

  const loadDashboardLayouts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDashboardLayouts(data || []);
      if (data && data.length > 0) {
        const defaultLayout = data.find(layout => layout.is_default) || data[0];
        setSelectedLayout(defaultLayout);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Dashboard-Layouts:', error);
      toast.error('Fehler beim Laden der Layouts');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewLayout = async () => {
    if (!user || !newLayoutName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .insert({
          name: newLayoutName.trim(),
          device_type: newLayoutDevice,
          layout_config: {
            grid: { columns: newLayoutDevice === 'mobile' ? 2 : 4, rowHeight: 140, gap: 12 },
            maxWidth: newLayoutDevice === 'mobile' ? '100%' : '1200px'
          },
          is_default: dashboardLayouts.length === 0,
          visibility_rules: { roles: ['admin'] }
        })
        .select()
        .single();

      if (error) throw error;

      setDashboardLayouts(prev => [data, ...prev]);
      setSelectedLayout(data);
      setNewLayoutName('');
      setIsCreateDialogOpen(false);
      toast.success('Layout erfolgreich erstellt!');
    } catch (error) {
      console.error('Fehler beim Erstellen des Layouts:', error);
      toast.error('Fehler beim Erstellen des Layouts');
    }
  };

  const deleteLayout = async (layoutId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_layouts')
        .delete()
        .eq('id', layoutId);

      if (error) throw error;

      setDashboardLayouts(prev => prev.filter(layout => layout.id !== layoutId));
      if (selectedLayout?.id === layoutId) {
        const remaining = dashboardLayouts.filter(layout => layout.id !== layoutId);
        setSelectedLayout(remaining.length > 0 ? remaining[0] : null);
      }
      toast.success('Layout gelöscht');
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      toast.error('Fehler beim Löschen des Layouts');
    }
  };

  const exportLayout = (layout: DashboardLayout) => {
    const exportData = {
      name: layout.name,
      device_type: layout.device_type,
      layout_config: layout.layout_config,
      visibility_rules: layout.visibility_rules,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-layout-${layout.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Layout exportiert');
  };

  const duplicateLayout = async (layout: DashboardLayout) => {
    try {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .insert({
          name: `${layout.name} (Kopie)`,
          device_type: layout.device_type,
          layout_config: layout.layout_config,
          is_default: false,
          visibility_rules: layout.visibility_rules
        })
        .select()
        .single();

      if (error) throw error;

      setDashboardLayouts(prev => [data, ...prev]);
      toast.success('Layout dupliziert');
    } catch (error) {
      console.error('Fehler beim Duplizieren:', error);
      toast.error('Fehler beim Duplizieren des Layouts');
    }
  };

  const applyTemplate = async (template: typeof templateLayouts[0]) => {
    if (!selectedLayout) return;

    const templateConfig = {
      grid: { columns: 4, rowHeight: 140, gap: 12 },
      widgets: template.widgets.map((widgetType, index) => ({
        id: `widget-${Date.now()}-${index}`,
        type: widgetType,
        position: { x: (index % 4), y: Math.floor(index / 4) },
        size: { width: 1, height: 1 }
      }))
    };

    try {
      const { error } = await supabase
        .from('dashboard_layouts')
        .update({
          layout_config: templateConfig,
          visibility_rules: { roles: template.roles }
        })
        .eq('id', selectedLayout.id);

      if (error) throw error;

      setSelectedLayout(prev => prev ? {
        ...prev,
        layout_config: templateConfig,
        visibility_rules: { roles: template.roles }
      } : null);

      toast.success('Vorlage angewendet');
    } catch (error) {
      console.error('Fehler beim Anwenden der Vorlage:', error);
      toast.error('Fehler beim Anwenden der Vorlage');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Lade Dashboard-Konfiguration...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard-Konfiguration</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen und verwalten Sie personalisierte Dashboard-Layouts mit Widgets und rollenspezifischer Sichtbarkeit
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neues Layout
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Dashboard-Layout erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="layout-name">Layout Name</Label>
                <Input
                  id="layout-name"
                  value={newLayoutName}
                  onChange={(e) => setNewLayoutName(e.target.value)}
                  placeholder="z.B. Manager Dashboard"
                />
              </div>
              <div>
                <Label htmlFor="device-type">Gerätetyp</Label>
                <Select value={newLayoutDevice} onValueChange={(value: 'mobile' | 'tablet' | 'desktop') => setNewLayoutDevice(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={createNewLayout} disabled={!newLayoutName.trim()}>
                  Erstellen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <ScrollArea className="w-full">
          <TabsList className="inline-flex w-auto min-w-full">
            <TabsTrigger value="overview" className="flex items-center gap-1.5">
              <Grid className="h-4 w-4" />
              Übersicht
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-1.5">
              <Layout className="h-4 w-4" />
              Layout-Editor
            </TabsTrigger>
            <TabsTrigger value="widgets" className="flex items-center gap-1.5">
              <Settings2 className="h-4 w-4" />
              Widget-Bibliothek
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-1.5">
              <Code className="h-4 w-4" />
              Layout-Builder
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1.5">
              <Copy className="h-4 w-4" />
              Vorlagen
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Rollensichtbarkeit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              Vorschau
            </TabsTrigger>
            <TabsTrigger value="role-assignment" className="flex items-center gap-1.5">
              <UserCog className="h-4 w-4" />
              Rollen-Zuweisung
            </TabsTrigger>
            <TabsTrigger value="widget-permissions" className="flex items-center gap-1.5">
              <Lock className="h-4 w-4" />
              Widget-Rechte
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="ai-settings" className="flex items-center gap-1.5">
              <Brain className="h-4 w-4" />
              KI-Dashboard
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-1.5">
              <History className="h-4 w-4" />
              Versionierung
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Audit-Log
            </TabsTrigger>
          </TabsList>
        </ScrollArea>

        {/* NEW: Visual Dashboard Editor Tab */}
        <TabsContent value="editor" className="space-y-0">
          <VisualDashboardEditor />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiken */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <Badge className={stat.color} variant="secondary">
                    {stat.trend}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Meine Dashboard-Layouts */}
          <Card>
            <CardHeader>
              <CardTitle>Meine Dashboard-Layouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dashboardLayouts.map((layout) => (
                  <Card key={layout.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{layout.name}</CardTitle>
                        <div className="flex gap-2">
                          {layout.is_default && (
                            <Badge variant="default">Standard</Badge>
                          )}
                          <Badge variant="outline">
                            {layout.device_type === 'mobile' && <Smartphone className="h-3 w-3 mr-1" />}
                            {layout.device_type === 'desktop' && <Monitor className="h-3 w-3 mr-1" />}
                            {layout.device_type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Erstellt am: {new Date(layout.created_at).toLocaleDateString()}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLayout(layout);
                            setCurrentTab('builder');
                          }}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Bearbeiten
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedLayout(layout);
                            setCurrentTab('preview');
                          }}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Vorschau
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => duplicateLayout(layout)}
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          Duplizieren
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => exportLayout(layout)}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          Export
                        </Button>
                        
                        {dashboardLayouts.length > 1 && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteLayout(layout.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {dashboardLayouts.length === 0 && (
                <div className="text-center py-12">
                  <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Noch keine Dashboard-Layouts</h3>
                  <p className="text-muted-foreground mb-4">
                    Erstellen Sie Ihr erstes personalisiertes Dashboard-Layout
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Erstes Layout erstellen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widgets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Widget-Bibliothek</CardTitle>
              <p className="text-sm text-muted-foreground">
                Verfügbare Widget-Typen für Ihre Dashboard-Layouts
              </p>
            </CardHeader>
            <CardContent>
              {widgetCategories.map((category) => {
                const categoryWidgets = defaultWidgets.filter(w => w.category === category.id);
                const CategoryIcon = category.icon;
                
                return (
                  <div key={category.id} className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${category.color} text-white`}>
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                      <Badge variant="secondary">{categoryWidgets.length} Widgets</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryWidgets.map((widget) => (
                        <Card key={widget.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-muted">
                                <widget.icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{widget.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {widget.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {category.id !== widgetCategories[widgetCategories.length - 1].id && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-0">
          <DashboardBuilder />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vorlagen-Manager</CardTitle>
              <p className="text-sm text-muted-foreground">
                Verwenden Sie vorgefertigte Dashboard-Layouts oder erstellen Sie eigene Vorlagen
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templateLayouts.map((template) => (
                  <Card key={template.id} className="relative">
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Zielrollen:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.roles.map((role) => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Enthaltene Widgets:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.widgets.map((widget) => {
                            const widgetInfo = defaultWidgets.find(w => w.id === widget);
                            return (
                              <Badge key={widget} variant="outline" className="text-xs">
                                {widgetInfo?.name || widget}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => applyTemplate(template)}
                          disabled={!selectedLayout}
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Anwenden
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          Vorschau
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {!selectedLayout && (
                <div className="text-center py-8 bg-muted/50 rounded-lg mt-6">
                  <p className="text-muted-foreground">
                    Wählen Sie ein Layout aus, um Vorlagen anwenden zu können
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rollenspezifische Sichtbarkeit</CardTitle>
              <p className="text-sm text-muted-foreground">
                Definieren Sie, welche Benutzerrollen welche Dashboard-Layouts und Widgets sehen können
              </p>
            </CardHeader>
            <CardContent>
              {selectedLayout ? (
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">
                      Layout-Sichtbarkeit: {selectedLayout.name}
                    </Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Wählen Sie die Rollen aus, die dieses Layout sehen dürfen
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {['admin', 'hr', 'manager', 'employee'].map((role) => (
                        <div key={role} className="flex items-center space-x-2">
                          <Switch
                            id={`role-${role}`}
                            checked={selectedLayout.visibility_rules?.roles?.includes(role)}
                            onCheckedChange={(checked) => {
                              const currentRoles = selectedLayout.visibility_rules?.roles || [];
                              const newRoles = checked 
                                ? [...currentRoles, role]
                                : currentRoles.filter(r => r !== role);
                              
                              setSelectedLayout(prev => prev ? {
                                ...prev,
                                visibility_rules: { ...prev.visibility_rules, roles: newRoles }
                              } : null);
                            }}
                          />
                          <Label htmlFor={`role-${role}`} className="text-sm capitalize">
                            {role}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-base font-medium">Widget-spezifische Regeln</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Zusätzliche Sichtbarkeitsregeln für einzelne Widgets
                    </p>
                    
                    <div className="space-y-3">
                      {defaultWidgets.slice(0, 5).map((widget) => (
                        <div key={widget.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <widget.icon className="h-5 w-5" />
                            <span className="font-medium">{widget.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                              <Switch id={`widget-${widget.id}-visible`} defaultChecked />
                              <Label htmlFor={`widget-${widget.id}-visible`} className="text-sm">
                                Sichtbar
                              </Label>
                            </div>
                            <Select defaultValue="all">
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Alle Rollen</SelectItem>
                                <SelectItem value="admin">Nur Admin</SelectItem>
                                <SelectItem value="hr">HR + Admin</SelectItem>
                                <SelectItem value="manager">Manager+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Kein Layout ausgewählt</h3>
                  <p className="text-muted-foreground mb-4">
                    Wählen Sie ein Layout aus, um Sichtbarkeitsregeln zu konfigurieren
                  </p>
                  <Button onClick={() => setCurrentTab('overview')}>
                    Zur Übersicht
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Vorschau & Aktivierung</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Testen Sie Ihre Dashboard-Layouts in verschiedenen Rollen und Geräteansichten
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="preview-mode">Rolle:</Label>
                    <Select value={previewMode} onValueChange={(value: 'admin' | 'hr' | 'manager' | 'employee') => setPreviewMode(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="preview-device">Gerät:</Label>
                    <Select value={previewDevice} onValueChange={(value: 'mobile' | 'desktop') => setPreviewDevice(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="desktop">Desktop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {selectedLayout ? (
                <div className="space-y-6">
                  {/* Vorschau-Bereich */}
                  <div className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 ${
                    previewDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">
                        Vorschau: {selectedLayout.name} ({previewMode} - {previewDevice})
                      </h3>
                      <Badge variant="outline">
                        {previewDevice === 'mobile' ? <Smartphone className="h-3 w-3 mr-1" /> : <Monitor className="h-3 w-3 mr-1" />}
                        {previewDevice}
                      </Badge>
                    </div>
                    
                    <div className={`grid gap-4 ${previewDevice === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`}>
                      {Array.from({ length: previewDevice === 'mobile' ? 6 : 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="border border-muted-foreground/20 rounded-lg p-4 min-h-24 flex items-center justify-center text-muted-foreground bg-muted/50"
                        >
                          <span className="text-xs">Widget {index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Aktivierungs-Steuerung */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Layout-Aktivierung</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Layout veröffentlichen</p>
                          <p className="text-sm text-muted-foreground">
                            Änderungen werden sofort für alle Benutzer sichtbar
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline">
                            <Pause className="mr-2 h-4 w-4" />
                            Entwurf speichern
                          </Button>
                          <Button>
                            <Play className="mr-2 h-4 w-4" />
                            Veröffentlichen
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Kein Layout ausgewählt</h3>
                  <p className="text-muted-foreground mb-4">
                    Wählen Sie ein Layout aus, um eine Vorschau anzuzeigen
                  </p>
                  <Button onClick={() => setCurrentTab('overview')}>
                    Zur Übersicht
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enterprise: Rollen-Zuweisung */}
        <TabsContent value="role-assignment" className="space-y-6">
          <DashboardRoleAssignment />
        </TabsContent>

        {/* Enterprise: Widget-Berechtigungen */}
        <TabsContent value="widget-permissions" className="space-y-6">
          <WidgetPermissions />
        </TabsContent>

        {/* Enterprise: Alerts & Schwellenwerte */}
        <TabsContent value="alerts" className="space-y-6">
          <DashboardAlerts />
        </TabsContent>

        {/* Enterprise: KI-Integration */}
        <TabsContent value="ai-settings" className="space-y-6">
          <DashboardAISettings />
        </TabsContent>

        {/* Enterprise: Versionierung */}
        <TabsContent value="versions" className="space-y-6">
          <DashboardVersionHistory />
        </TabsContent>

        {/* Enterprise: Audit-Log */}
        <TabsContent value="audit" className="space-y-6">
          <DashboardAuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardConfigPage;