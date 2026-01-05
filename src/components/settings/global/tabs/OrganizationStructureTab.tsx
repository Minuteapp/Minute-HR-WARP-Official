import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Building, Network, Shield, Users, GitBranch, Settings } from 'lucide-react';

export const OrganizationStructureTab = () => {
  const [settings, setSettings] = useState({
    organizationModel: 'hierarchical',
    maxHierarchyLevels: 5,
    matrixStructureEnabled: false,
    holdingEnabled: false,
    companiesEnabled: true,
    locationsEnabled: true,
    departmentsEnabled: true,
    teamsEnabled: true,
    costCentersEnabled: true,
    projectTeamsEnabled: false,
    locationAutonomy: 'partial',
    subsidiaryFullAutonomy: false,
    governanceRulesOverride: 'manager',
    governanceAIControl: 'admin',
    governanceReportExport: 'teamlead',
    governanceDataAggregation: 'hr',
    inheritanceDirection: 'topdown',
    inheritanceOverrideAllowed: true,
    inheritanceAuditTrail: true,
    showInheritanceIndicator: true,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Organisationsmodell */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organisationsmodell
          </CardTitle>
          <CardDescription>Struktur Ihres Unternehmens definieren</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Organisationstyp</Label>
              <Select value={settings.organizationModel} onValueChange={(v) => updateSetting('organizationModel', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flache Hierarchie</SelectItem>
                  <SelectItem value="hierarchical">Hierarchisch</SelectItem>
                  <SelectItem value="matrix">Matrix-Organisation</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Maximale Hierarchieebenen</Label>
              <Input 
                type="number"
                min={2}
                max={10}
                value={settings.maxHierarchyLevels}
                onChange={(e) => updateSetting('maxHierarchyLevels', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Matrix-Strukturen erlauben</Label>
              <p className="text-sm text-muted-foreground">Fachliche und disziplinarische Führung trennen</p>
            </div>
            <Switch 
              checked={settings.matrixStructureEnabled}
              onCheckedChange={(checked) => updateSetting('matrixStructureEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Organisationsebenen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Aktive Organisationsebenen
          </CardTitle>
          <CardDescription>Welche Ebenen werden in Ihrer Organisation verwendet?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Ebene 1</Badge>
                <span>Holding</span>
              </div>
              <Switch 
                checked={settings.holdingEnabled}
                onCheckedChange={(checked) => updateSetting('holdingEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Ebene 2</Badge>
                <span>Gesellschaften</span>
              </div>
              <Switch 
                checked={settings.companiesEnabled}
                onCheckedChange={(checked) => updateSetting('companiesEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Ebene 3</Badge>
                <span>Standorte</span>
              </div>
              <Switch 
                checked={settings.locationsEnabled}
                onCheckedChange={(checked) => updateSetting('locationsEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Ebene 4</Badge>
                <span>Abteilungen</span>
              </div>
              <Switch 
                checked={settings.departmentsEnabled}
                onCheckedChange={(checked) => updateSetting('departmentsEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Ebene 5</Badge>
                <span>Teams</span>
              </div>
              <Switch 
                checked={settings.teamsEnabled}
                onCheckedChange={(checked) => updateSetting('teamsEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Optional</Badge>
                <span>Kostenstellen</span>
              </div>
              <Switch 
                checked={settings.costCentersEnabled}
                onCheckedChange={(checked) => updateSetting('costCentersEnabled', checked)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Projekt-Teams aktivieren</Label>
              <p className="text-sm text-muted-foreground">Temporäre, projektbasierte Teamstrukturen</p>
            </div>
            <Switch 
              checked={settings.projectTeamsEnabled}
              onCheckedChange={(checked) => updateSetting('projectTeamsEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Autonomie-Regeln */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Autonomie-Regeln
          </CardTitle>
          <CardDescription>Welche Ebenen dürfen eigene Regeln setzen?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Standort-Autonomie</Label>
            <Select value={settings.locationAutonomy} onValueChange={(v) => updateSetting('locationAutonomy', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine - Global gesteuert</SelectItem>
                <SelectItem value="partial">Teilweise - Bestimmte Einstellungen</SelectItem>
                <SelectItem value="full">Vollständig - Alle Einstellungen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Tochtergesellschaften vollständig autonom</Label>
              <p className="text-sm text-muted-foreground">Eigene Mandanten mit voller Kontrolle</p>
            </div>
            <Switch 
              checked={settings.subsidiaryFullAutonomy}
              onCheckedChange={(checked) => updateSetting('subsidiaryFullAutonomy', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Governance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Governance-Regeln
          </CardTitle>
          <CardDescription>Welche Rolle darf welche Aktionen ausführen?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Regeln überschreiben</Label>
              <Select value={settings.governanceRulesOverride} onValueChange={(v) => updateSetting('governanceRulesOverride', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Nur Admin</SelectItem>
                  <SelectItem value="hr">HR und höher</SelectItem>
                  <SelectItem value="manager">Manager und höher</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>KI aktivieren/deaktivieren</Label>
              <Select value={settings.governanceAIControl} onValueChange={(v) => updateSetting('governanceAIControl', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">Nur Superadmin</SelectItem>
                  <SelectItem value="admin">Admin und höher</SelectItem>
                  <SelectItem value="hr">HR und höher</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Berichte exportieren</Label>
              <Select value={settings.governanceReportExport} onValueChange={(v) => updateSetting('governanceReportExport', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Nur Admin</SelectItem>
                  <SelectItem value="hr">HR und höher</SelectItem>
                  <SelectItem value="manager">Manager und höher</SelectItem>
                  <SelectItem value="teamlead">Teamleiter und höher</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Daten aggregieren (Konzern)</Label>
              <Select value={settings.governanceDataAggregation} onValueChange={(v) => updateSetting('governanceDataAggregation', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="superadmin">Nur Superadmin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vererbungslogik */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Vererbungslogik
          </CardTitle>
          <CardDescription>Wie werden Einstellungen an Unterebenen weitergegeben?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Vererbungsrichtung</Label>
            <Select value={settings.inheritanceDirection} onValueChange={(v) => updateSetting('inheritanceDirection', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="topdown">Von oben nach unten (Top-Down)</SelectItem>
                <SelectItem value="selective">Selektiv (nur markierte Einstellungen)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Lokale Überschreibung erlauben</Label>
              <p className="text-sm text-muted-foreground">Unterebenen können vererbte Werte ändern</p>
            </div>
            <Switch 
              checked={settings.inheritanceOverrideAllowed}
              onCheckedChange={(checked) => updateSetting('inheritanceOverrideAllowed', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Vererbungs-Audit-Trail</Label>
              <p className="text-sm text-muted-foreground">Alle Änderungen an Vererbung protokollieren</p>
            </div>
            <Switch 
              checked={settings.inheritanceAuditTrail}
              onCheckedChange={(checked) => updateSetting('inheritanceAuditTrail', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Vererbungs-Indikator anzeigen</Label>
              <p className="text-sm text-muted-foreground">Zeigt an, ob ein Wert geerbt oder lokal ist</p>
            </div>
            <Switch 
              checked={settings.showInheritanceIndicator}
              onCheckedChange={(checked) => updateSetting('showInheritanceIndicator', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationStructureTab;
