import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Palette, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function BrandingPage() {
  const navigate = useNavigate();

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings/company")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zu Unternehmenseinstellungen
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Corporate Design & Branding</h1>
              <p className="text-muted-foreground mt-2">
                Logo, Farben, Schriftarten und visuelles Erscheinungsbild
              </p>
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Firmenlogo</CardTitle>
            <CardDescription>
              Upload und Verwaltung verschiedener Logo-Varianten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Hauptlogo</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Logo hochladen</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Datei auswählen
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Logo invertiert</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Logo invertiert</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Datei auswählen
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Favicon</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Favicon (.ico)</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Datei auswählen
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Corporate Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Corporate Colors</CardTitle>
            <CardDescription>
              Primär- und Sekundärfarben, Farbpalette
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="primary-color">Primärfarbe</Label>
                <div className="flex gap-2">
                  <Input 
                    id="primary-color" 
                    type="color" 
                    defaultValue="#0070f3" 
                    className="w-16 h-10 p-1"
                  />
                  <Input defaultValue="#0070f3" className="flex-1" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="secondary-color">Sekundärfarbe</Label>
                <div className="flex gap-2">
                  <Input 
                    id="secondary-color" 
                    type="color" 
                    defaultValue="#6b7280" 
                    className="w-16 h-10 p-1"
                  />
                  <Input defaultValue="#6b7280" className="flex-1" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="accent-color">Akzentfarbe</Label>
                <div className="flex gap-2">
                  <Input 
                    id="accent-color" 
                    type="color" 
                    defaultValue="#10b981" 
                    className="w-16 h-10 p-1"
                  />
                  <Input defaultValue="#10b981" className="flex-1" />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="error-color">Fehlerfarbe</Label>
                <div className="flex gap-2">
                  <Input 
                    id="error-color" 
                    type="color" 
                    defaultValue="#ef4444" 
                    className="w-16 h-10 p-1"
                  />
                  <Input defaultValue="#ef4444" className="flex-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typographie</CardTitle>
            <CardDescription>
              Hausschrift und Schriftgrößen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Typographie-Einstellungen folgen in einer zukünftigen Version</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Zurücksetzen</Button>
          <Button>Änderungen speichern</Button>
        </div>
      </div>
    </PageLayout>
  );
}