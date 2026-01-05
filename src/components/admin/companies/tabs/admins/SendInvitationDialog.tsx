
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface SendInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  adminEmail: string | null;
  isSending: boolean;
  sendError: string | null;
}

const SendInvitationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  adminEmail,
  isSending,
  sendError
}: SendInvitationDialogProps) => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Reset errors when dialog opens/closes or when sendError changes
  useEffect(() => {
    if (sendError) {
      console.log("External error received:", sendError);
      setLocalError(sendError);
    }
  }, [sendError]);
  
  // Reset states when dialog opens/closes
  useEffect(() => {
    if (open) {
      console.log("Dialog opened, resetting states");
      setLocalError(null);
      setSuccessMessage(null);
    }
  }, [open]);
  
  const handleConfirm = async () => {
    console.log("=== SEND INVITATION DIALOG - CONFIRM START ===");
    console.log("Admin email:", adminEmail);
    
    try {
      setLocalError(null);
      setSuccessMessage(null);
      
      console.log("Calling onConfirm...");
      await onConfirm();
      
      console.log("onConfirm successful, showing success message");
      setSuccessMessage(`Einladungs-E-Mail wurde erfolgreich an ${adminEmail} gesendet.`);
      
      // Optional: Close the dialog after a delay on success
      setTimeout(() => {
        console.log("Auto-closing dialog after success");
        onOpenChange(false);
      }, 3000);
    } catch (error: any) {
      console.error("=== SEND INVITATION DIALOG - ERROR ===");
      console.error("Error details:", error);
      setLocalError(error.message || "Ein unbekannter Fehler ist aufgetreten");
    }
  };
  
  // Reset states when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    console.log("Dialog open state changing to:", open);
    if (!open) {
      setLocalError(null);
      setSuccessMessage(null);
    }
    onOpenChange(open);
  };
  
  // Kombiniere lokale und externe Fehler für die Anzeige
  const displayError = localError || sendError;
  
  console.log("Dialog render state:", {
    open,
    adminEmail,
    isSending,
    displayError,
    successMessage
  });
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Einladungs-E-Mail senden</DialogTitle>
          <DialogDescription>
            Senden Sie eine Einladungs-E-Mail an {adminEmail || 'den Administrator'} mit Anweisungen zur Kontoaktivierung.
          </DialogDescription>
        </DialogHeader>
        
        {displayError && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium">Fehler beim Senden der Einladung:</div>
              <div className="mt-1 text-sm">{displayError}</div>
            </AlertDescription>
          </Alert>
        )}
        
        {successMessage && !displayError && (
          <Alert variant="default" className="mt-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
          </Alert>
        )}
        
        {!displayError && !successMessage && (
          <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Nach dem Klick auf "Einladung senden" wird eine E-Mail mit Aktivierungsanweisungen an {adminEmail} gesendet.
            </AlertDescription>
          </Alert>
        )}
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isSending}
          >
            {successMessage ? "Schließen" : "Abbrechen"}
          </Button>
          {!successMessage && (
            <Button 
              onClick={handleConfirm}
              disabled={isSending}
            >
              {isSending ? "Wird gesendet..." : "Einladung senden"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendInvitationDialog;
