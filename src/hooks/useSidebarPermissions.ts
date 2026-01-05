import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeModuleKey, normalizeActionKey } from '@/utils/permissionNormalization';

// Mapping von URL-Pfaden zu Modul-Namen in der Datenbank
const PATH_TO_MODULE: Record<string, string[]> = {
  '/': ['dashboard', 'Dashboard'],
  '/mehr': ['dashboard', 'Dashboard'], // Mehr-Page soll immer sichtbar sein (filtert intern)
  '/employees': ['employees', 'Mitarbeiter', 'mitarbeiter'],
  '/absence': ['absence', 'Abwesenheit', 'abwesenheit'],
  '/time-tracking': ['time_tracking', 'Zeiterfassung', 'zeiterfassung'],
  '/time': ['time_tracking', 'Zeiterfassung'],
  '/payroll': ['payroll', 'Lohn & Gehalt', 'lohn_gehalt', 'payroll_settings'],
  '/recruiting': ['recruiting', 'Recruiting', 'recruiting'],
  '/performance': ['performance', 'Performance', 'performance'],
  '/goals': ['goals', 'Ziele', 'ziele'],
  '/calendar': ['calendar', 'Kalender', 'kalender'],
  '/chat': ['chat', 'Chat', 'chat'],
  '/tasks': ['tasks', 'Aufgaben', 'aufgaben'],
  '/projects': ['projects', 'Projekte', 'projekte'],
  '/documents': ['documents', 'Dokumente', 'dokumente'],
  '/helpdesk': ['helpdesk', 'Helpdesk', 'helpdesk'],
  '/reports': ['reports', 'Berichte', 'berichte'],
  '/settings': ['settings', 'Einstellungen', 'einstellungen'],
  '/dashboard': ['dashboard', 'Dashboard', 'dashboard'],
  '/today': ['today', 'Heute', 'heute'],
  '/notifications': ['notifications', 'Benachrichtigungen', 'benachrichtigungen'],
  '/profile': ['profil', 'profile', 'Profil'],
  '/profil': ['profil', 'profile', 'Profil'],
  '/onboarding': ['onboarding', 'Onboarding', 'onboarding'],
  '/compliance': ['compliance', 'Compliance', 'compliance'],
  '/budget': ['budget', 'Budget', 'budget'],
  '/workforce-planning': ['workforce_planning', 'Workforce Planning', 'workforce'],
  '/hr/organization-design': ['hr_organization_design', 'Organisationsdesign'],
  '/hr-organization-design': ['hr_organization_design', 'Organisationsdesign'],
  '/pulse-surveys': ['pulse_surveys', 'employee_surveys', 'Umfragen', 'surveys'],
  '/knowledge': ['knowledge_hub', 'Wissensdatenbank'],
  '/roadmap': ['roadmap', 'Roadmap'],
  '/training': ['training', 'Schulungen'],
  '/benefits': ['benefits', 'rewards', 'Benefits'],
  '/workflow': ['workflow', 'Workflows'],
  '/expenses': ['expenses', 'Ausgaben'],
  '/global-mobility': ['global_mobility', 'Global Mobility'],
  '/rewards': ['rewards', 'Benefits'],
  '/innovation': ['innovation', 'Innovation Hub'],
  '/environment': ['environment', 'Nachhaltigkeit'],
  '/business-travel': ['business_travel', 'Geschäftsreisen'],
  '/sick-leave': ['sick_leave', 'Krankmeldungen'],
  '/voicemail': ['voicemail', 'Business Voicemail'],
  '/shift-planning': ['shift_planning', 'Schichtplanung'],
  '/ai': ['ai', 'ai_hub', 'KI-Funktionen'],
  '/knowledge-hub': ['knowledge_hub', 'Wissensdatenbank'],
  '/auth': ['auth'], // Auth-Routen immer erlaubt
  '/menu': ['dashboard'], // Menu-Page soll immer sichtbar sein
  // Zusätzliche Pfade für 80/20 Defaults
  '/projects/roadmap': ['projects', 'roadmap', 'Projekte'],
  '/projects/new': ['projects', 'Projekte'],
  '/projects/board': ['projects', 'Projekte'],
  '/expenses/new': ['expenses', 'Ausgaben'],
  '/expenses/reports': ['expenses', 'Ausgaben'],
  '/rewards/benefits': ['rewards', 'Benefits'],
  '/rewards/recognition': ['rewards', 'Benefits'],
  '/environment/sustainability': ['environment', 'Nachhaltigkeit'],
  '/environment/carbon': ['environment', 'Nachhaltigkeit'],
  '/payroll/my': ['payroll', 'Lohn & Gehalt'], // Eigene Gehaltsabrechnung
  '/payroll/statements': ['payroll', 'Lohn & Gehalt'],
  '/performance/my': ['performance', 'Performance'], // Eigene Performance
  '/performance/goals': ['performance', 'Performance'],
  '/shift-planning/my': ['shift_planning', 'Schichtplanung'], // Eigene Schichten
  '/onboarding/my': ['onboarding', 'Onboarding'], // Eigenes Onboarding
  '/global-mobility/applications': ['global_mobility', 'Global Mobility'],
  '/innovation/ideas': ['innovation', 'Innovation Hub'],
  '/innovation/submit': ['innovation', 'Innovation Hub'],
  '/pulse-surveys/participate': ['pulse_surveys', 'Umfragen'],
};

/**
 * Normalisiert die DB-Rolle auf Rollen, die in role_permission_matrix existieren.
 * Dies verhindert "allow-by-default" bei unbekannten Rollen.
 */
function normalizeRoleForMatrix(role: string): EffectiveRole {
  const lowerRole = role?.toLowerCase() || 'employee';
  
  // Die 4 offiziellen Rollen (konsistent mit DB)
  if (lowerRole === 'superadmin' || lowerRole.includes('superadmin')) return 'superadmin';
  if (lowerRole === 'admin') return 'admin';
  if (lowerRole === 'hr_admin' || lowerRole === 'hr_manager' || lowerRole === 'hr' || lowerRole.includes('personal')) return 'hr_admin';
  if (lowerRole === 'team_lead' || lowerRole === 'teamlead' || lowerRole === 'manager' || lowerRole === 'teamleiter' || lowerRole.includes('lead') || lowerRole.includes('leiter')) return 'team_lead';
  if (lowerRole === 'employee' || lowerRole === 'mitarbeiter' || lowerRole === 'user') return 'employee';
  
  // Fallback: Admin-Check (wenn "admin" im Namen vorkommt aber nicht hr_admin)
  if (lowerRole.includes('admin') && !lowerRole.includes('hr')) return 'admin';
  
  // Unbekannt = Deny-by-default
  console.warn(`useSidebarPermissions: Unbekannte Rolle "${role}" wird als "employee" behandelt.`);
  return 'employee';
}

interface ModuleVisibility {
  [moduleName: string]: boolean;
}

interface ModuleActions {
  [moduleName: string]: string[];
}

export type EffectiveRole = 'superadmin' | 'admin' | 'hr_admin' | 'team_lead' | 'employee';

export const useSidebarPermissions = () => {
  const { user } = useAuth();

  // 1. Effektive Rolle ermitteln (mit Preview-Support)
  const { data: effectiveRole, isLoading: roleLoading } = useQuery({
    queryKey: ['effective-sidebar-role', user?.id],
    queryFn: async (): Promise<EffectiveRole> => {
      if (!user?.id) return 'employee';

      try {
        // 1. Prüfe zuerst ob Preview-Modus aktiv (nur für Superadmins)
        const { data: previewData } = await supabase
          .from('user_role_preview_sessions')
          .select('preview_role, is_preview_active')
          .eq('user_id', user.id)
          .eq('is_preview_active', true)
          .maybeSingle();

        if (previewData?.preview_role) {
          return previewData.preview_role as EffectiveRole;
        }

        // 2. Prüfe Tenant-Impersonation
        const { data: tenantSession } = await supabase
          .from('active_tenant_sessions')
          .select('impersonated_company_id, is_active')
          .eq('session_user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        // 3. Normale Rolle aus user_roles (ohne company filter zuerst)
        const { data: allRoles } = await supabase
          .from('user_roles')
          .select('role, company_id')
          .eq('user_id', user.id);

        // Superadmin check - wenn user eine superadmin Rolle hat (ohne company_id)
        const superadminRole = allRoles?.find(r => r.role === 'superadmin' && !r.company_id);
        if (superadminRole) {
          // Bei aktiver Tenant-Session: Superadmin behält superadmin-Rechte
          // (Er sieht alles im impersonierten Tenant)
          return 'superadmin';
        }

        // Falls impersonation aktiv, prüfe user_roles für die impersonierte Firma
        if (tenantSession?.impersonated_company_id) {
          const companyRole = allRoles?.find(r => r.company_id === tenantSession.impersonated_company_id);
          if (companyRole?.role) {
            return normalizeRoleForMatrix(companyRole.role);
          }
          // Superadmin ohne spezifische Rolle im Tenant: behält Admin-Zugriff
          // (Damit Superadmin nicht als employee eingestuft wird)
          return 'admin';
        }

        // Normale Rolle (erste gefundene)
        const firstRole = allRoles?.[0];
        if (firstRole?.role) {
          return normalizeRoleForMatrix(firstRole.role);
        }

        // 4. Kein Fallback auf user_metadata (Sicherheitsrisiko)
        // Unbekannte Rollen werden als employee behandelt (deny-by-default)
        return 'employee';
      } catch (error) {
        console.error('Fehler beim Ermitteln der Rolle:', error);
        return 'employee';
      }
    },
    enabled: !!user?.id,
    staleTime: 30000, // 30 Sekunden Cache
  });

  // 2. Modul-Sichtbarkeit aus DB laden
  const { data: moduleVisibility = {}, isLoading: visibilityLoading } = useQuery({
    queryKey: ['module-visibility', effectiveRole],
    queryFn: async (): Promise<ModuleVisibility> => {
      if (!effectiveRole) return {};

      try {
        const { data, error } = await supabase
          .from('role_permission_matrix')
          .select('module_name, is_visible')
          .eq('role', effectiveRole);

        if (error) {
          console.error('Fehler beim Laden der Modul-Sichtbarkeit:', error);
          return {};
        }

        return Object.fromEntries(
          data?.map(m => [m.module_name.toLowerCase(), m.is_visible]) || []
        );
      } catch (error) {
        console.error('Fehler beim Laden der Modul-Sichtbarkeit:', error);
        return {};
      }
    },
    enabled: !!effectiveRole && effectiveRole !== 'superadmin',
    staleTime: 30000,
  });

  // 3. Erlaubte Aktionen aus DB laden
  const { data: moduleActions = {} } = useQuery({
    queryKey: ['module-actions', effectiveRole],
    queryFn: async (): Promise<ModuleActions> => {
      if (!effectiveRole) return {};

      try {
        const { data, error } = await supabase
          .from('role_permission_matrix')
          .select('module_name, allowed_actions')
          .eq('role', effectiveRole);

        if (error) return {};

        return Object.fromEntries(
          data?.map(m => [m.module_name.toLowerCase(), m.allowed_actions || []]) || []
        );
      } catch (error) {
        return {};
      }
    },
    enabled: !!effectiveRole,
    staleTime: 30000,
  });

  /**
   * Findet den besten passenden Basis-Pfad für Unterseiten (Prefix-Matching)
   */
  const findBasePath = (path: string): string | null => {
    // Exakter Match zuerst
    if (PATH_TO_MODULE[path]) {
      return path;
    }
    
    // Longest-prefix-match: Finde den längsten Key, für den gilt: path.startsWith(key + '/')
    const sortedKeys = Object.keys(PATH_TO_MODULE)
      .filter(k => k !== '/' && path.startsWith(k + '/'))
      .sort((a, b) => b.length - a.length);
    
    if (sortedKeys.length > 0) {
      return sortedKeys[0];
    }
    
    // KEIN Fallback auf Root - unbekannte Pfade werden mit null zurückgegeben
    // Damit wird deny-by-default für alle unbekannten Pfade gewährleistet
    return null;
  };

  /**
   * Prüft ob ein Modul (via URL-Pfad) für den aktuellen Benutzer sichtbar ist
   */
  const isModuleVisible = (path: string): boolean => {
    // Nur SuperAdmin sieht immer alles
    if (effectiveRole === 'superadmin') {
      return true;
    }

    // Auth-Routen sind immer erlaubt
    if (path.startsWith('/auth')) {
      return true;
    }

    // Finde den besten passenden Basis-Pfad (für Unterseiten wie /projects/new)
    const basePath = findBasePath(path);
    
    if (!basePath) {
      // Unbekannte Pfade: Deny-by-default
      console.warn(`useSidebarPermissions: Unbekannter Pfad "${path}" - Deny-by-default.`);
      return false;
    }

    // Finde die möglichen Modul-Namen für diesen Basis-Pfad
    const moduleNames = PATH_TO_MODULE[basePath];
    
    if (!moduleNames) {
      return false;
    }

    // Prüfe ob mindestens einer der Modul-Namen in der DB als sichtbar markiert ist
    for (const moduleName of moduleNames) {
      const normalizedName = moduleName.toLowerCase();
      
      // Wenn explizit false gesetzt, nicht sichtbar
      if (moduleVisibility[normalizedName] === false) {
        return false;
      }
      
      // Wenn explizit true gesetzt, sichtbar
      if (moduleVisibility[normalizedName] === true) {
        return true;
      }
    }

    // Fallback: Wenn kein Eintrag in DB, Standard-Sichtbarkeit basierend auf Rolle
    return getDefaultVisibility(basePath, effectiveRole);
  };

  /**
   * Prüft ob eine bestimmte Aktion für ein Modul erlaubt ist
   * WICHTIG: Deny-by-default für unbekannte Pfade
   */
  const hasModuleAction = (path: string, action: string): boolean => {
    if (effectiveRole === 'superadmin') {
      return true;
    }

    // Finde den besten passenden Basis-Pfad (wie bei isModuleVisible)
    const basePath = findBasePath(path);
    
    // DENY-BY-DEFAULT: Unbekannte Pfade sind nicht erlaubt
    if (!basePath) {
      console.warn(`hasModuleAction: Unbekannter Pfad "${path}" - Deny-by-default.`);
      return false;
    }

    const moduleNames = PATH_TO_MODULE[basePath];
    if (!moduleNames) return false;

    // Normalisiere die Action für konsistente Prüfung
    const normalizedAction = normalizeActionKey(action);

    for (const moduleName of moduleNames) {
      const normalizedModuleName = normalizeModuleKey(moduleName);
      const actions = moduleActions[normalizedModuleName];
      
      if (actions) {
        // Prüfe ob die normalisierte Action in den erlaubten Actions ist
        const hasAction = actions.some(a => normalizeActionKey(a) === normalizedAction);
        if (hasAction) {
          return true;
        }
      }
    }

    return false;
  };

  return {
    isModuleVisible,
    hasModuleAction,
    moduleVisibility,
    moduleActions,
    effectiveRole,
    loading: roleLoading || visibilityLoading,
  };
};

/**
 * Default-Sichtbarkeit wenn kein DB-Eintrag vorhanden
 * (80/20 Regel: Sensible Module versteckt für niedrigere Rollen)
 */
function getDefaultVisibility(path: string, role: EffectiveRole | undefined): boolean {
  if (!role) return false;
  
  // Module die standardmäßig nur für höhere Rollen sichtbar sind
  const restrictedPaths = [
    '/employees',
    '/payroll',
    '/recruiting',
    '/onboarding',
    '/workflow',
    '/workforce-planning',
    '/hr/organization-design',
    '/compliance',
    '/budget',
    '/reports',
  ];

  // HR Admin sieht fast alles außer workflow und budget
  if (role === 'hr_admin') {
    return !(['/workflow'].includes(path));
  }

  // Teamleiter sieht eingeschränkt
  if (role === 'team_lead') {
    const teamleadHidden = [
      '/payroll',
      '/recruiting',
      '/onboarding',
      '/workflow',
      '/workforce-planning',
      '/hr/organization-design',
      '/compliance',
      '/budget',
    ];
    return !teamleadHidden.includes(path);
  }

  // Mitarbeiter sehen eingeschränkt
  if (role === 'employee') {
    return !restrictedPaths.includes(path);
  }

  return true;
}
