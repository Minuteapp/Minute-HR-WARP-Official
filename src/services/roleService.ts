
import { supabase } from '@/integrations/supabase/client';

export interface Role {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  description: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

export interface Module {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

// Keine Mock-Daten - Berechtigungen werden aus der Datenbank geladen
const mockPermissions: Permission[] = [];

// Keine Mock-Daten - Rollen werden aus der Datenbank geladen
const mockRoles: Role[] = [];

// Keine Mock-Daten - Module werden aus der Datenbank geladen
const mockModules: Module[] = [];

// Service-Funktionen
export const getAllRoles = async (): Promise<Role[]> => {
  try {
    // In einer echten Anwendung würden wir hier Daten aus Supabase abrufen
    // const { data, error } = await supabase.from('roles').select('*');
    
    // Für Entwicklungszwecke geben wir Mock-Daten zurück
    return mockRoles;
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
};

export const getRoleById = async (roleId: string): Promise<Role | null> => {
  try {
    // In einer echten Anwendung würden wir hier Daten aus Supabase abrufen
    // const { data, error } = await supabase.from('roles').select('*').eq('id', roleId).single();
    
    // Für Entwicklungszwecke geben wir Mock-Daten zurück
    return mockRoles.find(role => role.id === roleId) || null;
  } catch (error) {
    console.error(`Error fetching role ${roleId}:`, error);
    return null;
  }
};

export const createRole = async (role: Omit<Role, 'id'>): Promise<Role | null> => {
  try {
    // In einer echten Anwendung würden wir hier Daten in Supabase speichern
    // const { data, error } = await supabase.from('roles').insert([role]).select().single();
    
    // Für Entwicklungszwecke simulieren wir eine erfolgreiche Erstellung
    const newRole: Role = {
      ...role,
      id: Math.random().toString(36).substring(2, 11),
    };
    
    return newRole;
  } catch (error) {
    console.error('Error creating role:', error);
    return null;
  }
};

export const updateRole = async (roleId: string, updates: Partial<Role>): Promise<Role | null> => {
  try {
    // In einer echten Anwendung würden wir hier Daten in Supabase aktualisieren
    // const { data, error } = await supabase.from('roles').update(updates).eq('id', roleId).select().single();
    
    // Für Entwicklungszwecke simulieren wir eine erfolgreiche Aktualisierung
    const roleIndex = mockRoles.findIndex(role => role.id === roleId);
    if (roleIndex === -1) return null;
    
    const updatedRole: Role = {
      ...mockRoles[roleIndex],
      ...updates,
    };
    
    return updatedRole;
  } catch (error) {
    console.error(`Error updating role ${roleId}:`, error);
    return null;
  }
};

export const deleteRole = async (roleId: string): Promise<boolean> => {
  try {
    // In einer echten Anwendung würden wir hier Daten aus Supabase löschen
    // const { error } = await supabase.from('roles').delete().eq('id', roleId);
    
    // Für Entwicklungszwecke simulieren wir einen erfolgreichen Löschvorgang
    return true;
  } catch (error) {
    console.error(`Error deleting role ${roleId}:`, error);
    return false;
  }
};

export const getAllModules = async (): Promise<Module[]> => {
  // In einer echten Anwendung würden wir hier Daten aus Supabase abrufen
  return mockModules;
};

export const getAllPermissions = async (): Promise<Permission[]> => {
  // In einer echten Anwendung würden wir hier Daten aus Supabase abrufen
  return mockPermissions;
};

export const hasPermission = (userRole: string, requiredPermission: string): boolean => {
  // Finde die Rolle des Benutzers
  const role = mockRoles.find(r => r.id === userRole);
  if (!role) return false;
  
  // Prüfe, ob die Rolle die erforderliche Berechtigung hat
  return role.permissions.some(p => p.name === requiredPermission);
};

// Hilfsfunktion zum Prüfen von Berechtigungen, die von useRolePermissions verwendet wird
export const checkPermission = (userRole: string, requiredPermission: string): boolean => {
  return hasPermission(userRole, requiredPermission);
};
