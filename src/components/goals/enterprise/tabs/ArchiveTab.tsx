import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArchiveHeader } from "../archive/ArchiveHeader";
import { ArchiveFilters } from "../archive/ArchiveFilters";
import { ArchiveKPICards } from "../archive/ArchiveKPICards";
import { ArchivedGoalsList } from "../archive/ArchivedGoalsList";
import { ArchiveComplianceBox } from "../archive/ArchiveComplianceBox";
import { toast } from "sonner";

export const ArchiveTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [year, setYear] = useState("all");
  const [level, setLevel] = useState("all");

  const { data: archivedGoals = [], refetch } = useQuery({
    queryKey: ['archived-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .or('status.eq.completed,status.eq.archived')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const filteredGoals = useMemo(() => {
    return archivedGoals.filter(goal => {
      const matchesSearch = searchQuery === "" || 
        goal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        goal.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const goalYear = goal.target_date ? new Date(goal.target_date).getFullYear().toString() : "";
      const matchesYear = year === "all" || goalYear === year;
      
      const matchesLevel = level === "all" || goal.level === level;
      
      return matchesSearch && matchesYear && matchesLevel;
    });
  }, [archivedGoals, searchQuery, year, level]);

  const yearsInArchive = useMemo(() => {
    const years = new Set(
      archivedGoals
        .filter(g => g.target_date)
        .map(g => new Date(g.target_date!).getFullYear())
    );
    return years.size;
  }, [archivedGoals]);

  const handleRestore = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ status: 'on_track' })
        .eq('id', id);
      
      if (error) throw error;
      toast.success("Ziel erfolgreich wiederhergestellt");
      refetch();
    } catch (error) {
      toast.error("Fehler beim Wiederherstellen des Ziels");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success("Ziel erfolgreich gelöscht");
      refetch();
    } catch (error) {
      toast.error("Fehler beim Löschen des Ziels");
    }
  };

  return (
    <div className="space-y-6">
      <ArchiveHeader />
      
      <ArchiveFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        year={year}
        setYear={setYear}
        level={level}
        setLevel={setLevel}
      />

      <ArchiveKPICards
        totalArchived={archivedGoals.length}
        filteredCount={filteredGoals.length}
        yearsInArchive={yearsInArchive}
      />

      <ArchivedGoalsList
        goals={filteredGoals}
        onRestore={handleRestore}
        onDelete={handleDelete}
      />
      
      <ArchiveComplianceBox />
    </div>
  );
};
