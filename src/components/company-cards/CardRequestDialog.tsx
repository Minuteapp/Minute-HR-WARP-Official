import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Send } from "lucide-react";
import { toast } from "sonner";

interface CardRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CardRequestDialog = ({ open, onOpenChange }: CardRequestDialogProps) => {
  const [formData, setFormData] = useState({
    employeeName: "",
    department: "",
    cardType: "",
    requestedLimit: "",
    reason: "",
    usageCategory: ""
  });

  const handleSubmit = () => {
    if (!formData.employeeName || !formData.department || !formData.cardType) {
      toast.error("Bitte alle Pflichtfelder ausfüllen");
      return;
    }

    toast.success("Kartenantrag wurde eingereicht");
    onOpenChange(false);
    setFormData({
      employeeName: "",
      department: "",
      cardType: "",
      requestedLimit: "",
      reason: "",
      usageCategory: ""
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Neue Firmenkarte beantragen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Mitarbeiter *</Label>
            <Input
              placeholder="Name des Karteninhabers"
              value={formData.employeeName}
              onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
            />
          </div>

          <div>
            <Label>Abteilung *</Label>
            <Select 
              value={formData.department} 
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Abteilung wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="vertrieb">Vertrieb</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="finance">Finanzen</SelectItem>
                <SelectItem value="management">Management</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Kartentyp *</Label>
            <Select 
              value={formData.cardType} 
              onValueChange={(value) => setFormData({ ...formData, cardType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kartentyp wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">Visa Business</SelectItem>
                <SelectItem value="mastercard">Mastercard Business</SelectItem>
                <SelectItem value="amex">American Express Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Verwendungszweck</Label>
            <Select 
              value={formData.usageCategory} 
              onValueChange={(value) => setFormData({ ...formData, usageCategory: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Hauptverwendung" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="travel">Geschäftsreisen</SelectItem>
                <SelectItem value="supplies">Büromaterial</SelectItem>
                <SelectItem value="software">Software & Lizenzen</SelectItem>
                <SelectItem value="marketing">Marketing & Werbung</SelectItem>
                <SelectItem value="general">Allgemeine Ausgaben</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Gewünschtes monatliches Limit (€)</Label>
            <Input
              type="number"
              placeholder="z.B. 3000"
              value={formData.requestedLimit}
              onChange={(e) => setFormData({ ...formData, requestedLimit: e.target.value })}
            />
          </div>

          <div>
            <Label>Begründung</Label>
            <Textarea
              placeholder="Warum wird die Karte benötigt?"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />
            Antrag einreichen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
