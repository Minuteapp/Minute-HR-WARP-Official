import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Globe, Archive, FileCheck, Lock, Users, Save } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "@/hooks/use-toast";

interface FormState {
  eu_cloud_storage: boolean;
  e2e_encryption: boolean;
  auto_anonymization: boolean;
  datacenter_location: string;
  backup_location: string;
  de_dsgvo: boolean;
  de_betrvg: boolean;
  de_hgb: boolean;
  de_ao: boolean;
  ch_ndsg: boolean;
  ch_or: boolean;
  ch_arg: boolean;
  ch_zertes: boolean;
  at_dsgvo: boolean;
  at_ugb: boolean;
  at_arbvg: boolean;
  at_sigg: boolean;
  us_ccpa: boolean;
  us_sox: boolean;
  us_hipaa: boolean;
  us_flsa: boolean;
  auto_delete_enabled: boolean;
  secure_deletion: boolean;
  deletion_logging: boolean;
  deletion_warning_days: number;
  deletion_rhythm: string;
  works_council_access: boolean;
  authority_interface: boolean;
  external_audit_trail: boolean;
}

export default function DocumentCompliance() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  
  const [formState, setFormState] = useState<FormState>({
    eu_cloud_storage: true,
    e2e_encryption: true,
    auto_anonymization: false,
    datacenter_location: 'de-frankfurt',
    backup_location: 'de-berlin',
    de_dsgvo: true,
    de_betrvg: true,
    de_hgb: true,
    de_ao: true,
    ch_ndsg: false,
    ch_or: false,
    ch_arg: false,
    ch_zertes: false,
    at_dsgvo: false,
    at_ugb: false,
    at_arbvg: false,
    at_sigg: false,
    us_ccpa: false,
    us_sox: false,
    us_hipaa: false,
    us_flsa: false,
    auto_delete_enabled: true,
    secure_deletion: false,
    deletion_logging: true,
    deletion_warning_days: 90,
    deletion_rhythm: 'quarterly',
    works_council_access: false,
    authority_interface: false,
    external_audit_trail: true,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        eu_cloud_storage: getValue('compliance_eu_cloud_storage', true) as boolean,
        e2e_encryption: getValue('compliance_e2e_encryption', true) as boolean,
        auto_anonymization: getValue('compliance_auto_anonymization', false) as boolean,
        datacenter_location: getValue('compliance_datacenter_location', 'de-frankfurt') as string,
        backup_location: getValue('compliance_backup_location', 'de-berlin') as string,
        de_dsgvo: getValue('compliance_de_dsgvo', true) as boolean,
        de_betrvg: getValue('compliance_de_betrvg', true) as boolean,
        de_hgb: getValue('compliance_de_hgb', true) as boolean,
        de_ao: getValue('compliance_de_ao', true) as boolean,
        ch_ndsg: getValue('compliance_ch_ndsg', false) as boolean,
        ch_or: getValue('compliance_ch_or', false) as boolean,
        ch_arg: getValue('compliance_ch_arg', false) as boolean,
        ch_zertes: getValue('compliance_ch_zertes', false) as boolean,
        at_dsgvo: getValue('compliance_at_dsgvo', false) as boolean,
        at_ugb: getValue('compliance_at_ugb', false) as boolean,
        at_arbvg: getValue('compliance_at_arbvg', false) as boolean,
        at_sigg: getValue('compliance_at_sigg', false) as boolean,
        us_ccpa: getValue('compliance_us_ccpa', false) as boolean,
        us_sox: getValue('compliance_us_sox', false) as boolean,
        us_hipaa: getValue('compliance_us_hipaa', false) as boolean,
        us_flsa: getValue('compliance_us_flsa', false) as boolean,
        auto_delete_enabled: getValue('compliance_auto_delete_enabled', true) as boolean,
        secure_deletion: getValue('compliance_secure_deletion', false) as boolean,
        deletion_logging: getValue('compliance_deletion_logging', true) as boolean,
        deletion_warning_days: getValue('compliance_deletion_warning_days', 90) as number,
        deletion_rhythm: getValue('compliance_deletion_rhythm', 'quarterly') as string,
        works_council_access: getValue('compliance_works_council_access', false) as boolean,
        authority_interface: getValue('compliance_authority_interface', false) as boolean,
        external_audit_trail: getValue('compliance_external_audit_trail', true) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const settingsToSave = Object.entries(formState).reduce((acc, [key, value]) => {
      acc[`compliance_${key}`] = value;
      return acc;
    }, {} as Record<string, any>);
    
    await saveSettings(settingsToSave);
    toast({ title: "Compliance-Einstellungen gespeichert" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            DSGVO-konforme Speicherung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>EU-Cloud Speicherung</Label>
                <p className="text-sm text-muted-foreground">Daten werden ausschließlich in EU-Rechenzentren gespeichert</p>
              </div>
              <Switch 
                checked={formState.eu_cloud_storage}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, eu_cloud_storage: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Ende-zu-Ende Verschlüsselung</Label>
                <p className="text-sm text-muted-foreground">AES-256 Verschlüsselung für alle Dokumente</p>
              </div>
              <Switch 
                checked={formState.e2e_encryption}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, e2e_encryption: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Automatische Anonymisierung</Label>
                <p className="text-sm text-muted-foreground">Personenbezogene Daten nach Löschung anonymisieren</p>
              </div>
              <Switch 
                checked={formState.auto_anonymization}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_anonymization: checked }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Rechenzentrum-Standort</Label>
              <Select 
                value={formState.datacenter_location}
                onValueChange={(value) => setFormState(prev => ({ ...prev, datacenter_location: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Standort wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de-frankfurt">🇩🇪 Frankfurt (Standard)</SelectItem>
                  <SelectItem value="nl-amsterdam">🇳🇱 Amsterdam</SelectItem>
                  <SelectItem value="fr-paris">🇫🇷 Paris</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Backup-Standort</Label>
              <Select 
                value={formState.backup_location}
                onValueChange={(value) => setFormState(prev => ({ ...prev, backup_location: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Backup-Standort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de-berlin">🇩🇪 Berlin</SelectItem>
                  <SelectItem value="at-vienna">🇦🇹 Wien</SelectItem>
                  <SelectItem value="ch-zurich">🇨🇭 Zürich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Länderregeln
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-medium">🇩🇪 Deutschland</h4>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>DSGVO-Konformität</span>
                  <Switch 
                    checked={formState.de_dsgvo}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, de_dsgvo: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>BetrVG-Compliance</span>
                  <Switch 
                    checked={formState.de_betrvg}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, de_betrvg: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>HGB-Aufbewahrung</span>
                  <Switch 
                    checked={formState.de_hgb}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, de_hgb: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>AO-Compliance (Steuerrecht)</span>
                  <Switch 
                    checked={formState.de_ao}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, de_ao: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-medium">🇨🇭 Schweiz</h4>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>nDSG-Konformität</span>
                  <Switch 
                    checked={formState.ch_ndsg}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, ch_ndsg: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>OR-Aufbewahrung</span>
                  <Switch 
                    checked={formState.ch_or}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, ch_or: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>ArG-Compliance</span>
                  <Switch 
                    checked={formState.ch_arg}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, ch_arg: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>ZertES (Signaturgesetz)</span>
                  <Switch 
                    checked={formState.ch_zertes}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, ch_zertes: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-medium">🇦🇹 Österreich</h4>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>DSGVO-Konformität</span>
                  <Switch 
                    checked={formState.at_dsgvo}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, at_dsgvo: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>UGB-Aufbewahrung</span>
                  <Switch 
                    checked={formState.at_ugb}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, at_ugb: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>ArbVG-Compliance</span>
                  <Switch 
                    checked={formState.at_arbvg}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, at_arbvg: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>SigG (Signaturgesetz)</span>
                  <Switch 
                    checked={formState.at_sigg}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, at_sigg: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <h4 className="font-medium">🇺🇸 USA</h4>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>CCPA-Konformität</span>
                  <Switch 
                    checked={formState.us_ccpa}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, us_ccpa: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>SOX-Compliance</span>
                  <Switch 
                    checked={formState.us_sox}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, us_sox: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>HIPAA (Healthcare)</span>
                  <Switch 
                    checked={formState.us_hipaa}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, us_hipaa: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>FLSA-Records</span>
                  <Switch 
                    checked={formState.us_flsa}
                    onCheckedChange={(checked) => setFormState(prev => ({ ...prev, us_flsa: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Aufbewahrungspflichten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📊 HR- und Finanzdokumente</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Gehaltsabrechnungen</span>
                    <Badge variant="secondary">10 Jahre</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Arbeitsverträge</span>
                    <Badge variant="secondary">30 Jahre</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Krankmeldungen</span>
                    <Badge variant="secondary">5 Jahre</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Steuerdokumente</span>
                    <Badge variant="secondary">10 Jahre</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📋 Weitere Dokumente</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Schulungsnachweise</span>
                    <Badge variant="outline">15 Jahre</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Betriebsvereinbarungen</span>
                    <Badge variant="outline">Dauerhaft</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Unfallberichte</span>
                    <Badge variant="outline">30 Jahre</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bewerbungsunterlagen</span>
                    <Badge variant="outline">6 Monate</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Löschkonzepte für sensible Daten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Automatisches Löschen aktivieren</Label>
                <p className="text-sm text-muted-foreground">Dokumente nach Ablauf der Aufbewahrungsfrist löschen</p>
              </div>
              <Switch 
                checked={formState.auto_delete_enabled}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_delete_enabled: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Sichere Löschung (DoD 5220.22-M)</Label>
                <p className="text-sm text-muted-foreground">Mehrfaches Überschreiben für unwiderrufliche Löschung</p>
              </div>
              <Switch 
                checked={formState.secure_deletion}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, secure_deletion: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Lösch-Protokollierung</Label>
                <p className="text-sm text-muted-foreground">Nachweis über durchgeführte Löschungen</p>
              </div>
              <Switch 
                checked={formState.deletion_logging}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, deletion_logging: checked }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vorwarnung vor Löschung (Tage)</Label>
              <Input 
                type="number" 
                value={formState.deletion_warning_days}
                onChange={(e) => setFormState(prev => ({ ...prev, deletion_warning_days: parseInt(e.target.value) || 90 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Löschungsrhythmus</Label>
              <Select 
                value={formState.deletion_rhythm}
                onValueChange={(value) => setFormState(prev => ({ ...prev, deletion_rhythm: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rhythmus wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="quarterly">Quartalsweise</SelectItem>
                  <SelectItem value="yearly">Jährlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Betriebsrat & Behörden
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Betriebsrat-Zugang</Label>
                <p className="text-sm text-muted-foreground">Separate Kennzeichnung für Betriebsratsdokumente</p>
              </div>
              <Switch 
                checked={formState.works_council_access}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, works_council_access: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Behörden-Schnittstelle</Label>
                <p className="text-sm text-muted-foreground">Automatische Übermittlung an Behörden (z.B. Krankenkassen)</p>
              </div>
              <Switch 
                checked={formState.authority_interface}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, authority_interface: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Audit-Trail für Externe</Label>
                <p className="text-sm text-muted-foreground">Nachverfolgung externer Zugriffe</p>
              </div>
              <Switch 
                checked={formState.external_audit_trail}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, external_audit_trail: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Compliance-Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-medium">DSGVO-Status</h4>
                </div>
                <div className="text-2xl font-bold mb-1">98.7%</div>
                <p className="text-sm text-muted-foreground">Konformitätsrate</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-medium">Aufbewahrung</h4>
                </div>
                <div className="text-2xl font-bold mb-1">100%</div>
                <p className="text-sm text-muted-foreground">Regel-Konformität</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h4 className="font-medium">Sicherheit</h4>
                </div>
                <div className="text-2xl font-bold mb-1">94.2%</div>
                <p className="text-sm text-muted-foreground">Verschlüsselungsrate</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">Compliance-Bericht generieren</Button>
            <Button variant="outline">Audit-Log exportieren</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Compliance-Check ausführen</Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Speichern..." : "Einstellungen speichern"}
        </Button>
      </div>
    </div>
  );
}
