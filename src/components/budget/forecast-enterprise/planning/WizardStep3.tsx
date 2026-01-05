import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Info } from 'lucide-react';
import { BudgetFormData } from './CreateBudgetWizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WizardStep3Props {
  formData: BudgetFormData;
  updateFormData: (data: Partial<BudgetFormData>) => void;
}

export const WizardStep3: React.FC<WizardStep3Props> = ({ formData, updateFormData }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: formData.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getLevelLabel = (level: string) => {
    const labels: { [key: string]: string } = {
      company: 'Unternehmen',
      subsidiary: 'Gesellschaft',
      location: 'Standort',
      department: 'Abteilung',
      team: 'Team',
      project: 'Projekt',
      cost_center: 'Kostenstelle',
    };
    return labels[level] || level;
  };

  const getBudgetTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      annual: 'Jahresbudget',
      quarterly: 'Quartalsbudget',
      project: 'Projektbudget',
      personnel: 'Personalbudget',
      investment: 'Investitionsbudget',
      esg: 'ESG-Budget',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10">
        <Settings className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-foreground">Einstellungen & Bestätigung</h4>
          <p className="text-sm text-muted-foreground">
            Überprüfen Sie die Zusammenfassung und konfigurieren Sie die Einstellungen.
          </p>
        </div>
      </div>

      {/* Budget Settings */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Budget-Einstellungen</h4>
        
        <div className="flex items-start gap-3">
          <Checkbox
            id="notifications"
            checked={formData.notificationsEnabled}
            onCheckedChange={(checked) => updateFormData({ notificationsEnabled: !!checked })}
          />
          <div>
            <Label htmlFor="notifications" className="cursor-pointer">
              Benachrichtigungen aktivieren
            </Label>
            <p className="text-sm text-muted-foreground">
              Erhalten Sie Benachrichtigungen bei Budgetänderungen und Überschreitungen.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="autoUpdate"
            checked={formData.autoUpdate}
            onCheckedChange={(checked) => updateFormData({ autoUpdate: !!checked })}
          />
          <div>
            <Label htmlFor="autoUpdate" className="cursor-pointer">
              Automatische Aktualisierung
            </Label>
            <p className="text-sm text-muted-foreground">
              Ist-Kosten werden automatisch aus verknüpften Modulen aktualisiert.
            </p>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => updateFormData({ tags: e.target.value })}
          placeholder="z.B. Marketing, Digital, Q1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Kommagetrennte Tags zur Kategorisierung
        </p>
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            Zusammenfassung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Budget-Name</span>
              <p className="font-medium">{formData.name || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Betrag</span>
              <p className="font-medium">{formatCurrency(formData.amount)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Ebene</span>
              <p className="font-medium">{getLevelLabel(formData.level)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Typ</span>
              <p className="font-medium">{getBudgetTypeLabel(formData.budgetType)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Zeitraum</span>
              <p className="font-medium">{formData.period || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Verantwortlich</span>
              <p className="font-medium">{formData.responsiblePerson || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
