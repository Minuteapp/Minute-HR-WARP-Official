
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBusinessTravel } from "@/hooks/useBusinessTravel";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";

interface BusinessTripApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
}

const BusinessTripApproveDialog = ({ 
  open, 
  onOpenChange, 
  tripId 
}: BusinessTripApproveDialogProps) => {
  const { approveTrip, isSubmitting } = useBusinessTravel();
  const [error, setError] = useState("");

  const handleApprove = async () => {
    try {
      setError("");
      const result = await approveTrip(tripId);
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
          <DialogTitle>Dienstreise genehmigen</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p>Sind Sie sicher, dass Sie diese Dienstreise genehmigen möchten?</p>
          
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
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird genehmigt...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Genehmigen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessTripApproveDialog;
