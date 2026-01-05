import { ReactNode, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PolicyEnforcementGuard from './PolicyEnforcementGuard';
import PolicyStatusIndicator from './PolicyStatusIndicator';
import { usePolicySync } from '@/hooks/system/usePolicySync';
import { usePolicyEnforcement } from '@/hooks/system/usePolicyEnforcement';

interface PolicyAwareComponentProps {
  moduleName: string;
  requiredActions?: string[];
  context?: Record<string, any>;
  children: ReactNode;
  showStatus?: boolean;
  showRefresh?: boolean;
  fallback?: ReactNode;
}

const PolicyAwareComponent = ({
  moduleName,
  requiredActions = ['access'],
  context = {},
  children,
  showStatus = true,
  showRefresh = false,
  fallback
}: PolicyAwareComponentProps) => {
  const [lastPolicyUpdate, setLastPolicyUpdate] = useState<Date>(new Date());
  const [policiesChanged, setPoliciesChanged] = useState(false);
  const { enforcePolicies } = usePolicyEnforcement();

  // Set up policy sync for this module
  usePolicySync({
    modules: [moduleName],
    onPolicyChange: (event) => {
      console.log(`Policy change detected for module ${moduleName}:`, event);
      setLastPolicyUpdate(new Date());
      setPoliciesChanged(true);
    }
  });

  const handleRefresh = () => {
    setPoliciesChanged(false);
    setLastPolicyUpdate(new Date());
    // Force re-render by updating key
    window.location.reload();
  };

  // Check if user has access to this module
  const [hasModuleAccess, setHasModuleAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await enforcePolicies(moduleName, 'access', context);
      setHasModuleAccess(hasAccess);
    };

    checkAccess();
  }, [moduleName, context, enforcePolicies, lastPolicyUpdate]);

  // Show loading state while checking access
  if (hasModuleAccess === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm text-muted-foreground">
          Überprüfe Modulberechtigungen...
        </span>
      </div>
    );
  }

  // If no module access, show fallback or access denied
  if (!hasModuleAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert className="border-red-200">
        <Shield className="h-4 w-4" />
        <AlertTitle>Modulzugriff verweigert</AlertTitle>
        <AlertDescription>
          Sie haben keine Berechtigung für das Modul "{moduleName}".
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Policy status and notifications */}
      {showStatus && (
        <div className="flex items-center justify-between">
          <PolicyStatusIndicator 
            moduleName={moduleName} 
            showDetails={false}
            compact={true}
          />
          
          {(showRefresh || policiesChanged) && (
            <div className="flex items-center gap-2">
              {policiesChanged && (
                <Alert className="py-2 px-3">
                  <AlertDescription className="text-xs">
                    Sicherheitsrichtlinien wurden aktualisiert
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Aktualisieren
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Guard each required action */}
      {requiredActions.reduce((guardedChildren, action, index) => (
        <PolicyEnforcementGuard
          key={`${moduleName}-${action}-${index}`}
          moduleName={moduleName}
          action={action}
          context={context}
          showReason={index === 0} // Only show reason for first guard
          fallback={index === 0 ? fallback : undefined}
        >
          {guardedChildren}
        </PolicyEnforcementGuard>
      ), children)}
    </div>
  );
};

export default PolicyAwareComponent;