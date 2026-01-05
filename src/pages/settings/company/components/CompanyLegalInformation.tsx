import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, Scale, FileText, Shield } from "lucide-react";

export const CompanyLegalInformation = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const handleSave = () => {
    setSaving(true);
    
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Gespeichert",
        description: "Die rechtlichen Informationen wurden erfolgreich aktualisiert.",
      });
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      {/* Rechtsform und Registrierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Rechtsform und Registrierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="legal-form">Rechtsform</Label>
              <Select defaultValue="gmbh">
                <SelectTrigger id="legal-form">
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
              <Label htmlFor="register-number">Handelsregisternummer</Label>
              <Input id="register-number" defaultValue="HRB 12345" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="register-court">Registergericht</Label>
              <Input id="register-court" defaultValue="Amtsgericht München" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="founding-date">Gründungsdatum</Label>
              <Input id="founding-date" type="date" defaultValue="2020-01-15" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steuerliche Informationen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Steuerliche Informationen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax-number">Steuernummer</Label>
              <Input id="tax-number" defaultValue="123/456/7890" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vat-number">USt-IdNr.</Label>
              <Input id="vat-number" defaultValue="DE123456789" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tax-office">Finanzamt</Label>
              <Input id="tax-office" defaultValue="Finanzamt München" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="economic-id">Wirtschafts-IdNr.</Label>
              <Input id="economic-id" defaultValue="123456789" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tax-advisor">Steuerberater</Label>
            <Input id="tax-advisor" defaultValue="Steuerberatung Müller GmbH" />
          </div>
        </CardContent>
      </Card>

      {/* Versicherungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Versicherungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="liability-insurance">Betriebshaftpflicht</Label>
              <Input id="liability-insurance" defaultValue="Allianz Versicherung" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="insurance-number">Versicherungsnummer</Label>
              <Input id="insurance-number" defaultValue="BH-123456789" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="insurance-amount">Deckungssumme</Label>
              <Input id="insurance-amount" defaultValue="5.000.000 €" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="insurance-valid">Gültig bis</Label>
              <Input id="insurance-valid" type="date" defaultValue="2024-12-31" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance und Zertifizierungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Compliance und Zertifizierungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="iso-certification">ISO-Zertifizierung</Label>
              <Input id="iso-certification" defaultValue="ISO 9001:2015" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data-protection">Datenschutzbeauftragter</Label>
              <Input id="data-protection" defaultValue="Max Mustermann" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="legal-notes">Rechtliche Hinweise</Label>
            <Textarea 
              id="legal-notes" 
              defaultValue="Alle Angaben entsprechen den gesetzlichen Bestimmungen. Änderungen vorbehalten."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Wird gespeichert..." : "Speichern"}
        </Button>
      </div>
    </div>
  );
};