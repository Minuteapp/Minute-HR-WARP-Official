
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const CompanyBranding = () => {
  const { toast } = useToast();
  const [logoUploaded, setLogoUploaded] = useState(false);
  const [faviconUploaded, setFaviconUploaded] = useState(false);
  
  const handleLogoUpload = () => {
    setLogoUploaded(true);
    toast({
      title: "Logo hochgeladen",
      description: "Das Logo wurde erfolgreich hochgeladen.",
    });
  };
  
  const handleFaviconUpload = () => {
    setFaviconUploaded(true);
    toast({
      title: "Favicon hochgeladen",
      description: "Das Favicon wurde erfolgreich hochgeladen.",
    });
  };
  
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Unternehmenslogo</h3>
        <div className="flex items-center gap-6">
          <div className="w-40 h-20 border border-dashed rounded-lg flex items-center justify-center bg-gray-50">
            {logoUploaded ? (
              <div className="text-xl font-bold text-primary">LOGO</div>
            ) : (
              <UploadCloud className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="space-y-2">
            <Button onClick={handleLogoUpload} variant="outline">Logo hochladen</Button>
            <p className="text-xs text-gray-500">Empfohlene Größe: 200x100 Pixel, PNG oder SVG</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Favicon</h3>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 border border-dashed rounded-lg flex items-center justify-center bg-gray-50">
            {faviconUploaded ? (
              <div className="text-sm font-bold text-primary">FAV</div>
            ) : (
              <UploadCloud className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <div className="space-y-2">
            <Button onClick={handleFaviconUpload} variant="outline">Favicon hochladen</Button>
            <p className="text-xs text-gray-500">Empfohlene Größe: 32x32 Pixel, ICO oder PNG</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Farben</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primärfarbe</Label>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-md bg-primary flex-shrink-0"></div>
              <Input id="primary-color" defaultValue="#9b87f5" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary-color">Sekundärfarbe</Label>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-md bg-gray-600 flex-shrink-0"></div>
              <Input id="secondary-color" defaultValue="#4b5563" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button>Änderungen speichern</Button>
      </div>
    </div>
  );
};
