import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tags, Folder, Brain, Plus, Save } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "@/hooks/use-toast";

interface FormState {
  require_document_type: boolean;
  require_validity_date: boolean;
  require_department: boolean;
  require_confidentiality: boolean;
  ai_classification_enabled: boolean;
  default_department: string;
}

export default function CategoriesMetadataSettings() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  
  const [formState, setFormState] = useState<FormState>({
    require_document_type: true,
    require_validity_date: false,
    require_department: false,
    require_confidentiality: true,
    ai_classification_enabled: true,
    default_department: '',
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        require_document_type: getValue('categories_require_document_type', true) as boolean,
        require_validity_date: getValue('categories_require_validity_date', false) as boolean,
        require_department: getValue('categories_require_department', false) as boolean,
        require_confidentiality: getValue('categories_require_confidentiality', true) as boolean,
        ai_classification_enabled: getValue('categories_ai_classification_enabled', true) as boolean,
        default_department: getValue('categories_default_department', '') as string,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const settingsToSave = {
      categories_require_document_type: formState.require_document_type,
      categories_require_validity_date: formState.require_validity_date,
      categories_require_department: formState.require_department,
      categories_require_confidentiality: formState.require_confidentiality,
      categories_ai_classification_enabled: formState.ai_classification_enabled,
      categories_default_department: formState.default_department,
    };
    
    await saveSettings(settingsToSave);
    toast({ title: "Kategorien-Einstellungen gespeichert" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Dokument-Kategorien
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">👥 HR</h4>
                  <Badge variant="secondary">Standard</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Personalwesen und Mitarbeiterdokumente</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Bearbeiten</Button>
                  <Button variant="outline" size="sm">Löschen</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">💰 Finance</h4>
                  <Badge variant="secondary">Standard</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Finanzwesen und Buchhaltung</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Bearbeiten</Button>
                  <Button variant="outline" size="sm">Löschen</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">⚖️ Recht</h4>
                  <Badge variant="secondary">Standard</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Rechtliche Dokumente und Verträge</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Bearbeiten</Button>
                  <Button variant="outline" size="sm">Löschen</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed">
              <CardContent className="p-4 text-center">
                <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <h4 className="font-medium">Neue Kategorie</h4>
                <p className="text-sm text-muted-foreground mb-2">Eigene Kategorie hinzufügen</p>
                <Button variant="outline" size="sm">Erstellen</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Pflichtfelder bei Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dokumententyp</Label>
                <p className="text-sm text-muted-foreground">Typ muss bei Upload ausgewählt werden</p>
              </div>
              <Switch 
                checked={formState.require_document_type}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, require_document_type: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Gültigkeitsdatum</Label>
                <p className="text-sm text-muted-foreground">Ablaufdatum für zeitkritische Dokumente</p>
              </div>
              <Switch 
                checked={formState.require_validity_date}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, require_validity_date: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Abteilungszuordnung</Label>
                <p className="text-sm text-muted-foreground">Organisatorische Zuordnung erforderlich</p>
              </div>
              <Switch 
                checked={formState.require_department}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, require_department: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Vertraulichkeitsstufe</Label>
                <p className="text-sm text-muted-foreground">Klassifizierung nach Datenschutz</p>
              </div>
              <Switch 
                checked={formState.require_confidentiality}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, require_confidentiality: checked }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadaten-Felder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📝 Schlagwörter</h4>
                <p className="text-sm text-muted-foreground mb-2">Freitext-Tags für bessere Suche</p>
                <Input placeholder="z.B. Vertrag, Schulung, Zertifikat" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">🏢 Abteilung</h4>
                <p className="text-sm text-muted-foreground mb-2">Organisationseinheit</p>
                <Select 
                  value={formState.default_department}
                  onValueChange={(value) => setFormState(prev => ({ ...prev, default_department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Abteilung wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">Personal</SelectItem>
                    <SelectItem value="finance">Finanzen</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                    <SelectItem value="legal">Recht</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📊 Projektbezug</h4>
                <p className="text-sm text-muted-foreground mb-2">Verknüpfung mit Projekten</p>
                <Input placeholder="Projekt-ID oder Name" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📅 Erstellungsdatum</h4>
                <p className="text-sm text-muted-foreground mb-2">Automatisch erfasst</p>
                <Input value="Automatisch" disabled />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Automatische KI-Klassifizierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>KI-Klassifizierung aktivieren</Label>
              <p className="text-sm text-muted-foreground">Automatische Erkennung von Dokumenttypen</p>
            </div>
            <Switch 
              checked={formState.ai_classification_enabled}
              onCheckedChange={(checked) => setFormState(prev => ({ ...prev, ai_classification_enabled: checked }))}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-green-600">✓ Arbeitsvertrag</h4>
                <p className="text-sm text-muted-foreground">96% Erkennungsrate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-green-600">✓ Krankmeldung</h4>
                <p className="text-sm text-muted-foreground">94% Erkennungsrate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-green-600">✓ Rechnung</h4>
                <p className="text-sm text-muted-foreground">98% Erkennungsrate</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benutzerdefinierte Felder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2 items-center">
              <Input placeholder="Feldname" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Typ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Zahl</SelectItem>
                  <SelectItem value="date">Datum</SelectItem>
                  <SelectItem value="select">Auswahl</SelectItem>
                </SelectContent>
              </Select>
              <Switch />
              <Button variant="outline" size="sm">Hinzufügen</Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Beispiel: Kostenstelle (Zahl), Genehmiger (Text), Wiedervorlage (Datum)
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
