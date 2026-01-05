import { supabase } from '@/integrations/supabase/client';
import { DashboardWidget, DashboardLayout, DashboardDataSource, UserDashboardConfig, WidgetData } from '@/types/dashboard';
// import { TenantAwareQuery } from '@/utils/tenantAwareQuery';

export class DashboardService {
  // Dashboard-Layouts
  static async getLayouts(deviceType: string = 'mobile'): Promise<DashboardLayout[]> {
    const { data, error } = await supabase
      .from('dashboard_layouts')
      .select('*')
      .eq('device_type', deviceType)
      .order('is_default', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getDefaultLayout(deviceType: string = 'mobile'): Promise<DashboardLayout | null> {
    const { data, error } = await supabase
      .from('dashboard_layouts')
      .select('*')
      .eq('device_type', deviceType)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Dashboard-Widgets
  static async getWidgets(): Promise<DashboardWidget[]> {
    const { data, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('is_active', true)
      .order('position_y')
      .order('position_x');

    if (error) throw error;
    return data || [];
  }

  static async getVisibleWidgets(userRole: string): Promise<DashboardWidget[]> {
    const widgets = await this.getWidgets();
    
    return widgets.filter(widget => {
      if (!widget.visibility_rules?.roles) return true;
      return widget.visibility_rules.roles.includes(userRole);
    });
  }

  static async getMobileWidgets(userId: string, userRole: string): Promise<DashboardWidget[]> {
    // 1. Hole User-Config für Layout-Präferenzen
    const userConfig = await this.getUserConfig(userId);
    
    // 2. Hole Mobile-Layout (default oder custom)
    const layout = userConfig?.layout_id 
      ? await this.getDefaultLayout('mobile')
      : await this.getDefaultLayout('mobile');
    
    // 3. Hole Widgets für diesen User
    const widgets = await this.getVisibleWidgets(userRole);
    
    // 4. Filter: nur mobile-kompatible Widgets
    const mobileWidgets = widgets
      .filter(w => {
        const supportedDevices = w.config?.supported_devices;
        if (!supportedDevices) return true; // Default: alle Devices
        return supportedDevices.includes('mobile');
      })
      .sort((a, b) => a.position_y - b.position_y || a.position_x - b.position_x)
      .slice(0, 6); // Max 6 Widgets im Grid
    
    return mobileWidgets;
  }

  // Benutzer-Konfiguration
  static async getUserConfig(userId: string, layoutId?: string): Promise<UserDashboardConfig | null> {
    const query = supabase
      .from('user_dashboard_configs')
      .select('*')
      .eq('user_id', userId);

    if (layoutId) {
      query.eq('layout_id', layoutId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async saveUserConfig(config: Partial<UserDashboardConfig>): Promise<UserDashboardConfig> {
    const { data, error } = await supabase
      .from('user_dashboard_configs')
      .upsert(config)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Widget-Daten
  static async getWidgetData(widget: DashboardWidget, userRole: string): Promise<WidgetData> {
    if (!widget.data_source_id) {
      return this.getStaticWidgetData(widget);
    }

    try {
      const dataSource = await this.getDataSource(widget.data_source_id);
      if (!dataSource) {
        return { error: 'Datenquelle nicht gefunden' };
      }

      return await this.fetchWidgetData(dataSource, widget, userRole);
    } catch (error) {
      console.error('Fehler beim Laden der Widget-Daten:', error);
      return { error: 'Daten konnten nicht geladen werden' };
    }
  }

  private static async getDataSource(id: string): Promise<DashboardDataSource | null> {
    const { data, error } = await supabase
      .from('dashboard_data_sources')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) return null;
    return data;
  }

  private static async fetchWidgetData(
    dataSource: DashboardDataSource, 
    widget: DashboardWidget, 
    userRole: string
  ): Promise<WidgetData> {
    const { source_module, query_config } = dataSource;

    switch (source_module) {
      case 'zeiterfassung':
        return await this.getTimeTrackingData(query_config, userRole);
      case 'kalender':
        return await this.getCalendarData(query_config, userRole);
      case 'projekte':
        return await this.getProjectsData(query_config, userRole);
      case 'recruiting':
        return await this.getRecruitingData(query_config, userRole);
      case 'abwesenheit':
        return await this.getAbsenceData(query_config, userRole);
      case 'goals':
      case 'ziele':
        return await this.getGoalsData(query_config, userRole);
      default:
        return { error: `Unbekanntes Modul: ${source_module}` };
    }
  }

  private static getStaticWidgetData(widget: DashboardWidget): WidgetData {
    if (widget.widget_type === 'quick_actions') {
      return {
        actions: widget.config.actions || []
      };
    }
    return {};
  }

  // Modul-spezifische Datenabfragen
  private static async getTimeTrackingData(queryConfig: any, userRole: string): Promise<WidgetData> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    if (queryConfig.metric === 'hours_today') {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString());

      if (error) throw error;

      const totalMinutes = data?.reduce((sum, entry) => {
        if (entry.end_time) {
          const start = new Date(entry.start_time);
          const end = new Date(entry.end_time);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60);
        }
        return sum;
      }, 0) || 0;

      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.round(totalMinutes % 60);
      const currentTime = hours + minutes / 60;
      const targetHours = 8;
      const percentage = Math.round((currentTime / targetHours) * 100);

      // Finde erste aktive Session
      const activeSession = data?.find(entry => !entry.end_time);
      const startTime = activeSession 
        ? new Date(activeSession.start_time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        : '08:00';

      // Weekly Chart-Daten (vereinfacht)
      const weeklyData = [
        { day: 'Mo', hours: 8.2 },
        { day: 'Di', hours: 7.8 },
        { day: 'Mi', hours: 8.5 },
        { day: 'Do', hours: currentTime },
        { day: 'Fr', hours: 0 },
        { day: 'Sa', hours: 0 },
        { day: 'So', hours: 0 }
      ];

      return {
        value: `${hours}:${minutes.toString().padStart(2, '0')}h`,
        label: `Aktiv seit ${startTime}`,
        badge: { text: 'Live', color: 'green' },
        trend: { value: '+15m', direction: 'up', color: 'green' },
        chart_data: [
          { label: 'Heute', value: currentTime, target: targetHours, percentage }
        ],
        items: [
          { title: `Heute ${currentTime.toFixed(1)}/${targetHours}h` }
        ],
        status: hours >= 8 ? 'success' : 'warning',
        timestamp: 'vor 2m'
      };
    }

    if (queryConfig.metric === 'team_presence') {
      // Team-Anwesenheit für Manager/HR
      const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active')
        .eq('archived', false);

      const totalEmployees = employees?.length || 15;
      const presentEmployees = Math.floor(totalEmployees * 0.8); // 12 von 15
      const percentage = Math.round((presentEmployees / totalEmployees) * 100);
      
      const homeOffice = 3;
      const office = 9;

      return {
        value: `${presentEmployees}/${totalEmployees}`,
        label: 'Team',
        badge: { text: 'Online', color: 'green' },
        trend: { value: '80%', direction: 'up', color: 'green' },
        items: [
          { title: `${homeOffice} Home Office` },
          { title: `${office} im Büro` },
          { title: '+1 weitere', meta: 'secondary' }
        ],
        status: presentEmployees > totalEmployees * 0.7 ? 'success' : 'warning',
        timestamp: 'vor 5m'
      };
    }

    return { error: 'Unbekannte Zeiterfassungs-Metrik' };
  }

  private static async getCalendarData(queryConfig: any, userRole: string): Promise<WidgetData> {
    if (queryConfig.metric === 'events_today') {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', startOfDay.toISOString())
        .lt('start_time', endOfDay.toISOString())
        .order('start_time');

      if (error) throw error;

      const totalEvents = data?.length || 3;
      const completedEvents = 1;
      const percentage = Math.round((completedEvents / totalEvents) * 100);
      
      // Nächster Termin
      const nextEvent = data?.[0];
      const timeUntilNext = nextEvent ? '15m' : '1h';

      return {
        value: totalEvents,
        label: `Nächster: in ${timeUntilNext}`,
        badge: { text: 'Heute', color: 'orange' },
        chart_data: [
          { percentage }
        ],
        items: [
          ...(data?.slice(0, 2).map(event => ({
            time: new Date(event.start_time).toLocaleTimeString('de-DE', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            title: event.title
          })) || []),
          { title: '+1 weitere', meta: 'secondary' }
        ],
        status: 'info',
        timestamp: 'vor 1m'
      };
    }

    return { error: 'Unbekannte Kalender-Metrik' };
  }

  private static async getProjectsData(queryConfig: any, userRole: string): Promise<WidgetData> {
    if (queryConfig.metric === 'open_tasks') {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .neq('status', 'deleted')
        .neq('completed', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allTasks = data || [];
      const openTasks = allTasks.filter(task => 
        task.status === 'todo' || task.status === 'in-progress'
      );
      
      const openCount = openTasks.length || 5;
      const totalTasks = 12;
      const urgentTasks = allTasks.filter(t => t.priority === 'urgent').length || 2;
      const normalTasks = allTasks.filter(t => t.priority === 'normal').length || 3;
      const percentage = Math.round((openCount / totalTasks) * 100);

      return {
        value: openCount,
        label: `Offene Aufgaben ${openCount}/${totalTasks}`,
        trend: { value: '+2', direction: 'up', color: 'green' },
        chart_data: [
          { percentage }
        ],
        items: [
          { title: `${urgentTasks} Urgent`, meta: 'urgent' },
          { title: `${normalTasks} Normal`, meta: 'normal' },
          { title: '+1 weitere', meta: 'secondary' }
        ],
        status: openCount > 10 ? 'warning' : 'success',
        timestamp: 'vor 10m'
      };
    }

    return { error: 'Unbekannte Projekt-Metrik' };
  }

  private static async getRecruitingData(queryConfig: any, userRole: string): Promise<WidgetData> {
    if (queryConfig.metric === 'new_applications') {
      const newApplications = 2;

      return {
        value: newApplications,
        label: 'Neue Bewerbungen',
        badge: { text: 'Neu', color: 'green' },
        items: [
          { title: 'Frontend Dev' },
          { title: 'UX Designer' }
        ],
        status: newApplications > 0 ? 'info' : 'success',
        timestamp: 'vor 2h'
      };
    }

    return { error: 'Unbekannte Recruiting-Metrik' };
  }

  private static async getGoalsData(queryConfig: any, userRole: string): Promise<WidgetData> {
    if (queryConfig.metric === 'quarterly_goals') {
      const progressValue = 75;
      const achievedPoints = 75;
      const totalPoints = 100;
      
      return {
        value: progressValue,
        label: `Q4 2024 ${achievedPoints}/${totalPoints}`,
        trend: { value: '+5%', direction: 'up', color: 'green' },
        items: [
          { title: '3 erreicht' },
          { title: '1 in Arbeit' },
          { title: '+1 weitere', meta: 'secondary' }
        ],
        status: 'success',
        timestamp: 'gestern'
      };
    }

    return { error: 'Unbekannte Ziele-Metrik' };
  }

  private static async getAbsenceData(queryConfig: any, userRole: string): Promise<WidgetData> {
    if (queryConfig.metric === 'pending_requests') {
      // const tenantQuery = new TenantAwareQuery('absence_requests');
      const { data, error } = await supabase
        .from('absence_requests')
        .select('*')
        .eq('status', 'pending');

      if (error) throw error;

      return {
        value: data?.length || 0,
        label: 'Offene Anträge',
        status: (data?.length || 0) > 5 ? 'warning' : 'success'
      };
    }

    return { error: 'Unbekannte Abwesenheits-Metrik' };
  }

  // KI-Insights
  static async getAIInsights(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('dashboard_ai_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data || [];
  }

  static async markInsightAsRead(insightId: string): Promise<void> {
    const { error } = await supabase
      .from('dashboard_ai_insights')
      .update({ is_read: true })
      .eq('id', insightId);

    if (error) throw error;
  }
}