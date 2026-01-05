
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  BookOpen,
  Target
} from 'lucide-react';
import { useIntelligentRecruiting, OnboardingPlan } from '@/hooks/recruiting/useIntelligentRecruiting';

const OnboardingPlanGenerator: React.FC = () => {
  const { 
    onboardingPlans, 
    loading, 
    createOnboardingPlan 
  } = useIntelligentRecruiting();
  
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  const handleGeneratePlan = () => {
    if (selectedCandidate && selectedProject) {
      createOnboardingPlan(selectedCandidate, selectedProject);
    }
  };

  const getPhaseProgress = (phaseIndex: number, totalPhases: number) => {
    return ((phaseIndex + 1) / totalPhases) * 100;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Intelligente Onboarding-Plan-Generierung
          </CardTitle>
          
          {/* Generator */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
              <SelectTrigger>
                <SelectValue placeholder="Kandidat auswählen" />
              </SelectTrigger>
              <SelectContent>
                {/* ZERO-DATA: Kandidaten aus DB laden */}
                <SelectItem value="placeholder" disabled>Kandidat aus Datenbank laden</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Projekt auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proj-1">E-Commerce Platform</SelectItem>
                <SelectItem value="proj-2">Mobile App Development</SelectItem>
                <SelectItem value="proj-3">Digital Transformation</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleGeneratePlan}
              disabled={loading || !selectedCandidate || !selectedProject}
            >
              {loading ? 'Generiere...' : 'Plan erstellen'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Onboarding Pläne */}
      {onboardingPlans.map((plan) => (
        <Card key={plan.id} className="border">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  Onboarding-Plan für {plan.candidateId}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Projekt: {plan.projectId} • Dauer: {plan.estimatedDuration} Tage
                </p>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {plan.estimatedDuration} Tage
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Mentoren & Training */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Empfohlene Mentoren
                </h4>
                <div className="space-y-1">
                  {plan.mentorSuggestions.map((mentor) => (
                    <Badge key={mentor} variant="secondary" className="mr-1">
                      {mentor}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Training-Anforderungen
                </h4>
                <div className="space-y-1">
                  {plan.trainingRequirements.map((training) => (
                    <Badge key={training} variant="outline" className="mr-1 mb-1">
                      {training}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Phasen */}
            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Onboarding-Phasen
              </h4>
              
              <div className="space-y-4">
                {plan.phases.map((phase, index) => (
                  <Card key={phase.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {/* Phase Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-semibold">{phase.name}</h5>
                            <p className="text-sm text-gray-600">{phase.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {phase.duration} Tage
                            </Badge>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Phase {index + 1} von {plan.phases.length}</span>
                            <span>{Math.round(getPhaseProgress(index, plan.phases.length))}%</span>
                          </div>
                          <Progress 
                            value={getPhaseProgress(index, plan.phases.length)} 
                            className="h-2"
                          />
                        </div>

                        {/* Aufgaben */}
                        <div>
                          <p className="text-sm font-medium mb-2">Aufgaben:</p>
                          <ul className="space-y-1">
                            {phase.tasks.map((task, taskIndex) => (
                              <li key={taskIndex} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-3 w-3 text-gray-400" />
                                {task}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Erfolgskriterien */}
                        <div>
                          <p className="text-sm font-medium mb-2">Erfolgskriterien:</p>
                          <div className="bg-green-50 p-2 rounded">
                            <ul className="space-y-1">
                              {phase.success_criteria.map((criteria, criteriaIndex) => (
                                <li key={criteriaIndex} className="flex items-center gap-2 text-sm text-green-700">
                                  <Target className="h-3 w-3" />
                                  {criteria}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Dependencies */}
                        {phase.dependencies.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Abhängigkeiten:</p>
                            <div className="flex items-center gap-2">
                              {phase.dependencies.map((dep) => (
                                <div key={dep} className="flex items-center gap-1 text-xs">
                                  <ArrowRight className="h-3 w-3 text-gray-400" />
                                  <span>Phase {dep}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Aktionen */}
            <div className="flex gap-2 pt-4 border-t">
              <Button size="sm" variant="outline">
                Plan anpassen
              </Button>
              <Button size="sm" variant="outline">
                Mentoren zuweisen
              </Button>
              <Button size="sm" variant="outline">
                Termine planen
              </Button>
              <Button size="sm">
                Plan aktivieren
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Leer-Zustand */}
      {onboardingPlans.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Wählen Sie einen Kandidaten und ein Projekt aus, um einen maßgeschneiderten Onboarding-Plan zu generieren</p>
              <p className="text-sm mt-2">
                Unsere KI erstellt automatisch phasenbasierte Pläne mit passenden Mentoren und Trainings
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hinweise */}
      <Card>
        <CardContent className="pt-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800 mb-2">🚀 Intelligente Generierung</h4>
            <p className="text-sm text-purple-700">
              Onboarding-Pläne werden automatisch basierend auf Projektanforderungen, 
              Kandidatenprofil und verfügbaren Mentoren erstellt. Jeder Plan ist individuell 
              angepasst und berücksichtigt bewährte Onboarding-Praktiken.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPlanGenerator;
