import { CalendarTab } from "@/components/CalendarModule";

export type CalendarUserRole = 
  | "superadmin"
  | "admin" 
  | "hr"
  | "hr_manager"
  | "manager" 
  | "employee"
  | "moderator";

export interface CalendarTabPermissions {
  [key: string]: CalendarTab[];
}

export const calendarTabPermissions: CalendarTabPermissions = {
  superadmin: [
    "my-appointments",
    "team-calendar",
    "company-calendar",
    "projects-roadmaps",
    "shift-planning",
    "absences-travel",
    "workflows-approvals",
    "ai-planning",
  ],
  admin: [
    "my-appointments",
    "team-calendar",
    "company-calendar",
    "projects-roadmaps",
    "shift-planning",
    "absences-travel",
    "workflows-approvals",
    "ai-planning",
  ],
  hr: [
    "my-appointments",
    "team-calendar",
    "company-calendar",
    "projects-roadmaps",
    "shift-planning",
    "absences-travel",
    "workflows-approvals",
  ],
  hr_manager: [
    "my-appointments",
    "team-calendar",
    "company-calendar",
    "projects-roadmaps",
    "shift-planning",
    "absences-travel",
    "workflows-approvals",
  ],
  manager: [
    "my-appointments",
    "team-calendar",
    "company-calendar",
    "projects-roadmaps",
    "absences-travel",
    "workflows-approvals",
  ],
  employee: [
    "my-appointments",
    "company-calendar",
    "projects-roadmaps",
    "absences-travel",
  ],
  moderator: [
    "my-appointments",
    "company-calendar",
    "projects-roadmaps",
    "absences-travel",
  ],
};

/**
 * Prüft ob ein Tab für eine bestimmte Rolle sichtbar ist
 */
export const isTabVisibleForRole = (
  tab: CalendarTab, 
  role: CalendarUserRole | string
): boolean => {
  const normalizedRole = role.toLowerCase() as CalendarUserRole;
  const allowedTabs = calendarTabPermissions[normalizedRole] || calendarTabPermissions.employee;
  return allowedTabs.includes(tab);
};

/**
 * Gibt alle sichtbaren Tabs für eine Rolle zurück
 */
export const getVisibleTabsForRole = (
  role: CalendarUserRole | string
): CalendarTab[] => {
  const normalizedRole = role.toLowerCase() as CalendarUserRole;
  return calendarTabPermissions[normalizedRole] || calendarTabPermissions.employee;
};
