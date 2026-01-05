
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface CostManagementSectionProps {
  register: any;
  setValue: any;
  costCoverage: boolean;
  setCostCoverage: (value: boolean) => void;
  errors: any;
}

const CostManagementSection = ({ register, setValue, costCoverage, setCostCoverage, errors }: CostManagementSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Kostenübernahme & Budget</h3>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="cost_coverage"
          checked={costCoverage}
          onCheckedChange={(checked) => {
            setCostCoverage(checked as boolean);
            setValue("cost_coverage", checked);
          }}
        />
        <Label htmlFor="cost_coverage">Kostenübernahme durch Unternehmen</Label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cost_center">Kostenstelle (optional)</Label>
          <Input
            id="cost_center"
            {...register("cost_center")}
            placeholder="z.B. Marketing, IT-001"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="estimated_cost">Geschätzte Kosten (€)</Label>
          <Input
            id="estimated_cost"
            type="number"
            step="0.01"
            min="0"
            {...register("estimated_cost")}
            placeholder="0.00"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="advance_payment">Vorschuss gewünscht (€)</Label>
          <Input
            id="advance_payment"
            type="number"
            step="0.01"
            min="0"
            {...register("advance_payment")}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
};

export default CostManagementSection;
