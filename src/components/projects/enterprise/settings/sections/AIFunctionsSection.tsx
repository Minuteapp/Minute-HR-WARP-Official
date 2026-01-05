import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import AIFeatureRow from './AIFeatureRow';

interface AIFeature {
  id: string;
  title: string;
  description: string;
  isEnabled: boolean;
}

const defaultAIFeatures: AIFeature[] = [
  {
    id: 'ai-1',
    title: 'KI-Prognosen aktivieren',
    description: 'Automatische Vorhersagen für Projektverzögerungen und Budget-Überschreitungen',
    isEnabled: true
  },
  {
    id: 'ai-2',
    title: 'Smart Recommendations',
    description: 'KI-basierte Empfehlungen für Ressourcen-Zuweisung und Risiko-Mitigation',
    isEnabled: true
  },
  {
    id: 'ai-3',
    title: 'Automatische Warnungen',
    description: 'Proaktive Benachrichtigungen bei erkannten Risiken oder Abweichungen',
    isEnabled: true
  },
  {
    id: 'ai-4',
    title: 'NLP für Dokumenten-Analyse',
    description: 'Automatische Extraktion von Key-Insights aus Projekt-Dokumenten',
    isEnabled: false
  },
  {
    id: 'ai-5',
    title: 'Sentiment-Analyse',
    description: 'Analyse von Team-Feedback und Stakeholder-Kommentaren',
    isEnabled: false
  }
];

const AIFunctionsSection = () => {
  const [features, setFeatures] = useState<AIFeature[]>(defaultAIFeatures);

  const handleToggle = (id: string, value: boolean) => {
    setFeatures(prev =>
      prev.map(feature =>
        feature.id === id ? { ...feature, isEnabled: value } : feature
      )
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          KI-Funktionen
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Konfigurieren Sie KI-gestützte Features für Projektmanagement
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          {features.map(feature => (
            <AIFeatureRow
              key={feature.id}
              title={feature.title}
              description={feature.description}
              isEnabled={feature.isEnabled}
              onToggleChange={(value) => handleToggle(feature.id, value)}
            />
          ))}
        </div>
        <Button className="w-full">
          KI-Modell konfigurieren
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIFunctionsSection;
