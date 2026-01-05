import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Check, X } from 'lucide-react';

const AIComplianceInfo = () => {
  const aiFeatures = [
    { name: 'KI-Zusammenfassungen', active: true },
    { name: 'Mustererkennung', active: true },
    { name: 'Forecasting', active: true },
    { name: 'Auto-Ranking', active: false }
  ];

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
          <Bot className="h-5 w-5" />
          KI & Compliance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Übersicht der KI-gestützten Funktionen im Recruiting-Modul und deren Compliance-Status.
        </p>
        <div className="space-y-2">
          {aiFeatures.map((feature) => (
            <div key={feature.name} className="flex items-center gap-2">
              {feature.active ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {feature.name}: <span className={feature.active ? 'text-green-600' : 'text-red-500'}>
                  {feature.active ? 'Aktiv' : 'Deaktiviert'}
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIComplianceInfo;
