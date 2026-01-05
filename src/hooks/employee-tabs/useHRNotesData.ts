import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";

export const useHRNotesData = (employeeId: string | undefined) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["hr-notes", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      const { data, error } = await supabase
        .from("employee_hr_notes")
        .select("*, attachments:employee_hr_note_attachments(*)")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });

  // Gruppiere nach Kategorie
  const byCategory = notes.reduce((acc, note) => {
    const category = note.category || "Allgemein";
    if (!acc[category]) acc[category] = [];
    acc[category].push(note);
    return acc;
  }, {} as Record<string, typeof notes>);

  const statistics = {
    total: notes.length,
    byCategory: Object.keys(byCategory).reduce((acc, key) => {
      acc[key] = byCategory[key].length;
      return acc;
    }, {} as Record<string, number>),
  };

  const addNote = useMutation({
    mutationFn: async (data: any) => {
      if (!companyId) throw new Error("Company ID fehlt - bitte neu laden");
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("employee_hr_notes")
        .insert({ 
          ...data, 
          employee_id: employeeId,
          company_id: companyId,
          created_by: user?.user?.id 
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-notes"] });
      toast({ title: "Notiz hinzugefügt" });
    },
    onError: (error: any) => {
      console.error('HR Note error:', error);
      toast({ title: "Fehler beim Hinzufügen", description: error.message, variant: "destructive" });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { error } = await supabase
        .from("employee_hr_notes")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-notes"] });
      toast({ title: "Notiz aktualisiert" });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employee_hr_notes")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-notes"] });
      toast({ title: "Notiz gelöscht" });
    },
  });

  const addAttachment = useMutation({
    mutationFn: async ({ noteId, data }: { noteId: string; data: any }) => {
      const { error } = await supabase
        .from("employee_hr_note_attachments")
        .insert({ ...data, note_id: noteId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-notes"] });
      toast({ title: "Anhang hinzugefügt" });
    },
  });

  return {
    notes,
    byCategory,
    statistics,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
    addAttachment,
  };
};
