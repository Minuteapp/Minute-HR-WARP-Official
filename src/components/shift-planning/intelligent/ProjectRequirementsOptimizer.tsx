
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  Users, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectRequirement {
  id: string;
  projectName: string;
  requiredSkills: string[];
  timeSlot: string;
  currentCoverage: number;
  targetCoverage: number;
  criticalityLevel: 'low' | 'medium' | 'high';
  suggestedEmployees: string[];
}

const ProjectRequirementsOptimizer: React.FC = () => {
  // Keine Mock-Daten - leerer Zustand bis echte Projektanforderungen geladen werden
  const [requirements, setRequirements] = useState<ProjectRequirement[]>([]);

  const { toast } = useToast();

  const optimizeProjectCoverage = async (requirementId: string) => {
    const requirement = requirements.find(r => r.id === requirementId);
    if (!requirement) return;

    toast({
      title: "Optimierung wird angewendet",
      description: `Schichten für ${requirement.projectName} werden optimiert...`
    });

    // Simuliere Optimierung
    await new Promise(resolve => setTimeout(resolve, 2000));

    setRequirements(prev => prev.map(req => 
      req.id === requirementId 
        ? { ...req, currentCoverage: req.targetCoverage }
        : req
    ));

    toast({
      title: "Optimierung erfolgreich",
      description: `${requirement.projectName} ist jetzt optimal abgedeckt.`
    });
  };

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCoverageColor = (coverage: number, target: number) => {
    const percentage = (coverage / target) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Projekt-Anforderungen Optimierung</h3>
          <p className="text-gray-600">Automatische Anpassung basierend auf Projektbedürfnissen</p>
        </div>
        <Button>
          <Target className="h-4 w-4 mr-2" />
          Alle optimieren
        </Button>
      </div>

      <div className="grid gap-6">
        {requirements.map((req) => (
          <Card key={req.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {req.projectName}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4" />
                    {req.timeSlot}
                  </CardDescription>
                </div>
                <Badge className={getCriticalityColor(req.criticalityLevel)}>
                  {req.criticalityLevel} Priorität
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coverage Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Abdeckung</span>
                  <span className={`text-sm font-medium ${getCoverageColor(req.currentCoverage, req.targetCoverage)}`}>
                    {req.currentCoverage}% / {req.targetCoverage}%
                  </span>
                </div>
                <Progress 
                  value={(req.currentCoverage / req.targetCoverage) * 100} 
                  className="h-2"
                />
              </div>

              {/* Required Skills */}
              <div>
                <h4 className="text-sm font-medium mb-2">Erforderliche Qualifikationen</h4>
                <div className="flex flex-wrap gap-2">
                  {req.requiredSkills.map((skill, index) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Suggested Employees */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Vorgeschlagene Mitarbeiter
                </h4>
                <div className="flex flex-wrap gap-2">
                  {req.suggestedEmployees.map((employee, index) => (
                    <Badge key={index} variant="secondary">
                      {employee}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-between items-center pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {req.currentCoverage >= req.targetCoverage ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Optimal abgedeckt
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      Optimierung erforderlich
                    </>
                  )}
                </div>
                {req.currentCoverage < req.targetCoverage && (
                  <Button 
                    size="sm"
                    onClick={() => optimizeProjectCoverage(req.id)}
                  >
                    Optimieren
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Optimierungs-Zusammenfassung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {requirements.filter(r => r.currentCoverage >= r.targetCoverage).length}
              </div>
              <div className="text-sm text-gray-600">Optimal abgedeckt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {requirements.filter(r => r.currentCoverage < r.targetCoverage && r.criticalityLevel === 'high').length}
              </div>
              <div className="text-sm text-gray-600">Kritische Lücken</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(requirements.reduce((acc, req) => acc + (req.currentCoverage / req.targetCoverage), 0) / requirements.length * 100)}%
              </div>
              <div className="text-sm text-gray-600">Durchschnittliche Abdeckung</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectRequirementsOptimizer;
