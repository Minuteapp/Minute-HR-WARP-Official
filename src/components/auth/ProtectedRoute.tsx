import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRef, useEffect } from 'react';
import { useSidebarPermissions } from '@/hooks/useSidebarPermissions';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const hasRedirectedRef = useRef(false);
  const { isModuleVisible, loading: permissionsLoading, effectiveRole } = useSidebarPermissions();

  console.log("Protected route - user:", user, "loading:", loading);
  
  // Reset redirect flag when route changes
  useEffect(() => {
    hasRedirectedRef.current = false;
  }, [location.pathname]);

  // When still loading auth or permissions, show a loading spinner
  if (loading || (user && permissionsLoading)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login (only once per mount)
  if (!user && !hasRedirectedRef.current) {
    console.log("No user, redirecting to login");
    hasRedirectedRef.current = true;
    // Save the attempted url for redirecting after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  // Prevent multiple redirects
  if (!user && hasRedirectedRef.current) {
    return null;
  }

  // Modul-Berechtigungsprüfung (nach Auth-Check)
  if (user && !permissionsLoading) {
    const currentPath = location.pathname;
    
    // Prüfe ob der aktuelle Pfad erlaubt ist
    if (!isModuleVisible(currentPath)) {
      console.warn(`Zugriff verweigert auf "${currentPath}" für Rolle "${effectiveRole}"`);
      
      return (
        <div className="flex items-center justify-center h-screen bg-background">
          <Card className="max-w-md mx-4">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 rounded-full bg-destructive/10 mb-4">
                <ShieldX className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Zugriff verweigert</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Sie haben keine Berechtigung, auf diesen Bereich zuzugreifen.
              </p>
              <a 
                href="/" 
                className="text-primary hover:underline text-sm"
              >
                Zurück zum Dashboard
              </a>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // User is authenticated and has access, render the protected content
  return <>{children}</>;
};
