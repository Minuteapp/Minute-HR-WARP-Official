
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Brain, Sparkles, ListChecks, MessageSquare, Loader2, Bot } from "lucide-react";

const AI_FEATURES = [
  {
    id: 'ai_summarization_enabled',
    title: 'KI-Zusammenfassung',
    description: 'Automatische Zusammenfassung mehrerer Benachrichtigungen',
    icon: ListChecks
  },
  {
    id: 'ai_prioritization_enabled',
    title: 'KI-Priorisierung',
    description: 'Intelligente Sortierung nach Relevanz',
    icon: Sparkles
  },
  {
    id: 'ai_response_suggestions',
    title: 'Antwortvorschläge',
    description: 'KI-generierte Antwortvorschläge',
    icon: MessageSquare
  },
  {
    id: 'ai_context_hints',
    title: 'Kontext-Hinweise',
    description: 'Kontextbezogene Informationen im Chatbot',
    icon: Bot
  },
  {
    id: 'chatbot_integration',
    title: 'Chatbot-Integration',
    description: 'Benachrichtigungen über den HR-Chatbot',
    icon: Brain
  }
];

const PRIORITIZATION_MODELS = [
  { id: 'relevance', name: 'Nach Relevanz', description: 'Basierend auf Benutzeraktivität und Präferenzen' },
  { id: 'urgency', name: 'Nach Dringlichkeit', description: 'Basierend auf Fristen und Prioritäten' },
  { id: 'role_based', name: 'Rollenbasiert', description: 'Basierend auf der Rolle des Empfängers' },
  { id: 'hybrid', name: 'Hybrid', description: 'Kombination aller Faktoren' }
];

export default function AiAssistanceTab() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-ai-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_ai_settings')
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data || {
        ai_summarization_enabled: false,
        ai_prioritization_enabled: false,
        ai_response_suggestions: false,
        ai_context_hints: false,
        max_summary_items: 10,
        prioritization_model: 'relevance',
        chatbot_integration: false
      };
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const { data: existing } = await supabase
        .from('notification_ai_settings')
        .select('id')
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('notification_ai_settings')
          .update(newSettings)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_ai_settings')
          .insert(newSettings);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-ai-settings'] });
      toast.success('KI-Einstellungen gespeichert');
    },
    onError: () => {
      toast.error('Fehler beim Speichern');
    }
  });

  const handleToggle = (field: string, value: boolean) => {
    saveMutation.mutate({ ...settings, [field]: value });
  };

  const handleChange = (field: string, value: any) => {
    saveMutation.mutate({ ...settings, [field]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const enabledCount = AI_FEATURES.filter(f => settings?.[f.id as keyof typeof settings]).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>KI-Unterstützung</CardTitle>
                <CardDescription>
                  Intelligente Benachrichtigungsoptimierung durch KI
                </CardDescription>
              </div>
            </div>
            <Badge variant={enabledCount > 0 ? 'default' : 'secondary'}>
              {enabledCount} / {AI_FEATURES.length} aktiv
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {AI_FEATURES.map((feature) => {
              const Icon = feature.icon;
              const isEnabled = settings?.[feature.id as keyof typeof settings] as boolean;

              return (
                <Card key={feature.id} className={isEnabled ? 'border-primary/50 bg-primary/5' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${isEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleToggle(feature.id, checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Zusammenfassungs-Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Maximale Items pro Zusammenfassung</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={settings?.max_summary_items || 10}
                onChange={(e) => handleChange('max_summary_items', parseInt(e.target.value) || 10)}
                disabled={!settings?.ai_summarization_enabled}
              />
              <p className="text-xs text-muted-foreground">
                Anzahl der Benachrichtigungen, die in einer Zusammenfassung zusammengefasst werden
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priorisierungs-Modell</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Modell</Label>
              <Select
                value={settings?.prioritization_model || 'relevance'}
                onValueChange={(value) => handleChange('prioritization_model', value)}
                disabled={!settings?.ai_prioritization_enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIZATION_MODELS.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div>
                        <p>{model.name}</p>
                        <p className="text-xs text-muted-foreground">{model.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hinweise zur KI-Nutzung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Datenschutz</h5>
              <p className="text-muted-foreground">
                Alle KI-Verarbeitungen erfolgen DSGVO-konform. Persönliche Daten werden anonymisiert.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Transparenz</h5>
              <p className="text-muted-foreground">
                KI-generierte Inhalte werden entsprechend gekennzeichnet.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Kontrolle</h5>
              <p className="text-muted-foreground">
                Benutzer können KI-Funktionen jederzeit deaktivieren.
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Kosten</h5>
              <p className="text-muted-foreground">
                KI-Funktionen werden über Ihr KI-Kontingent abgerechnet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
