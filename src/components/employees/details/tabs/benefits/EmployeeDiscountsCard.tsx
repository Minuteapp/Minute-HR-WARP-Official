import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Percent, TrendingUp, ShoppingBag, Users } from "lucide-react";
import { format } from "date-fns";

interface DiscountUsage {
  discount_level: number;
  year_total: number;
  year_savings: number;
  last_order_date?: string;
  last_order_number?: string;
  eligible_family_members: number;
}

interface EmployeeDiscountsCardProps {
  discounts?: DiscountUsage;
}

export const EmployeeDiscountsCard = ({ discounts }: EmployeeDiscountsCardProps) => {
  if (!discounts) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Mitarbeiterrabatte auf eigene Produkte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keine Rabatt-Daten vorhanden
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Mitarbeiterrabatte auf eigene Produkte
          </div>
          <div className="text-2xl font-bold text-primary">
            {discounts.discount_level}% auf alle Produkte
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Rabatt-Level</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{discounts.discount_level}%</div>
              <Badge variant="secondary">Premium</Badge>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Genutzt 2025</div>
            </div>
            <div className="text-2xl font-bold">
              {Number(discounts.year_total).toFixed(2)} €
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Ersparnis: {Number(discounts.year_savings).toFixed(2)} €
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Letzte Bestellung</div>
            </div>
            {discounts.last_order_date && (
              <>
                <div className="text-lg font-bold">
                  {format(new Date(discounts.last_order_date), 'dd.MM.yyyy')}
                </div>
                {discounts.last_order_number && (
                  <div className="text-sm text-muted-foreground">
                    Bestell-Nr: {discounts.last_order_number}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">Freigabe</div>
            </div>
            <div className="text-2xl font-bold">Familie</div>
            <div className="text-sm text-muted-foreground">
              +{discounts.eligible_family_members} Personen
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 bg-primary hover:bg-primary/90">
            Zum Mitarbeiter-Shop
          </Button>
          <Button variant="outline" className="flex-1">
            Bestellhistorie anzeigen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
