
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Subsidiary {
  id: string;
  name: string;
  legal_form: string;
  address: string;
  contact_person: string;
  status: 'active' | 'inactive';
}

interface DeleteSubsidiaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subsidiary: Subsidiary;
  onDelete: () => void;
}

export const DeleteSubsidiaryDialog = ({ open, onOpenChange, subsidiary, onDelete }: DeleteSubsidiaryDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tochtergesellschaft löschen</DialogTitle>
          <DialogDescription>
            Möchten Sie die Tochtergesellschaft "{subsidiary.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Löschen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
