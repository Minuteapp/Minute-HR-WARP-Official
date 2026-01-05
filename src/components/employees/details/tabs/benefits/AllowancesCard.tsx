import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, UtensilsCrossed, Fuel, Ticket, Wifi } from "lucide-react";

interface Allowance {
  type: string;
  name: string;
  amount: number;
  description?: string;
}

interface AllowancesCardProps {
  allowances: Allowance[];
}

const typeIcons: Record<string, any> = {
  meal: UtensilsCrossed,
  fuel: Fuel,
  deutschlandticket: Ticket,
  internet: Wifi,
  other: FileText,
};

export const AllowancesCard = ({ allowances }: AllowancesCardProps) => {
  const totalAmount = allowances.reduce((sum, a) => sum + Number(a.amount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Sachbezüge & Zuschüsse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-4">
          <div className="text-sm text-green-700 dark:text-green-300 mb-1">
            Monatliche Sachbezüge
          </div>
          <div className="text-3xl font-bold text-green-800 dark:text-green-200">
            {totalAmount.toFixed(2)} €
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            Steuerfrei nach § 8 Abs. 2 EStG
          </div>
        </div>

        <div className="space-y-3">
          {allowances.map((allowance, index) => {
            const Icon = typeIcons[allowance.type] || FileText;
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{allowance.name}</div>
                    {allowance.description && (
                      <div className="text-sm text-muted-foreground">
                        {allowance.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{Number(allowance.amount).toFixed(2)} €</div>
                  <div className="text-xs text-muted-foreground">/Monat</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
