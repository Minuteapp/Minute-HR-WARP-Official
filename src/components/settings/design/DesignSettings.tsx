
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Layout, Type, Image } from "lucide-react";
import BrandingSettings from './BrandingSettings';
import LayoutSettings from './LayoutSettings';
import TypographySettings from './TypographySettings';
import ThemeSettings from './ThemeSettings';
import ColorSettings from './ColorSettings';

const DesignSettings = () => {
  const [activeTab, setActiveTab] = useState('branding');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-5 mb-6">
        <TabsTrigger value="branding" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          Branding
        </TabsTrigger>
        <TabsTrigger value="colors" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Farben
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
          <Palette className="h-4 w-4" />
          Themes
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="branding" className="space-y-6">
        <BrandingSettings />
      </TabsContent>
      
      <TabsContent value="colors" className="space-y-6">
        <ColorSettings />
      </TabsContent>
      
      <TabsContent value="layout" className="space-y-6">
        <LayoutSettings />
      </TabsContent>
      
      <TabsContent value="typography" className="space-y-6">
        <TypographySettings />
      </TabsContent>
      
      <TabsContent value="themes" className="space-y-6">
        <ThemeSettings />
      </TabsContent>
    </Tabs>
  );
};

export default DesignSettings;
