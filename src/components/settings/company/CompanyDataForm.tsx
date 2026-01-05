
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const CompanyDataForm = () => {
  const [formData, setFormData] = useState({
    companyName: 'Muster GmbH',
    legalForm: 'GmbH',
    taxId: 'DE123456789',
    vatId: 'DE987654321',
    foundingDate: '2010-01-01',
    website: 'https://muster-gmbh.de',
    sector: 'IT-Dienstleistungen',
    employeeCount: '50-100',
    address: {
      street: 'Musterstraße 123',
      postalCode: '12345',
      city: 'Musterstadt',
      country: 'Deutschland'
    },
    contactEmail: 'info@muster-gmbh.de',
    contactPhone: '+49 123 456789',
    description: 'Die Muster GmbH ist ein führendes Unternehmen im Bereich IT-Dienstleistungen mit Fokus auf innovative Lösungen für mittelständische Unternehmen.'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Unternehmensdaten gespeichert:', formData);
    // Hier würde normalerweise ein API-Call stattfinden
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Allgemeine Informationen</h3>
          
          <div className="space-y-2">
            <Label htmlFor="companyName">Unternehmensname</Label>
            <Input 
              id="companyName" 
              value={formData.companyName} 
              onChange={(e) => handleInputChange('companyName', e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="legalForm">Rechtsform</Label>
            <Select value={formData.legalForm} onValueChange={(value) => handleInputChange('legalForm', value)}>
              <SelectTrigger id="legalForm">
                <SelectValue placeholder="Rechtsform auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GmbH">GmbH</SelectItem>
                <SelectItem value="AG">AG</SelectItem>
                <SelectItem value="e.K.">Einzelunternehmen (e.K.)</SelectItem>
                <SelectItem value="KG">KG</SelectItem>
                <SelectItem value="OHG">OHG</SelectItem>
                <SelectItem value="GbR">GbR</SelectItem>
                <SelectItem value="UG">UG (haftungsbeschränkt)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxId">Steuernummer</Label>
            <Input 
              id="taxId" 
              value={formData.taxId} 
              onChange={(e) => handleInputChange('taxId', e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vatId">USt-IdNr.</Label>
            <Input 
              id="vatId" 
              value={formData.vatId} 
              onChange={(e) => handleInputChange('vatId', e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="foundingDate">Gründungsdatum</Label>
            <Input 
              id="foundingDate" 
              type="date" 
              value={formData.foundingDate} 
              onChange={(e) => handleInputChange('foundingDate', e.target.value)} 
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Adresse & Kontakt</h3>
          
          <div className="space-y-2">
            <Label htmlFor="street">Straße & Hausnummer</Label>
            <Input 
              id="street" 
              value={formData.address.street} 
              onChange={(e) => handleAddressChange('street', e.target.value)} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">PLZ</Label>
              <Input 
                id="postalCode" 
                value={formData.address.postalCode} 
                onChange={(e) => handleAddressChange('postalCode', e.target.value)} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">Stadt</Label>
              <Input 
                id="city" 
                value={formData.address.city} 
                onChange={(e) => handleAddressChange('city', e.target.value)} 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Land</Label>
            <Select 
              value={formData.address.country} 
              onValueChange={(value) => handleAddressChange('country', value)}
            >
              <SelectTrigger id="country">
                <SelectValue placeholder="Land auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Deutschland">Deutschland</SelectItem>
                <SelectItem value="Österreich">Österreich</SelectItem>
                <SelectItem value="Schweiz">Schweiz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Kontakt-E-Mail</Label>
            <Input 
              id="contactEmail" 
              type="email" 
              value={formData.contactEmail} 
              onChange={(e) => handleInputChange('contactEmail', e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Telefonnummer</Label>
            <Input 
              id="contactPhone" 
              value={formData.contactPhone} 
              onChange={(e) => handleInputChange('contactPhone', e.target.value)} 
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Unternehmensbeschreibung</h3>
        
        <div className="space-y-2">
          <Label htmlFor="description">Beschreibung</Label>
          <Textarea 
            id="description" 
            rows={4} 
            value={formData.description} 
            onChange={(e) => handleInputChange('description', e.target.value)} 
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit">Änderungen speichern</Button>
      </div>
    </form>
  );
};
