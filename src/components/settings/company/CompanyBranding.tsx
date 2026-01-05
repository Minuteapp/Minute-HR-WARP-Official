
import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Upload, Trash2 } from "lucide-react";

export const CompanyBranding = () => {
  const [primaryColor, setPrimaryColor] = useState('#3B44F6');
  const [secondaryColor, setSecondaryColor] = useState('#D6BCFA');
  const [logo, setLogo] = useState('/lovable-uploads/840a513c-5bfd-4036-af4a-70103e900e87.png');
  const [favicon, setFavicon] = useState('/lovable-uploads/840a513c-5bfd-4036-af4a-70103e900e87.png');
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hier würde normalerweise ein Datei-Upload stattfinden
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogo(event.target.result.toString());
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hier würde normalerweise ein Datei-Upload stattfinden
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFavicon(event.target.result.toString());
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="branding">Logo & Farben</TabsTrigger>
          <TabsTrigger value="templates">E-Mail-Vorlagen</TabsTrigger>
        </TabsList>
        
        <TabsContent value="branding" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Unternehmenslogo</h3>
              
              <div className="border rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                {logo ? (
                  <div className="relative">
                    <img 
                      src={logo} 
                      alt="Unternehmenslogo" 
                      className="h-24 object-contain mx-auto"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-2 -right-2"
                      onClick={() => setLogo('')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Kein Logo hochgeladen</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <Label htmlFor="logo-upload" className="block mb-2 text-sm font-medium">
                    Logo hochladen
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="logo-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Datei auswählen
                      </label>
                    </Button>
                    <span className="text-xs text-gray-500">SVG, PNG oder JPG (max. 2MB)</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mt-6">Favicon</h3>
              
              <div className="border rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                {favicon ? (
                  <div className="relative">
                    <img 
                      src={favicon} 
                      alt="Favicon" 
                      className="h-12 w-12 object-contain mx-auto"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -top-2 -right-2"
                      onClick={() => setFavicon('')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Kein Favicon hochgeladen</p>
                  </div>
                )}
                
                <div className="mt-4">
                  <Label htmlFor="favicon-upload" className="block mb-2 text-sm font-medium">
                    Favicon hochladen
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="favicon-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconUpload}
                      className="hidden"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="favicon-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Datei auswählen
                      </label>
                    </Button>
                    <span className="text-xs text-gray-500">ICO, PNG (quadratisch, max. 512px)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Markenfarben</h3>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primärfarbe</Label>
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-md border" 
                          style={{ backgroundColor: primaryColor }}
                        />
                        <Input 
                          id="primary-color" 
                          type="color" 
                          value={primaryColor} 
                          onChange={(e) => setPrimaryColor(e.target.value)} 
                          className="w-16 h-10 p-1"
                        />
                        <Input 
                          value={primaryColor} 
                          onChange={(e) => setPrimaryColor(e.target.value)} 
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Sekundärfarbe</Label>
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-md border" 
                          style={{ backgroundColor: secondaryColor }}
                        />
                        <Input 
                          id="secondary-color" 
                          type="color" 
                          value={secondaryColor} 
                          onChange={(e) => setSecondaryColor(e.target.value)} 
                          className="w-16 h-10 p-1"
                        />
                        <Input 
                          value={secondaryColor} 
                          onChange={(e) => setSecondaryColor(e.target.value)} 
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Vorschau</h4>
                    
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div 
                          className="h-8 rounded-md px-4 flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Primärbutton
                        </div>
                        
                        <div 
                          className="h-8 rounded-md px-4 flex items-center justify-center border font-medium"
                          style={{ borderColor: primaryColor, color: primaryColor }}
                        >
                          Sekundärbutton
                        </div>
                      </div>
                      
                      <div className="h-2 rounded-full w-full overflow-hidden bg-gray-200">
                        <div className="h-full" style={{ backgroundColor: primaryColor, width: '60%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end mt-6">
                <Button>Änderungen speichern</Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="templates" className="pt-4">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-2">E-Mail-Vorlagen</h3>
            <p className="text-gray-500">Hier können Sie E-Mail-Vorlagen für verschiedene Mitteilungen anpassen.</p>
            <p className="text-gray-500 mt-2">Diese Funktion wird in Kürze verfügbar sein.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
