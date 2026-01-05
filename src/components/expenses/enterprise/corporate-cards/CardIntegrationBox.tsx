
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

const CardIntegrationBox = () => {
  const integrations = [
    'Visa Business',
    'Mastercard Corporate',
    'American Express',
    'Stripe Issuing',
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Kartenintegration
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Firmenkarten sind mit folgenden Systemen verbunden:
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="border border-border rounded-md px-3 py-1.5 text-sm text-foreground bg-background"
            >
              {integration}
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            Kartentransaktionen werden automatisch als Ausgaben erfasst und können 
            direkt den entsprechenden Projekten und Kostenstellen zugeordnet werden.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardIntegrationBox;
