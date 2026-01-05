import { DollarSign } from "lucide-react";

export const CostsHeader = () => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-primary/10 rounded-lg">
        <DollarSign className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Kosten & Budgets</h2>
        <p className="text-sm text-muted-foreground">
          Übersicht aller Kosten und Budgets für Entsendungen
        </p>
      </div>
    </div>
  );
};
