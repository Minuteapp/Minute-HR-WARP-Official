
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, Tag, Sparkles, FileType, Plus, Trash2 } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { useToast } from "@/hooks/use-toast";

interface CategoryFormState {
  // Kategorie-Einstellungen
  categories_enabled: boolean;
  require_category_on_upload: boolean;
  allow_multiple_categories: boolean;
  category_hierarchy_enabled: boolean;
  max_hierarchy_depth: number;
  
  // Standard-Kategorien
  use_default_categories: boolean;
  custom_categories_allowed: boolean;
  
  // KI-Klassifizierung
  ai_classification_enabled: boolean;
  ai_confidence_threshold: number;
  auto_apply_ai_category: boolean;
  suggest_category_on_upload: boolean;
  
  // Tags
  tags_enabled: boolean;
  require_tags_on_upload: boolean;
  min_tags_required: number;
  max_tags_allowed: number;
  predefined_tags_only: boolean;
  ai_tag_suggestions: boolean;
  
  // Metadaten
  custom_metadata_enabled: boolean;
  require_description: boolean;
  require_document_date: boolean;
  require_expiry_date: boolean;
  
  // Dokumenttypen
  document_types_enabled: boolean;
  restrict_file_types: boolean;
  
  // Farben & Icons
  category_colors_enabled: boolean;
  category_icons_enabled: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  parent_id?: string;
}

const DocumentCategorySettings = () => {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  const { toast } = useToast();
  
  const [formState, setFormState] = useState<CategoryFormState>({
    categories_enabled: true,
    require_category_on_upload: true,
    allow_multiple_categories: false,
    category_hierarchy_enabled: true,
    max_hierarchy_depth: 3,
    use_default_categories: true,
    custom_categories_allowed: true,
    ai_classification_enabled: true,
    ai_confidence_threshold: 80,
    auto_apply_ai_category: false,
    suggest_category_on_upload: true,
    tags_enabled: true,
    require_tags_on_upload: false,
    min_tags_required: 0,
    max_tags_allowed: 10,
    predefined_tags_only: false,
    ai_tag_suggestions: true,
    custom_metadata_enabled: true,
    require_description: false,
    require_document_date: true,
    require_expiry_date: false,
    document_types_enabled: true,
    restrict_file_types: false,
    category_colors_enabled: true,
    category_icons_enabled: true,
  });

  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Verträge', description: 'Arbeitsverträge und Vereinbarungen', color: '#3B82F6' },
    { id: '2', name: 'Gehaltsabrechnungen', description: 'Monatliche Lohnabrechnungen', color: '#10B981' },
    { id: '3', name: 'Zertifikate', description: 'Zeugnisse und Zertifikate', color: '#F59E0B' },
    { id: '4', name: 'Krankmeldungen', description: 'Arbeitsunfähigkeitsbescheinigungen', color: '#EF4444' },
    { id: '5', name: 'Bewerbungen', description: 'Bewerbungsunterlagen', color: '#8B5CF6' },
  ]);

  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: '#6B7280' });

  useEffect(() => {
    if (settings) {
      setFormState(prev => ({
        ...prev,
        categories_enabled: getValue('categories_enabled', true) as boolean,
        require_category_on_upload: getValue('require_category_on_upload', true) as boolean,
        allow_multiple_categories: getValue('allow_multiple_categories', false) as boolean,
        category_hierarchy_enabled: getValue('category_hierarchy_enabled', true) as boolean,
        max_hierarchy_depth: getValue('max_hierarchy_depth', 3) as number,
        use_default_categories: getValue('use_default_categories', true) as boolean,
        custom_categories_allowed: getValue('custom_categories_allowed', true) as boolean,
        ai_classification_enabled: getValue('ai_classification_enabled', true) as boolean,
        ai_confidence_threshold: getValue('ai_confidence_threshold', 80) as number,
        auto_apply_ai_category: getValue('auto_apply_ai_category', false) as boolean,
        suggest_category_on_upload: getValue('suggest_category_on_upload', true) as boolean,
        tags_enabled: getValue('tags_enabled', true) as boolean,
        require_tags_on_upload: getValue('require_tags_on_upload', false) as boolean,
        min_tags_required: getValue('min_tags_required', 0) as number,
        max_tags_allowed: getValue('max_tags_allowed', 10) as number,
        predefined_tags_only: getValue('predefined_tags_only', false) as boolean,
        ai_tag_suggestions: getValue('ai_tag_suggestions', true) as boolean,
        custom_metadata_enabled: getValue('custom_metadata_enabled', true) as boolean,
        require_description: getValue('require_description', false) as boolean,
        require_document_date: getValue('require_document_date', true) as boolean,
        require_expiry_date: getValue('require_expiry_date', false) as boolean,
        document_types_enabled: getValue('document_types_enabled', true) as boolean,
        restrict_file_types: getValue('restrict_file_types', false) as boolean,
        category_colors_enabled: getValue('category_colors_enabled', true) as boolean,
        category_icons_enabled: getValue('category_icons_enabled', true) as boolean,
      }));
      
      const savedCategories = getValue('document_categories', null);
      if (savedCategories && Array.isArray(savedCategories)) {
        setCategories(savedCategories as Category[]);
      }
    }
  }, [settings]);

  const handleSave = async () => {
    await saveSettings({ ...formState, document_categories: categories });
    toast({ title: "Kategorie-Einstellungen gespeichert" });
  };

  const updateField = <K extends keyof CategoryFormState>(field: K, value: CategoryFormState[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const addCategory = () => {
    if (newCategory.name.trim()) {
      setCategories([...categories, { 
        id: Date.now().toString(), 
        ...newCategory 
      }]);
      setNewCategory({ name: '', description: '', color: '#6B7280' });
    }
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Kategorie-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Kategorien
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Kategorien aktivieren</Label>
            <Switch checked={formState.categories_enabled} onCheckedChange={(v) => updateField('categories_enabled', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Kategorie beim Upload erforderlich</Label>
              <Switch checked={formState.require_category_on_upload} onCheckedChange={(v) => updateField('require_category_on_upload', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Mehrere Kategorien erlauben</Label>
              <Switch checked={formState.allow_multiple_categories} onCheckedChange={(v) => updateField('allow_multiple_categories', v)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Hierarchische Kategorien</Label>
              <Switch checked={formState.category_hierarchy_enabled} onCheckedChange={(v) => updateField('category_hierarchy_enabled', v)} />
            </div>
            {formState.category_hierarchy_enabled && (
              <div className="space-y-2">
                <Label>Max. Hierarchie-Tiefe</Label>
                <Input type="number" value={formState.max_hierarchy_depth} onChange={(e) => updateField('max_hierarchy_depth', parseInt(e.target.value) || 3)} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Standard-Kategorien verwenden</Label>
              <Switch checked={formState.use_default_categories} onCheckedChange={(v) => updateField('use_default_categories', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Eigene Kategorien erlauben</Label>
              <Switch checked={formState.custom_categories_allowed} onCheckedChange={(v) => updateField('custom_categories_allowed', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kategorien verwalten */}
      <Card>
        <CardHeader>
          <CardTitle>Kategorien verwalten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }} />
                <div className="flex-1">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-muted-foreground">{category.description}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeCategory(category.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-2">
              <Label>Neue Kategorie</Label>
              <Input 
                value={newCategory.name} 
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} 
                placeholder="Kategorie-Name" 
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Beschreibung</Label>
              <Input 
                value={newCategory.description} 
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} 
                placeholder="Beschreibung" 
              />
            </div>
            <div className="space-y-2">
              <Label>Farbe</Label>
              <Input 
                type="color" 
                value={newCategory.color} 
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })} 
                className="w-16 h-10"
              />
            </div>
            <Button onClick={addCategory}>
              <Plus className="h-4 w-4 mr-1" />
              Hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KI-Klassifizierung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            KI-Klassifizierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>KI-Klassifizierung aktivieren</Label>
            <Switch checked={formState.ai_classification_enabled} onCheckedChange={(v) => updateField('ai_classification_enabled', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mindest-Konfidenz (%)</Label>
              <Input type="number" value={formState.ai_confidence_threshold} onChange={(e) => updateField('ai_confidence_threshold', parseInt(e.target.value) || 80)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Kategorie automatisch anwenden</Label>
              <Switch checked={formState.auto_apply_ai_category} onCheckedChange={(v) => updateField('auto_apply_ai_category', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Vorschlag beim Upload</Label>
              <Switch checked={formState.suggest_category_on_upload} onCheckedChange={(v) => updateField('suggest_category_on_upload', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Tags aktivieren</Label>
            <Switch checked={formState.tags_enabled} onCheckedChange={(v) => updateField('tags_enabled', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Tags beim Upload erforderlich</Label>
              <Switch checked={formState.require_tags_on_upload} onCheckedChange={(v) => updateField('require_tags_on_upload', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Nur vordefinierte Tags</Label>
              <Switch checked={formState.predefined_tags_only} onCheckedChange={(v) => updateField('predefined_tags_only', v)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min. Tags erforderlich</Label>
              <Input type="number" value={formState.min_tags_required} onChange={(e) => updateField('min_tags_required', parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Max. Tags erlaubt</Label>
              <Input type="number" value={formState.max_tags_allowed} onChange={(e) => updateField('max_tags_allowed', parseInt(e.target.value) || 10)} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label>KI-Tag-Vorschläge</Label>
            <Switch checked={formState.ai_tag_suggestions} onCheckedChange={(v) => updateField('ai_tag_suggestions', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Metadaten */}
      <Card>
        <CardHeader>
          <CardTitle>Pflichtfelder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Eigene Metadaten aktivieren</Label>
            <Switch checked={formState.custom_metadata_enabled} onCheckedChange={(v) => updateField('custom_metadata_enabled', v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Beschreibung erforderlich</Label>
              <Switch checked={formState.require_description} onCheckedChange={(v) => updateField('require_description', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Dokumentdatum erforderlich</Label>
              <Switch checked={formState.require_document_date} onCheckedChange={(v) => updateField('require_document_date', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Ablaufdatum erforderlich</Label>
              <Switch checked={formState.require_expiry_date} onCheckedChange={(v) => updateField('require_expiry_date', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dokumenttypen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileType className="h-5 w-5" />
            Dokumenttypen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Dokumenttypen aktivieren</Label>
            <Switch checked={formState.document_types_enabled} onCheckedChange={(v) => updateField('document_types_enabled', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Dateitypen einschränken</Label>
            <Switch checked={formState.restrict_file_types} onCheckedChange={(v) => updateField('restrict_file_types', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Darstellung */}
      <Card>
        <CardHeader>
          <CardTitle>Darstellung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Kategorie-Farben anzeigen</Label>
              <Switch checked={formState.category_colors_enabled} onCheckedChange={(v) => updateField('category_colors_enabled', v)} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Kategorie-Icons anzeigen</Label>
              <Switch checked={formState.category_icons_enabled} onCheckedChange={(v) => updateField('category_icons_enabled', v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Speichern..." : "Einstellungen speichern"}
        </Button>
      </div>
    </div>
  );
};

export default DocumentCategorySettings;
