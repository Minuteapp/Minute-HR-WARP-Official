
import { BudgetInput } from "./budget/BudgetInput";
import { CostCenterInput } from "./budget/CostCenterInput";
import { BudgetTypeSelector } from "./budget/BudgetTypeSelector";
import { TimeTrackingToggle } from "./budget/TimeTrackingToggle";
import { BudgetAlertSettings } from "./budget/BudgetAlertSettings";
import { PiggyBank } from "lucide-react";

interface BudgetSectionProps {
  budget?: number;
  costCenter?: string;
  budgetType?: string;
  enableTimeTracking?: boolean;
  enableBudgetAlerts?: boolean;
  onChange: (field: string, value: any) => void;
}

export const BudgetSection = ({ 
  budget, 
  costCenter, 
  budgetType = "fixed",
  enableTimeTracking = false,
  enableBudgetAlerts = true,
  onChange 
}: BudgetSectionProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Budget & Ressourcen
        </h3>
        <p className="text-sm text-gray-500">Definieren Sie das Budget und die Ressourcen für Ihr Projekt.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BudgetInput budget={budget} onChange={onChange} />
        <CostCenterInput costCenter={costCenter} onChange={onChange} />
      </div>

      <BudgetTypeSelector budgetType={budgetType} onChange={onChange} />

      <div className="space-y-4 pt-2">
        <TimeTrackingToggle enableTimeTracking={enableTimeTracking} onChange={onChange} />
        <BudgetAlertSettings enableBudgetAlerts={enableBudgetAlerts} onChange={onChange} />
      </div>
    </div>
  );
};
