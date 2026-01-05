import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Lightbulb, AlertCircle, Clock, FileText, DollarSign, Users } from 'lucide-react';

const examplePrompts = [
  {
    icon: AlertCircle,
    title: 'Krankmeldung ohne AU',
    description: 'Wenn ein Mitarbeiter sich krank meldet aber kein AU hochlädt, nach 3 Tagen automatisch erinnern.',
  },
  {
    icon: DollarSign,
    title: 'Spesen > 500€',
    description: 'Bei Spesenanträgen über 500€ automatisch Manager und Finanzabteilung benachrichtigen.',
  },
  {
    icon: Users,
    title: 'Schicht-Backfill',
    description: 'Wenn eine Schicht unbesetzt ist, automatisch verfügbare Mitarbeiter per Push benachrichtigen.',
  },
  {
    icon: Clock,
    title: 'Payroll Cutoff',
    description: 'Am 25. jeden Monats alle offenen Zeitbuchungen prüfen und Manager zur Freigabe auffordern.',
  },
];

export const NaturalLanguageWorkflow = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    // TODO: Implement AI workflow generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const handleExampleClick = (description: string) => {
    setPrompt(description);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Input */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">KI Workflow-Generator</CardTitle>
                <CardDescription>
                  Beschreibe den gewünschten Prozess in natürlicher Sprache
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Beschreibe deinen gewünschten Workflow..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[200px] resize-none"
            />
            <Button 
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full bg-primary text-primary-foreground"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generiere Workflow...' : 'Workflow generieren'}
            </Button>
          </CardContent>
        </Card>

        {/* Tip Box */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Tipp</p>
                <p className="text-sm text-muted-foreground">
                  Je detaillierter Ihre Beschreibung, desto präziser kann der Workflow generiert werden. 
                  Beschreiben Sie Trigger, Bedingungen und gewünschte Aktionen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Example Prompts */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Beispiel-Prompts</CardTitle>
            <CardDescription className="text-xs">
              Klicken Sie auf ein Beispiel, um es zu verwenden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {examplePrompts.map((example) => (
              <div
                key={example.title}
                onClick={() => handleExampleClick(example.description)}
                className="p-3 rounded-lg border bg-background hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <example.icon className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm text-foreground">{example.title}</span>
                </div>
                <p className="text-xs text-muted-foreground">{example.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
