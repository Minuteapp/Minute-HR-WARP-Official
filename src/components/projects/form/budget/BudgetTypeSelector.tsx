
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet } from "lucide-react";

interface BudgetTypeSelectorProps {
  budgetType?: string;
  onChange: (field: string, value: any) => void;
}

export const BudgetTypeSelector = ({ budgetType = "fixed", onChange }: BudgetTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="budgetType" className="flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        Budgettyp
      </Label>
      <Select 
        value={budgetType} 
        onValueChange={(value) => onChange('budgetType', value)}
      >
        <SelectTrigger id="budgetType">
          <SelectValue placeholder="Budgettyp auswählen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fixed">Festes Budget</SelectItem>
          <SelectItem value="hourly">Stundensatz</SelectItem>
          <SelectItem value="flexible">Flexibles Budget</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
