import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Building2, Globe, Mail, Phone, Upload, Palette, Save } from 'lucide-react';
import { toast } from 'sonner';

export function CompanyProfileTab() {
  const [formData, setFormData] = useState({
    // Stammdaten
    legalName: '',
    displayName: '',
    legalForm: '',
    foundingDate: '',
    commercialRegisterNumber: '',
    commercialRegisterCourt: '',
    vatId: '',
    taxId: '',
    // Hauptsitz
    country: 'DE',
    street: '',
    postalCode: '',
    city: '',
    // Kontakt
    website: '',
    email: '',
    phone: '',
    fax: '',
    // Branding
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    fontFamily: 'Inter',
    whiteLabel: false,
  });

  const legalForms = [
    { value: 'gmbh', label: 'GmbH' },
    { value: 'ag', label: 'AG' },
    { value: 'kg', label: 'KG' },
    { value: 'ohg', label: 'OHG' },
    { value: 'gbr', label: 'GbR' },
    { value: 'ug', label: 'UG (haftungsbeschränkt)' },
    { value: 'ev', label: 'e.V.' },
    { value: 'einzelunternehmen', label: 'Einzelunternehmen' },
    { value: 'gmbh_co_kg', label: 'GmbH & Co. KG' },
  ];

  const countries = [
    { value: 'DE', label: 'Deutschland' },
    { value: 'AT', label: 'Österreich' },
    { value: 'CH', label: 'Schweiz' },
    { value: 'NL', label: 'Niederlande' },
    { value: 'BE', label: 'Belgien' },
    { value: 'FR', label: 'Frankreich' },
    { value: 'PL', label: 'Polen' },
    { value: 'CZ', label: 'Tschechien' },
  ];

  const fontFamilies = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  ];

  const handleSave = () => {
    toast.success('Unternehmensprofil wurde gespeichert');
  };

  return (
    <div className="space-y-6">
      {/* Stammdaten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Stammdaten
          </CardTitle>
          <CardDescription>
            Rechtliche Grunddaten des Unternehmens
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="legalName">Firmenname (rechtlich) *</Label>
            <Input
              id="legalName"
              value={formData.legalName}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              placeholder="Musterfirma GmbH"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Anzeigename</Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="Musterfirma"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legalForm">Unternehmensform *</Label>
            <Select value={formData.legalForm} onValueChange={(value) => setFormData({ ...formData, legalForm: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Rechtsform wählen" />
              </SelectTrigger>
              <SelectContent>
                {legalForms.map((form) => (
                  <SelectItem key={form.value} value={form.value}>
                    {form.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="foundingDate">Gründungsdatum</Label>
            <Input
              id="foundingDate"
              type="date"
              value={formData.foundingDate}
              onChange={(e) => setFormData({ ...formData, foundingDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commercialRegisterNumber">Handelsregisternummer</Label>
            <Input
              id="commercialRegisterNumber"
              value={formData.commercialRegisterNumber}
              onChange={(e) => setFormData({ ...formData, commercialRegisterNumber: e.target.value })}
              placeholder="HRB 12345"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="commercialRegisterCourt">Registergericht</Label>
            <Input
              id="commercialRegisterCourt"
              value={formData.commercialRegisterCourt}
              onChange={(e) => setFormData({ ...formData, commercialRegisterCourt: e.target.value })}
              placeholder="Amtsgericht München"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatId">Umsatzsteuer-ID</Label>
            <Input
              id="vatId"
              value={formData.vatId}
              onChange={(e) => setFormData({ ...formData, vatId: e.target.value })}
              placeholder="DE123456789"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxId">Steuer-ID</Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              placeholder="123/456/78901"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hauptsitz */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Hauptsitz
          </CardTitle>
          <CardDescription>
            Adresse des Hauptsitzes
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="country">Land *</Label>
            <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Land wählen" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="street">Straße und Hausnummer *</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              placeholder="Musterstraße 123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postleitzahl *</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="12345"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Stadt *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Musterstadt"
            />
          </div>
        </CardContent>
      </Card>

      {/* Kontaktinformationen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Kontaktinformationen
          </CardTitle>
          <CardDescription>
            Allgemeine Kontaktdaten des Unternehmens
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="info@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+49 123 456789"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fax">Fax</Label>
            <Input
              id="fax"
              type="tel"
              value={formData.fax}
              onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
              placeholder="+49 123 456780"
            />
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Branding
          </CardTitle>
          <CardDescription>
            Visuelle Identität und White-Label-Optionen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Logo hochladen
                  </Button>
                  <p className="text-xs text-muted-foreground">PNG, JPG oder SVG. Max 2MB</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Label>App-Icon</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Icon hochladen
                  </Button>
                  <p className="text-xs text-muted-foreground">512x512px empfohlen</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primärfarbe</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Sekundärfarbe</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  placeholder="#10B981"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fontFamily">Schriftart</Label>
              <Select value={formData.fontFamily} onValueChange={(value) => setFormData({ ...formData, fontFamily: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Schriftart wählen" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div>
              <Label className="text-base">White-Label-Modus</Label>
              <p className="text-sm text-muted-foreground">
                Lovable-Branding ausblenden und eigenes Branding verwenden
              </p>
            </div>
            <Button 
              variant={formData.whiteLabel ? "default" : "outline"}
              onClick={() => setFormData({ ...formData, whiteLabel: !formData.whiteLabel })}
            >
              {formData.whiteLabel ? 'Aktiviert' : 'Aktivieren'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Speichern */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="min-w-[200px]">
          <Save className="h-4 w-4 mr-2" />
          Änderungen speichern
        </Button>
      </div>
    </div>
  );
}
