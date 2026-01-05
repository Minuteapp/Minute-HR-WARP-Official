import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface OverviewFiltersProps {
  selectedDepartment: string;
  setSelectedDepartment: (value: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (value: string) => void;
}

export function OverviewFilters({
  selectedDepartment,
  setSelectedDepartment,
  selectedPeriod,
  setSelectedPeriod
}: OverviewFiltersProps) {
  const { data: departments } = useQuery({
    queryKey: ["departments-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="flex gap-4">
      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Alle Abteilungen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Abteilungen</SelectItem>
          {departments?.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Zeitraum" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current">Aktueller Zyklus</SelectItem>
          <SelectItem value="q4-2024">Q4 2024</SelectItem>
          <SelectItem value="q3-2024">Q3 2024</SelectItem>
          <SelectItem value="2024">Jahr 2024</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
