import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { extractTenantFromUrl, isSuperAdminDomain } from '@/utils/tenant';
import { getTenantClaimsFromJWT } from '@/utils/jwtParser';

interface TenantCompany {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  brand_font: string;
  is_active: boolean;
}

interface TenantContextType {
  tenantSlug: string | null;
  tenantCompany: TenantCompany | null;
  isSuperAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  // Neue JWT-basierte Properties
  jwtCompanyId: string | null;
  jwtUserRole: string | null;
  isUsingJWTClaims: boolean;
  refetchTenant: () => void;
  // Phase 4: Für Impersonation-Refresh
  refreshAfterImpersonation: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Default-Werte für den Fallback (falls Provider fehlt, z.B. während Hot Reload)
const defaultTenantValue: TenantContextType = {
  tenantSlug: null,
  tenantCompany: null,
  isSuperAdmin: false,
  isLoading: true,
  error: null,
  jwtCompanyId: null,
  jwtUserRole: null,
  isUsingJWTClaims: false,
  refetchTenant: () => {},
  refreshAfterImpersonation: async () => {}
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  
  // Fallback für Hot Reload oder wenn Provider fehlt
  if (context === undefined) {
    console.warn('useTenant: Provider not found, using default values');
    return defaultTenantValue;
  }
  
  return context;
};

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🏗️ TenantProvider wird gemountet!');
  
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [tenantCompany, setTenantCompany] = useState<TenantCompany | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Neue JWT-basierte States
  const [jwtCompanyId, setJwtCompanyId] = useState<string | null>(null);
  const [jwtUserRole, setJwtUserRole] = useState<string | null>(null);
  const [isUsingJWTClaims, setIsUsingJWTClaims] = useState(false);

  const fetchTenantCompany = async (slug: string) => {
    try {
      setError(null);
      console.log('🔍 Fetching tenant company for slug:', slug);
      
      // Erst mit Slug versuchen, dann mit Name als Fallback
      let { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle(); // Verwende maybeSingle statt single

      // Fallback: Suche nach Name wenn kein Slug gefunden
      if (!company && companyError?.code === 'PGRST116') {
        console.log('🔄 Fallback: Searching by company name');
        const { data: companyByName, error: nameError } = await supabase
          .from('companies')
          .select('*')
          .ilike('name', `%${slug}%`)
          .eq('is_active', true)
          .maybeSingle();
        
        company = companyByName;
        companyError = nameError;
      }

      if (companyError) {
        console.error('❌ Tenant company error:', companyError);
        setError(`Firma "${slug}" nicht gefunden oder inaktiv`);
        return;
      }

      if (!company) {
        console.warn('⚠️ No company found for slug:', slug);
        setError(`Firma "${slug}" nicht gefunden`);
        return;
      }

      console.log('✅ Company found:', company);
      setTenantCompany({
        id: company.id,
        name: company.name,
        slug: company.slug || slug,
        logo_url: company.logo_url,
        primary_color: company.primary_color || '#3B82F6',
        secondary_color: company.secondary_color || '#1E40AF',
        brand_font: company.brand_font || 'Inter',
        is_active: company.is_active
      });

      // Setze CSS-Variablen für das firmenspezifische Theme
      const root = document.documentElement;
      root.style.setProperty('--company-primary', company.primary_color || '#3B82F6');
      root.style.setProperty('--company-secondary', company.secondary_color || '#1E40AF');
      root.style.setProperty('--company-font', company.brand_font || 'Inter');
      
      // Titel der Seite anpassen
      document.title = `${company.name} - HR Portal`;
      
      // Setze Tenant-Session in der Datenbank für RLS-Policies (optional)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Versuche tenant session zu setzen, aber ignoriere Fehler um die App funktionsfähig zu halten
          const { error: sessionError } = await supabase
            .from('user_tenant_sessions')
            .upsert({
              user_id: user.id,
              tenant_company_id: company.id,
              is_tenant_mode: true,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
          
          if (sessionError) {
            console.warn('⚠️ Could not set tenant session (table may not exist):', sessionError);
          } else {
            console.log('🔐 Tenant session set for company:', company.id);
          }
        }
      } catch (sessionError) {
        console.warn('⚠️ Could not set tenant session context (ignoring error):', sessionError);
        // Fehler ignorieren - die App soll auch ohne tenant sessions funktionieren
      }
      
      console.log('🎨 Theme updated for company:', company.name);
    } catch (error) {
      console.error('💥 Error fetching tenant company:', error);
      setError('Fehler beim Laden der Firmendaten');
    }
  };

  const initializeTenant = async () => {
    console.log('🚀 initializeTenant START');
    setIsLoading(true);
    
    const extractedSlug = extractTenantFromUrl();
    const isSuper = isSuperAdminDomain();
    
    console.log('🔍 Tenant initialization:', { extractedSlug, isSuper, hostname: window.location.hostname });
    
    // CRITICAL FIX: Warte auf Auth-Session bevor Tenant-Queries ausgeführt werden
    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (!authSession) {
      console.log('⚠️ No auth session yet, skipping tenant resolution');
      setIsLoading(false);
      setIsSuperAdmin(false);
      setTenantCompany(null);
      return;
    }
    console.log('✅ Auth session available:', authSession.user?.id);
    
    // PHASE 2: JWT-Claims auslesen (Primäre Quelle)
    let jwtClaims: { companyId: string | null; userRole: string | null; isSuperAdmin: boolean } = {
      companyId: null,
      userRole: null,
      isSuperAdmin: false
    };
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        const claims = getTenantClaimsFromJWT(session.access_token);
        jwtClaims = {
          companyId: claims.companyId,
          userRole: claims.userRole,
          isSuperAdmin: claims.isSuperAdmin
        };
        
        // Setze JWT-basierte States
        setJwtCompanyId(claims.companyId);
        setJwtUserRole(claims.userRole);
        
        console.log('🔑 JWT Claims extracted:', jwtClaims);
        
        // Wenn JWT company_id hat, nutze diese als primäre Quelle
        if (claims.companyId) {
          setIsUsingJWTClaims(true);
          console.log('✅ Using JWT-based company_id:', claims.companyId);
        }
      }
    } catch (jwtError) {
      console.warn('⚠️ Could not extract JWT claims:', jwtError);
    }
    
    // FALLBACK: Database-Session für SuperAdmin Impersonation
    let databaseTenantCompanyId: string | null = null;
    let userIsSuperAdmin = jwtClaims.isSuperAdmin;
    let dbIsSuperAdmin = false;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // CRITICAL FIX: IMMER DB auf SuperAdmin-Rolle prüfen (nicht nur wenn JWT keine Rolle hat)
        // Das überschreibt ggf. eine falsche JWT company_id
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'superadmin')
          .maybeSingle();
        
        dbIsSuperAdmin = !!userRole;
        userIsSuperAdmin = jwtClaims.isSuperAdmin || dbIsSuperAdmin;
        console.log('🔐 User superadmin status:', { jwtClaims: jwtClaims.isSuperAdmin, dbIsSuperAdmin, final: userIsSuperAdmin });
        
        // SuperAdmin Impersonation: Immer DB prüfen (JWT hat keine company_id für SuperAdmins)
        if (userIsSuperAdmin) {
          // 1. PRIORITÄT: Prüfe auf aktive IMPERSONATION-Session
          const { data: impersonationSession } = await supabase
            .from('impersonation_sessions')
            .select('target_tenant_id, target_user_id, status')
            .eq('superadmin_id', user.id)
            .eq('status', 'active')
            .maybeSingle();
          
          if (impersonationSession?.target_tenant_id) {
            databaseTenantCompanyId = impersonationSession.target_tenant_id;
            console.log('🔐 Found active IMPERSONATION session:', databaseTenantCompanyId);
          }
          
          // 2. FALLBACK: Prüfe Tenant-Session (manueller "In Firma tunneln")
          if (!databaseTenantCompanyId) {
            console.log('🔍 Checking user_tenant_sessions for user:', user.id);
            const { data: tenantSession, error: tenantSessionError } = await supabase
              .from('user_tenant_sessions')
              .select('tenant_company_id, is_tenant_mode')
              .eq('user_id', user.id)
              .eq('is_tenant_mode', true)
              .maybeSingle();
            
            if (tenantSessionError) {
              console.error('❌ Error fetching tenant session:', tenantSessionError);
            }
            
            console.log('🔍 Tenant session result:', tenantSession);
            
            if (tenantSession?.tenant_company_id) {
              databaseTenantCompanyId = tenantSession.tenant_company_id;
              console.log('🔐 Found active database tenant session:', databaseTenantCompanyId);
            }
          }
          
          // 3. FALLBACK: Eigene Firma des Superadmins aus user_roles (Standardfirma)
          if (!databaseTenantCompanyId) {
            const { data: ownCompanyRole } = await supabase
              .from('user_roles')
              .select('company_id')
              .eq('user_id', user.id)
              .not('company_id', 'is', null)
              .limit(1)
              .maybeSingle();
            
            if (ownCompanyRole?.company_id) {
              databaseTenantCompanyId = ownCompanyRole.company_id;
              console.log('🔐 Found superadmin own company (default):', databaseTenantCompanyId);
            }
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not check user role or tenant session:', error);
    }
    
    setTenantSlug(extractedSlug);
    
    // CRITICAL FIX: SuperAdmin ignoriert JWT company_id - nur Impersonation/Tunnel-Sessions zählen
    // Für normale User: JWT > DB-Session
    const effectiveCompanyId = userIsSuperAdmin 
      ? databaseTenantCompanyId  // SuperAdmin: NUR aus Impersonation/Tunnel
      : (jwtClaims.companyId || databaseTenantCompanyId);  // Normale User: JWT hat Priorität
    
    // CRITICAL FIX: Wenn SuperAdmin im Tunnel-Modus ist, UI auf Mitarbeiter-Ansicht umschalten
    const effectiveIsSuperAdmin = userIsSuperAdmin && !effectiveCompanyId;
    setIsSuperAdmin(effectiveIsSuperAdmin);
    
    console.log('🔐 Tenant resolution:', { 
      jwtCompanyId: jwtClaims.companyId,
      databaseTenantCompanyId,
      effectiveCompanyId,
      userIsSuperAdmin,
      effectiveIsSuperAdmin,
      isUsingJWT: !!jwtClaims.companyId
    });
    
    // Priorität: JWT/Database-Session > URL-Parameter > Super-Admin
    if (effectiveCompanyId) {
      console.log('Loading tenant company from:', jwtClaims.companyId ? 'JWT' : 'database session', effectiveCompanyId);
      try {
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', effectiveCompanyId)
          .eq('is_active', true)
          .single();

        if (companyError || !company) {
          console.error('❌ Tenant company not found:', companyError);
          setError(`Firma nicht gefunden`);
        } else {
          console.log('✅ Company found:', company);
          setTenantCompany({
            id: company.id,
            name: company.name,
            slug: company.slug || 'jwt-session',
            logo_url: company.logo_url,
            primary_color: company.primary_color || '#3B82F6',
            secondary_color: company.secondary_color || '#1E40AF',
            brand_font: company.brand_font || 'Inter',
            is_active: company.is_active
          });

          // Setze CSS-Variablen für das firmenspezifische Theme
          const root = document.documentElement;
          root.style.setProperty('--company-primary', company.primary_color || '#3B82F6');
          root.style.setProperty('--company-secondary', company.secondary_color || '#1E40AF');
          root.style.setProperty('--company-font', company.brand_font || 'Inter');
          
          // Titel der Seite anpassen
          document.title = `${company.name} - HR Portal`;
          setError(null);
        }
      } catch (error) {
        console.error('💥 Error loading company:', error);
        setError('Fehler beim Laden der Firmendaten');
      }
    } else if (extractedSlug && !isSuper) {
      console.log('Loading tenant company for URL slug:', extractedSlug);
      await fetchTenantCompany(extractedSlug);
    } else if (isSuper) {
      console.log('Setting up Super-Admin environment');
      // Super-Admin Bereich - MINUTE Branding
      document.title = 'MINUTE - Admin Portal';
      const root = document.documentElement;
      root.style.setProperty('--company-primary', '#3B82F6');
      root.style.setProperty('--company-secondary', '#1E40AF');
      root.style.setProperty('--company-font', 'Inter');
      // Explizit alle Tenant-Daten zurücksetzen
      setTenantCompany(null);
      setError(null);
    } else {
      // Kein Tenant und kein Super-Admin → Fallback auf Super-Admin
      console.log('No tenant detected, falling back to Super-Admin');
      setIsSuperAdmin(true);
      setTenantCompany(null);
      setError(null);
      document.title = 'MINUTE - Admin Portal';
    }
    
    setIsLoading(false);
    console.log('✅ initializeTenant COMPLETE:', { 
      userIsSuperAdmin, 
      effectiveCompanyId,
      isUsingJWT: !!jwtClaims.companyId,
      tenantCompany: tenantCompany?.name 
    });
  };

  const refetchTenant = () => {
    initializeTenant();
  };

  /**
   * Phase 4: Refresh nach Impersonation-Start/Ende
   * Wartet kurz auf DB-Commit und lädt dann den Tenant-Context neu
   */
  const refreshAfterImpersonation = async () => {
    console.log('🔄 Refreshing tenant context after impersonation change...');
    
    // Kurze Pause um sicherzustellen, dass DB-Transaktion committed ist
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Tenant-Context neu laden
    await initializeTenant();
    
    console.log('✅ Tenant context refreshed after impersonation');
  };

  useEffect(() => {
    console.log('🎯 TenantProvider useEffect TRIGGERED');
    initializeTenant();
    
    // Auth-State-Listener: Bei Login/Logout Tenant-Context neu laden
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 TenantContext: Auth state changed:', event);
        
        // Bei Login oder Token-Refresh: Tenant neu laden
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('🔄 Re-initializing tenant after auth change...');
          setIsLoading(true); // WICHTIG: Loading-State zurücksetzen
          // setTimeout um Supabase-Deadlock zu vermeiden
          setTimeout(() => {
            initializeTenant();
          }, 0);
        }
        
        // Bei Logout: Tenant zurücksetzen
        if (event === 'SIGNED_OUT') {
          console.log('🔄 Resetting tenant after logout...');
          setTenantCompany(null);
          setJwtCompanyId(null);
          setJwtUserRole(null);
          setIsUsingJWTClaims(false);
          setIsSuperAdmin(false);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  console.log('🎨 TenantProvider RENDER:', { 
    isSuperAdmin, 
    isLoading, 
    error,
    jwtCompanyId,
    jwtUserRole,
    isUsingJWTClaims,
    tenantCompany: tenantCompany?.name 
  });

  return (
    <TenantContext.Provider value={{
      tenantSlug,
      tenantCompany,
      isSuperAdmin,
      isLoading,
      error,
      jwtCompanyId,
      jwtUserRole,
      isUsingJWTClaims,
      refetchTenant,
      refreshAfterImpersonation
    }}>
      {children}
    </TenantContext.Provider>
  );
};