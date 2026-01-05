import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Eye, Save, Send, Sparkles, X, Tag, Loader2 } from 'lucide-react';
import { useKnowledgeArticles } from '@/hooks/useKnowledgeArticles';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CATEGORIES = [
  'Personal & HR',
  'Finanzen',
  'IT & Tools',
  'Prozesse & Workflows',
  'Compliance & Datenschutz',
  'Onboarding',
  'Projekte',
  'Kommunikation',
  'ESG',
];

const SUGGESTED_TAGS = ['Urlaub', 'Antrag', 'Workflow', 'HR-Prozess'];

export const ArticleEditor = () => {
  const navigate = useNavigate();
  const { createArticle, submitForApproval, isCreating } = useKnowledgeArticles();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [aiAssistant, setAiAssistant] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [visibility, setVisibility] = useState('all');
  const [language, setLanguage] = useState('de');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleGenerateWithAI = async () => {
    if (!title.trim()) {
      toast.error('Bitte geben Sie zuerst einen Titel ein');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-hub-chat', {
        body: {
          mode: 'generateContent',
          title: title.trim(),
          category: category || undefined,
          keywords: content.trim() || undefined, // Verwende existierenden Inhalt als Stichpunkte
        },
      });

      if (error) {
        console.error('Error generating content:', error);
        toast.error('Fehler bei der KI-Generierung');
        return;
      }

      if (data?.content) {
        setContent(data.content);
        toast.success('Inhalt wurde mit KI generiert');
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error calling AI:', error);
      toast.error('Fehler bei der Verbindung zur KI');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await createArticle({
        title,
        category,
        content,
        tags,
        status: 'draft',
        language,
        visibility: visibility === 'all' ? 'internal' : visibility,
        ai_assistant_enabled: aiAssistant,
        auto_translate_enabled: autoTranslate,
      });
      navigate('/knowledge-hub');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  const handlePublishNow = async () => {
    try {
      await createArticle({
        title,
        category,
        content,
        tags,
        status: 'published',
        language,
        visibility: visibility === 'all' ? 'internal' : visibility,
        ai_assistant_enabled: aiAssistant,
        auto_translate_enabled: autoTranslate,
      });
      navigate('/knowledge-hub');
    } catch (error) {
      console.error('Fehler beim Veröffentlichen:', error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Zurück Button Card */}
        <Card>
          <CardContent className="p-4 flex justify-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/knowledge-hub')}
              className="text-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          </CardContent>
        </Card>

        {/* Titel & Kategorie Card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Neuen Artikel erstellen</h2>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Vorschau
              </Button>
            </div>
            
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                placeholder="z.B. Urlaubsantrag stellen - Kompletter Leitfaden"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Kategorie *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags mit Icon */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Input
                    placeholder="Tag hinzufügen"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(newTag);
                      }
                    }}
                    className="pr-10"
                  />
                  <Tag className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleAddTag(newTag)}
                >
                  Hinzufügen
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTag(tag)}
                    className="text-xs"
                  >
                    + {tag}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inhalt Card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Inhalt *</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateWithAI}
                disabled={isGenerating || !title.trim()}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {isGenerating ? 'Generiere...' : 'Mit KI generieren'}
              </Button>
            </div>
            <Textarea
              id="content"
              placeholder="Schreiben Sie Ihren Artikel hier oder nutzen Sie 'Mit KI generieren'. Sie können auch Stichpunkte eingeben, die die KI als Basis verwendet..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground">
              Tipp: Geben Sie einen Titel ein und klicken Sie auf "Mit KI generieren" für automatische Inhaltserstellung. Optional: Stichpunkte im Textfeld werden berücksichtigt.
            </p>
          </CardContent>
        </Card>

        {/* Einstellungen Card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Einstellungen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="ai-assistant">KI-Assistent</Label>
                  <p className="text-xs text-muted-foreground">
                    Vorschläge während des Schreibens
                  </p>
                </div>
                <Switch
                  id="ai-assistant"
                  checked={aiAssistant}
                  onCheckedChange={setAiAssistant}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="auto-translate">Auto-Übersetzung</Label>
                  <p className="text-xs text-muted-foreground">
                    In alle Sprachen übersetzen
                  </p>
                </div>
                <Switch
                  id="auto-translate"
                  checked={autoTranslate}
                  onCheckedChange={setAutoTranslate}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visibility">Sichtbarkeit</Label>
                <Select value={visibility} onValueChange={setVisibility}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                    <SelectItem value="department">Nur meine Abteilung</SelectItem>
                    <SelectItem value="team">Nur mein Team</SelectItem>
                    <SelectItem value="restricted">Eingeschränkt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Sprache</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="it">Italiano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aktionen Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isCreating}
              >
                <Save className="h-4 w-4 mr-2" />
                Als Entwurf speichern
              </Button>
              <Button
                onClick={handlePublishNow}
                disabled={isCreating || !title || !category || !content}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Sofort veröffentlichen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};