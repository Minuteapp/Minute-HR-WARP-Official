
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Palette, Layout, Type, Image } from "lucide-react";

const colors = [
  { name: 'Primary', value: '#9b87f5', className: 'bg-primary' },
  { name: 'Secondary', value: '#7E69AB', className: 'bg-purple-500' },
  { name: 'Success', value: '#10b981', className: 'bg-green-500' },
  { name: 'Warning', value: '#f59e0b', className: 'bg-yellow-500' },
  { name: 'Danger', value: '#ef4444', className: 'bg-red-500' },
];

const CustomizationSettings = () => {
  const [activeTab, setActiveTab] = useState('branding');
  const [companyName, setCompanyName] = useState('Meine Firma GmbH');
  const [brandingItems, setBrandingItems] = useState({
    logoUploaded: true,
    faviconUploaded: true,
  });
  
  return (
    <Tabs defaultValue="branding" onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-4 mb-6">
        <TabsTrigger value="branding" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Branding
        </TabsTrigger>
        <TabsTrigger value="layout" className="flex items-center gap-2">
          <Layout className="h-4 w-4" />
          Layout
        </TabsTrigger>
        <TabsTrigger value="typography" className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          Typografie
        </TabsTrigger>
        <TabsTrigger value="themes" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Themes
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="branding" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Unternehmensidentität</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Firmenname</Label>
              <Input 
                id="company-name" 
                value={companyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <Label>Firmenlogo</Label>
              <div className="flex items-center gap-4">
                {brandingItems.logoUploaded ? (
                  <div className="w-32 h-16 bg-gray-100 flex items-center justify-center border rounded-md overflow-hidden">
                    <div className="text-primary font-bold">{companyName.substring(0, 2).toUpperCase()}</div>
                  </div>
                ) : (
                  <div className="w-32 h-16 bg-gray-100 flex items-center justify-center border border-dashed rounded-md">
                    <span className="text-gray-500 text-sm">Kein Logo</span>
                  </div>
                )}
                <Button variant="outline">Logo ändern</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Favicon</Label>
              <div className="flex items-center gap-4">
                {brandingItems.faviconUploaded ? (
                  <div className="w-10 h-10 bg-primary text-white flex items-center justify-center border rounded-md overflow-hidden">
                    <div className="font-bold">{companyName.substring(0, 1).toUpperCase()}</div>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-100 flex items-center justify-center border border-dashed rounded-md">
                    <span className="text-gray-500 text-xs">Icon</span>
                  </div>
                )}
                <Button variant="outline">Favicon ändern</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Farbschema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {colors.map((color) => (
                <div key={color.name} className="space-y-2">
                  <Label>{color.name}</Label>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${color.className}`}></div>
                    <Input 
                      value={color.value} 
                      className="font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline">Zurücksetzen</Button>
              <Button>Änderungen speichern</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="layout" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Layout-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Hier können Sie das Layout Ihrer Anwendung anpassen, z.B. die Position der Navigationsleiste,
              den Standardmodus (kompakt/erweitert) und vieles mehr.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="typography" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Typografie-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Hier können Sie die Schriftarten, Schriftgrößen und andere typografische Elemente Ihrer Anwendung anpassen.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="themes" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Theme-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">
              Hier können Sie zwischen verschiedenen vordefinierten Themes wählen oder ein eigenes Theme erstellen.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default CustomizationSettings;
