import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from 'lucide-react';

interface CostCenterSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const CostCenterSelector = ({ value, onChange }: CostCenterSelectorProps) => {
  const { data: costCenters = [], isLoading } = useQuery({
    queryKey: ['costCenters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_centers')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name');
      
      if (error) {
        console.error('Error loading cost centers:', error);
        return [];
      }
      return data || [];
    }
  });

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Kostenstelle
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border-[#3B44F6] rounded-lg">
          <SelectValue placeholder={isLoading ? "Laden..." : "Kostenstelle wählen"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Keine Kostenstelle</SelectItem>
          {costCenters.map((cc) => (
            <SelectItem key={cc.id} value={cc.name}>
              {cc.code ? `${cc.code} - ${cc.name}` : cc.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CostCenterSelector;
