import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Info } from 'lucide-react';
import { BudgetFormData } from './CreateBudgetWizard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WizardStep2Props {
  formData: BudgetFormData;
  updateFormData: (data: Partial<BudgetFormData>) => void;
}

export const WizardStep2: React.FC<WizardStep2Props> = ({ formData, updateFormData }) => {
  const updateDistribution = (key: keyof typeof formData.distribution, value: number) => {
    updateFormData({
      distribution: {
        ...formData.distribution,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10">
        <DollarSign className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-medium text-foreground">Finanzielle Details</h4>
          <p className="text-sm text-muted-foreground">
            Legen Sie den Budgetbetrag und die Verteilung fest.
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Budget-Betrag *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
            <Input
              id="amount"
              type="number"
              value={formData.amount || ''}
              onChange={(e) => updateFormData({ amount: parseFloat(e.target.value) || 0 })}
              className="pl-8"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="currency">Währung *</Label>
          <Select value={formData.currency} onValueChange={(value) => updateFormData({ currency: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="CHF">CHF - Schweizer Franken</SelectItem>
              <SelectItem value="GBP">GBP - Britisches Pfund</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="costCenter">Kostenstelle</Label>
          <Input
            id="costCenter"
            value={formData.costCenter}
            onChange={(e) => updateFormData({ costCenter: e.target.value })}
            placeholder="z.B. 1000-IT"
          />
        </div>

        <div>
          <Label htmlFor="responsiblePerson">Verantwortlich *</Label>
          <Input
            id="responsiblePerson"
            value={formData.responsiblePerson}
            onChange={(e) => updateFormData({ responsiblePerson: e.target.value })}
            placeholder="Name des Verantwortlichen"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="approver">Genehmiger</Label>
          <Input
            id="approver"
            value={formData.approver}
            onChange={(e) => updateFormData({ approver: e.target.value })}
            placeholder="Name des Genehmigers"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional: Der Genehmiger wird benachrichtigt, wenn das Budget zur Freigabe bereit ist.
          </p>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description">Beschreibung / Zweck</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Beschreiben Sie den Zweck dieses Budgets..."
            rows={3}
          />
        </div>
      </div>

      {/* Budget Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            Budget-Verteilung
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="personnel" className="text-sm">
              Personalkosten <span className="text-muted-foreground">(empfohlen 60-70%)</span>
            </Label>
            <div className="relative">
              <Input
                id="personnel"
                type="number"
                value={formData.distribution.personnel}
                onChange={(e) => updateDistribution('personnel', parseInt(e.target.value) || 0)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="operations" className="text-sm">
              Betriebskosten <span className="text-muted-foreground">(empfohlen 15-25%)</span>
            </Label>
            <div className="relative">
              <Input
                id="operations"
                type="number"
                value={formData.distribution.operations}
                onChange={(e) => updateDistribution('operations', parseInt(e.target.value) || 0)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="investments" className="text-sm">
              Investitionen <span className="text-muted-foreground">(empfohlen 10-15%)</span>
            </Label>
            <div className="relative">
              <Input
                id="investments"
                type="number"
                value={formData.distribution.investments}
                onChange={(e) => updateDistribution('investments', parseInt(e.target.value) || 0)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="other" className="text-sm">Sonstige</Label>
            <div className="relative">
              <Input
                id="other"
                type="number"
                value={formData.distribution.other}
                onChange={(e) => updateDistribution('other', parseInt(e.target.value) || 0)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
