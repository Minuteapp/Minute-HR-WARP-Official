import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Scale, Database, Trash2, Clock, FileText, AlertTriangle, MapPin } from 'lucide-react';

export const ComplianceLegalTab = () => {
  const [settings, setSettings] = useState({
    companySeatCountry: 'DE',
    defaultLaborLaw: 'DE',
    locationSpecificLaw: true,
    taxLogicPerCountry: true,
    timeTrackingLawPerCountry: true,
    gdprMode: true,
    gdprStrictMode: false,
    dataResidency: 'eu',
    dataResidencyStrict: false,
    anonymizationEnabled: true,
    anonymizationDelay: 365,
    pseudonymizationEnabled: true,
    pseudonymizationReports: true,
    retentionPeriodEmployee: 10,
    retentionPeriodApplicant: 6,
    retentionPeriodTimeTracking: 3,
    retentionPeriodPayroll: 10,
    retentionPeriodAudit: 10,
    deletionConceptEnabled: true,
    deletionAutomatic: false,
    deletionNotification: true,
    deletionApprovalRequired: true,
    rightToBeForgotten: true,
    dataPortability: true,
    consentManagement: true,
    cookieConsent: true,
    privacyImpactAssessment: false,
    dpoAssigned: false,
    dpoName: '',
    dpoEmail: '',
    auditTrailEnabled: true,
    auditTrailRetention: 5,
    complianceReporting: true,
    complianceAlerts: true,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const countries = [
    { code: 'DE', name: 'Deutschland' },
    { code: 'AT', name: 'Österreich' },
    { code: 'CH', name: 'Schweiz' },
    { code: 'FR', name: 'Frankreich' },
    { code: 'NL', name: 'Niederlande' },
    { code: 'PL', name: 'Polen' },
    { code: 'GB', name: 'Großbritannien' },
    { code: 'US', name: 'USA' },
  ];

  return (
    <div className="space-y-6">
      {/* Rechtliche Zuordnung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Rechtliche Zuordnung
          </CardTitle>
          <CardDescription>Sitzland und geltendes Recht</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sitzland des Unternehmens</Label>
              <Select value={settings.companySeatCountry} onValueChange={(v) => updateSetting('companySeatCountry', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Standard-Arbeitsrecht</Label>
              <Select value={settings.defaultLaborLaw} onValueChange={(v) => updateSetting('defaultLaborLaw', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Standortspezifisches Arbeitsrecht</Label>
                <p className="text-sm text-muted-foreground">Z.B. Firma in DE, Standort in AT → AT-Recht gilt</p>
              </div>
              <Switch 
                checked={settings.locationSpecificLaw}
                onCheckedChange={(checked) => updateSetting('locationSpecificLaw', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Steuerlogik je Land</Label>
                <p className="text-sm text-muted-foreground">Steuerliche Regelungen pro Standort</p>
              </div>
              <Switch 
                checked={settings.taxLogicPerCountry}
                onCheckedChange={(checked) => updateSetting('taxLogicPerCountry', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Zeiterfassungsregeln je Land</Label>
                <p className="text-sm text-muted-foreground">Lokale Arbeitszeitgesetze anwenden</p>
              </div>
              <Switch 
                checked={settings.timeTrackingLawPerCountry}
                onCheckedChange={(checked) => updateSetting('timeTrackingLawPerCountry', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datenschutz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Datenschutz (DSGVO)
          </CardTitle>
          <CardDescription>Datenschutzeinstellungen und -compliance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                DSGVO-Modus
                <Badge variant="secondary">Empfohlen</Badge>
              </Label>
              <p className="text-sm text-muted-foreground">Vollständige DSGVO-Compliance aktivieren</p>
            </div>
            <Switch 
              checked={settings.gdprMode}
              onCheckedChange={(checked) => updateSetting('gdprMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Strenger DSGVO-Modus</Label>
              <p className="text-sm text-muted-foreground">Zusätzliche Einschränkungen für maximalen Schutz</p>
            </div>
            <Switch 
              checked={settings.gdprStrictMode}
              onCheckedChange={(checked) => updateSetting('gdprStrictMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Datenresidenz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Datenresidenz
          </CardTitle>
          <CardDescription>Wo werden Daten gespeichert?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Datenstandort</Label>
            <Select value={settings.dataResidency} onValueChange={(v) => updateSetting('dataResidency', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eu">Europäische Union</SelectItem>
                <SelectItem value="de">Deutschland</SelectItem>
                <SelectItem value="ch">Schweiz</SelectItem>
                <SelectItem value="us">USA</SelectItem>
                <SelectItem value="global">Global (keine Einschränkung)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Strikte Datenresidenz</Label>
              <p className="text-sm text-muted-foreground">Keine Datenverarbeitung außerhalb der Region</p>
            </div>
            <Switch 
              checked={settings.dataResidencyStrict}
              onCheckedChange={(checked) => updateSetting('dataResidencyStrict', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Anonymisierung & Pseudonymisierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Anonymisierung & Pseudonymisierung
          </CardTitle>
          <CardDescription>Datenschutz durch Verschleierung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Anonymisierung aktivieren</Label>
              <p className="text-sm text-muted-foreground">Personenbezogene Daten anonymisieren</p>
            </div>
            <Switch 
              checked={settings.anonymizationEnabled}
              onCheckedChange={(checked) => updateSetting('anonymizationEnabled', checked)}
            />
          </div>

          {settings.anonymizationEnabled && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              <Label>Anonymisierung nach (Tage)</Label>
              <Input 
                type="number"
                value={settings.anonymizationDelay}
                onChange={(e) => updateSetting('anonymizationDelay', parseInt(e.target.value))}
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>Pseudonymisierung aktivieren</Label>
              <p className="text-sm text-muted-foreground">Personenbezug durch Pseudonyme ersetzen</p>
            </div>
            <Switch 
              checked={settings.pseudonymizationEnabled}
              onCheckedChange={(checked) => updateSetting('pseudonymizationEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Pseudonymisierte Berichte</Label>
              <p className="text-sm text-muted-foreground">Namen in Reports durch IDs ersetzen</p>
            </div>
            <Switch 
              checked={settings.pseudonymizationReports}
              onCheckedChange={(checked) => updateSetting('pseudonymizationReports', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Aufbewahrungsfristen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Aufbewahrungsfristen
          </CardTitle>
          <CardDescription>Wie lange werden Daten gespeichert?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mitarbeiterdaten (Jahre nach Austritt)</Label>
              <Input 
                type="number"
                value={settings.retentionPeriodEmployee}
                onChange={(e) => updateSetting('retentionPeriodEmployee', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Bewerberdaten (Monate)</Label>
              <Input 
                type="number"
                value={settings.retentionPeriodApplicant}
                onChange={(e) => updateSetting('retentionPeriodApplicant', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Zeiterfassung (Jahre)</Label>
              <Input 
                type="number"
                value={settings.retentionPeriodTimeTracking}
                onChange={(e) => updateSetting('retentionPeriodTimeTracking', parseInt(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Lohndaten (Jahre)</Label>
              <Input 
                type="number"
                value={settings.retentionPeriodPayroll}
                onChange={(e) => updateSetting('retentionPeriodPayroll', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Audit-Logs (Jahre)</Label>
            <Input 
              type="number"
              value={settings.retentionPeriodAudit}
              onChange={(e) => updateSetting('retentionPeriodAudit', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Löschkonzepte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Löschkonzepte
          </CardTitle>
          <CardDescription>Automatische Datenlöschung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Löschkonzept aktivieren</Label>
              <p className="text-sm text-muted-foreground">Automatische Löschung nach Ablauf der Frist</p>
            </div>
            <Switch 
              checked={settings.deletionConceptEnabled}
              onCheckedChange={(checked) => updateSetting('deletionConceptEnabled', checked)}
            />
          </div>

          {settings.deletionConceptEnabled && (
            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatische Löschung</Label>
                  <p className="text-sm text-muted-foreground">Ohne manuelle Bestätigung löschen</p>
                </div>
                <Switch 
                  checked={settings.deletionAutomatic}
                  onCheckedChange={(checked) => updateSetting('deletionAutomatic', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Löschbenachrichtigung</Label>
                  <p className="text-sm text-muted-foreground">Vor Löschung benachrichtigen</p>
                </div>
                <Switch 
                  checked={settings.deletionNotification}
                  onCheckedChange={(checked) => updateSetting('deletionNotification', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Genehmigung erforderlich</Label>
                  <p className="text-sm text-muted-foreground">Löschung muss genehmigt werden</p>
                </div>
                <Switch 
                  checked={settings.deletionApprovalRequired}
                  onCheckedChange={(checked) => updateSetting('deletionApprovalRequired', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Betroffenenrechte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Betroffenenrechte
          </CardTitle>
          <CardDescription>DSGVO-Rechte der Mitarbeiter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Recht auf Vergessenwerden</Label>
              <p className="text-sm text-muted-foreground">Self-Service Löschantrag ermöglichen</p>
            </div>
            <Switch 
              checked={settings.rightToBeForgotten}
              onCheckedChange={(checked) => updateSetting('rightToBeForgotten', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Datenportabilität</Label>
              <p className="text-sm text-muted-foreground">Export eigener Daten ermöglichen</p>
            </div>
            <Switch 
              checked={settings.dataPortability}
              onCheckedChange={(checked) => updateSetting('dataPortability', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Einwilligungsverwaltung</Label>
              <p className="text-sm text-muted-foreground">Consent-Management aktivieren</p>
            </div>
            <Switch 
              checked={settings.consentManagement}
              onCheckedChange={(checked) => updateSetting('consentManagement', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Cookie-Consent</Label>
              <p className="text-sm text-muted-foreground">Cookie-Banner anzeigen</p>
            </div>
            <Switch 
              checked={settings.cookieConsent}
              onCheckedChange={(checked) => updateSetting('cookieConsent', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Datenschutzbeauftragter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Datenschutzbeauftragter
          </CardTitle>
          <CardDescription>DSB-Einstellungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Datenschutzbeauftragter benannt</Label>
              <p className="text-sm text-muted-foreground">DSB-Pflicht erfüllt</p>
            </div>
            <Switch 
              checked={settings.dpoAssigned}
              onCheckedChange={(checked) => updateSetting('dpoAssigned', checked)}
            />
          </div>

          {settings.dpoAssigned && (
            <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label>Name des DSB</Label>
                <Input 
                  value={settings.dpoName}
                  onChange={(e) => updateSetting('dpoName', e.target.value)}
                  placeholder="Max Mustermann"
                />
              </div>
              <div className="space-y-2">
                <Label>E-Mail des DSB</Label>
                <Input 
                  value={settings.dpoEmail}
                  onChange={(e) => updateSetting('dpoEmail', e.target.value)}
                  placeholder="dsb@firma.de"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>Datenschutz-Folgenabschätzung</Label>
              <p className="text-sm text-muted-foreground">DSFA-Workflow aktivieren</p>
            </div>
            <Switch 
              checked={settings.privacyImpactAssessment}
              onCheckedChange={(checked) => updateSetting('privacyImpactAssessment', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceLegalTab;
