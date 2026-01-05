import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, TrendingUp, Target } from 'lucide-react';

export type DeviationType = 'plan-vs-actual' | 'plan-vs-forecast' | 'forecast-vs-actual';

interface DeviationTypesSelectorProps {
  selected: DeviationType;
  onSelect: (type: DeviationType) => void;
}

export const DeviationTypesSelector: React.FC<DeviationTypesSelectorProps> = ({
  selected,
  onSelect
}) => {
  const types = [
    {
      id: 'plan-vs-actual' as DeviationType,
      title: 'Plan vs. Ist',
      subtitle: 'YTD Analyse',
      description: 'Aktuelle Budgetentwicklung',
      icon: BarChart3,
      color: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-500'
    },
    {
      id: 'plan-vs-forecast' as DeviationType,
      title: 'Plan vs. Forecast',
      subtitle: 'Jahresendprognose',
      description: 'Geplant vs. prognostiziert',
      icon: TrendingUp,
      color: 'text-primary',
      borderColor: 'border-primary'
    },
    {
      id: 'forecast-vs-actual' as DeviationType,
      title: 'Forecast vs. Ist',
      subtitle: 'Prognosegenauigkeit',
      description: 'Qualitätskontrolle',
      icon: Target,
      color: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {types.map((type) => {
        const isSelected = selected === type.id;
        return (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? `${type.borderColor} border-2 bg-primary/5` : 'border-border hover:border-muted-foreground'
            }`}
            onClick={() => onSelect(type.id)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                  <type.icon className={`h-5 w-5 ${isSelected ? type.color : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className={`font-medium ${isSelected ? type.color : 'text-foreground'}`}>
                    {type.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{type.subtitle}</p>
                  <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
