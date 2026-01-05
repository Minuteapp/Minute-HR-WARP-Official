import { useState, useEffect } from 'react';
import { Role, Module, RolePermission } from '@/components/settings/users/types';

// Modul Zeiterfassung mit Submodulen (Menüpunkte)
const mockModules: Module[] = [
  {
    id: 'time-tracking',
    name: 'Zeiterfassung',
    description: 'Modul zur Erfassung und Verwaltung von Arbeitszeiten',
    submodules: [
      { id: 'my-time', name: 'Meine Zeit', description: 'Eigene Zeiteinträge erfassen und verwalten' },
      { id: 'team', name: 'Team', description: 'Team-Übersicht und Zeiteinträge des Teams' },
      { id: 'exceptions', name: 'Ausnahmen', description: 'Ausnahmen und Sonderregelungen verwalten' },
      { id: 'approvals', name: 'Genehmigungen', description: 'Genehmigungsworkflows und Freigaben' },
      { id: 'analytics', name: 'Analysen', description: 'Berichte und Auswertungen' }
    ]
  }
];

// 4 Rollen für Modul Zeiterfassung
const mockRoles: Role[] = [
  {
    id: 'employee',
    name: 'Mitarbeiter',
    description: 'Standard-Mitarbeiterrolle',
    permissions: [
      { moduleId: 'time-tracking', submoduleId: 'my-time', canView: true, canCreate: true, canEdit: true, canDelete: false }
    ]
  },
  {
    id: 'team-leader',
    name: 'Teamleiter',
    description: 'Teamleiter mit erweiterten Berechtigungen',
    permissions: [
      { moduleId: 'time-tracking', submoduleId: 'my-time', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { moduleId: 'time-tracking', submoduleId: 'team', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { moduleId: 'time-tracking', submoduleId: 'exceptions', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { moduleId: 'time-tracking', submoduleId: 'approvals', canView: true, canCreate: false, canEdit: true, canDelete: false, canApprove: true },
      { moduleId: 'time-tracking', submoduleId: 'analytics', canView: true, canCreate: false, canEdit: false, canDelete: false, canExport: true }
    ]
  },
  {
    id: 'hr-admin',
    name: 'HR Admin',
    description: 'HR-Administrator mit umfassenden Berechtigungen',
    permissions: [
      { moduleId: 'time-tracking', submoduleId: 'my-time', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { moduleId: 'time-tracking', submoduleId: 'team', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { moduleId: 'time-tracking', submoduleId: 'exceptions', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { moduleId: 'time-tracking', submoduleId: 'approvals', canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
      { moduleId: 'time-tracking', submoduleId: 'analytics', canView: true, canCreate: true, canEdit: true, canDelete: false, canExport: true }
    ]
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Vollzugriff auf alle Funktionen',
    permissions: [
      { moduleId: 'time-tracking', submoduleId: 'my-time', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { moduleId: 'time-tracking', submoduleId: 'team', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { moduleId: 'time-tracking', submoduleId: 'exceptions', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { moduleId: 'time-tracking', submoduleId: 'approvals', canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true },
      { moduleId: 'time-tracking', submoduleId: 'analytics', canView: true, canCreate: true, canEdit: true, canDelete: true, canExport: true }
    ]
  }
];

export function useRoleMatrix() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Daten laden
  useEffect(() => {
    console.log("Loading role matrix data");
    const fetchData = async () => {
      try {
        // In einer echten Anwendung würden wir hier einen API-Aufruf machen
        // Für die Entwicklung verwenden wir Mock-Daten
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulation der Netzwerklatenz
        
        setRoles(mockRoles);
        setModules(mockModules);
        setIsLoading(false);
      } catch (err) {
        console.error('Fehler beim Laden der Rollenmatrix:', err);
        setError(err instanceof Error ? err : new Error('Unbekannter Fehler beim Laden der Rollenmatrix'));
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Funktion zum Aktualisieren einer Berechtigung
  const updatePermission = (
    roleId: string,
    moduleId: string,
    permissionType: keyof Omit<RolePermission, 'moduleId'>,
    value: boolean
  ) => {
    console.log(`Updating permission for role ${roleId}, module ${moduleId}, permission ${String(permissionType)} to ${value}`);
    setRoles(prevRoles => 
      prevRoles.map(role => {
        if (role.id !== roleId) return role;
        
        return {
          ...role,
          permissions: role.permissions.map(perm => {
            if (perm.moduleId !== moduleId) return perm;
            
            return {
              ...perm,
              [String(permissionType)]: value
            };
          })
        };
      })
    );
  };

  return {
    roles,
    modules,
    isLoading,
    error,
    updatePermission
  };
}