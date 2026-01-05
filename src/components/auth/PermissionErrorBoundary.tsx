import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Mail, ShieldX, HelpCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FallbackAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
}

interface PermissionErrorBoundaryProps {
  requiredPermission?: string;
  requiredRole?: string;
  children: React.ReactNode;
  fallbackActions?: FallbackAction[];
  customMessage?: string;
  showRequestAccess?: boolean;
  onRequestAccess?: () => void;
}

export const PermissionErrorBoundary: React.FC<PermissionErrorBoundaryProps> = ({
  requiredPermission,
  requiredRole,
  children,
  fallbackActions = [],
  customMessage,
  showRequestAccess = true,
  onRequestAccess,
}) => {
  const navigate = useNavigate();
  const { hasPermission, isAdmin, isSuperAdmin } = useRolePermissions();
  const { user, loading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setIsLoadingRole(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
        setUserRole(data?.role || null);
      } catch (err) {
        console.error('Error fetching user role:', err);
      }
      setIsLoadingRole(false);
    };
    fetchUserRole();
  }, [user]);

  // Check role-based access
  const hasRequiredRole = requiredRole 
    ? userRole === requiredRole || isAdmin || isSuperAdmin 
    : true;
  
  // Check permission-based access  
  const hasRequiredPermission = requiredPermission ? hasPermission(requiredPermission) : true;

  const hasAccess = hasRequiredRole && hasRequiredPermission;

  // Show loading state
  if (loading || isLoadingRole) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // User has access - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access - show error boundary
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleRequestAccess = () => {
    if (onRequestAccess) {
      onRequestAccess();
    } else {
      // Default: Show toast with instructions
      toast.info('Zugriff angefordert', {
        description: 'Ihr Administrator wurde benachrichtigt. Sie erhalten eine E-Mail, sobald der Zugriff gewährt wurde.',
      });
    }
  };

  const handleContactSupport = () => {
    // Open mail client with pre-filled support request
    const subject = encodeURIComponent('Zugriffsanfrage: ' + (requiredPermission || requiredRole || 'Unbekannte Berechtigung'));
    const body = encodeURIComponent(`Hallo,

ich benötige Zugriff auf folgende Funktion:
- Berechtigung: ${requiredPermission || 'N/A'}
- Rolle: ${requiredRole || 'N/A'}

Meine aktuelle Rolle: ${userRole || 'Nicht zugewiesen'}

Bitte gewähren Sie mir den entsprechenden Zugriff.

Mit freundlichen Grüßen`);
    
    window.location.href = `mailto:admin@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <Card className="max-w-lg mx-auto mt-8 border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
          <ShieldX className="h-7 w-7 text-amber-600 dark:text-amber-400" />
        </div>
        <CardTitle className="text-xl text-amber-800 dark:text-amber-200">
          Zugriff eingeschränkt
        </CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-300">
          {customMessage || 'Sie haben nicht die erforderlichen Berechtigungen für diese Funktion.'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Permission Details */}
        <div className="rounded-lg bg-amber-100/50 dark:bg-amber-900/30 p-4 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              {requiredPermission && (
                <p className="text-amber-800 dark:text-amber-200">
                  <span className="font-medium">Erforderliche Berechtigung:</span>{' '}
                  <code className="bg-amber-200/50 dark:bg-amber-800/50 px-1.5 py-0.5 rounded text-xs">
                    {requiredPermission}
                  </code>
                </p>
              )}
              {requiredRole && (
                <p className="text-amber-800 dark:text-amber-200">
                  <span className="font-medium">Erforderliche Rolle:</span>{' '}
                  <code className="bg-amber-200/50 dark:bg-amber-800/50 px-1.5 py-0.5 rounded text-xs">
                    {requiredRole}
                  </code>
                </p>
              )}
              <p className="text-amber-700 dark:text-amber-300">
                <span className="font-medium">Ihre aktuelle Rolle:</span>{' '}
                <code className="bg-amber-200/50 dark:bg-amber-800/50 px-1.5 py-0.5 rounded text-xs">
                  {userRole || 'Nicht zugewiesen'}
                </code>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {/* Custom fallback actions */}
          {fallbackActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.onClick}
              className="w-full"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}

          {/* Request Access Button */}
          {showRequestAccess && (
            <Button
              variant="default"
              onClick={handleRequestAccess}
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Zugriff beim Admin anfragen
            </Button>
          )}

          {/* Contact Support */}
          <Button
            variant="outline"
            onClick={handleContactSupport}
            className="w-full"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Support kontaktieren
          </Button>

          {/* Go Back Button */}
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur vorherigen Seite
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-center text-muted-foreground pt-2">
          Wenn Sie glauben, dass dies ein Fehler ist, kontaktieren Sie bitte Ihren Administrator.
        </p>
      </CardContent>
    </Card>
  );
};

// ============================================
// HOC for wrapping components with permission check
// ============================================

export function withPermissionCheck<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission?: string,
  requiredRole?: string
) {
  return function WithPermissionCheckWrapper(props: P) {
    return (
      <PermissionErrorBoundary
        requiredPermission={requiredPermission}
        requiredRole={requiredRole}
      >
        <WrappedComponent {...props} />
      </PermissionErrorBoundary>
    );
  };
}

export default PermissionErrorBoundary;
