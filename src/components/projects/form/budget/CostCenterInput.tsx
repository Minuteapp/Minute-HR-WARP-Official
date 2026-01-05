
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Receipt } from "lucide-react";

interface CostCenterInputProps {
  costCenter?: string;
  onChange: (field: string, value: any) => void;
}

export const CostCenterInput = ({ costCenter, onChange }: CostCenterInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="costCenter" className="flex items-center gap-2">
        <Receipt className="h-4 w-4" />
        Kostenstelle
      </Label>
      <Input
        id="costCenter"
        value={costCenter || ''}
        onChange={(e) => onChange('costCenter', e.target.value)}
        placeholder="Kostenstelle oder Finanzierungsquelle"
      />
    </div>
  );
};
