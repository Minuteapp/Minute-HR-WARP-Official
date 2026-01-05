
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export const CompanyDataForm = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const handleSave = () => {
    setSaving(true);
    
    // Simuliere eine API-Anfrage
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Gespeichert",
        description: "Die Unternehmensdaten wurden erfolgreich aktualisiert.",
      });
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="company-name">Firmenname</Label>
          <Input id="company-name" defaultValue="Muster GmbH" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company-legal-form">Rechtsform</Label>
          <Select defaultValue="gmbh">
            <SelectTrigger id="company-legal-form">
              <SelectValue placeholder="Rechtsform wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gmbh">GmbH</SelectItem>
              <SelectItem value="ug">UG (haftungsbeschränkt)</SelectItem>
              <SelectItem value="ag">AG</SelectItem>
              <SelectItem value="ohg">OHG</SelectItem>
              <SelectItem value="kg">KG</SelectItem>
              <SelectItem value="gbr">GbR</SelectItem>
              <SelectItem value="individual">Einzelunternehmen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tax-id">Steuernummer</Label>
          <Input id="tax-id" defaultValue="123/456/7890" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vat-id">USt-IdNr.</Label>
          <Input id="vat-id" defaultValue="DE123456789" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company-address">Adresse</Label>
          <Input id="company-address" defaultValue="Musterstraße 123" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company-city">PLZ / Ort</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input id="company-zip" className="col-span-1" defaultValue="12345" />
            <Input id="company-city" className="col-span-2" defaultValue="Musterstadt" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company-country">Land</Label>
          <Select defaultValue="de">
            <SelectTrigger id="company-country">
              <SelectValue placeholder="Land wählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="de">Deutschland</SelectItem>
              <SelectItem value="at">Österreich</SelectItem>
              <SelectItem value="ch">Schweiz</SelectItem>
              <SelectItem value="other">Anderes Land</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company-phone">Telefon</Label>
          <Input id="company-phone" defaultValue="+49 123 45678900" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company-email">E-Mail</Label>
          <Input id="company-email" defaultValue="info@muster-gmbh.de" type="email" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company-website">Website</Label>
          <Input id="company-website" defaultValue="https://www.muster-gmbh.de" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company-description">Firmenbeschreibung</Label>
        <Textarea 
          id="company-description" 
          defaultValue="Die Muster GmbH ist ein fiktives Unternehmen, das als Beispiel für diese Anwendung dient."
          rows={4}
        />
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Wird gespeichert..." : "Speichern"}
        </Button>
      </div>
    </div>
  );
};
