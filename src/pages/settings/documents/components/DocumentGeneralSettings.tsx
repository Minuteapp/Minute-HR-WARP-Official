import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Upload, Archive, FileCheck, Save } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "@/hooks/use-toast";

interface FormState {
  max_file_size_mb: number;
  versioning_enabled: boolean;
  auto_archiving: boolean;
  max_versions_per_document: number;
  archive_after_days: number;
  format_pdf: boolean;
  format_word: boolean;
  format_excel: boolean;
  format_images: boolean;
  format_zip: boolean;
}

export default function DocumentGeneralSettings() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  
  const [formState, setFormState] = useState<FormState>({
    max_file_size_mb: 50,
    versioning_enabled: true,
    auto_archiving: false,
    max_versions_per_document: 10,
    archive_after_days: 365,
    format_pdf: true,
    format_word: true,
    format_excel: true,
    format_images: true,
    format_zip: true,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        max_file_size_mb: getValue('general_max_file_size_mb', 50) as number,
        versioning_enabled: getValue('general_versioning_enabled', true) as boolean,
        auto_archiving: getValue('general_auto_archiving', false) as boolean,
        max_versions_per_document: getValue('general_max_versions_per_document', 10) as number,
        archive_after_days: getValue('general_archive_after_days', 365) as number,
        format_pdf: getValue('general_format_pdf', true) as boolean,
        format_word: getValue('general_format_word', true) as boolean,
        format_excel: getValue('general_format_excel', true) as boolean,
        format_images: getValue('general_format_images', true) as boolean,
        format_zip: getValue('general_format_zip', true) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const settingsToSave = {
      general_max_file_size_mb: formState.max_file_size_mb,
      general_versioning_enabled: formState.versioning_enabled,
      general_auto_archiving: formState.auto_archiving,
      general_max_versions_per_document: formState.max_versions_per_document,
      general_archive_after_days: formState.archive_after_days,
      general_format_pdf: formState.format_pdf,
      general_format_word: formState.format_word,
      general_format_excel: formState.format_excel,
      general_format_images: formState.format_images,
      general_format_zip: formState.format_zip,
    };
    
    await saveSettings(settingsToSave);
    toast({ title: "Allgemeine Dokumenteinstellungen gespeichert" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Standardordner für Mitarbeiter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-dashed">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📄 Arbeitsvertrag</h4>
                <p className="text-sm text-muted-foreground mb-2">Verträge und Zusatzvereinbarungen</p>
                <Badge variant="secondary">Automatisch erstellt</Badge>
              </CardContent>
            </Card>
            <Card className="border-2 border-dashed">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">🏆 Zeugnisse</h4>
                <p className="text-sm text-muted-foreground mb-2">Arbeitszeugnisse und Qualifikationen</p>
                <Badge variant="secondary">Automatisch erstellt</Badge>
              </CardContent>
            </Card>
            <Card className="border-2 border-dashed">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📚 Weiterbildung</h4>
                <p className="text-sm text-muted-foreground mb-2">Schulungen und Zertifikate</p>
                <Badge variant="secondary">Automatisch erstellt</Badge>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm">Neue Ordner hinzufügen</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Standardordner für Unternehmensdokumente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-dashed">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📋 Policies</h4>
                <p className="text-sm text-muted-foreground mb-2">Unternehmensrichtlinien und Verhaltenskodex</p>
                <Badge variant="outline">Öffentlich</Badge>
              </CardContent>
            </Card>
            <Card className="border-2 border-dashed">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📖 Handbücher</h4>
                <p className="text-sm text-muted-foreground mb-2">Betriebshandbücher und Anleitungen</p>
                <Badge variant="outline">Rollenbasiert</Badge>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Datei-Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-file-size">Maximale Dateigröße (MB)</Label>
              <Input 
                type="number" 
                value={formState.max_file_size_mb}
                onChange={(e) => setFormState(prev => ({ ...prev, max_file_size_mb: parseInt(e.target.value) || 50 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-formats">Unterstützte Dateiformate</Label>
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={formState.format_pdf ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormState(prev => ({ ...prev, format_pdf: !prev.format_pdf }))}
                >
                  PDF
                </Badge>
                <Badge 
                  variant={formState.format_word ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormState(prev => ({ ...prev, format_word: !prev.format_word }))}
                >
                  Word
                </Badge>
                <Badge 
                  variant={formState.format_excel ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormState(prev => ({ ...prev, format_excel: !prev.format_excel }))}
                >
                  Excel
                </Badge>
                <Badge 
                  variant={formState.format_images ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormState(prev => ({ ...prev, format_images: !prev.format_images }))}
                >
                  Bilder
                </Badge>
                <Badge 
                  variant={formState.format_zip ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormState(prev => ({ ...prev, format_zip: !prev.format_zip }))}
                >
                  ZIP
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Versionierung & Archivierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Versionierung aktivieren</Label>
                <p className="text-sm text-muted-foreground">Dokumenthistorie automatisch speichern</p>
              </div>
              <Switch 
                checked={formState.versioning_enabled}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, versioning_enabled: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Automatische Archivierung</Label>
                <p className="text-sm text-muted-foreground">Alte Versionen nach Zeitraum archivieren</p>
              </div>
              <Switch 
                checked={formState.auto_archiving}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_archiving: checked }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maximale Versionen pro Dokument</Label>
              <Input 
                type="number" 
                value={formState.max_versions_per_document}
                onChange={(e) => setFormState(prev => ({ ...prev, max_versions_per_document: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Archivierung nach (Tagen)</Label>
              <Input 
                type="number" 
                value={formState.archive_after_days}
                onChange={(e) => setFormState(prev => ({ ...prev, archive_after_days: parseInt(e.target.value) || 365 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dokumentstatus & Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h4 className="font-medium">Entwurf</h4>
                </div>
                <p className="text-sm text-muted-foreground">Dokument in Bearbeitung</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h4 className="font-medium">Prüfung</h4>
                </div>
                <p className="text-sm text-muted-foreground">Zur Genehmigung eingereicht</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-medium">Genehmigt</h4>
                </div>
                <p className="text-sm text-muted-foreground">Freigegeben und aktiv</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <h4 className="font-medium">Archiviert</h4>
                </div>
                <p className="text-sm text-muted-foreground">Nicht mehr aktiv</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Zurücksetzen</Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Speichern..." : "Einstellungen speichern"}
        </Button>
      </div>
    </div>
  );
}
