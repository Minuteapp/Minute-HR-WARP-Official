import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOriginalRole } from '@/hooks/useOriginalRole';
import { useRef, useEffect } from 'react';

export const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading, session } = useAuth();
  const { isOriginalSuperAdmin, loading: roleLoading, originalRole } = useOriginalRole();
  const location = useLocation();
  const hasRedirectedRef = useRef(false);
  
  // Reset redirect flag when route changes
  useEffect(() => {
    hasRedirectedRef.current = false;
  }, [location.pathname]);

  console.log("=== SuperAdminRoute Debug (mit Original-Rolle) ===");
  console.log("User:", user?.email);
  console.log("User ID:", user?.id);
  console.log("Session vorhanden:", !!session);
  console.log("Auth Loading:", authLoading);
  console.log("Role Loading:", roleLoading);
  console.log("Original Role:", originalRole);
  console.log("isOriginalSuperAdmin:", isOriginalSuperAdmin);
  
  // KRITISCH: Warte auf Session UND Auth UND Rolle
  const loading = authLoading || roleLoading || !session;
  
  // When still loading, show a loading spinner
  if (loading) {
    console.log("SuperAdminRoute: Noch am Laden... (auth:", authLoading, ", role:", roleLoading, ", session:", !!session, ")");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user && !hasRedirectedRef.current) {
    console.log("SuperAdminRoute: Kein Benutzer, Weiterleitung zu Login");
    hasRedirectedRef.current = true;
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // Prevent multiple redirects
  if (!user && hasRedirectedRef.current) {
    console.log("SuperAdminRoute: Bereits weitergeleitet, return null");
    return null;
  }

  // KRITISCH: Nur echte SuperAdmins (basierend auf ORIGINALER Rolle) dürfen zugreifen
  // Role-Preview wird IGNORIERT für Admin-Modul Zugriff
  // Administrator, Manager, Mitarbeiter und HR-Manager dürfen NIEMALS zugreifen
  if (!isOriginalSuperAdmin) {
    console.log("🚫 SuperAdminRoute: Zugriff verweigert - Kein SuperAdmin");
    console.log("   Gefundene Original-Rolle:", originalRole);
    console.log("   Weiterleitung zu: /");
    return <Navigate to="/" replace />;
  }

  console.log("✅ SuperAdminRoute: Zugriff erlaubt für SuperAdmin (Original-Rolle:", originalRole, ")");
  
  // User is SuperAdmin, render the protected content
  return <>{children}</>;
};
