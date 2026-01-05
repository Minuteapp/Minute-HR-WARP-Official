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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

interface CompanyCard {
  id: string;
  cardNumber: string;
  holderName: string;
  status: 'active' | 'blocked' | 'expired' | 'pending';
}

interface CardBlockDialogProps {
  card: CompanyCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CardBlockDialog = ({ card, open, onOpenChange }: CardBlockDialogProps) => {
  const [reason, setReason] = useState("");
  const isBlocked = card.status === 'blocked';

  const handleConfirm = () => {
    if (isBlocked) {
      toast.success(`Karte ${card.cardNumber} wurde entsperrt`);
    } else {
      toast.success(`Karte ${card.cardNumber} wurde gesperrt`);
    }
    onOpenChange(false);
    setReason("");
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isBlocked ? "Karte entsperren?" : "Karte sperren?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBlocked 
              ? `Möchten Sie die Karte ${card.cardNumber} von ${card.holderName} wieder entsperren? Die Karte kann danach wieder für Zahlungen verwendet werden.`
              : `Möchten Sie die Karte ${card.cardNumber} von ${card.holderName} sperren? Alle weiteren Transaktionen werden abgelehnt.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!isBlocked && (
          <div className="py-4">
            <Label>Sperrgrund (optional)</Label>
            <Textarea
              placeholder="Grund für die Sperrung..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={isBlocked ? "" : "bg-destructive hover:bg-destructive/90"}
          >
            {isBlocked ? "Entsperren" : "Sperren"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
