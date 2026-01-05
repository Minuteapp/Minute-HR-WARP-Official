import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, AlertCircle } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeCorporateCards } from "@/hooks/useEmployeeCorporateCards";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CorporateCardsSectionProps {
  employee: Employee | null;
  isEditing: boolean;
}

export const CorporateCardsSection = ({ employee, isEditing }: CorporateCardsSectionProps) => {
  const { data: cards, isLoading, error } = useEmployeeCorporateCards(employee?.id || '');

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Firmenkreditkarten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Firmenkreditkarten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Fehler beim Laden der Firmenkreditkarten</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Firmenkreditkarten
          </CardTitle>
          <Button variant="link" size="sm" className="text-xs h-auto p-0">
            Neue Karte beantragen
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {(!cards || cards.length === 0) ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Keine Firmenkreditkarten zugewiesen</p>
            <p className="text-xs mt-1">Sie können eine neue Karte beantragen</p>
          </div>
        ) : (
          cards.map((card) => (
            <div key={card.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{card.card_type}</h4>
                    <Badge 
                      variant="default" 
                      className={`text-xs ${card.status === 'active' ? 'bg-black text-white' : 'bg-gray-400'}`}
                    >
                      {card.status === 'active' ? 'aktiv' : card.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{card.card_number_masked}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Karteninhaber</p>
                  <p className="font-medium">{card.holder_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gültig bis</p>
                  <p className="font-medium">
                    {card.valid_until 
                      ? format(new Date(card.valid_until), 'MM/yyyy', { locale: de })
                      : '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Primäre Nutzung</p>
                  <p className="font-medium">{card.usage_category || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Ausgestellt</p>
                  <p className="font-medium">
                    {card.issued_date 
                      ? format(new Date(card.issued_date), 'dd.MM.yyyy', { locale: de })
                      : '-'
                    }
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Monatslimit</span>
                  <span className="font-medium">
                    {card.current_usage.toFixed(2)} € von {card.monthly_limit.toFixed(2)} €
                  </span>
                </div>
                <Progress value={(card.current_usage / card.monthly_limit) * 100} className="h-2" />
                <p className="text-xs text-right mt-1 text-muted-foreground">
                  {((card.current_usage / card.monthly_limit) * 100).toFixed(1)}% verbraucht
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-7">
                  Details anzeigen
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-7">
                  Karte sperren
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
