import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Zap
} from "lucide-react";
import PolicyManager from "@/components/system/PolicyManager";
import PolicyStatusIndicator from "@/components/system/PolicyStatusIndicator";
import { usePolicyEngine } from "@/hooks/system/usePolicyEngine";

const PolicyManagement = () => {
  const { policies, conflicts, loading, refetchPolicies } = usePolicyEngine();

  const activePolicies = policies.filter(p => p.is_active);
  const criticalConflicts = conflicts.filter(c => c.severity === 'critical');

  return (
    <div className="space-y-6">
      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Policies</p>
                <p className="text-2xl font-bold text-green-600">{activePolicies.length}</p>
              </div>
              <div className="rounded-full bg-green-100 p-2">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Policy-Konflikte</p>
                <p className={`text-2xl font-bold ${conflicts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {conflicts.length}
                </p>
              </div>
              <div className={`rounded-full p-2 ${conflicts.length > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                {conflicts.length > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Status</p>
                <p className={`text-sm font-medium ${criticalConflicts.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {criticalConflicts.length === 0 ? 'Stabil' : 'Kritische Probleme'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={refetchPolicies}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {criticalConflicts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Kritische Policy-Konflikte erkannt</AlertTitle>
          <AlertDescription className="text-red-700">
            {criticalConflicts.length} kritische Konflikte erfordern sofortige Aufmerksamkeit. 
            Diese können die Systemsicherheit und Funktionalität beeinträchtigen.
          </AlertDescription>
        </Alert>
      )}

      {/* Real-time Enforcement Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Echtzeit-Policy-Durchsetzung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Systemweite Überwachung</p>
                <p className="text-sm text-muted-foreground">
                  Alle Benutzeraktionen werden automatisch gegen aktive Policies geprüft.
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Aktiv
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Überwachte Module:</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Zeiterfassung', policies: activePolicies.filter(p => p.affected_modules.includes('timetracking')).length },
                    { name: 'Abwesenheiten', policies: activePolicies.filter(p => p.affected_modules.includes('absence')).length },
                    { name: 'Dokumente', policies: activePolicies.filter(p => p.affected_modules.includes('documents')).length },
                    { name: 'Sicherheit', policies: activePolicies.filter(p => p.affected_modules.includes('security')).length }
                  ].map((module) => (
                    <div key={module.name} className="flex items-center justify-between text-sm">
                      <span>{module.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {module.policies} Policies
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-sm">Durchsetzungsstatistiken:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Aktionen heute geprüft:</span>
                    <span className="font-mono">1,247</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blockierte Aktionen:</span>
                    <span className="font-mono text-red-600">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Erfolgsrate:</span>
                    <span className="font-mono text-green-600">98.1%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System-wide Policy Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Modulübergreifender Policy-Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PolicyStatusIndicator moduleName="timetracking" showDetails={true} />
            <PolicyStatusIndicator moduleName="absence" showDetails={true} />
            <PolicyStatusIndicator moduleName="documents" showDetails={true} />
            <PolicyStatusIndicator moduleName="security" showDetails={true} />
          </div>
        </CardContent>
      </Card>

      {/* Link to Full Policy Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Erweiterte Policy-Verwaltung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Verwalten Sie alle Systemrichtlinien, lösen Sie Konflikte und überwachen Sie die Durchsetzung.
              </p>
              <Button variant="outline" className="text-sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Policy Manager öffnen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Policy Manager Component */}
      <PolicyManager />
    </div>
  );
};

export default PolicyManagement;