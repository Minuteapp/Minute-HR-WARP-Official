import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Network, GitBranch, Eye, Layers, Shield, Settings, Link2, ChevronLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { useOrgchartSettings } from "@/hooks/useOrgchartSettings";
import { 
  OrganizationType, LayoutType, ColorScheme, EditSource, RoleType, UnitType,
  layoutTypeLabels, colorSchemeLabels, roleTypeLabels, unitTypeLabels 
} from "@/types/orgchart-settings";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrgchartSettingsPage() {
  const navigate = useNavigate();
  const { 
    settings, 
    visibilityRules, 
    isLoading, 
    updateSettings, 
    updateVisibilityRule,
    deleteVisibilityRule,
    isSaving 
  } = useOrgchartSettings();

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

  return (
    <PageLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/settings")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Organigramm-Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Struktur, Darstellung & Governance des Organigramms</p>
          </div>
        </div>

        <Tabs defaultValue="structure" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="structure" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span className="hidden lg:inline">Struktur</span>
            </TabsTrigger>
            <TabsTrigger value="units" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span className="hidden lg:inline">Einheiten</span>
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden lg:inline">Darstellung</span>
            </TabsTrigger>
            <TabsTrigger value="visibility" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden lg:inline">Sichtbarkeit</span>
            </TabsTrigger>
            <TabsTrigger value="changes" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="hidden lg:inline">Änderungen</span>
            </TabsTrigger>
            <TabsTrigger value="integration" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden lg:inline">Integration</span>
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden lg:inline">Rechte</span>
            </TabsTrigger>
          </TabsList>

          {/* Struktur Tab */}
          <TabsContent value="structure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organisationslogik</CardTitle>
                <CardDescription>Grundlegende Struktureinstellungen für das Organigramm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Organisationstyp</Label>
                  <Select 
                    value={settings.organization_type} 
                    onValueChange={(value: OrganizationType) => updateSettings({ organization_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_line">Einlinien-Hierarchie (klassisch)</SelectItem>
                      <SelectItem value="matrix">Matrix-Organisation</SelectItem>
                      <SelectItem value="hybrid">Hybrides Modell</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {settings.organization_type === 'single_line' && 'Klassische Hierarchie mit einem Vorgesetzten pro Mitarbeiter'}
                    {settings.organization_type === 'matrix' && 'Fachliche und disziplinarische Berichtslinien'}
                    {settings.organization_type === 'hybrid' && 'Flexible Kombination verschiedener Strukturen'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maximale Hierarchietiefe</Label>
                    <Input 
                      type="number" 
                      value={settings.max_hierarchy_depth} 
                      onChange={(e) => updateSettings({ max_hierarchy_depth: parseInt(e.target.value) || 10 })}
                      min={1}
                      max={20}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mehrere Vorgesetzte erlaubt</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter können mehreren Führungskräften zugeordnet werden</p>
                  </div>
                  <Switch 
                    checked={settings.allow_multiple_managers}
                    onCheckedChange={(checked) => updateSettings({ allow_multiple_managers: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Stellvertretungen abbilden</Label>
                    <p className="text-sm text-muted-foreground">Vertretungsbeziehungen im Organigramm anzeigen</p>
                  </div>
                  <Switch 
                    checked={settings.show_deputies}
                    onCheckedChange={(checked) => updateSettings({ show_deputies: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Vakante Positionen anzeigen</Label>
                    <p className="text-sm text-muted-foreground">Offene Stellen im Organigramm markieren</p>
                  </div>
                  <Switch 
                    checked={settings.show_vacant_positions}
                    onCheckedChange={(checked) => updateSettings({ show_vacant_positions: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Temporäre Strukturen erlauben</Label>
                    <p className="text-sm text-muted-foreground">Zeitlich begrenzte Organisationseinheiten (z.B. Projekte)</p>
                  </div>
                  <Switch 
                    checked={settings.allow_temporary_structures}
                    onCheckedChange={(checked) => updateSettings({ allow_temporary_structures: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Einheiten Tab */}
          <TabsContent value="units" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Abbildungseinheiten</CardTitle>
                <CardDescription>Welche Organisationseinheiten sollen im Organigramm dargestellt werden?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(['company', 'location', 'department', 'team', 'position', 'person'] as UnitType[]).map((unit) => (
                  <div key={unit} className="flex items-center gap-4 p-3 border rounded-lg">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Checkbox 
                      checked={settings.enabled_unit_types?.includes(unit)}
                      onCheckedChange={(checked) => {
                        const current = settings.enabled_unit_types || [];
                        const updated = checked 
                          ? [...current, unit]
                          : current.filter(u => u !== unit);
                        updateSettings({ enabled_unit_types: updated });
                      }}
                    />
                    <div className="flex-1">
                      <Label className="font-medium">{unitTypeLabels[unit]}</Label>
                    </div>
                    <Badge variant={settings.enabled_unit_types?.includes(unit) ? "default" : "secondary"}>
                      {settings.enabled_unit_types?.includes(unit) ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground mt-4">
                  Ziehen Sie die Einheiten, um die Reihenfolge zu ändern. Deaktivierte Einheiten werden nicht im Organigramm angezeigt.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Darstellung Tab */}
          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Layout & Visualisierung</CardTitle>
                <CardDescription>Wie soll das Organigramm dargestellt werden?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Standard-Layout</Label>
                  <Select 
                    value={settings.default_layout}
                    onValueChange={(value: LayoutType) => updateSettings({ default_layout: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(layoutTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Farbschema</Label>
                  <Select 
                    value={settings.color_scheme}
                    onValueChange={(value: ColorScheme) => updateSettings({ color_scheme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(colorSchemeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Anzeigeoptionen</CardTitle>
                <CardDescription>Welche Informationen sollen in den Karten angezeigt werden?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Fotos anzeigen</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiterfotos in Karten</p>
                  </div>
                  <Switch 
                    checked={settings.show_photos}
                    onCheckedChange={(checked) => updateSettings({ show_photos: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Rolle/Position anzeigen</Label>
                    <p className="text-sm text-muted-foreground">Jobtitel in Karten</p>
                  </div>
                  <Switch 
                    checked={settings.show_role_info}
                    onCheckedChange={(checked) => updateSettings({ show_role_info: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Team/Abteilung anzeigen</Label>
                    <p className="text-sm text-muted-foreground">Teamzugehörigkeit in Karten</p>
                  </div>
                  <Switch 
                    checked={settings.show_team_info}
                    onCheckedChange={(checked) => updateSettings({ show_team_info: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Standort anzeigen</Label>
                    <p className="text-sm text-muted-foreground">Arbeitsstandort in Karten</p>
                  </div>
                  <Switch 
                    checked={settings.show_location_info}
                    onCheckedChange={(checked) => updateSettings({ show_location_info: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Kontaktinfos anzeigen</Label>
                    <p className="text-sm text-muted-foreground">E-Mail und Telefon einblenden</p>
                  </div>
                  <Switch 
                    checked={settings.show_contact_info}
                    onCheckedChange={(checked) => updateSettings({ show_contact_info: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ein-/Ausklappen aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Hierarchieebenen ein- und ausklappen</p>
                  </div>
                  <Switch 
                    checked={settings.enable_collapse_expand}
                    onCheckedChange={(checked) => updateSettings({ enable_collapse_expand: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Linienarten</CardTitle>
                <CardDescription>Darstellung der Berichtslinien</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Disziplinarische Linie</Label>
                    <Select 
                      value={settings.line_style_disciplinary}
                      onValueChange={(value) => updateSettings({ line_style_disciplinary: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Durchgezogen</SelectItem>
                        <SelectItem value="dashed">Gestrichelt</SelectItem>
                        <SelectItem value="dotted">Gepunktet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fachliche Linie</Label>
                    <Select 
                      value={settings.line_style_functional}
                      onValueChange={(value) => updateSettings({ line_style_functional: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Durchgezogen</SelectItem>
                        <SelectItem value="dashed">Gestrichelt</SelectItem>
                        <SelectItem value="dotted">Gepunktet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sichtbarkeit Tab */}
          <TabsContent value="visibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Datenschutz-Einstellungen</CardTitle>
                <CardDescription>Allgemeine Sichtbarkeits- und Datenschutzregeln</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sensible Daten anonymisieren</Label>
                    <p className="text-sm text-muted-foreground">Persönliche Daten für bestimmte Rollen verbergen</p>
                  </div>
                  <Switch 
                    checked={settings.anonymize_sensitive_data}
                    onCheckedChange={(checked) => updateSettings({ anonymize_sensitive_data: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Externe anonymisieren</Label>
                    <p className="text-sm text-muted-foreground">Daten für externe Benutzer anonymisieren</p>
                  </div>
                  <Switch 
                    checked={settings.anonymize_for_external}
                    onCheckedChange={(checked) => updateSettings({ anonymize_for_external: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Externe Sichtbarkeit</Label>
                    <p className="text-sm text-muted-foreground">Organigramm für externe Benutzer freigeben</p>
                  </div>
                  <Switch 
                    checked={settings.external_visibility_enabled}
                    onCheckedChange={(checked) => updateSettings({ external_visibility_enabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rollenbasierte Sichtbarkeit</CardTitle>
                <CardDescription>Definieren Sie, was jede Rolle im Organigramm sehen kann</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {visibilityRules.map((rule) => (
                  <div key={rule.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge>{roleTypeLabels[rule.role_type]}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => deleteVisibilityRule(rule.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Ebenen nach oben:</span>
                        <span className="ml-2 font-medium">{rule.can_view_levels_up === 999 ? 'Alle' : rule.can_view_levels_up}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ebenen nach unten:</span>
                        <span className="ml-2 font-medium">{rule.can_view_levels_down === 999 ? 'Alle' : rule.can_view_levels_down}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Detailstufe:</span>
                        <span className="ml-2 font-medium">{rule.detail_level}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Sichtbarkeitsregel hinzufügen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Änderungen Tab */}
          <TabsContent value="changes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pflege & Änderungslogik</CardTitle>
                <CardDescription>Wie werden Änderungen am Organigramm verwaltet?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Änderungsquelle</Label>
                  <Select 
                    value={settings.edit_source}
                    onValueChange={(value: EditSource) => updateSettings({ edit_source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company_info_only">Nur über Unternehmensinformationen</SelectItem>
                      <SelectItem value="explicit_approval">Mit expliziter Freigabe</SelectItem>
                      <SelectItem value="direct_edit">Direkte Bearbeitung (nicht empfohlen)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Das Organigramm ist die visuelle Repräsentation der Unternehmensstruktur, keine eigene Datenquelle.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Genehmigung erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Strukturänderungen müssen genehmigt werden</p>
                  </div>
                  <Switch 
                    checked={settings.require_approval_for_changes}
                    onCheckedChange={(checked) => updateSettings({ require_approval_for_changes: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Gültigkeitsdatum erforderlich</Label>
                    <p className="text-sm text-muted-foreground">Änderungen benötigen ein "gültig ab"-Datum</p>
                  </div>
                  <Switch 
                    checked={settings.change_effective_date_required}
                    onCheckedChange={(checked) => updateSettings({ change_effective_date_required: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Berechtigte Rollen für Änderungen</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['hr', 'admin', 'superadmin'] as const).map(role => (
                      <Badge 
                        key={role} 
                        variant={settings.allowed_change_roles?.includes(role) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = settings.allowed_change_roles || [];
                          const updated = current.includes(role)
                            ? current.filter(r => r !== role)
                            : [...current, role];
                          updateSettings({ allowed_change_roles: updated });
                        }}
                      >
                        {roleTypeLabels[role as RoleType]}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Tab */}
          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration mit anderen Modulen</CardTitle>
                <CardDescription>Das Organigramm wirkt automatisch in folgenden Bereichen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Benutzerverwaltung', desc: 'Hierarchien und Berichtslinien' },
                  { name: 'Rollen & Rechte', desc: 'Rollenbasierte Berechtigungen' },
                  { name: 'Dashboards', desc: 'Team- und Abteilungsansichten' },
                  { name: 'Workforce Planning', desc: 'Kapazitätsplanung nach Struktur' },
                  { name: 'Nachfolgeplanung', desc: 'Karrierepfade und Nachfolger' },
                  { name: 'Projekte & Aufgaben', desc: 'Verantwortlichkeiten' },
                  { name: 'Berichte & Exporte', desc: 'Strukturbasierte Reports' }
                ].map((module) => (
                  <div key={module.name} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{module.name}</p>
                      <p className="text-sm text-muted-foreground">{module.desc}</p>
                    </div>
                    <Badge variant="secondary">Automatisch</Badge>
                  </div>
                ))}
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
                        <th className="text-center py-3 px-4">Lesen</th>
                        <th className="text-center py-3 px-4">Team-Sicht</th>
                        <th className="text-center py-3 px-4">Vollständig</th>
                        <th className="text-center py-3 px-4">Struktur</th>
                        <th className="text-center py-3 px-4">Audit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { role: 'Mitarbeiter', read: true, team: false, full: false, structure: false, audit: false },
                        { role: 'Teamleiter', read: true, team: true, full: false, structure: false, audit: false },
                        { role: 'HR', read: true, team: true, full: true, structure: false, audit: false },
                        { role: 'Admin', read: true, team: true, full: true, structure: true, audit: false },
                        { role: 'Superadmin', read: true, team: true, full: true, structure: true, audit: true }
                      ].map((row) => (
                        <tr key={row.role} className="border-b">
                          <td className="py-3 px-4 font-medium">{row.role}</td>
                          <td className="text-center py-3 px-4">{row.read ? '✓' : '-'}</td>
                          <td className="text-center py-3 px-4">{row.team ? '✓' : '-'}</td>
                          <td className="text-center py-3 px-4">{row.full ? '✓' : '-'}</td>
                          <td className="text-center py-3 px-4">{row.structure ? '✓' : '-'}</td>
                          <td className="text-center py-3 px-4">{row.audit ? '✓' : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
