import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrivacySettingsProps {
  gdprCompliant: boolean;
  piiMaskingEnabled: boolean;
  logEncryptionEnabled: boolean;
  logRetentionDays: number;
  logAccessRoles: string[];
  onSettingChange: (key: string, value: boolean | number) => void;
  onLogAccessRoleToggle: (role: string) => void;
}

const allRoles = [
  { key: 'superadmin', label: 'Superadmin' },
  { key: 'admin', label: 'Admin' },
  { key: 'hr_manager', label: 'HR-Manager' },
  { key: 'team_lead', label: 'Teamleiter' },
  { key: 'employee', label: 'Mitarbeiter' },
  { key: 'revisor', label: 'Revisor' },
];

export const PrivacySettings = ({
  gdprCompliant,
  piiMaskingEnabled,
  logEncryptionEnabled,
  logRetentionDays,
  logAccessRoles,
  onSettingChange,
  onLogAccessRoleToggle
}: PrivacySettingsProps) => {
  return (
    <div className="space-y-6">
      {/* GDPR Status Box */}
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">DSGVO-konform</p>
            <p className="text-sm text-green-700">
              Alle Workflows sind DSGVO-compliant konfiguriert
            </p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          Aktiv
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datenschutz-Einstellungen</CardTitle>
          <CardDescription>
            Konfiguriere Datenschutz- und Compliance-Einstellungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="pii-masking" className="flex flex-col gap-0.5">
              <span>PII-Maskierung aktivieren</span>
              <span className="text-xs text-muted-foreground font-normal">
                Personenbezogene Daten in Logs maskieren
              </span>
            </Label>
            <Switch
              id="pii-masking"
              checked={piiMaskingEnabled}
              onCheckedChange={(checked) => onSettingChange('pii_masking_enabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="log-encryption" className="flex flex-col gap-0.5">
              <span>Log-Verschlüsselung</span>
              <span className="text-xs text-muted-foreground font-normal">
                Workflow-Logs werden verschlüsselt gespeichert
              </span>
            </Label>
            <Switch
              id="log-encryption"
              checked={logEncryptionEnabled}
              onCheckedChange={(checked) => onSettingChange('log_encryption_enabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="flex flex-col gap-0.5">
              <span>Log-Aufbewahrungsfrist</span>
              <span className="text-xs text-muted-foreground font-normal">
                Wie lange werden Logs gespeichert
              </span>
            </Label>
            <Select
              value={logRetentionDays.toString()}
              onValueChange={(value) => onSettingChange('log_retention_days', parseInt(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90 Tage</SelectItem>
                <SelectItem value="180">180 Tage</SelectItem>
                <SelectItem value="365">365 Tage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Zugriff auf Logs</CardTitle>
          <CardDescription>
            Nur diese Rollen dürfen Workflow-Logs einsehen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {allRoles.map((role) => {
              const isSelected = logAccessRoles.includes(role.key);
              return (
                <Badge
                  key={role.key}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'hover:bg-muted'
                  )}
                  onClick={() => onLogAccessRoleToggle(role.key)}
                >
                  {role.label}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mandantentrennung Info Box */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start gap-3">
          <ClipboardList className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Mandantentrennung</p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Jeder Workflow ist exakt an eine tenant_id gebunden</li>
              <li>Keine Cross-Tenant-Ausführung möglich</li>
              <li>Logs sind mandantenspezifisch isoliert</li>
              <li>Integrationen sind pro Tenant konfiguriert</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
