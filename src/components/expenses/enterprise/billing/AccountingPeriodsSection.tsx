import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle } from 'lucide-react';

interface AccountingPeriodsSectionProps {
  selectedPeriod: string;
  selectedCostCenter: string;
  onPeriodChange: (period: string) => void;
  onCostCenterChange: (costCenter: string) => void;
  closedPeriod?: { month: string; closedAt: string };
}

const AccountingPeriodsSection = ({
  selectedPeriod,
  selectedCostCenter,
  onPeriodChange,
  onCostCenterChange,
  closedPeriod,
}: AccountingPeriodsSectionProps) => {
  const periods = [
    'Dezember 2024',
    'November 2024',
    'Oktober 2024',
    'September 2024',
    'August 2024',
  ];

  const costCenters = [
    'Automatisch zuordnen',
    'IT',
    'Marketing',
    'Vertrieb',
    'HR',
    'Finanzen',
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Kontierung & Buchungsperioden</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Buchungsperiode</Label>
          <Select value={selectedPeriod} onValueChange={onPeriodChange}>
            <SelectTrigger>
              <SelectValue placeholder="Periode wählen" />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Kostenstelle</Label>
          <Select value={selectedCostCenter} onValueChange={onCostCenterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Kostenstelle wählen" />
            </SelectTrigger>
            <SelectContent>
              {costCenters.map((center) => (
                <SelectItem key={center} value={center}>
                  {center}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {closedPeriod && (
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Buchungsperiode abgeschlossen</h4>
              <p className="text-sm text-muted-foreground">
                Die Buchungsperiode <strong>{closedPeriod.month}</strong> wurde am {closedPeriod.closedAt} abgeschlossen. 
                Alle Ausgaben wurden exportiert und verbucht.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountingPeriodsSection;
