
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MapPin, Globe, Phone, AtSign, Calendar } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CompanyInfoCardProps {
  companyId?: string;
}

const CompanyInfoCard: React.FC<CompanyInfoCardProps> = ({ companyId }) => {
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      description: "Die Unternehmensinformationen wurden erfolgreich aktualisiert.",
    });
  };

  return (
    <Card className="settings-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Unternehmensinformationen
        </CardTitle>
        <CardDescription>
          Grundlegende Informationen über Ihr Unternehmen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Unternehmensname</Label>
            <div className="flex">
              <Building2 className="h-4 w-4 mr-2 mt-2.5 text-gray-500" />
              <Input id="company-name" defaultValue="Meine Firma GmbH" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-legal">Rechtsform</Label>
            <div className="flex">
              <AtSign className="h-4 w-4 mr-2 mt-2.5 text-gray-500" />
              <Input id="company-legal" defaultValue="GmbH" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-website">Webseite</Label>
            <div className="flex">
              <Globe className="h-4 w-4 mr-2 mt-2.5 text-gray-500" />
              <Input id="company-website" defaultValue="https://www.meinefirma.de" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-phone">Telefon</Label>
            <div className="flex">
              <Phone className="h-4 w-4 mr-2 mt-2.5 text-gray-500" />
              <Input id="company-phone" defaultValue="+49 123 456789" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-address">Adresse</Label>
            <div className="flex">
              <MapPin className="h-4 w-4 mr-2 mt-2.5 text-gray-500" />
              <Input id="company-address" defaultValue="Musterstraße 123, 12345 Berlin" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-founded">Gründungsdatum</Label>
            <div className="flex">
              <Calendar className="h-4 w-4 mr-2 mt-2.5 text-gray-500" />
              <Input type="date" id="company-founded" defaultValue="2020-01-01" />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="company-description">Unternehmensbeschreibung</Label>
          <Textarea 
            id="company-description" 
            defaultValue="Meine Firma GmbH ist ein innovatives Unternehmen, das sich auf die Entwicklung von Software spezialisiert hat."
            className="min-h-[100px]"
          />
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSave}>Speichern</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInfoCard;
