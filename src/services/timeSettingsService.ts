import { supabase } from '@/integrations/supabase/client';
import { TimePolicy, EntityReference } from '@/types/time-settings';

export interface DatabaseTimePolicy {
  id: string;
  name: string;
  typ: string;
  beschreibung: string | null;
  parameter: any;
  gueltig_ab: string;
  prioritaet: number;
  ist_aktiv: boolean;
  erstellt_von: string | null;
  [key: string]: any;
}

// Service für das Laden von Arbeitszeit-Richtlinien aus der Datenbank
export class TimeSettingsService {
  
  // Lade alle aktiven Richtlinien aus allen Tabellen
  static async loadAllPolicies(): Promise<TimePolicy[]> {
    const policies: TimePolicy[] = [];
    
    try {
      // Arbeitszeitmodelle laden
      const { data: arbeitszeitModelle } = await supabase
        .from('arbeitszeit_modelle')
        .select('*')
        .eq('ist_aktiv', true)
        .order('prioritaet', { ascending: false });
      
      if (arbeitszeitModelle) {
        policies.push(...arbeitszeitModelle.map(item => this.mapToTimePolicy(item, 'working_model')));
      }

      // Abwesenheitsarten laden
      const { data: abwesenheitsarten } = await supabase
        .from('abwesenheitsarten')
        .select('*')
        .eq('ist_aktiv', true)
        .order('prioritaet', { ascending: false });
      
      if (abwesenheitsarten) {
        policies.push(...abwesenheitsarten.map(item => this.mapToTimePolicy(item, 'absence_type')));
      }

      // Genehmigungsworkflows laden
      const { data: workflows } = await supabase
        .from('genehmigungsworkflows')
        .select('*')
        .eq('ist_aktiv', true)
        .order('prioritaet', { ascending: false });
      
      if (workflows) {
        policies.push(...workflows.map(item => this.mapToTimePolicy(item, 'approval_flow')));
      }

      // Pausenregelungen laden
      const { data: pausenregelungen } = await supabase
        .from('pausenregelungen')
        .select('*')
        .eq('ist_aktiv', true)
        .order('prioritaet', { ascending: false });
      
      if (pausenregelungen) {
        policies.push(...pausenregelungen.map(item => this.mapToTimePolicy(item, 'pause_rule')));
      }

      // Überstundenregelungen laden
      const { data: ueberstundenregelungen } = await supabase
        .from('ueberstundenregelungen')
        .select('*')
        .eq('ist_aktiv', true)
        .order('prioritaet', { ascending: false });
      
      if (ueberstundenregelungen) {
        policies.push(...ueberstundenregelungen.map(item => this.mapToTimePolicy(item, 'overtime_rule')));
      }

      // Feiertagsregelungen laden
      const { data: feiertagsregelungen } = await supabase
        .from('feiertagsregelungen')
        .select('*')
        .eq('ist_aktiv', true)
        .order('prioritaet', { ascending: false });
      
      if (feiertagsregelungen) {
        policies.push(...feiertagsregelungen.map(item => this.mapToTimePolicy(item, 'holiday_rule')));
      }

    } catch (error) {
      console.error('Fehler beim Laden der Richtlinien:', error);
      throw error;
    }

    return policies;
  }

  // Lade Organisationseinheiten (aus bestehenden Tabellen)
  static async loadOrganizationalEntities(): Promise<EntityReference[]> {
    const entities: EntityReference[] = [];
    
    try {
      // Unternehmen/Companies laden
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .eq('is_active', true);
      
      if (companies) {
        entities.push(...companies.map(company => ({
          id: company.id,
          type: 'company' as const,
          name: company.name
        })));
      }

      // Abteilungen aus employees laden (eindeutige Departments)
      const { data: departments } = await supabase
        .from('employees')
        .select('department')
        .not('department', 'is', null)
        .eq('status', 'active');
      
      if (departments) {
        const uniqueDepartments = [...new Set(departments.map(d => d.department).filter(Boolean))];
        entities.push(...uniqueDepartments.map((dept, index) => ({
          id: `dept-${index}`,
          type: 'department' as const,
          name: dept as string
        })));
      }

      // Teams aus employees laden (eindeutige Teams)
      const { data: teams } = await supabase
        .from('employees')
        .select('team')
        .not('team', 'is', null)
        .eq('status', 'active');
      
      if (teams) {
        const uniqueTeams = [...new Set(teams.map(t => t.team).filter(Boolean))];
        entities.push(...uniqueTeams.map((team, index) => ({
          id: `team-${index}`,
          type: 'team' as const,
          name: team as string
        })));
      }

    } catch (error) {
      console.error('Fehler beim Laden der Organisationseinheiten:', error);
      throw error;
    }

    return entities;
  }

  // Richtlinie einer Organisationseinheit zuweisen
  static async assignPolicyToEntity(
    policy: TimePolicy, 
    entity: EntityReference
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('organisationseinheit_zuweisungen')
        .insert({
          richtlinien_id: policy.id,
          richtlinien_typ: this.mapPolicyTypeToDb(policy.type),
          einheit_id: entity.id,
          einheit_typ: entity.type,
          einheit_name: entity.name,
          zugewiesen_von: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Fehler beim Zuweisen der Richtlinie:', error);
      throw error;
    }
  }

  // Hilfsmethode zum Mappen der DB-Daten zu TimePolicy
  private static mapToTimePolicy(item: DatabaseTimePolicy, type: TimePolicy['type']): TimePolicy {
    return {
      id: item.id,
      type,
      title: item.name,
      description: item.beschreibung || undefined,
      applicableTo: [], // Wird später geladen
      parameters: item.parameter || {},
      effectiveFrom: new Date(item.gueltig_ab),
      priority: item.prioritaet,
      createdBy: item.erstellt_von || 'system',
      isActive: item.ist_aktiv
    };
  }

  // Hilfsmethode zum Mappen der Policy-Typen zur Datenbank
  private static mapPolicyTypeToDb(type: TimePolicy['type']): string {
    const mapping = {
      'working_model': 'arbeitszeit_modell',
      'absence_type': 'abwesenheitsart',
      'approval_flow': 'genehmigungsworkflow',
      'pause_rule': 'pausenregelung',
      'overtime_rule': 'ueberstundenregelung',
      'holiday_rule': 'feiertagsregelung'
    };
    return mapping[type] || type;
  }
}