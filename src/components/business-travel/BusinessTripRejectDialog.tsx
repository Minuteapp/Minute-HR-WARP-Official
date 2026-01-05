
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBusinessTravel } from "@/hooks/useBusinessTravel";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { XCircle, Loader2 } from "lucide-react";
import { useState } from "react";

interface BusinessTripRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
}

const BusinessTripRejectDialog = ({ 
  open, 
  onOpenChange, 
  tripId 
}: BusinessTripRejectDialogProps) => {
  const { rejectTrip, isSubmitting } = useBusinessTravel();
  const [reason, setReason] = useState("");

  const handleReject = async () => {
    if (!reason.trim()) return;
    
    const result = await rejectTrip({ tripId, reason });
    if (result) {
      setReason("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      setReason("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dienstreise ablehnen</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <p>Bitte geben Sie einen Grund für die Ablehnung an:</p>
          
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Ablehnungsgrund</Label>
            <Textarea 
              id="rejection-reason"
              placeholder="Grund für die Ablehnung eingeben..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            {reason.trim().length === 0 && (
              <p className="text-sm text-red-500">Bitte geben Sie einen Grund an</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <Button 
            variant="destructive"
            onClick={handleReject}
            disabled={isSubmitting || reason.trim().length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird abgelehnt...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Ablehnen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessTripRejectDialog;
