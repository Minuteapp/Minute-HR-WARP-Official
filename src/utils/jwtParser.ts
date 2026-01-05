/**
 * JWT Parser Utilities für Tenant-Context
 * Liest company_id und user_role direkt aus dem JWT Token
 */

interface JWTClaims {
  company_id?: string;
  user_role?: string;
  sub?: string;
  email?: string;
  exp?: number;
  iat?: number;
}

/**
 * Dekodiert ein JWT Token ohne Signaturprüfung (Client-Side)
 * Die Signatur wird serverseitig von Supabase geprüft
 */
export const decodeJWT = (token: string): JWTClaims | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('⚠️ Invalid JWT format');
      return null;
    }
    
    // Dekodiere den Payload (Teil 2)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JWTClaims;
  } catch (error) {
    console.error('❌ JWT decode error:', error);
    return null;
  }
};

/**
 * Extrahiert company_id aus dem JWT Token
 */
export const getCompanyIdFromJWT = (token: string): string | null => {
  const claims = decodeJWT(token);
  return claims?.company_id || null;
};

/**
 * Extrahiert user_role aus dem JWT Token
 */
export const getUserRoleFromJWT = (token: string): string | null => {
  const claims = decodeJWT(token);
  return claims?.user_role || null;
};

/**
 * Prüft ob das JWT Token abgelaufen ist
 */
export const isJWTExpired = (token: string): boolean => {
  const claims = decodeJWT(token);
  if (!claims?.exp) return true;
  
  // exp ist in Sekunden, Date.now() in Millisekunden
  return claims.exp * 1000 < Date.now();
};

/**
 * Prüft ob der User laut JWT ein SuperAdmin ist
 */
export const isSuperAdminFromJWT = (token: string): boolean => {
  const claims = decodeJWT(token);
  return claims?.user_role === 'super_admin' || claims?.user_role === 'superadmin';
};

/**
 * Gibt alle relevanten Claims für den Tenant-Context zurück
 */
export const getTenantClaimsFromJWT = (token: string): {
  companyId: string | null;
  userRole: string | null;
  isSuperAdmin: boolean;
  isExpired: boolean;
} => {
  const claims = decodeJWT(token);
  
  if (!claims) {
    return {
      companyId: null,
      userRole: null,
      isSuperAdmin: false,
      isExpired: true
    };
  }
  
  const userRole = claims.user_role || null;
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'superadmin';
  const isExpired = claims.exp ? claims.exp * 1000 < Date.now() : true;
  
  return {
    companyId: claims.company_id || null,
    userRole,
    isSuperAdmin,
    isExpired
  };
};
