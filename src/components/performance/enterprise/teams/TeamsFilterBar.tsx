import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeamsFilterBarProps { search: string; setSearch: (v: string) => void; department: string; setDepartment: (v: string) => void; sortBy: string; setSortBy: (v: string) => void; }

export function TeamsFilterBar({ search, setSearch, department, setDepartment, sortBy, setSortBy }: TeamsFilterBarProps) {
  const { data: departments } = useQuery({
    queryKey: ["departments-teams-filter"],
    queryFn: async () => { const { data } = await supabase.from("departments").select("id, name").order("name"); return data || []; }
  });

  return (
    <div className="flex flex-wrap gap-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Team oder Abteilung suchen..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Select value={department} onValueChange={setDepartment}>
        <SelectTrigger className="w-[180px]"><SelectValue placeholder="Alle Abteilungen" /></SelectTrigger>
        <SelectContent><SelectItem value="all">Alle Abteilungen</SelectItem>{departments?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[150px]"><SelectValue placeholder="Nach Score" /></SelectTrigger>
        <SelectContent><SelectItem value="score_desc">Nach Score ↓</SelectItem><SelectItem value="score_asc">Nach Score ↑</SelectItem><SelectItem value="name">Nach Name</SelectItem></SelectContent>
      </Select>
    </div>
  );
}
