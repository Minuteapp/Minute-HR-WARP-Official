
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

interface AIHint {
  country: string;
  type: 'warning' | 'info' | 'success';
  message: string;
}

interface ComplianceAIHintsProps {
  hints?: AIHint[];
}

const defaultHints: AIHint[] = [
  {
    country: 'USA',
    type: 'warning',
    message: 'L-1 Visum erfordert spezifische Nachweise für Führungspositionen. Frühzeitige Antragstellung empfohlen.',
  },
  {
    country: 'UK',
    type: 'info',
    message: 'Post-Brexit: Skilled Worker Visa benötigt Sponsorship Certificate des Arbeitgebers.',
  },
];

export function ComplianceAIHints({ hints = defaultHints }: ComplianceAIHintsProps) {
  const getIcon = (type: AIHint['type']) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBgColor = (type: AIHint['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          KI-gestützte Compliance-Hinweise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hints.map((hint, index) => (
            <div key={index} className={`p-3 rounded-lg border ${getBgColor(hint.type)}`}>
              <div className="flex items-start gap-2">
                {getIcon(hint.type)}
                <div>
                  <span className="font-medium text-sm">{hint.country}:</span>
                  <p className="text-sm text-muted-foreground mt-1">{hint.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
