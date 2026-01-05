import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tags, Package, Users, TrendingDown, Plus, ChevronLeft, Trash2, 
  RefreshCw, Undo2, Link2, Brain, Shield, Laptop, Car, Key, Wrench, FileCode, Armchair
} from "lucide-react";
import { useAssetSettings } from "@/hooks/useAssetSettings";
import { categoryLabels, assignmentTargetLabels, AssignmentTarget, AssetCategory } from "@/types/asset-settings";
import { Skeleton } from "@/components/ui/skeleton";

const categoryIcons: Record<AssetCategory, any> = {
  it_hardware: Laptop,
  accessory: Package,
  vehicle: Car,
  access_media: Key,
  work_tool: Wrench,
  software_license: FileCode,
  furniture: Armchair,
  other: Package
};

export default function AssetsSettingsPage() {
  const navigate = useNavigate();
  const { 
    settings, 
    assetTypes, 
    roleRequirements,
    returnChecklists,
    isLoading, 
    updateSettings,
    createAssetType,
    deleteAssetType,
    isSaving 
  } = useAssetSettings();

  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCategory, setNewTypeCategory] = useState<AssetCategory>("it_hardware");

  if (isLoading) {
    return (
      <PageLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageLayout>
    );
  }

  const handleAddType = () => {
    if (newTypeName.trim()) {
      createAssetType({
        name: newTypeName,
        category: newTypeCategory,
        is_active: true,
        require_serial_number: false,
        require_inventory_number: true,
        track_value: true,
        track_warranty: true,
        depreciation_method: 'linear',
        depreciation_years: 3,
        maintenance_reminder_days: 14,
        sort_order: assetTypes.length
      });
      setNewTypeName("");
    }
  };

  return (
    <PageLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/settings")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Asset-Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Inventar, Zuweisung & Lifecycle-Steuerung</p>
          </div>
        </div>

        <Tabs defaultValue="types" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="types" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              <span className="hidden lg:inline">Typen</span>
            </TabsTrigger>
            <TabsTrigger value="attributes" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden lg:inline">Attribute</span>
            </TabsTrigger>
            <TabsTrigger value="assignment" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden lg:inline">Zuweisung</span>
            </TabsTrigger>
            <TabsTrigger value="lifecycle" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden lg:inline">Lifecycle</span>
            </TabsTrigger>
            <TabsTrigger value="return" className="flex items-center gap-2">
              <Undo2 className="h-4 w-4" />
              <span className="hidden lg:inline">Rückgabe</span>
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden lg:inline">Integration</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden lg:inline">KI</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden lg:inline">Rechte</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden lg:inline">Audit</span>
            </TabsTrigger>
          </TabsList>

          {/* Typen Tab */}
          <TabsContent value="types" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Asset-Typen & Kategorien</CardTitle>
                <CardDescription>Definieren Sie die verfügbaren Asset-Typen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {assetTypes.map((type) => {
                  const Icon = categoryIcons[type.category] || Package;
                  return (
                    <div key={type.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{type.name}</p>
                        <p className="text-sm text-muted-foreground">{categoryLabels[type.category]}</p>
                      </div>
                      <div className="flex gap-2">
                        {type.require_serial_number && <Badge variant="secondary">Seriennr.</Badge>}
                        {type.track_value && <Badge variant="secondary">Wert</Badge>}
                        <Badge>{type.depreciation_years} Jahre AfA</Badge>
                      </div>
                      <Button variant="outline" size="sm">Bearbeiten</Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteAssetType(type.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}

                <div className="flex gap-4 p-4 border rounded-lg border-dashed">
                  <Input 
                    placeholder="Neuer Asset-Typ..." 
                    value={newTypeName}
                    onChange={(e) => setNewTypeName(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={newTypeCategory} onValueChange={(v: AssetCategory) => setNewTypeCategory(v)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddType}>
                    <Plus className="h-4 w-4 mr-2" />
                    Hinzufügen
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Konfiguration je Typ</CardTitle>
                <CardDescription>Standardeinstellungen für Asset-Typen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label>Seriennummer Pflicht</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label>Wert erfassen</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label>Garantie verfolgen</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label>Wartungsintervall</Label>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attribute Tab */}
          <TabsContent value="attributes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventarnummer-Generierung</CardTitle>
                <CardDescription>Automatische Vergabe von Inventarnummern</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatische Inventarnummern</Label>
                    <p className="text-sm text-muted-foreground">Eindeutige IDs automatisch generieren</p>
                  </div>
                  <Switch 
                    checked={settings.auto_generate_inventory_number}
                    onCheckedChange={(checked) => updateSettings({ auto_generate_inventory_number: checked })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Präfix</Label>
                    <Input 
                      value={settings.inventory_number_prefix}
                      onChange={(e) => updateSettings({ inventory_number_prefix: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Input 
                      value={settings.inventory_number_format}
                      onChange={(e) => updateSettings({ inventory_number_format: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Barcode & QR-Code</CardTitle>
                <CardDescription>Scanbare Identifikation von Assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Barcode aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Barcodes für Assets generieren</p>
                  </div>
                  <Switch 
                    checked={settings.enable_barcode}
                    onCheckedChange={(checked) => updateSettings({ enable_barcode: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>QR-Code aktivieren</Label>
                    <p className="text-sm text-muted-foreground">QR-Codes für Assets generieren</p>
                  </div>
                  <Switch 
                    checked={settings.enable_qr_code}
                    onCheckedChange={(checked) => updateSettings({ enable_qr_code: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Zuweisung Tab */}
          <TabsContent value="assignment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zuweisungsregeln</CardTitle>
                <CardDescription>An wen können Assets zugewiesen werden?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Zuweisung möglich an</Label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(assignmentTargetLabels) as AssignmentTarget[]).map(target => (
                      <Badge 
                        key={target}
                        variant={settings.assignment_targets?.includes(target) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = settings.assignment_targets || [];
                          const updated = current.includes(target)
                            ? current.filter(t => t !== target)
                            : [...current, target];
                          updateSettings({ assignment_targets: updated });
                        }}
                      >
                        {assignmentTargetLabels[target]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Max. Assets pro Benutzer</Label>
                    <Input 
                      type="number"
                      value={settings.max_assets_per_user || ''}
                      onChange={(e) => updateSettings({ max_assets_per_user: parseInt(e.target.value) || undefined })}
                      placeholder="Unbegrenzt"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bestätigungsfrist (Tage)</Label>
                    <Input 
                      type="number"
                      value={settings.assignment_confirmation_days}
                      onChange={(e) => updateSettings({ assignment_confirmation_days: parseInt(e.target.value) || 3 })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bestätigung erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Empfänger muss Zuweisung bestätigen</p>
                  </div>
                  <Switch 
                    checked={settings.require_assignment_confirmation}
                    onCheckedChange={(checked) => updateSettings({ require_assignment_confirmation: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mehrfachzuweisung erlauben</Label>
                    <p className="text-sm text-muted-foreground">Ein Asset an mehrere Personen</p>
                  </div>
                  <Switch 
                    checked={settings.allow_multiple_assignment}
                    onCheckedChange={(checked) => updateSettings({ allow_multiple_assignment: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pflicht-Assets je Rolle</CardTitle>
                <CardDescription>Welche Assets werden für welche Rollen benötigt?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {roleRequirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{req.role_name}</p>
                      <p className="text-sm text-muted-foreground">{req.quantity}x Asset</p>
                    </div>
                    <Badge variant={req.is_mandatory ? "default" : "secondary"}>
                      {req.is_mandatory ? "Pflicht" : "Optional"}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Rollenanforderung hinzufügen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lifecycle Tab */}
          <TabsContent value="lifecycle" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lifecycle-Automatisierungen</CardTitle>
                <CardDescription>Automatische Aktionen bei Statusänderungen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Onboarding → Asset zuweisen</Label>
                    <p className="text-sm text-muted-foreground">Automatische Zuweisung bei Eintritt</p>
                  </div>
                  <Switch 
                    checked={settings.auto_assign_onboarding}
                    onCheckedChange={(checked) => updateSettings({ auto_assign_onboarding: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rollenwechsel → Asset-Check</Label>
                    <p className="text-sm text-muted-foreground">Bei Rollenwechsel Assets prüfen</p>
                  </div>
                  <Switch 
                    checked={settings.auto_check_role_change}
                    onCheckedChange={(checked) => updateSettings({ auto_check_role_change: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Offboarding → Rückgabe erzwingen</Label>
                    <p className="text-sm text-muted-foreground">Rückgabe bei Austritt erforderlich</p>
                  </div>
                  <Switch 
                    checked={settings.force_return_offboarding}
                    onCheckedChange={(checked) => updateSettings({ force_return_offboarding: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Standortwechsel → Neuzuordnung</Label>
                    <p className="text-sm text-muted-foreground">Standort-Assets automatisch umbuchen</p>
                  </div>
                  <Switch 
                    checked={settings.auto_reassign_location_change}
                    onCheckedChange={(checked) => updateSettings({ auto_reassign_location_change: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Garantieablauf-Warnung</Label>
                    <p className="text-sm text-muted-foreground">Benachrichtigung vor Garantieende</p>
                  </div>
                  <Switch 
                    checked={settings.notify_before_warranty_end}
                    onCheckedChange={(checked) => updateSettings({ notify_before_warranty_end: checked })}
                  />
                </div>

                {settings.notify_before_warranty_end && (
                  <div className="space-y-2 ml-6">
                    <Label>Tage vor Garantieende</Label>
                    <Input 
                      type="number"
                      value={settings.warranty_notification_days}
                      onChange={(e) => updateSettings({ warranty_notification_days: parseInt(e.target.value) || 30 })}
                      className="w-32"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rückgabe Tab */}
          <TabsContent value="return" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rückgabe-Einstellungen</CardTitle>
                <CardDescription>Regeln für die Asset-Rückgabe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Checkliste erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Rückgabe-Checkliste ausfüllen</p>
                  </div>
                  <Switch 
                    checked={settings.require_return_checklist}
                    onCheckedChange={(checked) => updateSettings({ require_return_checklist: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Zustandsbericht erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Zustand bei Rückgabe dokumentieren</p>
                  </div>
                  <Switch 
                    checked={settings.require_condition_report}
                    onCheckedChange={(checked) => updateSettings({ require_condition_report: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Digitale Bestätigung</Label>
                    <p className="text-sm text-muted-foreground">Elektronische Unterschrift bei Rückgabe</p>
                  </div>
                  <Switch 
                    checked={settings.require_digital_confirmation}
                    onCheckedChange={(checked) => updateSettings({ require_digital_confirmation: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Eskalation aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Bei überfälliger Rückgabe eskalieren</p>
                  </div>
                  <Switch 
                    checked={settings.escalation_enabled}
                    onCheckedChange={(checked) => updateSettings({ escalation_enabled: checked })}
                  />
                </div>

                {settings.escalation_enabled && (
                  <div className="space-y-2 ml-6">
                    <Label>Eskalation nach (Tage)</Label>
                    <Input 
                      type="number"
                      value={settings.escalation_days_overdue}
                      onChange={(e) => updateSettings({ escalation_days_overdue: parseInt(e.target.value) || 7 })}
                      className="w-32"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rückgabe-Checklisten</CardTitle>
                <CardDescription>Vorlagen für Rückgabe-Prozess</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {returnChecklists.map((checklist) => (
                  <div key={checklist.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{checklist.name}</p>
                      <p className="text-sm text-muted-foreground">{checklist.items?.length || 0} Punkte</p>
                    </div>
                    {checklist.is_default && <Badge>Standard</Badge>}
                    <Button variant="outline" size="sm">Bearbeiten</Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Checkliste hinzufügen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration mit anderen Modulen</CardTitle>
                <CardDescription>Asset-Management wirkt in folgenden Bereichen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Onboarding / Offboarding', desc: 'Automatische Asset-Zuweisung/-Rückforderung' },
                  { name: 'Mitarbeiter', desc: 'Asset-Übersicht pro Mitarbeiter' },
                  { name: 'IT / Access', desc: 'IT-Equipment und Zugänge' },
                  { name: 'Dokumente', desc: 'Übergabeprotokolle und Belege' },
                  { name: 'Compliance Hub', desc: 'Asset-bezogene Compliance' },
                  { name: 'Dashboard', desc: 'Asset-Statistiken und KPIs' },
                  { name: 'Berichte', desc: 'Inventar- und Wertberichte' }
                ].map((module) => (
                  <div key={module.name} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{module.name}</p>
                      <p className="text-sm text-muted-foreground">{module.desc}</p>
                    </div>
                    <Badge variant="secondary">Aktiv</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* KI Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KI-Unterstützung</CardTitle>
                <CardDescription>Intelligente Asset-Optimierung (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Asset-Verteilungsvorschläge</Label>
                    <p className="text-sm text-muted-foreground">KI schlägt optimale Zuweisung vor</p>
                  </div>
                  <Switch 
                    checked={settings.ai_suggestions_enabled}
                    onCheckedChange={(checked) => updateSettings({ ai_suggestions_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ungenutzte Assets erkennen</Label>
                    <p className="text-sm text-muted-foreground">Warnung bei lange ungenutzten Assets</p>
                  </div>
                  <Switch 
                    checked={settings.ai_unused_detection_enabled}
                    onCheckedChange={(checked) => updateSettings({ ai_unused_detection_enabled: checked })}
                  />
                </div>

                {settings.ai_unused_detection_enabled && (
                  <div className="space-y-2 ml-6">
                    <Label>Schwellenwert (Tage)</Label>
                    <Input 
                      type="number"
                      value={settings.ai_unused_threshold_days}
                      onChange={(e) => updateSettings({ ai_unused_threshold_days: parseInt(e.target.value) || 90 })}
                      className="w-32"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Wartungsprognosen</Label>
                    <p className="text-sm text-muted-foreground">Vorhersage von Wartungsbedarf</p>
                  </div>
                  <Switch 
                    checked={settings.ai_maintenance_prediction_enabled}
                    onCheckedChange={(checked) => updateSettings({ ai_maintenance_prediction_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Kostenoptimierung</Label>
                    <p className="text-sm text-muted-foreground">Vorschläge zur Asset-Kostenreduzierung</p>
                  </div>
                  <Switch 
                    checked={settings.ai_cost_optimization_enabled}
                    onCheckedChange={(checked) => updateSettings({ ai_cost_optimization_enabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rechte Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Berechtigungsmatrix</CardTitle>
                <CardDescription>Übersicht der Berechtigungen je Rolle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Rolle</th>
                        <th className="text-center py-3 px-4">Eigene</th>
                        <th className="text-center py-3 px-4">Team</th>
                        <th className="text-center py-3 px-4">Zuweisung</th>
                        <th className="text-center py-3 px-4">Konfiguration</th>
                        <th className="text-center py-3 px-4">Audit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { role: 'Mitarbeiter', own: true, team: false, assign: false, config: false, audit: false },
                        { role: 'Teamleiter', own: true, team: true, assign: false, config: false, audit: false },
                        { role: 'HR', own: true, team: true, assign: true, config: false, audit: false },
                        { role: 'IT', own: true, team: true, assign: true, config: false, audit: false },
                        { role: 'Admin', own: true, team: true, assign: true, config: true, audit: false },
                        { role: 'Superadmin', own: true, team: true, assign: true, config: true, audit: true }
                      ].map((row) => (
                        <tr key={row.role} className="border-b">
                          <td className="py-3 px-4 font-medium">{row.role}</td>
                          <td className="text-center py-3 px-4">{row.own ? '✓' : '-'}</td>
                          <td className="text-center py-3 px-4">{row.team ? '✓' : '-'}</td>
                          <td className="text-center py-3 px-4">{row.assign ? '✓' : '-'}</td>
                          <td className="text-center py-3 px-4">{row.config ? '✓' : '-'}</td>
                          <td className="text-center py-3 px-4">{row.audit ? '✓' : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit, Historie & Compliance</CardTitle>
                <CardDescription>Nachvollziehbarkeit und Dokumentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vollständiges Audit-Trail</Label>
                    <p className="text-sm text-muted-foreground">Alle Änderungen protokollieren</p>
                  </div>
                  <Switch 
                    checked={settings.enable_full_audit_trail}
                    onCheckedChange={(checked) => updateSettings({ enable_full_audit_trail: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Aufbewahrungsfrist (Jahre)</Label>
                  <Input 
                    type="number"
                    value={settings.retention_years}
                    onChange={(e) => updateSettings({ retention_years: parseInt(e.target.value) || 10 })}
                    className="w-32"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Regelmäßige Inventur</Label>
                    <p className="text-sm text-muted-foreground">Periodische Bestandsaufnahme</p>
                  </div>
                  <Switch 
                    checked={settings.enable_periodic_inventory}
                    onCheckedChange={(checked) => updateSettings({ enable_periodic_inventory: checked })}
                  />
                </div>

                {settings.enable_periodic_inventory && (
                  <div className="space-y-2 ml-6">
                    <Label>Inventur-Intervall (Monate)</Label>
                    <Input 
                      type="number"
                      value={settings.inventory_frequency_months}
                      onChange={(e) => updateSettings({ inventory_frequency_months: parseInt(e.target.value) || 12 })}
                      className="w-32"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
