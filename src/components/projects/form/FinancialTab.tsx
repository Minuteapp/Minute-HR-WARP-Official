
import { TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { ProjectFormData } from '@/hooks/projects/useProjectForm';

interface FinancialTabProps {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: any) => void;
  onBack: () => void;
  onNext: () => void;
  active: boolean;
  forceMount?: boolean;
  mode: 'create' | 'edit';
}

export const FinancialTab = ({ 
  formData, 
  onChange, 
  onBack, 
  onNext,
  active, 
  forceMount = false,
  mode 
}: FinancialTabProps) => {
  const calculateROI = () => {
    const expectedRevenue = formData.expectedRevenue || 0;
    const totalInvestment = (formData.capexAmount || 0) + (formData.opexAmount || 0);
    if (totalInvestment > 0) {
      const roi = ((expectedRevenue - totalInvestment) / totalInvestment) * 100;
      onChange('roiPercentage', Math.round(roi * 100) / 100);
    }
  };

  return (
    <TabsContent value="financial" className={active ? 'block' : 'hidden'} forceMount={forceMount || undefined}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Finanzielle Planung
          </h3>
          <p className="text-sm text-gray-500">Definieren Sie Budget, Investitionen und erwartete Erträge</p>
        </div>

        {/* Budget & Investitionstyp */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Budget & Investitionsart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Gesamtbudget</Label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => onChange('budget', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Währung</Label>
                <Select value={formData.currency} onValueChange={(value) => onChange('currency', value)}>
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
              <div className="space-y-2">
                <Label>Investitionstyp</Label>
                <Select 
                  value={formData.investmentType} 
                  onValueChange={(value) => onChange('investmentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Typ wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAPEX">CAPEX (Investitionsausgaben)</SelectItem>
                    <SelectItem value="OPEX">OPEX (Betriebsausgaben)</SelectItem>
                    <SelectItem value="MIXED">Gemischt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CAPEX/OPEX Aufschlüsselung */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Investitionsaufschlüsselung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CAPEX-Anteil</Label>
                <Input
                  type="number"
                  value={formData.capexAmount}
                  onChange={(e) => onChange('capexAmount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500">Einmalige Investitionskosten</p>
              </div>
              <div className="space-y-2">
                <Label>OPEX-Anteil</Label>
                <Input
                  type="number"
                  value={formData.opexAmount}
                  onChange={(e) => onChange('opexAmount', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500">Laufende Betriebskosten</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Erwartete Erträge & ROI */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ertragsplanung & ROI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Erwartete Erträge</Label>
                <Input
                  type="number"
                  value={formData.expectedRevenue}
                  onChange={(e) => onChange('expectedRevenue', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Diskontierungssatz (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.discountRate}
                  onChange={(e) => onChange('discountRate', parseFloat(e.target.value) || 0)}
                  placeholder="5.0"
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>ROI (%)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={formData.roiPercentage}
                    onChange={(e) => onChange('roiPercentage', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={calculateROI}
                  >
                    <Calculator className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>NPV</Label>
                <Input
                  type="number"
                  value={formData.npvValue}
                  onChange={(e) => onChange('npvValue', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>IRR (%)</Label>
                <Input
                  type="number"
                  value={formData.irrPercentage}
                  onChange={(e) => onChange('irrPercentage', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="financial-calculations"
                checked={formData.enableFinancialCalculations}
                onCheckedChange={(checked) => onChange('enableFinancialCalculations', checked)}
              />
              <Label htmlFor="financial-calculations">
                Erweiterte Finanzberechnungen aktivieren
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Zurück
          </Button>
          <Button onClick={onNext}>
            Weiter
          </Button>
        </div>
      </div>
    </TabsContent>
  );
};
