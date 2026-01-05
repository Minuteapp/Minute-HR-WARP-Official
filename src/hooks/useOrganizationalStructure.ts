import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type {
  OrganizationalUnit,
  OrganizationalRole,
  OrganizationalConfig,
  CreateOrganizationalUnitData,
  UpdateOrganizationalUnitData,
  CreateOrganizationalRoleData,
  UpdateOrganizationalRoleData,
  OrganizationalHierarchy
} from '@/types/organizational-structure';

export const useOrganizationalStructure = () => {
  const [units, setUnits] = useState<OrganizationalUnit[]>([]);
  const [roles, setRoles] = useState<OrganizationalRole[]>([]);
  const [config, setConfig] = useState<OrganizationalConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Organisationseinheiten laden
  const fetchUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('organizational_units')
        .select('*')
        .order('level', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setUnits(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Organisationseinheiten:', error);
      toast({
        title: 'Fehler',
        description: 'Organisationseinheiten konnten nicht geladen werden.',
        variant: 'destructive',
      });
    }
  };

  // Organisationsrollen laden
  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('organizational_roles')
        .select(`
          *,
          organizational_unit:organizational_units(name, type, code)
        `)
        .eq('is_active', true);

      if (error) throw error;
      setRoles(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Organisationsrollen:', error);
      toast({
        title: 'Fehler',
        description: 'Organisationsrollen konnten nicht geladen werden.',
        variant: 'destructive',
      });
    }
  };

  // Konfiguration laden
  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('organizational_config')
        .select('*')
        .order('config_key');

      if (error) throw error;
      setConfig(data || []);
    } catch (error) {
      console.error('Fehler beim Laden der Konfiguration:', error);
      toast({
        title: 'Fehler',
        description: 'Konfiguration konnte nicht geladen werden.',
        variant: 'destructive',
      });
    }
  };

  // Hierarchie aufbauen
  const buildHierarchy = (units: OrganizationalUnit[]): OrganizationalHierarchy[] => {
    const unitMap = new Map<string, OrganizationalUnit>();
    const rootUnits: OrganizationalUnit[] = [];

    // Map für schnellen Zugriff erstellen
    units.forEach(unit => {
      unitMap.set(unit.id, { ...unit, children: [] });
    });

    // Hierarchie aufbauen
    units.forEach(unit => {
      if (unit.parent_id) {
        const parent = unitMap.get(unit.parent_id);
        const child = unitMap.get(unit.id);
        if (parent && child) {
          parent.children = parent.children || [];
          parent.children.push(child);
        }
      } else {
        const rootUnit = unitMap.get(unit.id);
        if (rootUnit) {
          rootUnits.push(rootUnit);
        }
      }
    });

    // In Hierarchie-Format konvertieren
    const convertToHierarchy = (unit: OrganizationalUnit, depth = 0): OrganizationalHierarchy => ({
      unit,
      children: (unit.children || []).map(child => convertToHierarchy(child, depth + 1)),
      depth,
      hasChildren: (unit.children || []).length > 0,
      isExpanded: depth < 2 // Standard: erste zwei Ebenen aufgeklappt
    });

    return rootUnits.map(unit => convertToHierarchy(unit));
  };

  // Organisationseinheit erstellen
  const createUnit = async (data: CreateOrganizationalUnitData): Promise<OrganizationalUnit | null> => {
    try {
      const { data: newUnit, error } = await supabase
        .from('organizational_units')
        .insert([{
          ...data,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchUnits();
      toast({
        title: 'Erfolg',
        description: `Organisationseinheit "${data.name}" wurde erstellt.`,
      });

      return newUnit;
    } catch (error) {
      console.error('Fehler beim Erstellen der Organisationseinheit:', error);
      toast({
        title: 'Fehler',
        description: 'Organisationseinheit konnte nicht erstellt werden.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Organisationseinheit aktualisieren
  const updateUnit = async (data: UpdateOrganizationalUnitData): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organizational_units')
        .update({
          ...data,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', data.id);

      if (error) throw error;

      await fetchUnits();
      toast({
        title: 'Erfolg',
        description: 'Organisationseinheit wurde aktualisiert.',
      });

      return true;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Organisationseinheit:', error);
      toast({
        title: 'Fehler',
        description: 'Organisationseinheit konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Organisationseinheit deaktivieren
  const deactivateUnit = async (unitId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organizational_units')
        .update({
          is_active: false,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', unitId);

      if (error) throw error;

      await fetchUnits();
      toast({
        title: 'Erfolg',
        description: 'Organisationseinheit wurde deaktiviert.',
      });

      return true;
    } catch (error) {
      console.error('Fehler beim Deaktivieren der Organisationseinheit:', error);
      toast({
        title: 'Fehler',
        description: 'Organisationseinheit konnte nicht deaktiviert werden.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Organisationsrolle erstellen
  const createRole = async (data: CreateOrganizationalRoleData): Promise<OrganizationalRole | null> => {
    try {
      const { data: newRole, error } = await supabase
        .from('organizational_roles')
        .insert([{
          ...data,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchRoles();
      toast({
        title: 'Erfolg',
        description: 'Organisationsrolle wurde zugewiesen.',
      });

      return newRole;
    } catch (error) {
      console.error('Fehler beim Erstellen der Organisationsrolle:', error);
      toast({
        title: 'Fehler',
        description: 'Organisationsrolle konnte nicht zugewiesen werden.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Organisationsrolle aktualisieren
  const updateRole = async (data: UpdateOrganizationalRoleData): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organizational_roles')
        .update(data)
        .eq('id', data.id);

      if (error) throw error;

      await fetchRoles();
      toast({
        title: 'Erfolg',
        description: 'Organisationsrolle wurde aktualisiert.',
      });

      return true;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Organisationsrolle:', error);
      toast({
        title: 'Fehler',
        description: 'Organisationsrolle konnte nicht aktualisiert werden.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Organisationsrolle deaktivieren
  const deactivateRole = async (roleId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organizational_roles')
        .update({ is_active: false })
        .eq('id', roleId);

      if (error) throw error;

      await fetchRoles();
      toast({
        title: 'Erfolg',
        description: 'Organisationsrolle wurde entfernt.',
      });

      return true;
    } catch (error) {
      console.error('Fehler beim Deaktivieren der Organisationsrolle:', error);
      toast({
        title: 'Fehler',
        description: 'Organisationsrolle konnte nicht entfernt werden.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Daten laden
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUnits(), fetchRoles(), fetchConfig()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Realtime-Updates für Organisationseinheiten
  useEffect(() => {
    const channel = supabase
      .channel('organizational-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organizational_units'
        },
        () => fetchUnits()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'organizational_roles'
        },
        () => fetchRoles()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const hierarchy = buildHierarchy(units);

  return {
    units,
    roles,
    config,
    hierarchy,
    loading,
    createUnit,
    updateUnit,
    deactivateUnit,
    createRole,
    updateRole,
    deactivateRole,
    fetchUnits,
    fetchRoles,
    fetchConfig
  };
};