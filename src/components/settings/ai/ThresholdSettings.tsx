import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, AlertTriangle, DollarSign, Users } from "lucide-react";
import { useState } from "react";

interface SuggestionRule {
  id: string;
  process: string;
  threshold: number;
  unit: string;
  operator: 'greater' | 'less' | 'equal';
  enabled: boolean;
  category: 'risk' | 'budget' | 'performance' | 'compliance';
}

interface ThresholdSettingsProps {
  rules: SuggestionRule[];
  onUpdateRule: (ruleId: string, updates: Partial<SuggestionRule>) => void;
  onAddRule: (rule: Omit<SuggestionRule, 'id'>) => void;
}

const categoryIcons = {
  risk: AlertTriangle,
  budget: DollarSign,
  performance: TrendingUp,
  compliance: Users
};

const categoryLabels = {
  risk: 'Risiko-Analysen',
  budget: 'Budget-Warnungen',
  performance: 'Performance-Alerts',
  compliance: 'Compliance-Checks'
};

export function ThresholdSettings({ rules, onUpdateRule, onAddRule }: ThresholdSettingsProps) {
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRule, setNewRule] = useState<Omit<SuggestionRule, 'id'>>({
    process: '',
    threshold: 0,
    unit: '%',
    operator: 'greater',
    enabled: true,
    category: 'risk'
  });

  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, SuggestionRule[]>);

  const handleAddRule = () => {
    if (newRule.process.trim()) {
      onAddRule(newRule);
      setNewRule({
        process: '',
        threshold: 0,
        unit: '%',
        operator: 'greater',
        enabled: true,
        category: 'risk'
      });
      setIsAddingRule(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Schwellenwerte & Vorschlagslogiken
          </CardTitle>
          <Button 
            onClick={() => setIsAddingRule(true)} 
            size="sm"
            disabled={isAddingRule}
          >
            Schwellenwert hinzufügen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isAddingRule && (
          <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
            <h4 className="font-medium">Neuen Schwellenwert erstellen</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="process">Prozess/Metrik</Label>
                <Input
                  id="process"
                  placeholder="z.B. Fluktuationsrisiko"
                  value={newRule.process}
                  onChange={(e) => setNewRule({ ...newRule, process: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select 
                  value={newRule.category} 
                  onValueChange={(value) => setNewRule({ ...newRule, category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operator">Bedingung</Label>
                <Select 
                  value={newRule.operator} 
                  onValueChange={(value) => setNewRule({ ...newRule, operator: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="greater">Größer als</SelectItem>
                    <SelectItem value="less">Kleiner als</SelectItem>
                    <SelectItem value="equal">Gleich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="threshold">Schwellenwert</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule({ ...newRule, threshold: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Einheit</Label>
                <Select 
                  value={newRule.unit} 
                  onValueChange={(value) => setNewRule({ ...newRule, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="%">Prozent (%)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="days">Tage</SelectItem>
                    <SelectItem value="count">Anzahl</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddRule}>Hinzufügen</Button>
              <Button variant="outline" onClick={() => setIsAddingRule(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        {Object.entries(groupedRules).map(([category, categoryRules]) => {
          const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <CategoryIcon className="h-4 w-4" />
                <h3 className="font-medium text-sm">{categoryLabels[category as keyof typeof categoryLabels]}</h3>
              </div>
              
              <div className="space-y-3">
                {categoryRules.map((rule) => (
                  <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{rule.process}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {rule.operator === 'greater' ? '>' : rule.operator === 'less' ? '<' : '='} {rule.threshold} {rule.unit}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Schwellenwert: {rule.threshold} {rule.unit}</Label>
                      <Slider
                        value={[rule.threshold]}
                        onValueChange={([value]) => onUpdateRule(rule.id, { threshold: value })}
                        max={rule.unit === '%' ? 100 : 10000}
                        step={rule.unit === '%' ? 1 : 100}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {Object.keys(groupedRules).length === 0 && !isAddingRule && (
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Schwellenwerte konfiguriert</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}