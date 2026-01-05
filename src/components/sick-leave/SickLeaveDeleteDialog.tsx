
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SickLeave } from "@/types/sick-leave";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface SickLeaveDeleteDialogProps {
  sickLeave: SickLeave;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SickLeaveDeleteDialog = ({ sickLeave, isOpen, onClose, onSuccess }: SickLeaveDeleteDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Simulieren des Löschens
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Erfolg simulieren
      toast({
        title: "Erfolg",
        description: "Krankmeldung wurde erfolgreich gelöscht."
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Beim Löschen ist ein Fehler aufgetreten."
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Krankmeldung löschen</DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie diese Krankmeldung löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="font-medium">Details der zu löschenden Krankmeldung:</p>
            <ul className="mt-2 text-sm space-y-1">
              <li>
                <span className="font-semibold">Zeitraum:</span> {format(new Date(sickLeave.start_date), 'dd.MM.yyyy')}
                {sickLeave.end_date && ` - ${format(new Date(sickLeave.end_date), 'dd.MM.yyyy')}`}
              </li>
              <li>
                <span className="font-semibold">Grund:</span> {sickLeave.description || 'Nicht angegeben'}
              </li>
              <li>
                <span className="font-semibold">Status:</span> {sickLeave.status}
              </li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Abbrechen
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Wird gelöscht...
              </>
            ) : (
              'Löschen'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SickLeaveDeleteDialog;
