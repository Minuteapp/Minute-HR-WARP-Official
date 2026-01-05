import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Building2, Calendar, FileText, Edit, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CompanyMasterData = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [logoUploaded, setLogoUploaded] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Stammdaten gespeichert",
      description: "Die Unternehmensstammdaten wurden erfolgreich aktualisiert.",
    });
  };

  const handleLogoUpload = () => {
    setLogoUploaded(true);
    toast({
      title: "Logo hochgeladen",
      description: "Das Unternehmenslogo wurde erfolgreich hochgeladen.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Unternehmensstammdaten</h3>
          <p className="text-sm text-muted-foreground">
            Grundlegende Informationen und Branding Ihres Unternehmens.
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                <X className="h-4 w-4 mr-2" />
                Abbrechen
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Logo & Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Logo & Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Unternehmenslogo</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border border-dashed rounded-lg flex items-center justify-center bg-muted">
                  {logoUploaded ? (
                    <div className="text-2xl font-bold text-primary">LOGO</div>
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <Button onClick={handleLogoUpload} variant="outline" size="sm" disabled={!isEditing}>
                  Logo hochladen
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-name">Unternehmensname</Label>
              <Input 
                id="company-name" 
                defaultValue="MINUTE GmbH" 
                disabled={!isEditing}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primärfarbe</Label>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded bg-primary flex-shrink-0"></div>
                  <Input 
                    id="primary-color" 
                    defaultValue="#3B82F6" 
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Sekundärfarbe</Label>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded bg-muted flex-shrink-0"></div>
                  <Input 
                    id="secondary-color" 
                    defaultValue="#1E40AF" 
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grunddaten */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Grunddaten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="legal-form">Rechtsform</Label>
              <Select disabled={!isEditing}>
                <SelectTrigger>
                  <SelectValue placeholder="Rechtsform wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmbh">GmbH</SelectItem>
                  <SelectItem value="ag">AG</SelectItem>
                  <SelectItem value="se">SE</SelectItem>
                  <SelectItem value="ug">UG</SelectItem>
                  <SelectItem value="ohg">OHG</SelectItem>
                  <SelectItem value="kg">KG</SelectItem>
                  <SelectItem value="einzelunternehmen">Einzelunternehmen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="founding-date">Gründungsdatum</Label>
              <Input 
                id="founding-date" 
                type="date" 
                defaultValue="2020-01-15"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade-register">Handelsregisternummer</Label>
              <Input 
                id="trade-register" 
                defaultValue="HRB 12345"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-id">Steuer-ID</Label>
              <Input 
                id="tax-id" 
                defaultValue="123/456/78901"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vat-id">USt-IdNr.</Label>
              <Input 
                id="vat-id" 
                defaultValue="DE123456789"
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Branche */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Branchenzuordnung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="industry-code">NACE-Code</Label>
                <Input 
                  id="industry-code" 
                  defaultValue="62.01"
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry-description">Branchenbeschreibung</Label>
                <Input 
                  id="industry-description" 
                  defaultValue="Softwareentwicklung"
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-description">Unternehmensbeschreibung</Label>
              <Textarea 
                id="company-description" 
                placeholder="Beschreiben Sie Ihr Unternehmen..."
                defaultValue="Innovative HR-Software-Lösungen für moderne Unternehmen."
                disabled={!isEditing}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};