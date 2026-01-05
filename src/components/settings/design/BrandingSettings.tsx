
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image } from "lucide-react";

const BrandingSettings = () => {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    toast({
      title: "Branding gespeichert",
      description: "Die Branding-Einstellungen wurden erfolgreich gespeichert."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Firmenlogo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-center">
              <Image className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Logo hochladen</p>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Logo hochladen
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unternehmensinformationen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Firmenname</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ihr Firmenname"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Slogan/Tagline</Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Ihr Firmenslogan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibung Ihres Unternehmens"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => {
          setCompanyName('');
          setTagline('');
          setDescription('');
        }}>
          Zurücksetzen
        </Button>
        <Button onClick={handleSave}>Änderungen speichern</Button>
      </div>
    </div>
  );
};

export default BrandingSettings;
