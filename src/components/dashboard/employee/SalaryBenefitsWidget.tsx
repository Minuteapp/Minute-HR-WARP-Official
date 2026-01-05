import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Calendar, TrendingUp, Gift } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const SalaryBenefitsWidget: React.FC = () => {
  const nextPayday = '31. Januar';
  const bonusProgress = 75;
  const benefits = [
    { name: 'Firmenwagen', active: true },
    { name: 'Jobticket', active: true },
    { name: 'Fitness', active: true },
  ];

  return (
    <Card className="h-full bg-background border-primary/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wallet className="h-4 w-4 text-green-600" />
          Gehalt & Benefits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-3 w-3 text-green-600" />
            <span className="text-xs text-muted-foreground">Nächste Auszahlung</span>
          </div>
          <p className="text-lg font-semibold text-green-600">{nextPayday}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3 w-3 text-amber-600" />
            <span className="text-xs text-muted-foreground">Bonus-Fortschritt</span>
          </div>
          <Progress value={bonusProgress} className="h-2" />
          <p className="text-[10px] text-muted-foreground text-right">{bonusProgress}% erreicht</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Gift className="h-3 w-3 text-purple-600" />
            <span className="text-xs font-medium">Aktive Benefits</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {benefits.map((benefit, index) => (
              <span
                key={index}
                className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
              >
                {benefit.name}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
