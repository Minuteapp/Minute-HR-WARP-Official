
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Video, PlayCircle, FileCheck, Download } from 'lucide-react';
import { useState } from 'react';

interface TrainingItem {
  id: string;
  title: string;
  type: 'document' | 'video' | 'tutorial';
  description: string;
  url: string | null;
  completed: boolean;
}

const DUMMY_TRAININGS: TrainingItem[] = [
  {
    id: '1',
    title: 'Unternehmensrichtlinien',
    type: 'document',
    description: 'Wichtige Informationen über Richtlinien und Verfahren im Unternehmen.',
    url: null,
    completed: false
  },
  {
    id: '2',
    title: 'Einführung in die Software',
    type: 'video',
    description: 'Eine kurze Einführung in die wichtigsten Funktionen der Software.',
    url: null,
    completed: false
  },
  {
    id: '3',
    title: 'Onboarding-Tutorial',
    type: 'tutorial',
    description: 'Schritt-für-Schritt-Anleitung für neue Mitarbeiter.',
    url: null,
    completed: false
  }
];

const OnboardingTraining = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trainings, setTrainings] = useState<TrainingItem[]>(DUMMY_TRAININGS);

  const filteredTrainings = trainings.filter(training => 
    training.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    training.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markAsCompleted = (id: string) => {
    setTrainings(trainings.map(training => 
      training.id === id ? { ...training, completed: !training.completed } : training
    ));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'document': return <FileText className="h-10 w-10 text-blue-500" />;
      case 'video': return <Video className="h-10 w-10 text-red-500" />;
      case 'tutorial': return <PlayCircle className="h-10 w-10 text-green-500" />;
      default: return <FileText className="h-10 w-10 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schulungsmaterialien</CardTitle>
          <CardDescription>
            Hier finden Sie alle Schulungsunterlagen und Videos für Ihr Onboarding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Schulungsmaterial suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="space-y-4 mt-6">
            {filteredTrainings.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">Keine Schulungsmaterialien gefunden.</p>
              </div>
            ) : (
              filteredTrainings.map((training) => (
                <div key={training.id} className="flex p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="mr-4 flex-shrink-0">
                    {getIcon(training.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{training.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {training.description}
                    </p>
                    <div className="flex items-center mt-3">
                      <Button variant="outline" size="sm" className="mr-2">
                        <Download className="h-4 w-4 mr-1" /> 
                        Ansehen
                      </Button>
                      <Button 
                        variant={training.completed ? "default" : "secondary"} 
                        size="sm"
                        onClick={() => markAsCompleted(training.id)}
                      >
                        <FileCheck className="h-4 w-4 mr-1" />
                        {training.completed ? "Abgeschlossen" : "Als abgeschlossen markieren"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTraining;
