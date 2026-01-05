
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DeleteProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  projectId?: string;
}

export const DeleteProjectDialog = ({
  open,
  onOpenChange,
  onConfirm,
  projectId,
}: DeleteProjectDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      
      // Prüfen, ob eine Projekt-ID vorhanden ist
      if (!projectId) {
        toast.error("Kein Projekt zum Löschen ausgewählt");
        return;
      }
      
      console.log("Löschen des Projekts mit ID:", projectId);
      
      // Zuerst alle Aufgaben löschen, die zu diesem Projekt gehören
      const { error: tasksError } = await supabase
        .from('project_tasks')
        .delete()
        .eq('project_id', projectId);
      
      if (tasksError) {
        console.error("Fehler beim Löschen der Projektaufgaben:", tasksError);
        // Wir fahren trotz eines Fehlers bei den Aufgaben fort
      }
      
      // Jetzt das Projekt selbst löschen
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
          
      if (error) {
        console.error("Fehler beim Löschen des Projekts:", error);
        toast.error("Fehler beim Löschen des Projekts: " + error.message);
        throw error;
      }
      
      toast.success("Projekt erfolgreich gelöscht");
      
      // Callback aufrufen, um die Projektliste zu aktualisieren
      await onConfirm();
      onOpenChange(false); // Dialog nach erfolgreicher Löschung schließen
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      toast.error("Fehler beim Löschen des Projekts");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Projekt löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Diese Aktion kann nicht rückgängig gemacht werden. Das Projekt wird dauerhaft aus unseren Servern gelöscht.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }} 
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gelöscht...
              </>
            ) : (
              'Löschen'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
