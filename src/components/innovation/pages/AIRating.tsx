import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, ThumbsDown, Download, Clock, DollarSign, Target, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export const AIRating: React.FC = () => {
  const [selectedIdea, setSelectedIdea] = useState(0);

  const ideas = [
    {
      id: 1,
      title: 'KI-gestützte Kundenbetreuung',
      author: 'Sarah Chen',
      category: 'KI & Technologie',
      description: 'Implementierung eines intelligenten Chatbots für 24/7 Kundenservice',
      overallScore: 85,
      criteria: {
        feasibility: 75,
        relevance: 90,
        impact: 80,
        cost: 60,
        timeline: 70
      },
      pros: [
        '24/7 Verfügbarkeit',
        'Kosteneinsparung bei Personalkosten',
        'Schnelle Antwortzeiten',
        'Skalierbarkeit'
      ],
      cons: [
        'Hohe Anfangsinvestition',
        'Datenschutzrisiken',
        'Mögliche Kundenunzufriedenheit',
        'Komplexe Integration'
      ],
      recommendations: [
        'Pilotprojekt mit ausgewählten Kunden starten',
        'Datenschutzkonzept entwickeln',
        'Schrittweise Einführung planen'
      ]
    },
    {
      id: 2,
      title: 'Nachhaltiges Bürokonzept',
      author: 'Max Müller',
      category: 'Nachhaltigkeit',
      description: 'Umstellung auf papierlose Büros und erneuerbare Energien',
      overallScore: 92,
      criteria: {
        feasibility: 85,
        relevance: 95,
        impact: 90,
        cost: 80,
        timeline: 85
      },
      pros: [
        'Positive Umweltwirkung',
        'Langfristige Kosteneinsparung',
        'Verbessertes Unternehmensimage',
        'Erhöhte Mitarbeiterzufriedenheit'
      ],
      cons: [
        'Initialkosten für Umstellung',
        'Gewöhnungszeit für Mitarbeiter',
        'Technische Herausforderungen'
      ],
      recommendations: [
        'Schrittweise Umsetzung',
        'Mitarbeiterschulungen durchführen',
        'ROI-Berechnung erstellen'
      ]
    }
  ];

  const currentIdea = ideas[selectedIdea];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          KI-Bewertung von Ideen
        </h1>
        <p className="text-white/70 text-lg">
          Lass deine Ideen von unserer KI analysieren und bewerten.
        </p>
      </motion.div>

      {/* Idea Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-4 overflow-x-auto pb-2"
      >
        {ideas.map((idea, index) => (
          <Card
            key={idea.id}
            className={`min-w-72 cursor-pointer transition-all duration-300 ${
              selectedIdea === index
                ? 'bg-gradient-to-r from-[hsl(var(--innovation-neon-turquoise))]/20 to-[hsl(var(--innovation-dark-blue))]/20 border-[hsl(var(--innovation-neon-turquoise))]/50'
                : 'bg-white/10 border-white/20 hover:bg-white/15'
            } backdrop-blur-sm`}
            onClick={() => setSelectedIdea(index)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="bg-white/10 text-white">
                  {idea.category}
                </Badge>
                <div className={`flex items-center gap-1 ${getScoreColor(idea.overallScore)}`}>
                  <Star className="w-4 h-4" />
                  <span className="font-bold">{idea.overallScore}</span>
                </div>
              </div>
              <h3 className="text-white font-medium mb-1">{idea.title}</h3>
              <p className="text-white/60 text-sm">{idea.author}</p>
            </div>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <div className="p-6 text-center">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold mb-4 ${getScoreBackground(currentIdea.overallScore)} ${getScoreColor(currentIdea.overallScore)}`}>
                {currentIdea.overallScore}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Gesamtbewertung</h3>
              <p className="text-white/70 text-sm">
                {currentIdea.overallScore >= 80 ? 'Exzellente Idee' :
                 currentIdea.overallScore >= 60 ? 'Gute Idee' : 'Verbesserungsbedarf'}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Criteria Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Bewertungskriterien</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(currentIdea.criteria).map(([key, value]) => {
                  const icons = {
                    feasibility: Target,
                    relevance: Star,
                    impact: TrendingUp,
                    cost: DollarSign,
                    timeline: Clock
                  };
                  const labels = {
                    feasibility: 'Machbarkeit',
                    relevance: 'Relevanz',
                    impact: 'Auswirkung',
                    cost: 'Kosten',
                    timeline: 'Zeitplan'
                  };
                  const Icon = icons[key as keyof typeof icons] || Target;
                  const label = labels[key as keyof typeof labels] || key;

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-[hsl(var(--innovation-neon-turquoise))]" />
                          <span className="text-white text-sm">{label}</span>
                        </div>
                        <span className={`font-bold ${getScoreColor(value)}`}>
                          {value}%
                        </span>
                      </div>
                      <Progress 
                        value={value} 
                        className="h-2 bg-white/10"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Pros and Cons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ThumbsUp className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-bold text-white">Vorteile</h3>
              </div>
              <ul className="space-y-3">
                {currentIdea.pros.map((pro, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3 text-white/80"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                    {pro}
                  </motion.li>
                ))}
              </ul>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ThumbsDown className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold text-white">Nachteile & Risiken</h3>
              </div>
              <ul className="space-y-3">
                {currentIdea.cons.map((con, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3 text-white/80"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                    {con}
                  </motion.li>
                ))}
              </ul>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recommendations & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-[hsl(var(--innovation-neon-turquoise))]/20 to-[hsl(var(--innovation-dark-blue))]/20 border-[hsl(var(--innovation-neon-turquoise))]/30">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-[hsl(var(--innovation-neon-turquoise))]" />
              <h3 className="text-lg font-bold text-white">Empfehlungen</h3>
            </div>
            <ul className="space-y-2 mb-6">
              {currentIdea.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 text-white/80">
                  <div className="w-2 h-2 rounded-full bg-[hsl(var(--innovation-neon-turquoise))] mt-2 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
            
            <div className="flex gap-4">
              <Button
                className="bg-gradient-to-r from-[hsl(var(--innovation-neon-turquoise))] to-[hsl(var(--innovation-dark-blue))] hover:shadow-[0_0_20px_hsl(var(--innovation-neon-turquoise)/0.5)]"
              >
                In Projekt umwandeln
              </Button>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Bewertung exportieren
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};