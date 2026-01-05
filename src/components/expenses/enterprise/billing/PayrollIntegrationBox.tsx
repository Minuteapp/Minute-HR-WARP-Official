import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Settings } from 'lucide-react';

interface PayrollIntegrationBoxProps {
  nextPayrollDate?: Date;
  onSettings: () => void;
}

const PayrollIntegrationBox = ({ nextPayrollDate, onSettings }: PayrollIntegrationBoxProps) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <Card className="bg-purple-50 border-purple-100">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <CreditCard className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-foreground mb-1">Payroll-Integration</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Rückerstattungen können automatisch mit der Gehaltsabrechnung verrechnet werden.
              {nextPayrollDate && (
                <> Die nächste Payroll-Verarbeitung erfolgt am <strong>{formatDate(nextPayrollDate)}</strong>.</>
              )}
            </p>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={onSettings}
            >
              <Settings className="h-4 w-4 mr-2" />
              Payroll-Einstellungen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayrollIntegrationBox;
