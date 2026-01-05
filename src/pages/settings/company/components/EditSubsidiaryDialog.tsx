
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Subsidiary {
  id: string;
  name: string;
  legal_form: string;
  address: string;
  contact_person: string;
  status: 'active' | 'inactive';
}

interface EditSubsidiaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subsidiary: Subsidiary;
  onSave: (subsidiary: Subsidiary) => void;
}

export const EditSubsidiaryDialog = ({ open, onOpenChange, subsidiary, onSave }: EditSubsidiaryDialogProps) => {
  const [editedSubsidiary, setEditedSubsidiary] = useState<Subsidiary>(subsidiary);
  
  useEffect(() => {
    setEditedSubsidiary(subsidiary);
  }, [subsidiary]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedSubsidiary({ ...editedSubsidiary, [name]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedSubsidiary);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tochtergesellschaft bearbeiten</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              name="name"
              value={editedSubsidiary.name}
              onChange={handleChange}
              placeholder="Name der Tochtergesellschaft"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-legal_form">Rechtsform</Label>
            <Input
              id="edit-legal_form"
              name="legal_form"
              value={editedSubsidiary.legal_form}
              onChange={handleChange}
              placeholder="z.B. GmbH, AG, KG"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-address">Adresse</Label>
            <Textarea
              id="edit-address"
              name="address"
              value={editedSubsidiary.address}
              onChange={handleChange}
              placeholder="Vollständige Adresse"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-contact_person">Ansprechpartner</Label>
            <Input
              id="edit-contact_person"
              name="contact_person"
              value={editedSubsidiary.contact_person}
              onChange={handleChange}
              placeholder="Name des Ansprechpartners"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="edit-status" className="font-medium">Aktiv</Label>
            <Switch
              id="edit-status"
              checked={editedSubsidiary.status === 'active'}
              onCheckedChange={(checked) => 
                setEditedSubsidiary({ ...editedSubsidiary, status: checked ? 'active' : 'inactive' })
              }
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit">Speichern</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
