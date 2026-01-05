import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Eye, Database, AlertTriangle } from "lucide-react";

interface DataPolicySetting {
  id: string;
  dataCategory: string;
  description: string;
  optInRequired: boolean;
  retentionPeriod: number;
  sensitivityLevel: 'low' | 'medium' | 'high' | 'critical';
  aiTrainingAllowed: boolean;
  anonymizationRequired: boolean;
}

interface DataPolicySettingsProps {
  policies: DataPolicySetting[];
  onUpdatePolicy: (policyId: string, updates: Partial<DataPolicySetting>) => void;
}

const sensitivityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const sensitivityLabels = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
  critical: 'Kritisch'
};

export function DataPolicySettings({ policies, onUpdatePolicy }: DataPolicySettingsProps) {
  const criticalPolicies = policies.filter(p => p.sensitivityLevel === 'critical');
  const hasCriticalDataWithoutOptIn = criticalPolicies.some(p => !p.optInRequired);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Datenschutz & KI-Datennutzung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasCriticalDataWithoutOptIn && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warnung: Kritische Daten ohne explizite Einwilligung gefunden. 
              Dies könnte DSGVO-Compliance-Probleme verursachen.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {policies.map((policy) => (
            <div key={policy.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{policy.dataCategory}</h4>
                    <Badge className={sensitivityColors[policy.sensitivityLevel]}>
                      {sensitivityLabels[policy.sensitivityLevel]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{policy.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4" />
                      Opt-in erforderlich
                    </Label>
                    <Switch
                      checked={policy.optInRequired}
                      onCheckedChange={(checked) => 
                        onUpdatePolicy(policy.id, { optInRequired: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-sm">
                      <Database className="h-4 w-4" />
                      KI-Training erlaubt
                    </Label>
                    <Switch
                      checked={policy.aiTrainingAllowed}
                      onCheckedChange={(checked) => 
                        onUpdatePolicy(policy.id, { aiTrainingAllowed: checked })
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4" />
                      Anonymisierung erforderlich
                    </Label>
                    <Switch
                      checked={policy.anonymizationRequired}
                      onCheckedChange={(checked) => 
                        onUpdatePolicy(policy.id, { anonymizationRequired: checked })
                      }
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Aufbewahrungsdauer</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{policy.retentionPeriod} Monate</span>
                      <Badge variant="outline" className="text-xs">
                        {policy.retentionPeriod >= 36 ? 'Lang' : policy.retentionPeriod >= 12 ? 'Standard' : 'Kurz'}
                      </Badge>
                    </div>
                  </div>
                  
                  {policy.sensitivityLevel === 'critical' && !policy.optInRequired && (
                    <Alert>
                      <AlertTriangle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        Kritische Daten sollten Opt-in erfordern
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>DSGVO-Status: {policy.optInRequired ? '✓ Konform' : '⚠ Prüfung erforderlich'}</span>
                  <span>Letzte Änderung: Heute</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {policies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Datenschutzrichtlinien konfiguriert</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}