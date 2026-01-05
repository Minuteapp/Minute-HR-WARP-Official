
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Calculator, DollarSign, TrendingUp, Settings, PieChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProjectPortfolioSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    defaultDiscountRate: 10,
    defaultCurrency: 'EUR',
    roiThresholdGood: 15,
    roiThresholdAcceptable: 5,
    enableCapexOpexCategorization: true,
    requireFinancialApproval: true,
    financialApprovalThreshold: 10000,
    enableNpvCalculations: true,
    enableIrrCalculations: true,
    autoCalculateFinancials: true,
    budgetIntegrationEnabled: true
  });

  const handleSave = async () => {
    try {
      // Hier würde normalerweise ein API-Call stattfinden
      console.log('Portfolio-Einstellungen gespeichert:', settings);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Portfolio-Einstellungen wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Calculations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Finanzberechnungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultDiscountRate">Standard-Diskontierungssatz (%)</Label>
              <Input
                id="defaultDiscountRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.defaultDiscountRate}
                onChange={(e) => setSettings({
                  ...settings,
                  defaultDiscountRate: parseFloat(e.target.value) || 0
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Standard-Währung</Label>
              <Select 
                value={settings.defaultCurrency} 
                onValueChange={(value) => setSettings({...settings, defaultCurrency: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  <SelectItem value="USD">US Dollar (USD)</SelectItem>
                  <SelectItem value="GBP">Britisches Pfund (GBP)</SelectItem>
                  <SelectItem value="CHF">Schweizer Franken (CHF)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>NPV-Berechnungen aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Berechnung des Nettokapitalwerts für Projekte
              </p>
            </div>
            <Switch
              checked={settings.enableNpvCalculations}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                enableNpvCalculations: checked
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>IRR-Berechnungen aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Berechnung der internen Rendite
              </p>
            </div>
            <Switch
              checked={settings.enableIrrCalculations}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                enableIrrCalculations: checked
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* ROI Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ROI-Schwellenwerte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="roiThresholdGood">Guter ROI-Schwellenwert (%)</Label>
              <Input
                id="roiThresholdGood"
                type="number"
                min="0"
                max="100"
                value={settings.roiThresholdGood}
                onChange={(e) => setSettings({
                  ...settings,
                  roiThresholdGood: parseFloat(e.target.value) || 0
                })}
              />
              <p className="text-xs text-muted-foreground">
                Projekte mit ROI über diesem Wert werden als "gut" eingestuft
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roiThresholdAcceptable">Akzeptabler ROI-Schwellenwert (%)</Label>
              <Input
                id="roiThresholdAcceptable"
                type="number"
                min="0"
                max="100"
                value={settings.roiThresholdAcceptable}
                onChange={(e) => setSettings({
                  ...settings,
                  roiThresholdAcceptable: parseFloat(e.target.value) || 0
                })}
              />
              <p className="text-xs text-muted-foreground">
                Projekte mit ROI über diesem Wert werden als "akzeptabel" eingestuft
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CAPEX/OPEX Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            CAPEX/OPEX-Kategorisierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>CAPEX/OPEX-Kategorisierung aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Kategorisierung von Projekten in Investitions- und Betriebskosten
              </p>
            </div>
            <Switch
              checked={settings.enableCapexOpexCategorization}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                enableCapexOpexCategorization: checked
              })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Budget Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget-Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Budget-Integration aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Verknüpfung mit dem Budget-Modul für Finanzplanung
              </p>
            </div>
            <Switch
              checked={settings.budgetIntegrationEnabled}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                budgetIntegrationEnabled: checked
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Finanzielle Genehmigung erforderlich</Label>
              <p className="text-sm text-muted-foreground">
                Projekte über dem Schwellenwert benötigen finanzielle Genehmigung
              </p>
            </div>
            <Switch
              checked={settings.requireFinancialApproval}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                requireFinancialApproval: checked
              })}
            />
          </div>

          {settings.requireFinancialApproval && (
            <div className="space-y-2">
              <Label htmlFor="financialApprovalThreshold">Genehmigungsschwellenwert (€)</Label>
              <Input
                id="financialApprovalThreshold"
                type="number"
                min="0"
                value={settings.financialApprovalThreshold}
                onChange={(e) => setSettings({
                  ...settings,
                  financialApprovalThreshold: parseFloat(e.target.value) || 0
                })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="min-w-32">
          <Settings className="h-4 w-4 mr-2" />
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default ProjectPortfolioSettings;
