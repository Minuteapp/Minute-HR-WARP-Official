
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, Clock, Star, Search } from 'lucide-react';
import { useIntelligentRecruiting, InterviewerSuggestion } from '@/hooks/recruiting/useIntelligentRecruiting';

const InterviewerSuggestions: React.FC = () => {
  const { 
    interviewerSuggestions, 
    loading, 
    suggestInterviewers 
  } = useIntelligentRecruiting();
  
  const [selectedPosition, setSelectedPosition] = useState('');
  const [candidateId, setCandidateId] = useState('candidate-1');

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'limited': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Verfügbar';
      case 'limited': return 'Begrenzt verfügbar';
      case 'unavailable': return 'Nicht verfügbar';
      default: return availability;
    }
  };

  const getScoreStars = (score: number) => {
    const stars = Math.round(score * 5);
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const handleSuggestInterviewers = () => {
    if (selectedPosition) {
      suggestInterviewers(candidateId, selectedPosition);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Intelligente Interviewer-Vorschläge
          </CardTitle>
          
          {/* Suchbereich */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <Input
              placeholder="Kandidaten-ID eingeben..."
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
            />
            
            <Select value={selectedPosition} onValueChange={setSelectedPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Position auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frontend-developer">Frontend Developer</SelectItem>
                <SelectItem value="backend-developer">Backend Developer</SelectItem>
                <SelectItem value="fullstack-developer">Fullstack Developer</SelectItem>
                <SelectItem value="product-manager">Product Manager</SelectItem>
                <SelectItem value="ux-designer">UX Designer</SelectItem>
                <SelectItem value="team-lead">Team Lead</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleSuggestInterviewers}
              disabled={loading || !selectedPosition}
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Analysiere...' : 'Interviewer finden'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {interviewerSuggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Wählen Sie eine Position aus, um passende Interviewer zu finden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviewerSuggestions.map((suggestion) => (
                <Card key={suggestion.employeeId} className="border">
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{suggestion.employeeName}</h4>
                          <p className="text-sm text-gray-600">
                            {suggestion.position} • {suggestion.department}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-2">
                            {getScoreStars(suggestion.relevanceScore)}
                          </div>
                          <Badge className={getAvailabilityColor(suggestion.availability)}>
                            {getAvailabilityText(suggestion.availability)}
                          </Badge>
                        </div>
                      </div>

                      {/* Relevanz-Score */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Fachliche Relevanz</span>
                          <span>{Math.round(suggestion.relevanceScore * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${suggestion.relevanceScore * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Skill Matches */}
                      <div>
                        <p className="text-sm font-medium mb-2">Relevante Fähigkeiten:</p>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.skillMatch.map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Begründung */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Warum passend:</strong> {suggestion.reason}
                        </p>
                      </div>

                      {/* Aktionen */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button size="sm" variant="outline">
                          <Clock className="h-4 w-4 mr-1" />
                          Interview planen
                        </Button>
                        <Button size="sm" variant="outline">
                          Verfügbarkeit prüfen
                        </Button>
                        <Button size="sm" variant="outline">
                          Profil anzeigen
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

      {/* Info-Box */}
      <Card>
        <CardContent className="pt-4">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">💡 Intelligente Auswahl</h4>
            <p className="text-sm text-yellow-700">
              Unsere KI berücksichtigt Fachkenntnisse, Erfahrung, aktuelle Workload und 
              Verfügbarkeit der Mitarbeiter, um die besten Interviewer für jeden Kandidaten zu finden.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewerSuggestions;
