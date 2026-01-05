
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  AlertTriangle, 
  Calendar,
  Settings,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

interface ShiftRule {
  id: string;
  name: string;
  description: string;
  value: string | number | boolean;
  type: 'number' | 'boolean' | 'time' | 'text';
  category: 'arbeitszeit' | 'pause' | 'ruhezeit' | 'wochenarbeitszeit' | 'feiertage';
  isActive: boolean;
  isLegal: boolean; // Gesetzlich vorgeschrieben
}

const RuleSettings = () => {
  const [rules, setRules] = useState<ShiftRule[]>([
    // Arbeitszeitgesetz (ArbZG)
    {
      id: 'max_daily_hours',
      name: 'Maximale tägliche Arbeitszeit',
      description: 'Die werktägliche Arbeitszeit darf 8 Stunden nicht überschreiten (§ 3 ArbZG)',
      value: 8,
      type: 'number',
      category: 'arbeitszeit',
      isActive: true,
      isLegal: true
    },
    {
      id: 'max_daily_hours_extended',
      name: 'Verlängerte tägliche Arbeitszeit',
      description: 'Bis zu 10 Stunden, wenn innerhalb von 6 Monaten im Durchschnitt 8 Stunden nicht überschritten werden (§ 3 ArbZG)',
      value: 10,
      type: 'number',
      category: 'arbeitszeit',
      isActive: true,
      isLegal: true
    },
    {
      id: 'min_break_6h',
      name: 'Mindestpause bei 6-9 Stunden',
      description: 'Bei einer Arbeitszeit von mehr als 6 bis zu 9 Stunden: mindestens 30 Minuten Pause (§ 4 ArbZG)',
      value: 30,
      type: 'number',
      category: 'pause',
      isActive: true,
      isLegal: true
    },
    {
      id: 'min_break_9h',
      name: 'Mindestpause bei über 9 Stunden',
      description: 'Bei einer Arbeitszeit von mehr als 9 Stunden: mindestens 45 Minuten Pause (§ 4 ArbZG)',
      value: 45,
      type: 'number',
      category: 'pause',
      isActive: true,
      isLegal: true
    },
    {
      id: 'min_rest_period',
      name: 'Mindestruhezeit',
      description: 'Nach Beendigung der täglichen Arbeitszeit müssen mindestens 11 Stunden ununterbrochene Ruhezeit gewährt werden (§ 5 ArbZG)',
      value: 11,
      type: 'number',
      category: 'ruhezeit',
      isActive: true,
      isLegal: true
    },
    {
      id: 'max_weekly_hours',
      name: 'Maximale wöchentliche Arbeitszeit',
      description: 'Die wöchentliche Arbeitszeit darf im Durchschnitt von 6 Monaten 48 Stunden nicht überschreiten (§ 3 ArbZG)',
      value: 48,
      type: 'number',
      category: 'wochenarbeitszeit',
      isActive: true,
      isLegal: true
    },
    {
      id: 'sunday_work_prohibited',
      name: 'Sonntagsarbeitsverbot',
      description: 'Arbeitnehmer dürfen an Sonn- und gesetzlichen Feiertagen nicht beschäftigt werden (§ 9 ArbZG)',
      value: true,
      type: 'boolean',
      category: 'feiertage',
      isActive: true,
      isLegal: true
    },
    // Betriebsspezifische Regeln
    {
      id: 'min_staff_per_shift',
      name: 'Mindestbesetzung pro Schicht',
      description: 'Minimale Anzahl von Mitarbeitern, die gleichzeitig anwesend sein müssen',
      value: 2,
      type: 'number',
      category: 'arbeitszeit',
      isActive: true,
      isLegal: false
    },
    {
      id: 'night_shift_premium',
      name: 'Nachtschichtzuschlag',
      description: 'Prozentualer Zuschlag für Nachtschichten (22:00-06:00 Uhr)',
      value: 25,
      type: 'number',
      category: 'arbeitszeit',
      isActive: true,
      isLegal: false
    }
  ]);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleRuleChange = (ruleId: string, newValue: string | number | boolean) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, value: newValue }
        : rule
    ));
    setHasUnsavedChanges(true);
  };

  const handleRuleToggle = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    try {
      // Hier würde die Speicherung in der Datenbank erfolgen
      // await saveShiftRules(rules);
      
      toast.success('Regeln erfolgreich gespeichert');
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error('Fehler beim Speichern der Regeln');
      console.error('Fehler beim Speichern:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'arbeitszeit':
        return <Clock className="h-4 w-4" />;
      case 'pause':
        return <AlertTriangle className="h-4 w-4" />;
      case 'ruhezeit':
        return <Calendar className="h-4 w-4" />;
      case 'wochenarbeitszeit':
        return <Users className="h-4 w-4" />;
      case 'feiertage':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'arbeitszeit':
        return 'Arbeitszeit';
      case 'pause':
        return 'Pausen';
      case 'ruhezeit':
        return 'Ruhezeiten';
      case 'wochenarbeitszeit':
        return 'Wochenarbeitszeit';
      case 'feiertage':
        return 'Feiertage';
      default:
        return 'Sonstige';
    }
  };

  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, ShiftRule[]>);

  const renderRuleInput = (rule: ShiftRule) => {
    switch (rule.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={rule.value as number}
            onChange={(e) => handleRuleChange(rule.id, parseInt(e.target.value) || 0)}
            disabled={!rule.isActive}
            className="w-24"
          />
        );
      case 'boolean':
        return (
          <Switch
            checked={rule.value as boolean}
            onCheckedChange={(checked) => handleRuleChange(rule.id, checked)}
            disabled={!rule.isActive}
          />
        );
      case 'time':
        return (
          <Input
            type="time"
            value={rule.value as string}
            onChange={(e) => handleRuleChange(rule.id, e.target.value)}
            disabled={!rule.isActive}
            className="w-32"
          />
        );
      default:
        return (
          <Input
            type="text"
            value={rule.value as string}
            onChange={(e) => handleRuleChange(rule.id, e.target.value)}
            disabled={!rule.isActive}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Gesetzliche & tarifliche Regeln</h2>
          <p className="text-muted-foreground">
            Konfigurieren Sie die Arbeitszeitregeln entsprechend dem deutschen Arbeitszeitgesetz und Ihren betrieblichen Anforderungen
          </p>
        </div>
        <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
          <Save className="h-4 w-4 mr-2" />
          Speichern
        </Button>
      </div>

      {Object.entries(groupedRules).map(([category, categoryRules]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getCategoryIcon(category)}
              {getCategoryName(category)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryRules.map((rule, index) => (
              <div key={rule.id}>
                <div className="flex items-start justify-between space-x-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">{rule.name}</Label>
                      {rule.isLegal && (
                        <Badge variant="destructive" className="text-xs">
                          Gesetzlich
                        </Badge>
                      )}
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => handleRuleToggle(rule.id)}
                        disabled={rule.isLegal} // Gesetzliche Regeln können nicht deaktiviert werden
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rule.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderRuleInput(rule)}
                    {rule.type === 'number' && rule.category === 'arbeitszeit' && 
                      <span className="text-sm text-muted-foreground">Std.</span>
                    }
                    {rule.type === 'number' && rule.category === 'pause' && 
                      <span className="text-sm text-muted-foreground">Min.</span>
                    }
                  </div>
                </div>
                {index < categoryRules.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {hasUnsavedChanges && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Ungespeicherte Änderungen</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Sie haben Änderungen vorgenommen, die noch nicht gespeichert wurden.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RuleSettings;
