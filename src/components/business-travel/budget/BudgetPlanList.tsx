
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetPlan } from "@/types/business-travel";
import { ArrowUpRight, Calendar, CheckCircle, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { formatCurrency } from "@/utils/currencyUtils";
import { Badge } from "@/components/ui/badge";

interface BudgetPlanListProps {
  budgetPlans: BudgetPlan[];
  isLoading: boolean;
  onSelectBudget: (id: string) => void;
}

const BudgetPlanStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "active":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aktiv</Badge>;
    case "closed":
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Abgeschlossen</Badge>;
    case "draft":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Entwurf</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const BudgetTypeLabel = ({ type }: { type: string }) => {
  switch (type) {
    case "department":
      return "Abteilung";
    case "project":
      return "Projekt";
    case "team":
      return "Team";
    case "cost_center":
      return "Kostenstelle";
    default:
      return type;
  }
};

const BudgetPlanList: React.FC<BudgetPlanListProps> = ({ budgetPlans, isLoading, onSelectBudget }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-5 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="mt-4 flex justify-between">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-8 w-24" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (budgetPlans.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-medium">Keine Budgetpläne vorhanden</h3>
          <p className="text-muted-foreground mt-1">
            Erstellen Sie einen neuen Budgetplan mit dem Button oben.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {budgetPlans.map((budget) => (
        <Card 
          key={budget.id} 
          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onSelectBudget(budget.id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{budget.name}</h3>
              <div className="flex gap-2 items-center mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  <BudgetTypeLabel type={budget.type} />: {budget.assigned_to_name}
                </span>
              </div>
            </div>
            <BudgetPlanStatusBadge status={budget.status} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="text-sm">
              <p className="text-muted-foreground">Gesamtbudget</p>
              <p className="font-medium">{formatCurrency(budget.amount, budget.currency as any)}</p>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Verwendet</p>
              <p className="font-medium">{formatCurrency(budget.used_amount, budget.currency as any)}</p>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Verbleibend</p>
              <p className="font-medium">{formatCurrency(budget.remaining_amount, budget.currency as any)}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {format(new Date(budget.start_date), "dd.MM.yyyy", { locale: de })} - 
              {format(new Date(budget.end_date), "dd.MM.yyyy", { locale: de })}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default BudgetPlanList;
