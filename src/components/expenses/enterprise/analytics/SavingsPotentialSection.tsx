
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import SavingsPotentialItem from './SavingsPotentialItem';

interface SavingsPotential {
  id: string;
  category: string;
  tip: string;
  amount: number;
}

interface SavingsPotentialSectionProps {
  data: SavingsPotential[];
  totalSavings: number;
}

const SavingsPotentialSection = ({ data, totalSavings }: SavingsPotentialSectionProps) => {
  const hasData = data.length > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Management-Reports
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Einsparpotenziale (KI-Analyse)
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <>
            <div className="space-y-1">
              {data.map((item) => (
                <SavingsPotentialItem
                  key={item.id}
                  category={item.category}
                  tip={item.tip}
                  amount={item.amount}
                />
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-700 dark:text-green-400">
                  Gesamtes Einsparpotenzial
                </span>
                <span className="font-bold text-green-700 dark:text-green-400">
                  €{totalSavings.toLocaleString('de-DE')}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            Keine Einsparpotenziale identifiziert
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsPotentialSection;
