import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info } from 'lucide-react';
import { BudgetFormData } from './CreateBudgetWizard';

interface WizardStep1Props {
  formData: BudgetFormData;
  updateFormData: (data: Partial<BudgetFormData>) => void;
}

export const WizardStep1: React.FC<WizardStep1Props> = ({ formData, updateFormData }) => {
  const levels = [
    { value: 'company', label: 'Unternehmen' },
    { value: 'subsidiary', label: 'Gesellschaft' },
    { value: 'location', label: 'Standort' },
    { value: 'department', label: 'Abteilung' },
    { value: 'team', label: 'Team' },
    { value: 'project', label: 'Projekt' },
    { value: 'cost_center', label: 'Kostenstelle' },
  ];

  const budgetTypes = [
    { value: 'annual', label: 'Jahresbudget' },
    { value: 'quarterly', label: 'Quartalsbudget' },
    { value: 'project', label: 'Projektbudget' },
    { value: 'personnel', label: 'Personalbudget' },
    { value: 'investment', label: 'Investitionsbudget' },
    { value: 'esg', label: 'ESG-Budget' },
  ];

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10">
        <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-foreground">Grundinformationen</h4>
          <p className="text-sm text-muted-foreground">
            Definieren Sie die grundlegenden Informationen für Ihr neues Budget.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="name">Budget-Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="z.B. IT-Budget 2025"
          />
        </div>

        <div>
          <Label htmlFor="level">Budget-Ebene *</Label>
          <Select value={formData.level} onValueChange={(value) => updateFormData({ level: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Ebene auswählen" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="budgetType">Budget-Typ *</Label>
          <Select value={formData.budgetType} onValueChange={(value) => updateFormData({ budgetType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Typ auswählen" />
            </SelectTrigger>
            <SelectContent>
              {budgetTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="period">Zeitraum *</Label>
          <Input
            id="period"
            value={formData.period}
            onChange={(e) => updateFormData({ period: e.target.value })}
            placeholder="z.B. Q1 2025 oder 2025"
          />
        </div>

        <div>
          <Label htmlFor="department">Abteilung</Label>
          <Select value={formData.department} onValueChange={(value) => updateFormData({ department: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Abteilung auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="it">IT</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="finance">Finanzen</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="sales">Vertrieb</SelectItem>
              <SelectItem value="operations">Betrieb</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="startDate">Startdatum *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => updateFormData({ startDate: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="endDate">Enddatum *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => updateFormData({ endDate: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};
