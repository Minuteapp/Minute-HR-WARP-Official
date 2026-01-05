export interface DashboardWidget {
  id: string;
  widget_type: 'kpi_card' | 'list_compact' | 'bar_chart' | 'line_chart' | 'progress_ring' | 'quick_actions' | 'team_status' | 'calendar_summary' | 'notification_feed' | 'favorites';
  title: string;
  icon?: string;
  data_source_id?: string;
  config: Record<string, any>;
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

export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  layout_config: {
    grid: {
      columns: number;
      rowHeight: number;
      gap: number;
    };
    maxWidth?: string;
  };
  is_default: boolean;
  visibility_rules: {
    roles: string[];
  };
}

export interface DashboardDataSource {
  id: string;
  source_name: string;
  source_module: string;
  query_config: Record<string, any>;
  cache_ttl_seconds: number;
  requires_roles: string[];
  is_active: boolean;
}

export interface UserDashboardConfig {
  id: string;
  user_id: string;
  layout_id?: string;
  custom_widget_positions: any[];
  hidden_widgets: string[];
  preferences: Record<string, any>;
}

export interface DashboardAIInsight {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  content: string;
  metadata: Record<string, any>;
  priority: number;
  is_read: boolean;
  expires_at?: string;
  created_at: string;
}

export interface WidgetData {
  value?: number | string;
  label?: string;
  items?: any[];
  chart_data?: any[];
  actions?: {
    label: string;
    route?: string;
    action?: string;
  }[];
  status?: 'success' | 'warning' | 'error' | 'info';
  badge?: {
    text: string;
    color: 'green' | 'orange' | 'red' | 'blue';
  };
  trend?: {
    value: string; // "+15m", "80%", "+2", "+5%"
    direction: 'up' | 'down';
    color?: 'green' | 'red';
  };
  loading?: boolean;
  error?: string;
  timestamp?: string;
}