
import { UserRole } from '@/types/auth.types';

/**
 * Validiert die Benutzerrolle
 * @param role Die zu validierende Rolle
 * @returns Gültige Rolle oder Standardrolle
 */
export const validateRole = (role?: string): UserRole => {
  if (!role) return 'employee';
  
  // Gültige Rollen gemäß UserRole-Typ
  const validRoles: UserRole[] = ['employee', 'admin', 'superadmin', 'moderator'];
  
  // Prüfe, ob die angegebene Rolle gültig ist
  if (validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }
  
  // Standardmäßig 'employee', wenn ungültig
  console.warn(`Ungültige Rolle: ${role}. Fallback auf 'employee'.`);
  return 'employee';
};

/**
 * Validiert eine UUID
 * @param uuid Die zu validierende UUID
 * @returns Boolean, ob die UUID gültig ist
 */
export const isValidUUID = (uuid?: string): boolean => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
