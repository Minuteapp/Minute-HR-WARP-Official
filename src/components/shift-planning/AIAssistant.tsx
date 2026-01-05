
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, Users, Clock, TrendingUp } from 'lucide-react';

const skillAnalysis = [
  { skill: 'Grundqualifikation', coverage: 95, status: 'Gut abgedeckt', employees: 4 },
  { skill: 'Turbine A Zertifikat', coverage: 90, status: 'Gut abgedeckt', employees: 3 },
  { skill: 'Wartung', coverage: 75, status: 'Ausreichend', employees: 2 },
  { skill: 'Qualitätskontrolle', coverage: 65, status: 'Verbesserungsbedarf', employees: 2 },
  { skill: 'Nachtwache', coverage: 40, status: 'Kritisch', employees: 1 }
];

const recommendations = [
  {
    title: 'Backup-Mitarbeiter für Nachtschichten einplanen',
    description: 'Skills-Training für Turbine A Bedienung empfohlen',
    priority: 'Hoch',
    impact: 'Hohe Planungsgenauigkeit'
  },
  {
    title: 'Wochenend-Besetzung optimieren',
    description: 'Überstunden reduzieren durch bessere Verteilung',
    priority: 'Mittel',
    impact: 'Bessere Work-Life-Balance'
  }
];

const trainingNeeds = [
  { employee: 'Zusätzliches Training A Zertifikat', count: '4 Mitarbeiter' },
  { employee: 'Nachtwache Qualifikation', count: '3 Mitarbeiter' },
  { employee: 'Wartungsspezializierung', count: '2 Mitarbeiter' }
];

const AIAssistant = () => {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">KI-Assistent für optimale Planung</h2>
          <p className="text-sm text-gray-600 mt-1">
            Der KI-Assistent analysiert Skills und schlägt optimale Schichtbesetzungen vor.
          </p>
        </div>
      </div>

      {/* Skill Analysis */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-medium">Skill-Abdeckung</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            45% der möglichen Zuweisungen sind besetzt
          </p>
          <div className="space-y-3">
            {skillAnalysis.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{skill.skill}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{skill.coverage}% ({skill.employees})</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      skill.status === 'Gut abgedeckt' ? 'bg-green-100 text-green-800' :
                      skill.status === 'Ausreichend' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {skill.status}
                    </span>
                  </div>
                </div>
                <Progress value={skill.coverage} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-base font-medium">Optimierungsvorschläge</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            1 Mitarbeiter könnten zusätzlich eingeplant werden
          </p>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium">{rec.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${
                    rec.priority === 'Hoch' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{rec.description}</p>
                <p className="text-xs text-blue-600">{rec.impact}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="text-base font-medium">KI-Empfehlungen</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {trainingNeeds.map((need, index) => (
            <div key={index} className="text-sm">
              <div className="text-blue-600 font-medium mb-1">{index === 0 ? 'Trainingsbedarf' : ''}</div>
              <div className="text-gray-600">
                <div>• {need.employee}</div>
                <div className="text-xs text-gray-500">{need.count}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Button */}
      <Card className="p-6 text-center">
        <div className="flex items-center gap-2 justify-center mb-4">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-medium">KI-Optimierung starten</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Lassen Sie die KI automatisch die beste Schichtverteilung berechnen
        </p>
        <Button className="bg-black text-white px-8">
          KI-basierte Optimierung starten
        </Button>
      </Card>
    </div>
  );
};

export default AIAssistant;
