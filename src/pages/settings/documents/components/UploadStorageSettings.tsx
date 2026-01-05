import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Archive, QrCode, Clock, Save } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "@/hooks/use-toast";

interface FormState {
  auto_save_to_employee_profile: boolean;
  smart_folder_assignment: boolean;
  duplicate_detection: boolean;
  salary_statements_retention_years: number;
  contracts_retention_years: number;
  sick_notes_retention_years: number;
  training_docs_retention_years: number;
  auto_archive_enabled: boolean;
  archive_warning_days: number;
  archive_location: string;
  qr_code_digitization: boolean;
  smart_detection_ocr: boolean;
  mobile_app_scanning: boolean;
  compression_level: string;
  thumbnail_generation: boolean;
  cdn_for_large_files: boolean;
}

export default function UploadStorageSettings() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  
  const [formState, setFormState] = useState<FormState>({
    auto_save_to_employee_profile: true,
    smart_folder_assignment: true,
    duplicate_detection: false,
    salary_statements_retention_years: 10,
    contracts_retention_years: 30,
    sick_notes_retention_years: 5,
    training_docs_retention_years: 15,
    auto_archive_enabled: true,
    archive_warning_days: 30,
    archive_location: 'cloud',
    qr_code_digitization: false,
    smart_detection_ocr: true,
    mobile_app_scanning: true,
    compression_level: 'medium',
    thumbnail_generation: true,
    cdn_for_large_files: false,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        auto_save_to_employee_profile: getValue('upload_auto_save_to_employee_profile', true) as boolean,
        smart_folder_assignment: getValue('upload_smart_folder_assignment', true) as boolean,
        duplicate_detection: getValue('upload_duplicate_detection', false) as boolean,
        salary_statements_retention_years: getValue('upload_salary_statements_retention_years', 10) as number,
        contracts_retention_years: getValue('upload_contracts_retention_years', 30) as number,
        sick_notes_retention_years: getValue('upload_sick_notes_retention_years', 5) as number,
        training_docs_retention_years: getValue('upload_training_docs_retention_years', 15) as number,
        auto_archive_enabled: getValue('upload_auto_archive_enabled', true) as boolean,
        archive_warning_days: getValue('upload_archive_warning_days', 30) as number,
        archive_location: getValue('upload_archive_location', 'cloud') as string,
        qr_code_digitization: getValue('upload_qr_code_digitization', false) as boolean,
        smart_detection_ocr: getValue('upload_smart_detection_ocr', true) as boolean,
        mobile_app_scanning: getValue('upload_mobile_app_scanning', true) as boolean,
        compression_level: getValue('upload_compression_level', 'medium') as string,
        thumbnail_generation: getValue('upload_thumbnail_generation', true) as boolean,
        cdn_for_large_files: getValue('upload_cdn_for_large_files', false) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const settingsToSave = {
      upload_auto_save_to_employee_profile: formState.auto_save_to_employee_profile,
      upload_smart_folder_assignment: formState.smart_folder_assignment,
      upload_duplicate_detection: formState.duplicate_detection,
      upload_salary_statements_retention_years: formState.salary_statements_retention_years,
      upload_contracts_retention_years: formState.contracts_retention_years,
      upload_sick_notes_retention_years: formState.sick_notes_retention_years,
      upload_training_docs_retention_years: formState.training_docs_retention_years,
      upload_auto_archive_enabled: formState.auto_archive_enabled,
      upload_archive_warning_days: formState.archive_warning_days,
      upload_archive_location: formState.archive_location,
      upload_qr_code_digitization: formState.qr_code_digitization,
      upload_smart_detection_ocr: formState.smart_detection_ocr,
      upload_mobile_app_scanning: formState.mobile_app_scanning,
      upload_compression_level: formState.compression_level,
      upload_thumbnail_generation: formState.thumbnail_generation,
      upload_cdn_for_large_files: formState.cdn_for_large_files,
    };
    
    await saveSettings(settingsToSave);
    toast({ title: "Upload & Speicher-Einstellungen gespeichert" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Standard-Uploadpfade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">👤 Mitarbeiter</h4>
                <p className="text-sm text-muted-foreground mb-2">Automatischer Upload in persönlichen Ordner</p>
                <Input placeholder="/mitarbeiter/{user_id}/dokumente" readOnly />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">👥 HR</h4>
                <p className="text-sm text-muted-foreground mb-2">HR-Dokumente zentral verwaltet</p>
                <Input placeholder="/hr/dokumente/{kategorie}" readOnly />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">🏢 Unternehmen</h4>
                <p className="text-sm text-muted-foreground mb-2">Allgemeine Unternehmensdokumente</p>
                <Input placeholder="/unternehmen/{abteilung}" readOnly />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📋 Projekte</h4>
                <p className="text-sm text-muted-foreground mb-2">Projektbezogene Dokumente</p>
                <Input placeholder="/projekte/{projekt_id}/docs" readOnly />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automatische Speicherung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Automatisch in Mitarbeiterprofil speichern</Label>
                <p className="text-sm text-muted-foreground">Zeugnisse, Verträge direkt zuordnen</p>
              </div>
              <Switch 
                checked={formState.auto_save_to_employee_profile}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_save_to_employee_profile: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Smart-Folder-Zuordnung</Label>
                <p className="text-sm text-muted-foreground">KI bestimmt automatisch den richtigen Ordner</p>
              </div>
              <Switch 
                checked={formState.smart_folder_assignment}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, smart_folder_assignment: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Duplikatserkennung</Label>
                <p className="text-sm text-muted-foreground">Warnung vor doppelten Uploads</p>
              </div>
              <Switch 
                checked={formState.duplicate_detection}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, duplicate_detection: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Aufbewahrungsfristen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">💰 Gehaltsabrechnungen</h4>
                <div className="space-y-2">
                  <Label>Aufbewahrungszeit (Jahre)</Label>
                  <Input 
                    type="number" 
                    value={formState.salary_statements_retention_years}
                    onChange={(e) => setFormState(prev => ({ ...prev, salary_statements_retention_years: parseInt(e.target.value) || 10 }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📄 Arbeitsverträge</h4>
                <div className="space-y-2">
                  <Label>Aufbewahrungszeit (Jahre)</Label>
                  <Input 
                    type="number" 
                    value={formState.contracts_retention_years}
                    onChange={(e) => setFormState(prev => ({ ...prev, contracts_retention_years: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">🏥 Krankmeldungen</h4>
                <div className="space-y-2">
                  <Label>Aufbewahrungszeit (Jahre)</Label>
                  <Input 
                    type="number" 
                    value={formState.sick_notes_retention_years}
                    onChange={(e) => setFormState(prev => ({ ...prev, sick_notes_retention_years: parseInt(e.target.value) || 5 }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📚 Schulungsnachweise</h4>
                <div className="space-y-2">
                  <Label>Aufbewahrungszeit (Jahre)</Label>
                  <Input 
                    type="number" 
                    value={formState.training_docs_retention_years}
                    onChange={(e) => setFormState(prev => ({ ...prev, training_docs_retention_years: parseInt(e.target.value) || 15 }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Automatische Archivierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Archivierung aktivieren</Label>
              <p className="text-sm text-muted-foreground">Dokumente nach Ablaufdatum automatisch archivieren</p>
            </div>
            <Switch 
              checked={formState.auto_archive_enabled}
              onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_archive_enabled: checked }))}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Warnung vor Archivierung (Tage)</Label>
              <Input 
                type="number" 
                value={formState.archive_warning_days}
                onChange={(e) => setFormState(prev => ({ ...prev, archive_warning_days: parseInt(e.target.value) || 30 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Archiv-Speicherort</Label>
              <Select 
                value={formState.archive_location}
                onValueChange={(value) => setFormState(prev => ({ ...prev, archive_location: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Speicherort wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cloud">Cloud-Archiv</SelectItem>
                  <SelectItem value="local">Lokaler Server</SelectItem>
                  <SelectItem value="external">Externer Anbieter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Papierdokumente digitalisieren
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>QR-Code Digitalisierung</Label>
                <p className="text-sm text-muted-foreground">QR-Codes auf Papier für schnelle Zuordnung</p>
              </div>
              <Switch 
                checked={formState.qr_code_digitization}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, qr_code_digitization: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Smart Detection aktivieren</Label>
                <p className="text-sm text-muted-foreground">OCR-Texterkennung für gescannte Dokumente</p>
              </div>
              <Switch 
                checked={formState.smart_detection_ocr}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, smart_detection_ocr: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Mobile App Scanning</Label>
                <p className="text-sm text-muted-foreground">Smartphone-App für Dokumentenerfassung</p>
              </div>
              <Switch 
                checked={formState.mobile_app_scanning}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, mobile_app_scanning: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Speicher & Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Komprimierung aktivieren</Label>
              <Select 
                value={formState.compression_level}
                onValueChange={(value) => setFormState(prev => ({ ...prev, compression_level: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Thumbnail-Generierung</Label>
              <Switch 
                checked={formState.thumbnail_generation}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, thumbnail_generation: checked }))}
              />
            </div>
            <div className="space-y-2">
              <Label>CDN für große Dateien</Label>
              <Switch 
                checked={formState.cdn_for_large_files}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, cdn_for_large_files: checked }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Upload-Regeln</Label>
            <Textarea 
              placeholder="z.B. Maximale Größe 50MB, nur bestimmte Dateitypen erlaubt, Virenscan erforderlich..."
              rows={3}
            />
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
