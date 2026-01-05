import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

export const AIFeatureCards: React.FC = () => {
  const features = [
    {
      title: 'Abweichungserklärung',
      value: 'Automatisch',
      description: 'Root-Cause-Analyse für Budget-Abweichungen',
      icon: Target,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Prognoseverbesserung',
      value: '+12% Genauigkeit',
      description: 'ML-basierte Optimierung der Forecasts',
      icon: TrendingUp,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Frühwarnsystem',
      value: 'Echtzeit',
      description: 'Proaktive Risiko-Identifikation',
      icon: AlertTriangle,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {features.map((feature, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`h-12 w-12 rounded-lg ${feature.iconBg} flex items-center justify-center`}>
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{feature.title}</p>
                <p className="text-xl font-bold">{feature.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
