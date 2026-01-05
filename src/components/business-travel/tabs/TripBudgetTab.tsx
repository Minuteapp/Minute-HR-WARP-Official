import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Euro, 
  Plane, 
  Hotel, 
  Utensils, 
  Car, 
  MoreHorizontal,
  TrendingUp
} from "lucide-react";
import { TripCost } from "@/types/business-travel-extended";

interface TripBudgetTabProps {
  budget: number;
  costs: TripCost[];
}

interface CostCategory {
  key: 'flight' | 'hotel' | 'food' | 'transport' | 'other';
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
}

const TripBudgetTab = ({ budget, costs }: TripBudgetTabProps) => {
  const categories: CostCategory[] = [
    { key: 'flight', label: 'Flug', icon: <Plane className="h-5 w-5" />, bgColor: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
    { key: 'hotel', label: 'Hotel', icon: <Hotel className="h-5 w-5" />, bgColor: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-600' },
    { key: 'food', label: 'Verpflegung', icon: <Utensils className="h-5 w-5" />, bgColor: 'bg-green-100 dark:bg-green-900/30', iconColor: 'text-green-600' },
    { key: 'transport', label: 'Transport', icon: <Car className="h-5 w-5" />, bgColor: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
    { key: 'other', label: 'Sonstiges', icon: <MoreHorizontal className="h-5 w-5" />, bgColor: 'bg-gray-100 dark:bg-gray-800', iconColor: 'text-gray-600' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
  };

  // Calculate totals per category
  const getCategoryTotal = (category: string): number => {
    return costs
      .filter(c => c.category === category)
      .reduce((sum, c) => sum + Number(c.amount), 0);
  };

  const totalSpent = costs.reduce((sum, c) => sum + Number(c.amount), 0);
  const usedPercentage = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

  // Build cost detail rows
  const costDetailRows = [
    { label: 'Flugkosten', amount: getCategoryTotal('flight') },
    { label: 'Hotelkosten', amount: getCategoryTotal('hotel') },
    { label: 'Verpflegung', amount: getCategoryTotal('food') },
    { label: 'Lokaler Transport', amount: getCategoryTotal('transport') },
    { label: 'Sonstige Kosten', amount: getCategoryTotal('other') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Euro className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Budget-Übersicht</h2>
        </div>
        <Badge variant={usedPercentage > 90 ? "destructive" : usedPercentage > 70 ? "secondary" : "default"}>
          {usedPercentage}% genutzt
        </Badge>
      </div>

      {/* Total Budget Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Gesamt-Budget</p>
              <p className="text-4xl font-bold">{formatCurrency(budget)}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const amount = getCategoryTotal(cat.key);
          const percentage = budget > 0 ? Math.round((amount / budget) * 100) : 0;
          
          return (
            <Card key={cat.key} className="overflow-hidden">
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${cat.bgColor} flex items-center justify-center mb-3`}>
                  <span className={cat.iconColor}>{cat.icon}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{cat.label}</p>
                <p className="text-lg font-bold">{formatCurrency(amount)}</p>
                <p className="text-xs text-muted-foreground">{percentage}%</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Cost Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detaillierte Kostenübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          {costs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Keine Kostendaten vorhanden</p>
          ) : (
            <div className="space-y-3">
              {costDetailRows.map((row, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between py-2 ${idx < costDetailRows.length - 1 ? 'border-b' : ''}`}
                >
                  <span className="text-sm">{row.label}</span>
                  <span className="font-medium">{formatCurrency(row.amount)}</span>
                </div>
              ))}
              
              {/* Total Row */}
              <div className="flex items-center justify-between pt-3 border-t-2">
                <span className="font-semibold">Gesamt</span>
                <span className="text-lg font-bold">{formatCurrency(totalSpent)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TripBudgetTab;