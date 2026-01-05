import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, TrendingDown, Heart, TrendingUp } from 'lucide-react';

export interface ESGKPIData {
  esgScore: { value: number; trend: number };
  diversityQuote: { value: number; target: number };
  genderPayGap: { value: number; targetMax: number };
  wellbeingScore: { value: number; target: number };
}

interface ESGKPICardsProps {
  data?: ESGKPIData;
}

export const ESGKPICards: React.FC<ESGKPICardsProps> = ({ data }) => {
  const kpis = [
    {
      icon: Target,
      iconBg: 'bg-purple-100 dark:bg-purple-950/30',
      iconColor: 'text-purple-600',
      title: 'ESG-Score Gesamt',
      value: data?.esgScore?.value !== undefined ? `${data.esgScore.value}/100` : '--/100',
      subtitle: data?.esgScore?.trend !== undefined ? (
        <span className={`flex items-center gap-1 text-xs ${data.esgScore.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {data.esgScore.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {data.esgScore.trend >= 0 ? '+' : ''}{data.esgScore.trend} vs. Vorjahr
        </span>
      ) : 'Keine Daten',
    },
    {
      icon: Users,
      iconBg: 'bg-blue-100 dark:bg-blue-950/30',
      iconColor: 'text-blue-600',
      title: 'Diversity-Quote',
      value: data?.diversityQuote?.value !== undefined ? `${data.diversityQuote.value}%` : '--%',
      subtitle: data?.diversityQuote?.target !== undefined ? `Ziel: ${data.diversityQuote.target}%` : 'Keine Daten',
    },
    {
      icon: TrendingDown,
      iconBg: 'bg-green-100 dark:bg-green-950/30',
      iconColor: 'text-green-600',
      title: 'Gender Pay Gap',
      value: data?.genderPayGap?.value !== undefined ? `${data.genderPayGap.value}%` : '--%',
      subtitle: data?.genderPayGap?.targetMax !== undefined ? (
        <span className={data.genderPayGap.value <= data.genderPayGap.targetMax ? 'text-green-600' : 'text-red-600'}>
          {'<'} {data.genderPayGap.targetMax}% Ziel
        </span>
      ) : 'Keine Daten',
    },
    {
      icon: Heart,
      iconBg: 'bg-pink-100 dark:bg-pink-950/30',
      iconColor: 'text-pink-600',
      title: 'Wellbeing-Score',
      value: data?.wellbeingScore?.value !== undefined ? data.wellbeingScore.value.toString() : '--',
      subtitle: data?.wellbeingScore?.target !== undefined ? `Ziel: ≥${data.wellbeingScore.target}` : 'Keine Daten',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <Card key={index} className="bg-card">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${kpi.iconBg}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <div className="text-sm text-muted-foreground">{kpi.subtitle}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
