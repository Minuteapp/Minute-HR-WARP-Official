
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBusinessTravel } from "@/hooks/useBusinessTravel";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

interface BusinessTripCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
}

const BusinessTripCompleteDialog = ({ 
  open, 
  onOpenChange, 
  tripId 
}: BusinessTripCompleteDialogProps) => {
  const { completeTrip, isSubmitting } = useBusinessTravel();
  const [error, setError] = useState("");

  const handleComplete = async () => {
    try {
      setError("");
      const result = await completeTrip(tripId);
      if (result) {
        onOpenChange(false);
      }
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !isSubmitting && onOpenChange(open)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dienstreise abschließen</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p>Möchten Sie die Dienstreise als abgeschlossen markieren? Dies bedeutet, dass die Reise durchgeführt wurde.</p>
          <p className="mt-2 text-sm text-gray-500">Nach Abschluss können Sie einen Reisebericht erstellen und Ausgaben hinzufügen.</p>
          
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird abgeschlossen...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Abschließen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessTripCompleteDialog;
