import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, Lock, Key } from 'lucide-react';
import { usePolicyEnforcement } from '@/hooks/system/usePolicyEnforcement';

interface PolicyEnforcementGuardProps {
  moduleName: string;
  action: string;
  context?: Record<string, any>;
  children: ReactNode;
  fallback?: ReactNode;
  showReason?: boolean;
}

const PolicyEnforcementGuard = ({
  moduleName,
  action,
  context = {},
  children,
  fallback,
  showReason = true
}: PolicyEnforcementGuardProps) => {
  const { usePolicyGuard } = usePolicyEnforcement();
  const { isAllowed, isLoading } = usePolicyGuard(moduleName, action, context);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">
              Überprüfe Berechtigungen...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Access denied
  if (!isAllowed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <Lock className="h-6 w-6 text-red-600" />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Zugriff verweigert
            </h3>
            
            {showReason && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Diese Aktion ist durch Sicherheitsrichtlinien blockiert.
                </p>
                
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Sicherheitsrichtlinie aktiv</AlertTitle>
                  <AlertDescription>
                    Modul: <span className="font-mono text-xs">{moduleName}</span><br />
                    Aktion: <span className="font-mono text-xs">{action}</span>
                  </AlertDescription>
                </Alert>
                
                {/* Hints for common issues */}
                {action.includes('mfa') && (
                  <Alert>
                    <Key className="h-4 w-4" />
                    <AlertTitle>Multi-Faktor-Authentifizierung erforderlich</AlertTitle>
                    <AlertDescription>
                      Bitte aktivieren Sie die Zwei-Faktor-Authentifizierung in Ihren Sicherheitseinstellungen.
                    </AlertDescription>
                  </Alert>
                )}
                
                {action.includes('qr') && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>QR-Code-Scan erforderlich</AlertTitle>
                    <AlertDescription>
                      Diese Aktion erfordert einen gültigen QR-Code-Scan.
                    </AlertDescription>
                  </Alert>
                )}
                
                {action.includes('location') && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Standortverifikation erforderlich</AlertTitle>
                    <AlertDescription>
                      Diese Aktion ist nur an genehmigten Standorten erlaubt.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Access granted - render children
  return <>{children}</>;
};

export default PolicyEnforcementGuard;