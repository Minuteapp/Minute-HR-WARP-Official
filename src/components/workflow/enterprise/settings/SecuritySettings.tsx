import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecuritySettingsProps {
  requireApprovalBeforeActivation: boolean;
  requireApprovalOnChange: boolean;
  fourEyesPrinciple: boolean;
  versioningEnabled: boolean;
  auditModules: string[];
  onSettingChange: (key: string, value: boolean) => void;
  onAuditModuleToggle: (module: string) => void;
}

const allModules = [
  { key: 'absence', label: 'Abwesenheit' },
  { key: 'sick_leave', label: 'Krankmeldungen' },
  { key: 'time_tracking', label: 'Zeiterfassung' },
  { key: 'payroll', label: 'Lohn & Gehalt' },
  { key: 'recruiting', label: 'Recruiting' },
  { key: 'onboarding', label: 'Onboarding' },
  { key: 'performance', label: 'Performance' },
  { key: 'expenses', label: 'Spesen' },
  { key: 'projects', label: 'Projekte' },
  { key: 'documents', label: 'Dokumente' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'workforce_planning', label: 'Workforce Planning' },
];

export const SecuritySettings = ({
  requireApprovalBeforeActivation,
  requireApprovalOnChange,
  fourEyesPrinciple,
  versioningEnabled,
  auditModules,
  onSettingChange,
  onAuditModuleToggle
}: SecuritySettingsProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Genehmigungs- und Sicherheitsregeln</CardTitle>
          <CardDescription>
            Kontrolliere, wie Workflows aktiviert und überwacht werden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="approval-activation" className="flex flex-col gap-0.5">
              <span>Manuelle Freigabe vor Aktivierung</span>
              <span className="text-xs text-muted-foreground font-normal">
                Workflows müssen vor der Aktivierung genehmigt werden
              </span>
            </Label>
            <Switch
              id="approval-activation"
              checked={requireApprovalBeforeActivation}
              onCheckedChange={(checked) => onSettingChange('require_approval_before_activation', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="approval-change" className="flex flex-col gap-0.5">
              <span>Freigabe bei Änderungen</span>
              <span className="text-xs text-muted-foreground font-normal">
                Änderungen an aktiven Workflows erfordern Genehmigung
              </span>
            </Label>
            <Switch
              id="approval-change"
              checked={requireApprovalOnChange}
              onCheckedChange={(checked) => onSettingChange('require_approval_on_change', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="four-eyes" className="flex flex-col gap-0.5">
              <span>4-Augen-Prinzip</span>
              <span className="text-xs text-muted-foreground font-normal">
                Kritische Workflows erfordern zwei Genehmiger
              </span>
            </Label>
            <Switch
              id="four-eyes"
              checked={fourEyesPrinciple}
              onCheckedChange={(checked) => onSettingChange('four_eyes_principle', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="versioning" className="flex flex-col gap-0.5">
              <span>Versionierung aktivieren</span>
              <span className="text-xs text-muted-foreground font-normal">
                Änderungshistorie für alle Workflows speichern
              </span>
            </Label>
            <Switch
              id="versioning"
              checked={versioningEnabled}
              onCheckedChange={(checked) => onSettingChange('versioning_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Auditpflicht für Module</CardTitle>
          <CardDescription>
            Wähle Module, für die Audit-Protokollierung erforderlich ist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allModules.map((module) => {
              const isSelected = auditModules.includes(module.key);
              return (
                <Badge
                  key={module.key}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'hover:bg-muted'
                  )}
                  onClick={() => onAuditModuleToggle(module.key)}
                >
                  {module.label}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-orange-800">Sicherheitshinweis</p>
          <p className="text-sm text-orange-700 mt-1">
            Workflows mit hohen Berechtigungen (z.B. Payroll, Compliance) sollten immer 
            4-Augen-Prinzip und Auditpflicht aktiviert haben.
          </p>
        </div>
      </div>
    </div>
  );
};
