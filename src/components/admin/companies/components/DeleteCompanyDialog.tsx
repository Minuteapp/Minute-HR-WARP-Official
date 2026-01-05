
import { useState } from "react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  companyName?: string;
}

export const DeleteCompanyDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  companyName
}: DeleteCompanyDialogProps) => {
  return (
    <AlertDialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isDeleting) {
          onOpenChange(isOpen);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Firma löschen</AlertDialogTitle>
          <AlertDialogDescription>
            {companyName 
              ? `Sind Sie sicher, dass Sie die Firma "${companyName}" löschen möchten?` 
              : "Sind Sie sicher, dass Sie diese Firma löschen möchten?"}
            Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault(); // Prevent default to handle confirm action manually
              onConfirm();
            }}
            className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isDeleting ? "Wird gelöscht..." : "Löschen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
