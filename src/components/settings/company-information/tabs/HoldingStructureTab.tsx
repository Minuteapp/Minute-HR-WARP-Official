import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Network, Building2, Settings2, Database, Shield, Save, Bot, Download } from 'lucide-react';
import { toast } from 'sonner';

export function HoldingStructureTab() {
  const [formData, setFormData] = useState({
    // Grundstruktur
    hasHolding: false,
    holdingName: '',
    hierarchyType: 'flat',
    // Beteiligungen
    defaultSharePercentage: 100,
    showMinorityStakes: true,
    // Konsolidierung
    consolidationMode: 'full',
    consolidationCurrency: 'EUR',
    reportingPeriod: 'monthly',
    // Governance
    subsidiaryAutonomy: 'partial',
    dataAggregation: 'group',
    inheritSettings: true,
    // Berechtigungen
    overrideLevel: 'holding',
    aiControlLevel: 'holding',
    exportLevel: 'all',
    // Compliance
    intercompanyAgreements: true,
    transferPricing: true,
    consolidatedReporting: true,
  });

  const hierarchyTypes = [
    { value: 'flat', label: 'Flache Struktur (Holding → Gesellschaften)' },
    { value: 'nested', label: 'Verschachtelt (Holding → Tochter → Enkel)' },
    { value: 'matrix', label: 'Matrix-Struktur' },
  ];

  const consolidationModes = [
    { value: 'full', label: 'Vollkonsolidierung' },
    { value: 'quota', label: 'Quotenkonsolidierung' },
    { value: 'equity', label: 'Equity-Methode' },
    { value: 'none', label: 'Keine Konsolidierung' },
  ];

  const reportingPeriods = [
    { value: 'daily', label: 'Täglich' },
    { value: 'weekly', label: 'Wöchentlich' },
    { value: 'monthly', label: 'Monatlich' },
    { value: 'quarterly', label: 'Quartalsweise' },
    { value: 'yearly', label: 'Jährlich' },
  ];

  const autonomyLevels = [
    { value: 'full', label: 'Vollständig autonom' },
    { value: 'partial', label: 'Teilweise autonom' },
    { value: 'central', label: 'Zentral gesteuert' },
  ];

  const dataAggregationModes = [
    { value: 'group', label: 'Konzernweit' },
    { value: 'holding', label: 'Nur Holding' },
    { value: 'entity', label: 'Gesellschaftsweise' },
  ];

  const controlLevels = [
    { value: 'holding', label: 'Nur Holding' },
    { value: 'subsidiary', label: 'Bis Tochtergesellschaft' },
    { value: 'all', label: 'Alle Ebenen' },
  ];

  const handleSave = () => {
    toast.success('Holdingstruktur wurde gespeichert');
  };

  return (
    <div className="space-y-6">
      {/* Grundstruktur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Konzernstruktur
          </CardTitle>
          <CardDescription>
            Definition der Unternehmenshierarchie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div>
              <Label className="text-base">Holding-Struktur vorhanden</Label>
              <p className="text-sm text-muted-foreground">
                Aktivieren Sie diese Option, wenn Ihr Unternehmen Teil eines Konzerns ist
              </p>
            </div>
            <Switch
              checked={formData.hasHolding}
              onCheckedChange={(checked) => setFormData({ ...formData, hasHolding: checked })}
            />
          </div>

          {formData.hasHolding && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="holdingName">Konzern-/Holdingname</Label>
                <Input
                  id="holdingName"
                  value={formData.holdingName}
                  onChange={(e) => setFormData({ ...formData, holdingName: e.target.value })}
                  placeholder="Muster Holding AG"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hierarchyType">Hierarchie-Typ</Label>
                <Select value={formData.hierarchyType} onValueChange={(value) => setFormData({ ...formData, hierarchyType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Typ wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {hierarchyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Beteiligungen */}
      {formData.hasHolding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Beteiligungen
            </CardTitle>
            <CardDescription>
              Einstellungen für Beteiligungsquoten und -verwaltung
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="defaultSharePercentage">Standard-Beteiligungsquote (%)</Label>
              <Input
                id="defaultSharePercentage"
                type="number"
                min="0"
                max="100"
                value={formData.defaultSharePercentage}
                onChange={(e) => setFormData({ ...formData, defaultSharePercentage: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label>Minderheitsbeteiligungen anzeigen</Label>
                <p className="text-sm text-muted-foreground">Beteiligungen unter 50% einblenden</p>
              </div>
              <Switch
                checked={formData.showMinorityStakes}
                onCheckedChange={(checked) => setFormData({ ...formData, showMinorityStakes: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Konsolidierung */}
      {formData.hasHolding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Konsolidierung & Reporting
            </CardTitle>
            <CardDescription>
              Finanzielle Konsolidierungsregeln für das Konzernreporting
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="consolidationMode">Konsolidierungsmethode</Label>
              <Select value={formData.consolidationMode} onValueChange={(value) => setFormData({ ...formData, consolidationMode: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Methode wählen" />
                </SelectTrigger>
                <SelectContent>
                  {consolidationModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consolidationCurrency">Konzernwährung</Label>
              <Select value={formData.consolidationCurrency} onValueChange={(value) => setFormData({ ...formData, consolidationCurrency: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Währung wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  <SelectItem value="USD">USD (US-Dollar)</SelectItem>
                  <SelectItem value="CHF">CHF (Schweizer Franken)</SelectItem>
                  <SelectItem value="GBP">GBP (Britisches Pfund)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportingPeriod">Reporting-Rhythmus</Label>
              <Select value={formData.reportingPeriod} onValueChange={(value) => setFormData({ ...formData, reportingPeriod: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Rhythmus wählen" />
                </SelectTrigger>
                <SelectContent>
                  {reportingPeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Governance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Governance & Autonomie
          </CardTitle>
          <CardDescription>
            Steuerung der Entscheidungsbefugnisse zwischen Ebenen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="subsidiaryAutonomy">Autonomie der Gesellschaften</Label>
              <Select value={formData.subsidiaryAutonomy} onValueChange={(value) => setFormData({ ...formData, subsidiaryAutonomy: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Level wählen" />
                </SelectTrigger>
                <SelectContent>
                  {autonomyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Definiert, wie viel Eigenständigkeit die einzelnen Gesellschaften haben
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataAggregation">Datenaggregation</Label>
              <Select value={formData.dataAggregation} onValueChange={(value) => setFormData({ ...formData, dataAggregation: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Modus wählen" />
                </SelectTrigger>
                <SelectContent>
                  {dataAggregationModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Auf welcher Ebene werden Daten zusammengeführt?
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div>
              <Label className="text-base">Einstellungen vererben</Label>
              <p className="text-sm text-muted-foreground">
                Globale Einstellungen automatisch an Tochtergesellschaften weitergeben
              </p>
            </div>
            <Switch
              checked={formData.inheritSettings}
              onCheckedChange={(checked) => setFormData({ ...formData, inheritSettings: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Berechtigungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Berechtigungen nach Ebene
          </CardTitle>
          <CardDescription>
            Wer darf auf welcher Ebene Änderungen vornehmen?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border space-y-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                <Label>Override-Rechte</Label>
              </div>
              <Select value={formData.overrideLevel} onValueChange={(value) => setFormData({ ...formData, overrideLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {controlLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Welche Ebene darf Regeln überschreiben?
              </p>
            </div>

            <div className="p-4 rounded-lg border space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <Label>KI-Steuerung</Label>
              </div>
              <Select value={formData.aiControlLevel} onValueChange={(value) => setFormData({ ...formData, aiControlLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {controlLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Welche Ebene darf KI-Funktionen steuern?
              </p>
            </div>

            <div className="p-4 rounded-lg border space-y-3">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <Label>Export-Rechte</Label>
              </div>
              <Select value={formData.exportLevel} onValueChange={(value) => setFormData({ ...formData, exportLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {controlLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Welche Ebene darf Daten exportieren?
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance */}
      {formData.hasHolding && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Konzern-Compliance
            </CardTitle>
            <CardDescription>
              Rechtliche Anforderungen für Konzernstrukturen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label>Intercompany-Vereinbarungen</Label>
                <p className="text-sm text-muted-foreground">Verwaltung von Leistungsverrechnungen zwischen Gesellschaften</p>
              </div>
              <Switch
                checked={formData.intercompanyAgreements}
                onCheckedChange={(checked) => setFormData({ ...formData, intercompanyAgreements: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label>Verrechnungspreisdokumentation</Label>
                <p className="text-sm text-muted-foreground">Transfer Pricing Dokumentation aktivieren</p>
              </div>
              <Switch
                checked={formData.transferPricing}
                onCheckedChange={(checked) => setFormData({ ...formData, transferPricing: checked })}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label>Konsolidiertes Reporting</Label>
                <p className="text-sm text-muted-foreground">Konzernweite Finanzberichte erstellen</p>
              </div>
              <Switch
                checked={formData.consolidatedReporting}
                onCheckedChange={(checked) => setFormData({ ...formData, consolidatedReporting: checked })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Speichern */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="min-w-[200px]">
          <Save className="h-4 w-4 mr-2" />
          Änderungen speichern
        </Button>
      </div>
    </div>
  );
}
