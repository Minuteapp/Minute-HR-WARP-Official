// Utility-Funktionen für Multi-Tenant-Handling
export const extractTenantFromUrl = (): string | null => {
  const hostname = window.location.hostname;
  
  // Für lokale Entwicklung/lovable.app: Prüfe URL-Parameter
  if (hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('lovable') || hostname.includes('lovableproject.com')) {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get('tenant');
    if (tenantParam) {
      console.log('🏢 Tenant from URL parameter:', tenantParam);
      return tenantParam;
    }
    return null; // Super-Admin Bereich wenn kein tenant Parameter
  }
  
  // Subdomain-Erkennung: firma.minute.app
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[1] === 'minute') {
    return parts[0]; // Gibt 'hiprocall' von 'hiprocall.minute.app' zurück
  }
  
  // Für Produktions-Domains nur bekannte Patterns verwenden
  return null;
};

export const isSuperAdminDomain = (): boolean => {
  const hostname = window.location.hostname;
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  
  // Wenn wir einen tenant Parameter haben, sind wir nicht im Super-Admin Bereich
  if (tenantParam) {
    return false;
  }
  
  return hostname === 'localhost' || 
         hostname.includes('127.0.0.1') || 
         hostname.includes('lovable') || 
         hostname.includes('lovableproject.com') ||
         hostname === 'minute.app' ||
         hostname === 'admin.minute.app';
};

export const getTenantLoginUrl = (tenantSlug: string): string => {
  const protocol = window.location.protocol;
  return `${protocol}//${tenantSlug}.minute.app/login`;
};

export const getSuperAdminUrl = (): string => {
  const protocol = window.location.protocol;
  const host = window.location.host;
  
  // Für lokale Entwicklung/lovable.app - Basis-URL ohne tenant Parameter
  if (host.includes('lovable.app') || host.includes('localhost') || host.includes('lovableproject.com')) {
    // Entferne nur den tenant Parameter, behalte den Rest
    const url = new URL(window.location.href);
    url.searchParams.delete('tenant');
    url.pathname = '/admin';
    return url.toString();
  }
  
  // Für Produktion
  return `${protocol}//admin.minute.app`;
};