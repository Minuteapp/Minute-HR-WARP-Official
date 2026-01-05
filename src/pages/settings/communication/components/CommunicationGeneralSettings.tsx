import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Palette, Mail, Settings } from "lucide-react";

export default function CommunicationGeneralSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Sprache & Mehrsprachigkeit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-language">Standard-Sprache</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sprache wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mehrsprachigkeit aktivieren</Label>
              <div className="flex items-center space-x-2">
                <Switch />
                <span className="text-sm text-muted-foreground">Automatische Übersetzungen</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Layout-Vorlagen & Branding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-dashed">
              <CardContent className="p-4 text-center">
                <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h4 className="font-medium">E-Mail Vorlage</h4>
                <p className="text-sm text-muted-foreground">Standard E-Mail Design</p>
                <Button variant="outline" size="sm" className="mt-2">Bearbeiten</Button>
              </CardContent>
            </Card>
            <Card className="border-2 border-dashed">
              <CardContent className="p-4 text-center">
                <Settings className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h4 className="font-medium">Push Vorlage</h4>
                <p className="text-sm text-muted-foreground">Mobile Benachrichtigungen</p>
                <Button variant="outline" size="sm" className="mt-2">Bearbeiten</Button>
              </CardContent>
            </Card>
            <Card className="border-2 border-dashed">
              <CardContent className="p-4 text-center">
                <Globe className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h4 className="font-medium">In-App Vorlage</h4>
                <p className="text-sm text-muted-foreground">Interne Nachrichten</p>
                <Button variant="outline" size="sm" className="mt-2">Bearbeiten</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unternehmensbranding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-logo">Firmen-Logo URL</Label>
              <Input placeholder="https://example.com/logo.png" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-color">Primärfarbe</Label>
              <div className="flex gap-2">
                <Input placeholder="#1F2937" />
                <div className="w-10 h-10 bg-primary rounded border"></div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-footer">E-Mail Footer</Label>
            <Textarea 
              placeholder="Ihr Unternehmen | Musterstraße 1 | 12345 Musterstadt | info@unternehmen.de"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Antwort-Optionen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>HR Antwort-E-Mail</Label>
              <Input placeholder="hr@unternehmen.de" />
            </div>
            <div className="space-y-2">
              <Label>Manager Antwort-E-Mail</Label>
              <Input placeholder="management@unternehmen.de" />
            </div>
            <div className="space-y-2">
              <Label>Do-Not-Reply E-Mail</Label>
              <Input placeholder="noreply@unternehmen.de" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Zurücksetzen</Button>
        <Button>Einstellungen speichern</Button>
      </div>
    </div>
  );
}