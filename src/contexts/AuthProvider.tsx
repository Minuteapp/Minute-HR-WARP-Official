import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthMethods } from '@/hooks/useAuthMethods';
import { AuthContextType, AuthUser, UserRole } from '@/types/auth.types';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Create context with undefined initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const { login, signUp: authSignUp, logout, resetPassword: resetPasswordMethod } = useAuthMethods();
  
  // CRITICAL FIX: Verhindert doppelte State-Updates
  const isInitializedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  // Berechne isAuthenticated basierend auf user
  const isAuthenticated = !!user;

  // Map methods to the expected interface
  const signIn = async (email: string, password: string): Promise<void> => {
    await login(email, password);
  };

  const signUp = async (email: string, password: string, role?: string, companyId?: string): Promise<void> => {
    // Stelle sicher, dass eine gültige Standardrolle verwendet wird
    const validRole = role || 'employee';
    console.log(`AuthProvider signUp mit Rolle: ${validRole} und Firmen-ID: ${companyId || 'keine'}`);
    await authSignUp(email, password, validRole, companyId);
  };

  const signOut = async (): Promise<void> => {
    await logout();
  };

  const resetPassword = async (email: string): Promise<void> => {
    await resetPasswordMethod(email);
  };

  useEffect(() => {
    console.log("AuthProvider initialisiert");
    
    // CRITICAL FIX: Setup auth listener BEFORE getting initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth-Status geändert:", event, currentSession?.user?.email || 'kein Benutzer');
      
      // CRITICAL FIX: Prüfe ob Session-ID sich wirklich geändert hat (für alle Events)
      const newSessionId = currentSession?.access_token || null;
      if (newSessionId === sessionIdRef.current && isInitializedRef.current) {
        console.log('⏭️ Duplicate session update ignored');
        return;
      }
      
      sessionIdRef.current = newSessionId;
      
      if (event === 'SIGNED_IN' && !currentSession?.user) {
        console.warn("⚠️ SIGNED_IN Event aber kein Benutzer in der Session!");
      }
      
      if (event === 'SIGNED_OUT' && currentSession?.user) {
        console.warn("⚠️ SIGNED_OUT Event aber Benutzer noch in der Session!");
      }
    
      setSession(currentSession);
      
      if (currentSession?.user) {
        const userMetadata = currentSession.user.user_metadata || {};
        const roleFromMetadata = userMetadata.role;
        const companyIdFromMetadata = userMetadata.company_id;
        
        // Hole Rolle aus user_roles Tabelle falls nicht in Metadata
        let roleFromDB: string | null = null;
        if (!roleFromMetadata) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentSession.user.id)
            .maybeSingle();
          roleFromDB = roleData?.role || null;
        }
          
        // Sicherstellen, dass die Rolle gültig ist
        const validRoles: UserRole[] = ['employee', 'admin', 'superadmin', 'moderator'];
        const detectedRole = roleFromMetadata || roleFromDB || 'employee';
        const role = validRoles.includes(detectedRole as UserRole) 
          ? detectedRole as UserRole 
          : 'employee';
        
        console.log('🔑 Auth: Rolle erkannt:', role, '(Metadata:', roleFromMetadata, ', DB:', roleFromDB, ')');
        
        setUser({ 
          ...currentSession.user, 
          role,
          company_id: companyIdFromMetadata 
        });
        
        if (event === 'SIGNED_IN') {
          console.log("🎉 AuthProvider: SIGNED_IN Event - Benutzer erfolgreich angemeldet");
          toast.success("Erfolgreich angemeldet");
        }
      } else {
        setUser(null);
        
        if (event === 'SIGNED_OUT') {
          console.log("👋 AuthProvider: SIGNED_OUT Event - Benutzer abgemeldet");
          toast.success("Erfolgreich abgemeldet");
        }
      }
      
      // CRITICAL FIX: Loading immer auf false setzen nach jedem Auth-Event
      setLoading(false);
      isInitializedRef.current = true;
    });
    
    // CRITICAL FIX: Get initial session AFTER setting up listener
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Fehler beim Abrufen der Sitzung:", error);
          setLoading(false);
          isInitializedRef.current = true;
          return;
        }
        
        console.log("Initiale Sitzungsdaten:", currentSession);
        
        // CRITICAL FIX: Setze Session-ID
        sessionIdRef.current = currentSession?.access_token || null;
        
        setSession(currentSession);
        
        // Wenn Benutzer in der Sitzung vorhanden ist, holen wir die Rolle aus den Metadaten oder DB
        if (currentSession?.user) {
          const userMetadata = currentSession.user.user_metadata || {};
          const roleFromMetadata = userMetadata.role;
          const companyIdFromMetadata = userMetadata.company_id;
          
          // Hole Rolle aus user_roles Tabelle falls nicht in Metadata
          let roleFromDB: string | null = null;
          if (!roleFromMetadata) {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentSession.user.id)
              .maybeSingle();
            roleFromDB = roleData?.role || null;
          }
          
          // Sicherstellen, dass die Rolle gültig ist
          const validRoles: UserRole[] = ['employee', 'admin', 'superadmin', 'moderator'];
          const detectedRole = roleFromMetadata || roleFromDB || 'employee';
          const role = validRoles.includes(detectedRole as UserRole) 
            ? detectedRole as UserRole 
            : 'employee';
          
          setUser({ 
            ...currentSession.user, 
            role,
            company_id: companyIdFromMetadata 
          });
          
          console.log("🔑 Initiale Rolle erkannt:", role, "(Metadata:", roleFromMetadata, ", DB:", roleFromDB, ")");
          console.log("✅ AuthProvider: Benutzer erfolgreich authentifiziert und Zustand gesetzt");
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der initialen Sitzung:", error);
        toast.error("Fehler beim Laden der Benutzersitzung");
      } finally {
        setLoading(false);
        isInitializedRef.current = true;
      }
    };
    
    getInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      session,
      isAuthenticated,
      signIn, 
      signUp, 
      signOut,
      resetPassword,
      setSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook für die Verwendung des Auth-Kontexts
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth muss innerhalb eines AuthProviders verwendet werden');
  }
  return context;
}
