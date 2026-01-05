
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreditCard } from "lucide-react";

interface BudgetInputProps {
  budget?: number;
  onChange: (field: string, value: any) => void;
}

export const BudgetInput = ({ budget, onChange }: BudgetInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="budget" className="flex items-center gap-2">
        <CreditCard className="h-4 w-4" />
        Budget (€)
      </Label>
      <Input
        id="budget"
        type="number"
        value={budget !== undefined ? budget : ''}
        onChange={(e) => onChange('budget', e.target.value ? Number(e.target.value) : undefined)}
        placeholder="Budget eingeben"
      />
    </div>
  );
};
