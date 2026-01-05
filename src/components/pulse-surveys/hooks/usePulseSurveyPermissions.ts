export type PulseSurveyRole = 'admin' | 'hr' | 'teamlead' | 'employee';

export interface PulseSurveyPermissions {
  canCreateSurveys: boolean;
  canEditSurveys: boolean;
  canDeleteSurveys: boolean;
  canViewAllResults: boolean;
  canViewTeamResults: boolean;
  canEditSettings: boolean;
  canCreateActions: boolean;
  canParticipate: boolean;
  canViewQuestions: boolean;
  canEditQuestions: boolean;
  canViewArchive: boolean;
  canViewPulse: boolean;
  visibleTabs: string[];
}

const TAB_CONFIG: Record<PulseSurveyRole, string[]> = {
  admin: [
    'overview',
    'surveys',
    'questions',
    'participation',
    'analysis',
    'actions',
    'pulse',
    'archive',
    'settings'
  ],
  hr: [
    'overview',
    'surveys',
    'questions',
    'participation',
    'analysis',
    'actions',
    'pulse',
    'archive',
    'settings'
  ],
  teamlead: [
    'overview',
    'surveys',
    'participation',
    'analysis',
    'actions'
  ],
  employee: [] // Mitarbeiter bekommen eine komplett andere Ansicht
};

export const usePulseSurveyPermissions = (role: PulseSurveyRole): PulseSurveyPermissions => {
  const isAdminOrHR = role === 'admin' || role === 'hr';
  const isTeamlead = role === 'teamlead';
  const isEmployee = role === 'employee';

  return {
    // Umfragen erstellen/bearbeiten/löschen
    canCreateSurveys: isAdminOrHR,
    canEditSurveys: isAdminOrHR,
    canDeleteSurveys: role === 'admin',
    
    // Ergebnisse ansehen
    canViewAllResults: isAdminOrHR,
    canViewTeamResults: isAdminOrHR || isTeamlead,
    
    // Einstellungen
    canEditSettings: isAdminOrHR,
    
    // Maßnahmen
    canCreateActions: isAdminOrHR || isTeamlead,
    
    // Teilnahme
    canParticipate: isTeamlead || isEmployee,
    
    // Fragen & Vorlagen
    canViewQuestions: isAdminOrHR,
    canEditQuestions: isAdminOrHR,
    
    // Archiv & Pulse
    canViewArchive: isAdminOrHR,
    canViewPulse: isAdminOrHR,
    
    // Sichtbare Tabs
    visibleTabs: TAB_CONFIG[role]
  };
};

export const getRoleLabel = (role: PulseSurveyRole): string => {
  const labels: Record<PulseSurveyRole, string> = {
    admin: 'Administrator',
    hr: 'HR Admin',
    teamlead: 'Teamleiter',
    employee: 'Mitarbeiter'
  };
  return labels[role];
};

export const getRoleColor = (role: PulseSurveyRole): string => {
  const colors: Record<PulseSurveyRole, string> = {
    admin: 'bg-red-500 hover:bg-red-600',
    hr: 'bg-purple-500 hover:bg-purple-600',
    teamlead: 'bg-blue-500 hover:bg-blue-600',
    employee: 'bg-green-500 hover:bg-green-600'
  };
  return colors[role];
};
