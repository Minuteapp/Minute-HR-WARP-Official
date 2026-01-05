
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Brain, 
  Users, 
  TrendingUp,
  Calculator,
  Save,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const ProjectPortfolioSettings = () => {
  const [settings, setSettings] = useState({
    // Allgemeine Portfolio Einstellungen
    enableFinancialAnalysis: true,
    enableSkillsMatrix: true,
    enableResourceHeatmap: true,
    autoCalculateROI: true,
    defaultDiscountRate: 10,
    
    // Skills-Matrix Einstellungen
    skillCategories: ['Frontend', 'Backend', 'Design', 'UX', 'Programming', 'Database', 'DevOps'],
    skillLevels: ['beginner', 'intermediate', 'advanced', 'expert'],
    requireSkillVerification: false,
    autoSkillMatching: true,
    skillDecayMonths: 12,
    
    // Ressourcen-Auslastung Einstellungen
    utilizationThresholds: {
      overloaded: 100,
      high: 85,
      normal: 70,
      available: 40
    },
    utilizationAlerts: true,
    forecastPeriodWeeks: 8,
    
    // Finanzielle Einstellungen
    enableCAPEXOPEXTracking: true,
    defaultCurrency: 'EUR',
    requireBudgetApproval: true,
    budgetVarianceThreshold: 10,
    
    // Dashboard Einstellungen
    refreshIntervalMinutes: 15,
    enableRealTimeUpdates: true,
    showAdvancedMetrics: true,
    compactView: false
  });

  const [newSkillCategory, setNewSkillCategory] = useState('');

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleThresholdChange = (threshold: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      utilizationThresholds: {
        ...prev.utilizationThresholds,
        [threshold]: value
      }
    }));
  };

  const addSkillCategory = () => {
    if (newSkillCategory.trim() && !settings.skillCategories.includes(newSkillCategory.trim())) {
      setSettings(prev => ({
        ...prev,
        skillCategories: [...prev.skillCategories, newSkillCategory.trim()]
      }));
      setNewSkillCategory('');
    }
  };

  const removeSkillCategory = (category: string) => {
    setSettings(prev => ({
      ...prev,
      skillCategories: prev.skillCategories.filter(c => c !== category)
    }));
  };

  const handleSave = () => {
    // Hier würden die Einstellungen gespeichert werden
    console.log('Saving portfolio settings:', settings);
    toast.success('Portfolio-Einstellungen gespeichert');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Portfolio-Dashboard Einstellungen</h1>
      </div>

      {/* Allgemeine Portfolio Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Allgemeine Portfolio-Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Finanzanalyse aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                ROI, NPV und IRR Berechnungen für Projekte
              </p>
            </div>
            <Switch
              checked={settings.enableFinancialAnalysis}
              onCheckedChange={(value) => handleSettingChange('enableFinancialAnalysis', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Skills-Matrix aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Skill-Tracking und Ressourcen-Matching
              </p>
            </div>
            <Switch
              checked={settings.enableSkillsMatrix}
              onCheckedChange={(value) => handleSettingChange('enableSkillsMatrix', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ressourcen-Heatmap aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Auslastungsvisualisierung für Team-Mitglieder
              </p>
            </div>
            <Switch
              checked={settings.enableResourceHeatmap}
              onCheckedChange={(value) => handleSettingChange('enableResourceHeatmap', value)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountRate">Standard-Diskontierungssatz (%)</Label>
              <Input
                id="discountRate"
                type="number"
                value={settings.defaultDiscountRate}
                onChange={(e) => handleSettingChange('defaultDiscountRate', parseFloat(e.target.value))}
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refreshInterval">Aktualisierungsintervall (Minuten)</Label>
              <Input
                id="refreshInterval"
                type="number"
                value={settings.refreshIntervalMinutes}
                onChange={(e) => handleSettingChange('refreshIntervalMinutes', parseInt(e.target.value))}
                min="1"
                max="60"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills-Matrix Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Skills-Matrix Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Skill-Kategorien</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.skillCategories.map((category) => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-600" 
                    onClick={() => removeSkillCategory(category)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Neue Kategorie hinzufügen..."
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkillCategory()}
              />
              <Button onClick={addSkillCategory} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Skill-Verifizierung erforderlich</Label>
              <p className="text-sm text-muted-foreground">
                Skills müssen von Vorgesetzten bestätigt werden
              </p>
            </div>
            <Switch
              checked={settings.requireSkillVerification}
              onCheckedChange={(value) => handleSettingChange('requireSkillVerification', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatisches Skill-Matching</Label>
              <p className="text-sm text-muted-foreground">
                Automatische Empfehlungen für Projektteams
              </p>
            </div>
            <Switch
              checked={settings.autoSkillMatching}
              onCheckedChange={(value) => handleSettingChange('autoSkillMatching', value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skillDecay">Skill-Verfall (Monate ohne Nutzung)</Label>
            <Input
              id="skillDecay"
              type="number"
              value={settings.skillDecayMonths}
              onChange={(e) => handleSettingChange('skillDecayMonths', parseInt(e.target.value))}
              min="1"
              max="36"
            />
          </div>
        </CardContent>
      </Card>

      {/* Ressourcen-Auslastung Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ressourcen-Auslastung Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Label>Auslastungs-Schwellenwerte (%)</Label>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overloaded" className="text-red-600">Überlastet</Label>
                <Input
                  id="overloaded"
                  type="number"
                  value={settings.utilizationThresholds.overloaded}
                  onChange={(e) => handleThresholdChange('overloaded', parseInt(e.target.value))}
                  min="0"
                  max="200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="high" className="text-orange-600">Hoch</Label>
                <Input
                  id="high"
                  type="number"
                  value={settings.utilizationThresholds.high}
                  onChange={(e) => handleThresholdChange('high', parseInt(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="normal" className="text-yellow-600">Normal</Label>
                <Input
                  id="normal"
                  type="number"
                  value={settings.utilizationThresholds.normal}
                  onChange={(e) => handleThresholdChange('normal', parseInt(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="available" className="text-green-600">Verfügbar</Label>
                <Input
                  id="available"
                  type="number"
                  value={settings.utilizationThresholds.available}
                  onChange={(e) => handleThresholdChange('available', parseInt(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auslastungs-Warnungen aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Benachrichtigungen bei kritischer Auslastung
              </p>
            </div>
            <Switch
              checked={settings.utilizationAlerts}
              onCheckedChange={(value) => handleSettingChange('utilizationAlerts', value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forecastPeriod">Prognosezeitraum (Wochen)</Label>
            <Input
              id="forecastPeriod"
              type="number"
              value={settings.forecastPeriodWeeks}
              onChange={(e) => handleSettingChange('forecastPeriodWeeks', parseInt(e.target.value))}
              min="1"
              max="26"
            />
          </div>
        </CardContent>
      </Card>

      {/* Finanzielle Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Finanzielle Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>CAPEX/OPEX Tracking aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Separate Verfolgung von Investitions- und Betriebskosten
              </p>
            </div>
            <Switch
              checked={settings.enableCAPEXOPEXTracking}
              onCheckedChange={(value) => handleSettingChange('enableCAPEXOPEXTracking', value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Standard-Währung</Label>
              <Select 
                value={settings.defaultCurrency} 
                onValueChange={(value) => handleSettingChange('defaultCurrency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetVariance">Budget-Abweichungsschwelle (%)</Label>
              <Input
                id="budgetVariance"
                type="number"
                value={settings.budgetVarianceThreshold}
                onChange={(e) => handleSettingChange('budgetVarianceThreshold', parseInt(e.target.value))}
                min="0"
                max="100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speichern Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Einstellungen speichern
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectPortfolioSettings;
