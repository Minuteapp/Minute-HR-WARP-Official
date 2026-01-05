
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Subsidiary {
  id?: string;
  name: string;
  legal_form: string;
  address: string;
  contact_person: string;
  status: 'active' | 'inactive';
}

interface NewSubsidiaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (subsidiary: Subsidiary) => void;
}

export const NewSubsidiaryDialog = ({ open, onOpenChange, onSave }: NewSubsidiaryDialogProps) => {
  const [subsidiary, setSubsidiary] = useState<Subsidiary>({
    name: '',
    legal_form: '',
    address: '',
    contact_person: '',
    status: 'active'
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSubsidiary({ ...subsidiary, [name]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(subsidiary);
    setSubsidiary({
      name: '',
      legal_form: '',
      address: '',
      contact_person: '',
      status: 'active'
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neue Tochtergesellschaft hinzufügen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={subsidiary.name}
              onChange={handleChange}
              placeholder="Name der Tochtergesellschaft"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="legal_form">Rechtsform</Label>
            <Input
              id="legal_form"
              name="legal_form"
              value={subsidiary.legal_form}
              onChange={handleChange}
              placeholder="z.B. GmbH, AG, KG"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              name="address"
              value={subsidiary.address}
              onChange={handleChange}
              placeholder="Vollständige Adresse"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_person">Ansprechpartner</Label>
            <Input
              id="contact_person"
              name="contact_person"
              value={subsidiary.contact_person}
              onChange={handleChange}
              placeholder="Name des Ansprechpartners"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="status" className="font-medium">Aktiv</Label>
            <Switch
              id="status"
              checked={subsidiary.status === 'active'}
              onCheckedChange={(checked) => 
                setSubsidiary({ ...subsidiary, status: checked ? 'active' : 'inactive' })
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
