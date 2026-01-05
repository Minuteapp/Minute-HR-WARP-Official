-- Erweitere die CHECK-Constraint für cross_module_events um alle Module
ALTER TABLE cross_module_events 
DROP CONSTRAINT IF EXISTS cross_module_events_source_module_check;

ALTER TABLE cross_module_events 
ADD CONSTRAINT cross_module_events_source_module_check 
CHECK (source_module = ANY (ARRAY[
  'absence',
  'sick_leave', 
  'shift_planning',
  'recruiting',
  'onboarding',
  'offboarding',
  'performance',
  'payroll',
  'expenses',
  'assets',
  'workflows',
  'projects',
  'documents',
  'helpdesk',
  'orgchart',
  'users_roles',
  'notifications',
  'innovation',
  'knowledge',
  'rewards',
  'workforce_planning',
  'global_mobility',
  'compliance',
  'time_tracking',
  'calendar',
  'business_travel',
  'training',
  'goals',
  'chat',
  'ai',
  'settings',
  'dashboard',
  'reports',
  'analytics',
  'integrations',
  'security',
  'audit'
]::text[]));