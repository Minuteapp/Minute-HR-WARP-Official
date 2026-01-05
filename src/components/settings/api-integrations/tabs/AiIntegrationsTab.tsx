import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Eye,
  EyeOff,
  AlertTriangle,
  Coins,
  Zap,
  FileText,
  TrendingUp,
  Settings
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface AiProviderSettings {
  id: string;
  company_id: string;
  provider: string;
  api_key: string;
  model: string;
  modules_enabled: string[];
  monthly_token_limit: number;
  monthly_cost_limit: number;
  current_month_usage: number;
  current_month_cost: number;
  explainability_required: boolean;
  is_active: boolean;
}

const AI_PROVIDERS = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    description: 'GPT-4, GPT-3.5, DALL-E',
    logo: '🤖',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  { 
    id: 'azure_openai', 
    name: 'Azure OpenAI', 
    description: 'Enterprise OpenAI via Azure',
    logo: '☁️',
    models: ['gpt-4', 'gpt-35-turbo']
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    description: 'Claude AI',
    logo: '🧠',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
  },
  { 
    id: 'custom', 
    name: 'Eigener Provider', 
    description: 'Self-hosted oder andere APIs',
    logo: '🔧',
    models: ['custom']
  }
];

const AI_MODULES = [
  { id: 'chatbot', label: 'HR Chatbot', description: 'KI-gestützter Support' },
  { id: 'document_analysis', label: 'Dokumentenanalyse', description: 'OCR und Extraktion' },
  { id: 'absence_suggestions', label: 'Abwesenheits-KI', description: 'Intelligente Vorschläge' },
  { id: 'time_anomaly', label: 'Zeiterfassungs-Anomalien', description: 'Erkennung von Mustern' },
  { id: 'recruiting', label: 'Recruiting KI', description: 'CV-Analyse & Matching' },
  { id: 'performance', label: 'Performance Insights', description: 'Leistungsanalyse' },
  { id: 'compliance', label: 'Compliance Check', description: 'Automatische Prüfungen' },
  { id: 'forecasting', label: 'Prognosen', description: 'Personalplanung & Trends' }
];

export function AiIntegrationsTab() {
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [showApiKey, setShowApiKey] = useState(false);

  const { data: providers, isLoading } = useQuery({
    queryKey: ['ai-provider-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_provider_settings')
        .select('*');
      
      if (error) throw error;
      return data as AiProviderSettings[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (settings: Partial<AiProviderSettings>) => {
      const existing = providers?.find(p => p.provider === settings.provider);
      
      if (existing) {
        const { error } = await supabase
          .from('ai_provider_settings')
          .update(settings)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_provider_settings')
          .insert(settings);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-provider-settings'] });
      toast.success("KI-Einstellungen gespeichert");
    },
    onError: () => {
      toast.error("Fehler beim Speichern");
    }
  });

  const getCurrentSettings = (): Partial<AiProviderSettings> => {
    return providers?.find(p => p.provider === selectedProvider) || {
      provider: selectedProvider,
      model: AI_PROVIDERS.find(p => p.id === selectedProvider)?.models[0] || '',
      modules_enabled: [],
      monthly_token_limit: 1000000,
      monthly_cost_limit: 100,
      current_month_usage: 0,
      current_month_cost: 0,
      explainability_required: true,
      is_active: false
    };
  };

  const settings = getCurrentSettings();

  const updateSettings = (updates: Partial<AiProviderSettings>) => {
    saveMutation.mutate({ ...settings, ...updates, provider: selectedProvider });
  };

  const toggleModule = (moduleId: string) => {
    const modules = settings.modules_enabled as string[] || [];
    const newModules = modules.includes(moduleId)
      ? modules.filter(m => m !== moduleId)
      : [...modules, moduleId];
    updateSettings({ modules_enabled: newModules });
  };

  const usagePercentage = settings.monthly_token_limit 
    ? ((settings.current_month_usage || 0) / settings.monthly_token_limit) * 100 
    : 0;
  
  const costPercentage = settings.monthly_cost_limit 
    ? ((settings.current_month_cost || 0) / settings.monthly_cost_limit) * 100 
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            KI-Provider
          </CardTitle>
          <CardDescription>
            Wählen und konfigurieren Sie Ihren KI-Anbieter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {AI_PROVIDERS.map((provider) => {
              const providerSettings = providers?.find(p => p.provider === provider.id);
              const isSelected = selectedProvider === provider.id;
              
              return (
                <Card 
                  key={provider.id}
                  className={`cursor-pointer transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:shadow-md'}`}
                  onClick={() => setSelectedProvider(provider.id)}
                >
                  <CardContent className="p-4 text-center">
                    <span className="text-3xl">{provider.logo}</span>
                    <h4 className="font-medium mt-2">{provider.name}</h4>
                    <p className="text-xs text-muted-foreground">{provider.description}</p>
                    {providerSettings?.is_active && (
                      <Badge variant="default" className="mt-2">Aktiv</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Provider Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Konfiguration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Provider aktiviert</Label>
              <Switch 
                checked={settings.is_active ?? false}
                onCheckedChange={(checked) => updateSettings({ is_active: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>API-Key</Label>
              <div className="flex gap-2">
                <Input 
                  type={showApiKey ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={settings.api_key || ''}
                  onChange={(e) => updateSettings({ api_key: e.target.value })}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Modell</Label>
              <Select 
                value={settings.model || ''}
                onValueChange={(value) => updateSettings({ model: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Modell wählen" />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.find(p => p.id === selectedProvider)?.models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <Label>Explainability erforderlich</Label>
                <p className="text-xs text-muted-foreground">KI-Entscheidungen müssen erklärbar sein</p>
              </div>
              <Switch 
                checked={settings.explainability_required ?? true}
                onCheckedChange={(checked) => updateSettings({ explainability_required: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Usage & Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Nutzung & Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Token-Nutzung</span>
                <span>{(settings.current_month_usage || 0).toLocaleString()} / {(settings.monthly_token_limit || 0).toLocaleString()}</span>
              </div>
              <Progress value={usagePercentage} className={usagePercentage > 80 ? '[&>div]:bg-yellow-500' : ''} />
              <div className="flex gap-2">
                <Input 
                  type="number"
                  placeholder="Token-Limit"
                  value={settings.monthly_token_limit || ''}
                  onChange={(e) => updateSettings({ monthly_token_limit: parseInt(e.target.value) })}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Kosten diesen Monat</span>
                <span>€{(settings.current_month_cost || 0).toFixed(2)} / €{(settings.monthly_cost_limit || 0).toFixed(2)}</span>
              </div>
              <Progress value={costPercentage} className={costPercentage > 80 ? '[&>div]:bg-red-500' : ''} />
              <div className="flex gap-2">
                <Input 
                  type="number"
                  placeholder="Kostenlimit (€)"
                  value={settings.monthly_cost_limit || ''}
                  onChange={(e) => updateSettings({ monthly_cost_limit: parseFloat(e.target.value) })}
                  className="text-sm"
                />
              </div>
            </div>

            {(usagePercentage > 80 || costPercentage > 80) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Sie nähern sich Ihrem monatlichen Limit.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module Activation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            KI-Module aktivieren
          </CardTitle>
          <CardDescription>
            Wählen Sie, welche Module KI nutzen dürfen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {AI_MODULES.map((module) => {
              const isEnabled = (settings.modules_enabled as string[] || []).includes(module.id);
              
              return (
                <div 
                  key={module.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${isEnabled ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground'}`}
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{module.label}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                    </div>
                    <Checkbox checked={isEnabled} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
