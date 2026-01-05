import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../client";
import { useToast } from "@/hooks/use-toast";

export const useEmployeeHRNotes = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ["employee-hr-notes", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("Employee ID required");
      
      const { data, error } = await supabase
        .from("employee_hr_notes")
        .select(`
          *,
          attachments:employee_hr_note_attachments(*)
        `)
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!employeeId,
  });
};

export const useCreateHRNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (note: {
      employee_id: string;
      title: string;
      content: string;
      category: string;
      tags: string[];
      visibility: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nicht authentifiziert");

      const { data, error } = await supabase
        .from("employee_hr_notes")
        .insert({
          ...note,
          author_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-hr-notes"] });
      toast({ 
        title: "Notiz erstellt", 
        description: "Die HR-Notiz wurde erfolgreich gespeichert." 
      });
    },
    onError: (error: any) => {
      toast({ 
        variant: "destructive",
        title: "Fehler", 
        description: error.message || "Notiz konnte nicht erstellt werden." 
      });
    },
  });
};

export const useDeleteHRNote = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("employee_hr_notes")
        .delete()
        .eq("id", noteId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-hr-notes"] });
      toast({ 
        title: "Notiz gelöscht", 
        description: "Die HR-Notiz wurde erfolgreich gelöscht." 
      });
    },
    onError: (error: any) => {
      toast({ 
        variant: "destructive",
        title: "Fehler", 
        description: error.message || "Notiz konnte nicht gelöscht werden." 
      });
    },
  });
};
