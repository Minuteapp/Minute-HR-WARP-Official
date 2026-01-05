
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, AlertTriangle, Calendar, Briefcase } from 'lucide-react';
import { useIntelligentRecruiting, SkillGap } from '@/hooks/recruiting/useIntelligentRecruiting';

const SkillGapAnalysis: React.FC = () => {
  const { 
    skillGaps, 
    loading, 
    identifySkillGaps 
  } = useIntelligentRecruiting();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <TrendingUp className="h-4 w-4" />;
      case 'low': return <Briefcase className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  const getLevelProgress = (currentLevel: string, requiredLevel: string) => {
    const levels = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    const current = levels[currentLevel as keyof typeof levels] || 0;
    const required = levels[requiredLevel as keyof typeof levels] || 0;
    
    return {
      current: (current / 3) * 100,
      required: (required / 3) * 100,
      gap: required - current
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Skill-Gap-Analyse für zukünftige Projekte
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={identifySkillGaps}
              disabled={loading}
            >
              {loading ? 'Analysiere...' : 'Analyse starten'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {skillGaps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Starten Sie die Analyse, um Skill-Lücken zu identifizieren</p>
            </div>
          ) : (
            <div className="space-y-4">
              {skillGaps.map((gap, index) => {
                const levelData = getLevelProgress(gap.currentLevel, gap.requiredLevel);
                
                return (
                  <Card key={index} className="border">
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-lg">{gap.skill}</h4>
                            <p className="text-sm text-gray-600">
                              Aktuell: {gap.currentLevel} → Benötigt: {gap.requiredLevel}
                            </p>
                          </div>
                          <Badge className={`${getPriorityColor(gap.priority)} flex items-center gap-1`}>
                            {getPriorityIcon(gap.priority)}
                            {gap.priority === 'high' ? 'Hoch' : 
                             gap.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                          </Badge>
                        </div>

                        {/* Level Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Skill-Level</span>
                            <span>Gap: {levelData.gap} Level(s)</span>
                          </div>
                          <div className="relative">
                            <Progress value={levelData.current} className="h-3" />
                            <div 
                              className="absolute top-0 h-3 bg-red-200 rounded-full opacity-50"
                              style={{ 
                                left: `${levelData.current}%`, 
                                width: `${levelData.required - levelData.current}%` 
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Beginner</span>
                            <span>Intermediate</span>
                            <span>Advanced</span>
                          </div>
                        </div>

                        {/* Projekte */}
                        <div>
                          <p className="text-sm font-medium mb-2">Benötigt für Projekte:</p>
                          <div className="flex flex-wrap gap-1">
                            {gap.projectsRequiring.map((project) => (
                              <Badge key={project} variant="outline" className="text-xs">
                                {project}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Zeitrahmen */}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">Zeitrahmen: {gap.timeframe}</span>
                        </div>

                        {/* Aktionen */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button size="sm" variant="outline">
                            Stellenanzeige erstellen
                          </Button>
                          <Button size="sm" variant="outline">
                            Weiterbildung planen
                          </Button>
                          <Button size="sm" variant="outline">
                            Externe Berater suchen
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zusammenfassung */}
      {skillGaps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Kritische Lücken</p>
                  <p className="text-xl font-bold text-red-600">
                    {skillGaps.filter(g => g.priority === 'high').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Mittlere Priorität</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {skillGaps.filter(g => g.priority === 'medium').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Gesamt Skills</p>
                  <p className="text-xl font-bold">
                    {skillGaps.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empfehlungen */}
      {skillGaps.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🎯 Strategische Empfehlungen</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Prioritäten bei kritischen Skills setzen (Machine Learning, DevOps)</li>
                <li>• Interne Weiterbildungsprogramme für bestehende Mitarbeiter</li>
                <li>• Externe Recruitment-Fokus auf seltene Spezialisten</li>
                <li>• Partnerschaften mit Universitäten und Coding-Bootcamps</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillGapAnalysis;
