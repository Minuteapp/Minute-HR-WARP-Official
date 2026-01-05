
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { useIntelligentRecruiting, CandidateMatch } from '@/hooks/recruiting/useIntelligentRecruiting';

const CandidateProjectMatching: React.FC = () => {
  const { 
    candidateMatches, 
    loading, 
    matchCandidatesToProjects 
  } = useIntelligentRecruiting();

  const getMatchColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-500';
    if (score >= 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 0.9) return 'Exzellent';
    if (score >= 0.7) return 'Gut';
    return 'Durchschnitt';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Intelligentes Kandidaten-Matching
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={matchCandidatesToProjects}
              disabled={loading}
            >
              {loading ? 'Analysiere...' : 'Matching starten'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {candidateMatches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Starten Sie das Matching, um Kandidaten zu Projekten zuzuordnen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidateMatches.map((match) => (
                <Card key={`${match.candidateId}-${match.projectId}`} className="border">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {/* Header mit Kandidat und Projekt */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{match.candidateName}</h4>
                          <p className="text-sm text-gray-600">→ {match.projectName}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-3 h-3 rounded-full ${getMatchColor(match.matchScore)}`}></span>
                            <span className="font-medium">{Math.round(match.matchScore * 100)}%</span>
                          </div>
                          <Badge variant="outline">
                            {getMatchLabel(match.matchScore)}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Match-Qualität</span>
                          <span>{Math.round(match.matchScore * 100)}%</span>
                        </div>
                        <Progress 
                          value={match.matchScore * 100} 
                          className="h-2"
                        />
                      </div>

                      {/* Skill Matches */}
                      <div>
                        <p className="text-sm font-medium mb-2">Übereinstimmende Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {match.skillMatches.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Match Gründe */}
                      <div>
                        <p className="text-sm font-medium mb-2">Matching-Gründe:</p>
                        <ul className="space-y-1">
                          {match.matchReasons.map((reason, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Aktionen */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button size="sm" variant="outline">
                          Interview planen
                        </Button>
                        <Button size="sm" variant="outline">
                          Kandidat kontaktieren
                        </Button>
                        <Button size="sm" variant="outline">
                          Details anzeigen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiken */}
      {candidateMatches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Durchschnittlicher Match</p>
                  <p className="text-xl font-bold">
                    {Math.round(candidateMatches.reduce((acc, m) => acc + m.matchScore, 0) / candidateMatches.length * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Hochqualifizierte Matches</p>
                  <p className="text-xl font-bold">
                    {candidateMatches.filter(m => m.matchScore >= 0.8).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Verfügbare Kandidaten</p>
                  <p className="text-xl font-bold">
                    {candidateMatches.filter(m => m.availabilityMatch).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CandidateProjectMatching;
