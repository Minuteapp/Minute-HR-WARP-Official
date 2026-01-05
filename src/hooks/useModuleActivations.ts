import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ModuleInfo {
  key: string;
  name: string;
  description: string;
  status: string;
  version: string;
  activations: number;
}

export interface TenantModuleActivation {
  id: string;
  name: string;
  activeModules: string[];
  availableModules: string[];
  limits: {
    projects: { used: number; max: number };
    surveys: { used: number; max: number };
  };
}

// Standard-Module der Plattform
const AVAILABLE_MODULES: ModuleInfo[] = [
  { key: 'workforce_planning', name: 'Workforce Planning', description: 'Schichtplanung, Zeiterfassung, Kapazitätsmanagement', status: 'Aktiv', version: 'v2.4.1', activations: 0 },
  { key: 'innovation_hub', name: 'Innovation Hub', description: 'Ideenmanagement, Innovationsprojekte, Gamification', status: 'Aktiv', version: 'v1.8.0', activations: 0 },
  { key: 'feedback_360', name: 'Feedback 360°', description: 'Mitarbeiterbewertungen, Peer-Feedback, Umfragen', status: 'Aktiv', version: 'v3.1.2', activations: 0 },
  { key: 'okr_manager', name: 'OKR Manager', description: 'Zielmanagement, KPI-Tracking, Strategiealignment', status: 'Beta', version: 'v0.9.5', activations: 0 },
  { key: 'event_manager', name: 'Event Manager', description: 'Firmenveranstaltungen, Buchungen, Kalendersync', status: 'Aktiv', version: 'v2.0.0', activations: 0 },
  { key: 'analytics_pro', name: 'Analytics Pro', description: 'Erweiterte Berichte, Predictive Analytics, Dashboards', status: 'Veraltet', version: 'v1.5.0', activations: 0 },
];

export const useModuleActivations = () => {
  return useQuery({
    queryKey: ['module-activations'],
    queryFn: async () => {
      // Hole alle Modul-Zuweisungen
      const { data: assignments, error: assignmentsError } = await supabase
        .from('company_module_assignments')
        .select(`
          company_id,
          module_key,
          is_active,
          companies(id, name)
        `)
        .eq('is_active', true);

      if (assignmentsError) throw assignmentsError;

      // Hole echte Projekt-Counts pro Company
      const { data: projectCounts } = await supabase
        .from('projects')
        .select('company_id');

      const projectsByCompany: Record<string, number> = {};
      (projectCounts || []).forEach(p => {
        if (p.company_id) {
          projectsByCompany[p.company_id] = (projectsByCompany[p.company_id] || 0) + 1;
        }
      });

      // Hole echte Survey-Counts pro Company
      const { data: surveyCounts } = await supabase
        .from('surveys')
        .select('company_id');

      const surveysByCompany: Record<string, number> = {};
      (surveyCounts || []).forEach(s => {
        if (s.company_id) {
          surveysByCompany[s.company_id] = (surveysByCompany[s.company_id] || 0) + 1;
        }
      });

      // Hole Limits aus company_subscriptions oder platform_settings
      const { data: subscriptions } = await supabase
        .from('company_subscriptions')
        .select('company_id, max_projects, max_surveys');

      const limitsByCompany: Record<string, { maxProjects: number; maxSurveys: number }> = {};
      (subscriptions || []).forEach(s => {
        if (s.company_id) {
          limitsByCompany[s.company_id] = {
            maxProjects: s.max_projects || 100,
            maxSurveys: s.max_surveys || 50
          };
        }
      });

      // Zähle Aktivierungen pro Modul
      const activationCounts: Record<string, number> = {};
      (assignments || []).forEach(a => {
        activationCounts[a.module_key] = (activationCounts[a.module_key] || 0) + 1;
      });

      const modules = AVAILABLE_MODULES.map(m => ({
        ...m,
        activations: activationCounts[m.key] || 0
      }));

      // Gruppiere nach Mandant mit echten Daten
      const tenantModules: Record<string, TenantModuleActivation> = {};
      (assignments || []).forEach(a => {
        const companyId = a.company_id;
        const companyName = (a.companies as any)?.name || 'Unbekannt';
        const limits = limitsByCompany[companyId] || { maxProjects: 100, maxSurveys: 50 };
        
        if (!tenantModules[companyId]) {
          tenantModules[companyId] = {
            id: companyId,
            name: companyName,
            activeModules: [],
            availableModules: AVAILABLE_MODULES.map(m => m.name),
            limits: {
              projects: { 
                used: projectsByCompany[companyId] || 0, 
                max: limits.maxProjects 
              },
              surveys: { 
                used: surveysByCompany[companyId] || 0, 
                max: limits.maxSurveys 
              }
            }
          };
        }
        
        const moduleName = AVAILABLE_MODULES.find(m => m.key === a.module_key)?.name || a.module_key;
        tenantModules[companyId].activeModules.push(moduleName);
        tenantModules[companyId].availableModules = tenantModules[companyId].availableModules.filter(
          m => m !== moduleName
        );
      });

      return {
        modules,
        tenantActivations: Object.values(tenantModules)
      };
    }
  });
};
