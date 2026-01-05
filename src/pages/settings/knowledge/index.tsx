import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, Tags, FileText, Eye, Lock, Plus, Trash2, ChevronLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";

interface KnowledgeFormState {
  // Review-Prozess
  review_before_publish: boolean;
  periodic_review: boolean;
  review_interval_months: number;
  // Zugriffsrechte
  default_read_all: boolean;
  everyone_can_edit: boolean;
  department_restrictions: boolean;
  // Kategorien
  categories: Array<{ id: string; name: string }>;
  // Allgemein
  versioning_enabled: boolean;
  comments_enabled: boolean;
  ratings_enabled: boolean;
  ai_suggestions: boolean;
}

export default function KnowledgeSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, saveSettings, getValue } = useEffectiveSettings('knowledge');
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<KnowledgeFormState>({
    review_before_publish: true,
    periodic_review: true,
    review_interval_months: 6,
    default_read_all: true,
    everyone_can_edit: false,
    department_restrictions: false,
    categories: [
      { id: "1", name: "Policies & Richtlinien" },
      { id: "2", name: "How-To Guides" },
      { id: "3", name: "FAQ" },
      { id: "4", name: "Best Practices" },
    ],
    versioning_enabled: true,
    comments_enabled: true,
    ratings_enabled: true,
    ai_suggestions: false,
  });

  useEffect(() => {
    if (!loading) {
      setFormState(prev => ({
        ...prev,
        review_before_publish: getValue('review_before_publish', prev.review_before_publish),
        periodic_review: getValue('periodic_review', prev.periodic_review),
        review_interval_months: getValue('review_interval_months', prev.review_interval_months),
        default_read_all: getValue('default_read_all', prev.default_read_all),
        everyone_can_edit: getValue('everyone_can_edit', prev.everyone_can_edit),
        department_restrictions: getValue('department_restrictions', prev.department_restrictions),
        categories: getValue('categories', prev.categories),
        versioning_enabled: getValue('versioning_enabled', prev.versioning_enabled),
        comments_enabled: getValue('comments_enabled', prev.comments_enabled),
        ratings_enabled: getValue('ratings_enabled', prev.ratings_enabled),
        ai_suggestions: getValue('ai_suggestions', prev.ai_suggestions),
      }));
    }
  }, [loading, getValue]);

  const updateFormState = (key: keyof KnowledgeFormState, value: any) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const updateCategory = (id: string, name: string) => {
    setFormState(prev => ({
      ...prev,
      categories: prev.categories.map(cat => 
        cat.id === id ? { ...cat, name } : cat
      ),
    }));
  };

  const addCategory = () => {
    const newId = String(Date.now());
    setFormState(prev => ({
      ...prev,
      categories: [...prev.categories, { id: newId, name: "Neue Kategorie" }],
    }));
  };

  const removeCategory = (id: string) => {
    setFormState(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== id),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(formState);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Knowledge Hub-Einstellungen wurden erfolgreich aktualisiert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" onClick={() => navigate("/settings")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Knowledge Hub-Einstellungen</h1>
            <p className="text-sm text-muted-foreground">Konfigurieren Sie Wissensmanagement und Zugriffsrechte</p>
          </div>
        </div>
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              Kategorien
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Vorlagen
            </TabsTrigger>
            <TabsTrigger value="review" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Review-Prozess
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Zugriffsrechte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wissenskategorien</CardTitle>
                <CardDescription>Organisieren Sie Ihre Wissensbasis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formState.categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Input 
                      value={category.name} 
                      className="flex-1"
                      onChange={(e) => updateCategory(category.id, e.target.value)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeCategory(category.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Kategorie hinzufügen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Artikelvorlagen</CardTitle>
                <CardDescription>Standardvorlagen für Wissensartikel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Versionierung aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Änderungshistorie für alle Artikel</p>
                  </div>
                  <Switch 
                    checked={formState.versioning_enabled}
                    onCheckedChange={(checked) => updateFormState('versioning_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Kommentare aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Mitarbeiter können Artikel kommentieren</p>
                  </div>
                  <Switch 
                    checked={formState.comments_enabled}
                    onCheckedChange={(checked) => updateFormState('comments_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bewertungen aktivieren</Label>
                    <p className="text-sm text-muted-foreground">Artikel können bewertet werden</p>
                  </div>
                  <Switch 
                    checked={formState.ratings_enabled}
                    onCheckedChange={(checked) => updateFormState('ratings_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>KI-Vorschläge</Label>
                    <p className="text-sm text-muted-foreground">KI schlägt verwandte Artikel vor</p>
                  </div>
                  <Switch 
                    checked={formState.ai_suggestions}
                    onCheckedChange={(checked) => updateFormState('ai_suggestions', checked)}
                  />
                </div>
                <div className="text-center py-8 text-muted-foreground border-t">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Noch keine Vorlagen erstellt</p>
                  <Button variant="outline" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Vorlage erstellen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review-Prozess</CardTitle>
                <CardDescription>Qualitätssicherung für Wissensartikel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Review vor Veröffentlichung</Label>
                    <p className="text-sm text-muted-foreground">Artikel müssen geprüft werden</p>
                  </div>
                  <Switch 
                    checked={formState.review_before_publish}
                    onCheckedChange={(checked) => updateFormState('review_before_publish', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Periodische Überprüfung</Label>
                    <p className="text-sm text-muted-foreground">Regelmäßige Aktualitätsprüfung</p>
                  </div>
                  <Switch 
                    checked={formState.periodic_review}
                    onCheckedChange={(checked) => updateFormState('periodic_review', checked)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Review-Intervall (Monate)</Label>
                  <Input 
                    type="number" 
                    value={formState.review_interval_months}
                    onChange={(e) => updateFormState('review_interval_months', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zugriffsrechte</CardTitle>
                <CardDescription>Berechtigungen für Wissensinhalte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Standard: Alle können lesen</Label>
                    <p className="text-sm text-muted-foreground">Neue Artikel sind für alle sichtbar</p>
                  </div>
                  <Switch 
                    checked={formState.default_read_all}
                    onCheckedChange={(checked) => updateFormState('default_read_all', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Jeder kann bearbeiten</Label>
                    <p className="text-sm text-muted-foreground">Wiki-Modus für alle Mitarbeiter</p>
                  </div>
                  <Switch 
                    checked={formState.everyone_can_edit}
                    onCheckedChange={(checked) => updateFormState('everyone_can_edit', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Abteilungs-Einschränkungen</Label>
                    <p className="text-sm text-muted-foreground">Zugriff nach Abteilung begrenzen</p>
                  </div>
                  <Switch 
                    checked={formState.department_restrictions}
                    onCheckedChange={(checked) => updateFormState('department_restrictions', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Einstellungen speichern
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
