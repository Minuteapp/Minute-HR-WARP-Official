import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Star,
  Zap,
  Target,
  BarChart3,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { IdeaData } from './IdeaVisualization';

interface AIAnalysis {
  overallScore: number;
  feasibilityScore: number;
  costScore: number;
  innovationScore: number;
  riskScore: number;
  roiPotential: number;
  implementationTime: number;
  requiredResources: string[];
  advantages: string[];
  disadvantages: string[];
  recommendations: string[];
  marketPotential: 'low' | 'medium' | 'high';
  technicalComplexity: 'low' | 'medium' | 'high';
  competitiveAdvantage: 'low' | 'medium' | 'high';
  confidence: number;
  analysisComplete: boolean;
}

interface AIAnalysisSystemProps {
  idea: IdeaData;
  onAnalysisComplete: (analysis: AIAnalysis) => void;
}

const AIAnalysisSystem: React.FC<AIAnalysisSystemProps> = ({ idea, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simuliere KI-Analyse
  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);

    // Simuliere schrittweise Analyse
    const steps = [
      { name: 'Machbarkeitsanalyse', duration: 1000 },
      { name: 'Kostenanalyse', duration: 1200 },
      { name: 'Marktpotenzial-Bewertung', duration: 800 },
      { name: 'Risikobewertung', duration: 1000 },
      { name: 'ROI-Berechnung', duration: 900 },
      { name: 'Empfehlungen generieren', duration: 700 }
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, steps[i].duration));
      setProgress((i + 1) / steps.length * 100);
    }

    // Generiere KI-Analyse basierend auf Idee
    const aiAnalysis: AIAnalysis = generateAIAnalysis(idea);
    setAnalysis(aiAnalysis);
    setIsAnalyzing(false);
    onAnalysisComplete(aiAnalysis);
  };

  const generateAIAnalysis = (idea: IdeaData): AIAnalysis => {
    // Simuliere intelligente Analyse basierend auf Titel und Beschreibung
    const containsAI = idea.title.toLowerCase().includes('ki') || 
                      idea.description.toLowerCase().includes('künstlich') ||
                      idea.description.toLowerCase().includes('automatisier');
    
    const containsTech = idea.tags.some(tag => 
      ['technologie', 'digital', 'app', 'software'].includes(tag.toLowerCase())
    );

    const baseScore = 60 + Math.random() * 30;
    const techBonus = containsTech ? 10 : 0;
    const aiBonus = containsAI ? 15 : 0;

    return {
      overallScore: Math.min(95, baseScore + techBonus + aiBonus),
      feasibilityScore: 70 + Math.random() * 25,
      costScore: 65 + Math.random() * 30,
      innovationScore: containsAI ? 85 + Math.random() * 10 : 60 + Math.random() * 25,
      riskScore: 40 + Math.random() * 30,
      roiPotential: idea.roiPotential || 25000 + Math.random() * 75000,
      implementationTime: containsTech ? 6 + Math.random() * 12 : 3 + Math.random() * 9,
      requiredResources: [
        containsTech ? 'Entwicklungsteam' : 'Projektteam',
        'Budget für Implementierung',
        containsAI ? 'KI-Expertise' : 'Fachberatung',
        'Change Management'
      ],
      advantages: [
        'Erhöht die Effizienz der Mitarbeiter',
        'Reduziert manuelle Prozesse',
        containsAI ? 'Nutzt modernste Technologie' : 'Bewährte Lösungsansätze',
        'Verbessert Kundenerfahrung',
        'Skalierbare Lösung'
      ],
      disadvantages: [
        'Erfordert initiale Investition',
        'Schulungsaufwand für Mitarbeiter',
        containsTech ? 'Technische Komplexität' : 'Organisatorische Herausforderungen',
        'Mögliche Widerständen bei Veränderungen'
      ],
      recommendations: [
        'Pilotprojekt mit kleinem Team starten',
        'Schrittweise Implementierung planen',
        'Frühzeitige Einbindung der Stakeholder',
        containsAI ? 'KI-Expertise extern einkaufen' : 'Interne Ressourcen nutzen',
        'Kontinuierliche Erfolgsmessung etablieren'
      ],
      marketPotential: containsAI ? 'high' : Math.random() > 0.5 ? 'medium' : 'high',
      technicalComplexity: containsTech ? 'high' : Math.random() > 0.6 ? 'medium' : 'low',
      competitiveAdvantage: containsAI ? 'high' : Math.random() > 0.4 ? 'medium' : 'high',
      confidence: 85 + Math.random() * 10,
      analysisComplete: true
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPotentialColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-800">
          <Brain className="h-5 w-5" />
          KI-Bewertungssystem
          <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
            <Sparkles className="h-3 w-3 mr-1" />
            GPT-4.1 Analyse
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!analysis && !isAnalyzing && (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Intelligente Ideenbewertung
            </h3>
            <p className="text-gray-600 mb-4">
              Nutzen Sie KI-Power für eine umfassende Analyse von Machbarkeit, Kosten und Potenzial
            </p>
            <Button 
              onClick={startAnalysis}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              KI-Analyse starten
            </Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-purple-700 mb-4">
                <Brain className="h-6 w-6 animate-pulse" />
                <span className="font-semibold">KI analysiert Ihre Idee...</span>
              </div>
              <Progress value={progress} className="w-full h-3" />
              <p className="text-sm text-gray-600 mt-2">{Math.round(progress)}% abgeschlossen</p>
            </div>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Gesamtbewertung */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBg(analysis.overallScore)} mb-4`}>
                <span className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                  {Math.round(analysis.overallScore)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Gesamtbewertung</h3>
              <p className="text-sm text-gray-600">Basierend auf KI-Analyse aller Faktoren</p>
            </div>

            {/* Detailbewertungen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Machbarkeit</span>
                  </div>
                  <span className={`font-semibold ${getScoreColor(analysis.feasibilityScore)}`}>
                    {Math.round(analysis.feasibilityScore)}%
                  </span>
                </div>
                <Progress value={analysis.feasibilityScore} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Kosten-Nutzen</span>
                  </div>
                  <span className={`font-semibold ${getScoreColor(analysis.costScore)}`}>
                    {Math.round(analysis.costScore)}%
                  </span>
                </div>
                <Progress value={analysis.costScore} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Innovation</span>
                  </div>
                  <span className={`font-semibold ${getScoreColor(analysis.innovationScore)}`}>
                    {Math.round(analysis.innovationScore)}%
                  </span>
                </div>
                <Progress value={analysis.innovationScore} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Risiko</span>
                  </div>
                  <span className={`font-semibold ${getScoreColor(100 - analysis.riskScore)}`}>
                    {Math.round(analysis.riskScore)}%
                  </span>
                </div>
                <Progress value={analysis.riskScore} className="h-2" />
              </div>
            </div>

            <Separator />

            {/* Schlüsselmetriken */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">ROI-Potenzial</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  €{analysis.roiPotential.toLocaleString()}
                </span>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Umsetzungszeit</span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {Math.round(analysis.implementationTime)} Monate
                </span>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">KI-Vertrauen</span>
                </div>
                <span className="text-xl font-bold text-purple-600">
                  {Math.round(analysis.confidence)}%
                </span>
              </div>
            </div>

            {/* Bewertungsdetails */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Marktpotenzial</span>
                <Badge className={getPotentialColor(analysis.marketPotential)}>
                  {analysis.marketPotential === 'high' ? 'Hoch' : 
                   analysis.marketPotential === 'medium' ? 'Mittel' : 'Niedrig'}
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Technische Komplexität</span>
                <Badge className={getComplexityColor(analysis.technicalComplexity)}>
                  {analysis.technicalComplexity === 'high' ? 'Hoch' : 
                   analysis.technicalComplexity === 'medium' ? 'Mittel' : 'Niedrig'}
                </Badge>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Wettbewerbsvorteil</span>
                <Badge className={getPotentialColor(analysis.competitiveAdvantage)}>
                  {analysis.competitiveAdvantage === 'high' ? 'Hoch' : 
                   analysis.competitiveAdvantage === 'medium' ? 'Mittel' : 'Niedrig'}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Vorteile und Nachteile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Vorteile
                </h4>
                <ul className="space-y-2">
                  {analysis.advantages.map((advantage, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Star className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                      {advantage}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Herausforderungen
                </h4>
                <ul className="space-y-2">
                  {analysis.disadvantages.map((disadvantage, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-3 w-3 text-red-600 mt-1 flex-shrink-0" />
                      {disadvantage}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* KI-Empfehlungen */}
            <div>
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                KI-Empfehlungen
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Target className="h-3 w-3 text-purple-600 mt-1 flex-shrink-0" />
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>

            {/* Benötigte Ressourcen */}
            <div>
              <h4 className="font-semibold text-blue-800 mb-3">Benötigte Ressourcen</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.requiredResources.map((resource, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {resource}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAnalysisSystem;