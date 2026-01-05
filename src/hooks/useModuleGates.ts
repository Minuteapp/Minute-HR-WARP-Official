import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  MODULE_REQUIREMENTS, 
  RequirementKey, 
  getRequirementLabels,
  getFirstSettingsPath
} from "@/config/moduleRequirements";

interface ModuleGateResult {
  isReady: boolean;
  isLoading: boolean;
  missingRequirements: string[];
  settingsPath: string;
  moduleName: string;
  moduleDescription: string;
}

/**
 * ZERO-DATA-START: Hook zur Prüfung ob ein Modul verwendbar ist
 * 
 * DEAKTIVIERT: Module sollen immer zugänglich sein und leere Zustände 
 * anzeigen statt "nicht konfiguriert" Sperren.
 * 
 * Module zeigen jetzt "Keine Daten vorhanden" wenn Tabellen leer sind,
 * anstatt den Zugang komplett zu blockieren.
 */
export function useModuleGates(moduleKey: string): ModuleGateResult {
  const moduleConfig = MODULE_REQUIREMENTS[moduleKey];

  // DEAKTIVIERT: Immer isReady: true zurückgeben
  // Module sollen zugänglich sein und Empty States zeigen
  return {
    isReady: true,
    isLoading: false,
    missingRequirements: [],
    settingsPath: moduleConfig?.settingsPath || '/settings',
    moduleName: moduleConfig?.name || 'Modul',
    moduleDescription: moduleConfig?.description || ''
  };
}

/**
 * Prüft ob Daten für eine bestimmte Anforderung existieren
 */
async function checkRequirement(requirement: RequirementKey): Promise<boolean> {
  try {
    switch (requirement) {
      case 'locations': {
        const { count } = await supabase
          .from('locations')
          .select('*', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      }

      case 'departments': {
        const { count } = await supabase
          .from('departments')
          .select('*', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      }

      case 'teams': {
        const { count } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      }

      case 'employees': {
        const { count } = await supabase
          .from('employees')
          .select('*', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      }

      case 'shift_models': {
        const { count } = await supabase
          .from('shift_models')
          .select('*', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      }

      case 'work_time_models': {
        const { count } = await supabase
          .from('work_time_models')
          .select('*', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      }

      case 'absence_types': {
        const { count } = await supabase
          .from('absence_types')
          .select('*', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      }

      case 'cost_centers': {
        const { count } = await supabase
          .from('cost_centers')
          .select('*', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      }

      case 'project_categories': {
        const { count } = await supabase
          .from('project_categories')
          .select('*', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      }

      case 'roles': {
        const { count } = await supabase
          .from('role_definitions')
          .select('*', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      }

      case 'workflows': {
        const { count } = await supabase
          .from('workflow_definitions')
          .select('*', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      }

      case 'compliance_rules': {
        const { count } = await supabase
          .from('compliance_rules')
          .select('*', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      }

      case 'skill_categories': {
        const { count } = await supabase
          .from('skill_categories')
          .select('*', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      }

      default:
        console.warn(`Unknown requirement: ${requirement}`);
        return true;
    }
  } catch (error) {
    console.error(`Error checking requirement ${requirement}:`, error);
    // Bei Fehler annehmen, dass die Anforderung erfüllt ist
    // um das Modul nicht unnötig zu sperren
    return true;
  }
}

/**
 * Hook für mehrere Module gleichzeitig prüfen (z.B. für Dashboard-Übersicht)
 */
export function useMultipleModuleGates(moduleKeys: string[]) {
  return useQuery({
    queryKey: ['module-gates-multiple', moduleKeys],
    queryFn: async () => {
      const results: Record<string, { isReady: boolean; missing: string[] }> = {};

      for (const key of moduleKeys) {
        const config = MODULE_REQUIREMENTS[key];
        if (!config || config.requires.length === 0) {
          results[key] = { isReady: true, missing: [] };
          continue;
        }

        const checks = await Promise.all(
          config.requires.map(async (requirement) => {
            const hasData = await checkRequirement(requirement);
            return { requirement, hasData };
          })
        );

        const missing = checks.filter(c => !c.hasData).map(c => c.requirement);
        results[key] = {
          isReady: missing.length === 0,
          missing: getRequirementLabels(missing as RequirementKey[])
        };
      }

      return results;
    },
    staleTime: 30000
  });
}
