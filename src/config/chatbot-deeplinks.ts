import { ModuleDeepLink } from '@/types/chatbot-actions';

export const CHATBOT_DEEP_LINKS: ModuleDeepLink[] = [
  { 
    moduleKey: 'absence', 
    basePath: '/absence', 
    supportedFilters: ['status', 'scope', 'type', 'year'],
    requiresPermission: 'absence.view',
    icon: 'Calendar'
  },
  { 
    moduleKey: 'time', 
    basePath: '/time', 
    supportedFilters: ['date', 'employee', 'project'],
    requiresPermission: 'time.view',
    icon: 'Clock'
  },
  { 
    moduleKey: 'tasks', 
    basePath: '/tasks', 
    supportedFilters: ['priority', 'status', 'assignee', 'project'],
    requiresPermission: 'tasks.view',
    icon: 'CheckSquare'
  },
  { 
    moduleKey: 'documents', 
    basePath: '/documents', 
    supportedFilters: ['type', 'category', 'status'],
    requiresPermission: 'documents.view',
    icon: 'FileText'
  },
  { 
    moduleKey: 'expenses', 
    basePath: '/expenses', 
    supportedFilters: ['status', 'category', 'date'],
    requiresPermission: 'expenses.view',
    icon: 'Receipt'
  },
  { 
    moduleKey: 'employees', 
    basePath: '/employees', 
    supportedFilters: ['department', 'status', 'role'],
    requiresPermission: 'employees.view',
    icon: 'Users'
  },
  { 
    moduleKey: 'shifts', 
    basePath: '/shifts', 
    supportedFilters: ['date', 'team', 'status'],
    requiresPermission: 'shifts.view',
    icon: 'CalendarDays'
  },
  { 
    moduleKey: 'payroll', 
    basePath: '/payroll', 
    supportedFilters: ['month', 'year', 'status'],
    requiresPermission: 'payroll.view',
    icon: 'Wallet'
  },
  { 
    moduleKey: 'settings', 
    basePath: '/settings', 
    supportedFilters: ['module'],
    requiresPermission: 'settings.view',
    icon: 'Settings'
  },
  { 
    moduleKey: 'helpdesk', 
    basePath: '/helpdesk', 
    supportedFilters: ['status', 'priority', 'category'],
    requiresPermission: 'helpdesk.view',
    icon: 'HelpCircle'
  },
  { 
    moduleKey: 'reports', 
    basePath: '/reports', 
    supportedFilters: ['type', 'period'],
    requiresPermission: 'reports.view',
    icon: 'BarChart3'
  },
  { 
    moduleKey: 'onboarding', 
    basePath: '/onboarding', 
    supportedFilters: ['status', 'employee'],
    requiresPermission: 'onboarding.view',
    icon: 'UserPlus'
  }
];

export const buildSecureDeepLink = (
  moduleKey: string, 
  filters: Record<string, string> = {}
): string => {
  const module = CHATBOT_DEEP_LINKS.find(m => m.moduleKey === moduleKey);
  if (!module) return '/dashboard';
  
  const validFilters: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(filters)) {
    if (module.supportedFilters.includes(key) && value) {
      // Sanitize value - keine sensiblen Daten
      const sanitized = String(value).replace(/[<>'"&]/g, '');
      validFilters[key] = sanitized;
    }
  }
  
  const queryString = new URLSearchParams(validFilters).toString();
  return queryString ? `${module.basePath}?${queryString}` : module.basePath;
};

export const getModuleByPath = (path: string): ModuleDeepLink | undefined => {
  return CHATBOT_DEEP_LINKS.find(m => path.startsWith(m.basePath));
};

export const extractModuleFromPath = (path: string): string => {
  const module = getModuleByPath(path);
  return module?.moduleKey || 'unknown';
};
