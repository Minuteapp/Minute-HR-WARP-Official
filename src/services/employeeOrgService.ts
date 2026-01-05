import { supabase } from "@/integrations/supabase/client";

export type OrganizationalRoleType = 'manager' | 'member' | 'deputy' | 'assistant' | 'viewer';

export interface OrganizationalUnitOption {
  id: string;
  name: string;
  type: string;
  parent_id: string | null;
  level: number;
}

export const employeeOrgService = {
  /**
   * Lädt alle verfügbaren Organisationseinheiten für Dropdown
   */
  async getAvailableUnits(companyId: string): Promise<OrganizationalUnitOption[]> {
    const { data, error } = await supabase
      .from('organizational_units')
      .select('id, name, type, parent_id, level')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Fehler beim Laden der Organisationseinheiten:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Verknüpft einen Mitarbeiter mit einer Organisationseinheit
   */
  async assignToUnit(
    employeeId: string,
    unitId: string,
    roleType: OrganizationalRoleType,
    companyId: string
  ): Promise<boolean> {
    try {
      // Prüfen ob bereits eine Rolle existiert
      const { data: existingRole } = await supabase
        .from('organizational_roles')
        .select('id')
        .eq('user_id', employeeId)
        .eq('organizational_unit_id', unitId)
        .maybeSingle();

      if (existingRole) {
        // Aktualisiere vorhandene Rolle
        const { error: updateError } = await supabase
          .from('organizational_roles')
          .update({
            role_type: roleType,
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRole.id);

        if (updateError) {
          console.error('Fehler beim Aktualisieren der Organisationsrolle:', updateError);
          return false;
        }
      } else {
        // Neue Rolle erstellen
        const { error: insertError } = await supabase
          .from('organizational_roles')
          .insert({
            user_id: employeeId,
            organizational_unit_id: unitId,
            role_type: roleType,
            company_id: companyId,
            is_active: true,
            valid_from: new Date().toISOString(),
            responsibilities: [],
            permissions: {}
          });

        if (insertError) {
          console.error('Fehler beim Erstellen der Organisationsrolle:', insertError);
          return false;
        }
      }

      // Bei Manager-Rolle: organizational_units.manager_id setzen
      if (roleType === 'manager') {
        await supabase
          .from('organizational_units')
          .update({ manager_id: employeeId })
          .eq('id', unitId);
      }

      return true;
    } catch (error) {
      console.error('Fehler bei der Organigramm-Verknüpfung:', error);
      return false;
    }
  },

  /**
   * Entfernt die Verknüpfung eines Mitarbeiters aus einer Organisationseinheit
   */
  async removeFromUnit(employeeId: string, unitId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('organizational_roles')
        .update({ is_active: false })
        .eq('user_id', employeeId)
        .eq('organizational_unit_id', unitId);

      if (error) {
        console.error('Fehler beim Entfernen der Organisationsrolle:', error);
        return false;
      }

      // Manager-ID entfernen falls dieser Mitarbeiter Manager war
      await supabase
        .from('organizational_units')
        .update({ manager_id: null })
        .eq('id', unitId)
        .eq('manager_id', employeeId);

      return true;
    } catch (error) {
      console.error('Fehler beim Entfernen aus dem Organigramm:', error);
      return false;
    }
  },

  /**
   * Holt die aktuelle Organisationsrolle eines Mitarbeiters
   */
  async getEmployeeRole(employeeId: string): Promise<{
    unitId: string;
    unitName: string;
    roleType: OrganizationalRoleType;
  } | null> {
    const { data, error } = await supabase
      .from('organizational_roles')
      .select(`
        organizational_unit_id,
        role_type,
        organizational_units (
          name
        )
      `)
      .eq('user_id', employeeId)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      unitId: data.organizational_unit_id,
      unitName: (data.organizational_units as any)?.name || '',
      roleType: data.role_type as OrganizationalRoleType
    };
  },

  /**
   * Migriert bestehende Mitarbeiter basierend auf dem department-Textfeld
   */
  async migrateExistingEmployees(companyId: string): Promise<{ migrated: number; failed: number }> {
    let migrated = 0;
    let failed = 0;

    try {
      // Alle Mitarbeiter ohne Organisationsrolle laden
      const { data: employees } = await supabase
        .from('employees')
        .select('id, department, position')
        .eq('company_id', companyId)
        .not('department', 'is', null);

      if (!employees || employees.length === 0) {
        return { migrated: 0, failed: 0 };
      }

      // Alle Organisationseinheiten laden
      const { data: units } = await supabase
        .from('organizational_units')
        .select('id, name')
        .eq('company_id', companyId)
        .eq('is_active', true);

      if (!units || units.length === 0) {
        return { migrated: 0, failed: employees.length };
      }

      // Vorhandene Rollen laden um Duplikate zu vermeiden
      const { data: existingRoles } = await supabase
        .from('organizational_roles')
        .select('user_id')
        .eq('company_id', companyId)
        .eq('is_active', true);

      const employeesWithRoles = new Set(existingRoles?.map(r => r.user_id) || []);

      for (const employee of employees) {
        // Überspringen wenn bereits verknüpft
        if (employeesWithRoles.has(employee.id)) {
          continue;
        }

        // Versuche passende Unit zu finden (case-insensitive)
        const matchingUnit = units.find(u => 
          u.name.toLowerCase() === employee.department?.toLowerCase()
        );

        if (matchingUnit) {
          // Rolle bestimmen basierend auf Position
          let roleType: OrganizationalRoleType = 'member';
          const positionLower = (employee.position || '').toLowerCase();
          
          if (positionLower.includes('leiter') || positionLower.includes('head') || positionLower.includes('manager')) {
            roleType = 'manager';
          } else if (positionLower.includes('stellv') || positionLower.includes('deputy')) {
            roleType = 'deputy';
          }

          const success = await this.assignToUnit(employee.id, matchingUnit.id, roleType, companyId);
          
          if (success) {
            migrated++;
          } else {
            failed++;
          }
        } else {
          failed++;
        }
      }

      return { migrated, failed };
    } catch (error) {
      console.error('Fehler bei der Migration:', error);
      return { migrated, failed };
    }
  }
};
