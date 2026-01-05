
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, Users, TrendingUp, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Roadmap } from '@/hooks/useRoadmaps';

interface ProjectRoadmapProps {
  projectId: string;
  roadmaps?: Roadmap[];
  isLoading?: boolean;
}

interface StrategicObjective {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  progress?: number;
  status?: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  owner?: string;
  kpis?: string[];
}

const ProjectRoadmap: React.FC<ProjectRoadmapProps> = ({
  projectId,
  roadmaps = [],
  isLoading = false
}) => {
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Dummy data for demonstration
  const dummyObjectives: StrategicObjective[] = [
    {
      id: '1',
      title: 'Marktführerschaft erreichen',
      description: 'Wir wollen bis Ende 2024 Marktführer in unserem Segment werden.',
      target_date: '2024-12-31',
      progress: 65,
      status: 'in_progress',
      owner: 'Marketing Team',
      kpis: ['Marktanteil', 'Kundenzufriedenheit', 'Umsatzwachstum']
    },
    {
      id: '2',
      title: 'Produktinnovation vorantreiben',
      description: 'Entwicklung von 3 neuen Produktfeatures bis Q3 2024.',
      target_date: '2024-09-30',
      progress: 40,
      status: 'in_progress',
      owner: 'Product Team',
      kpis: ['Feature-Releases', 'User Adoption', 'Performance']
    },
    {
      id: '3',
      title: 'Team erweitern',
      description: 'Aufbau eines 15-köpfigen Entwicklerteams.',
      target_date: '2024-08-31',
      progress: 80,
      status: 'in_progress',
      owner: 'HR Team',
      kpis: ['Headcount', 'Time to Hire', 'Retention Rate']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on_hold':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'draft':
        return 'Entwurf';
      case 'archived':
        return 'Archiviert';
      case 'planning':
        return 'Planung';
      case 'in_progress':
        return 'In Bearbeitung';
      case 'completed':
        return 'Abgeschlossen';
      case 'on_hold':
        return 'Pausiert';
      default:
        return status;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nicht festgelegt';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Projekt-Roadmap</h2>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!roadmaps || roadmaps.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Projekt-Roadmap</h2>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Roadmap erstellen
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Keine Roadmap vorhanden
            </h3>
            <p className="text-gray-500 text-center mb-6 max-w-md">
              Erstellen Sie eine Roadmap, um die strategischen Ziele und Meilensteine 
              dieses Projekts zu verwalten.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Erste Roadmap erstellen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projekt-Roadmap</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Roadmap
        </Button>
      </div>

      {/* Roadmap Overview */}
      <div className="grid gap-6">
        {roadmaps.map((roadmap) => (
          <Card key={roadmap.id} className="border-l-4 border-l-purple-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    {roadmap.title}
                  </CardTitle>
                  {roadmap.description && (
                    <p className="text-sm text-gray-600 mt-2">{roadmap.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(roadmap.status)}>
                    {getStatusLabel(roadmap.status)}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Start: {formatDate(roadmap.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>Ende: {formatDate(roadmap.end_date)}</span>
                  </div>
                </div>
                
                {roadmap.vision && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Vision</h4>
                    <p className="text-sm text-gray-600">{roadmap.vision}</p>
                  </div>
                )}
                
                {roadmap.mission && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Mission</h4>
                    <p className="text-sm text-gray-600">{roadmap.mission}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Strategic Objectives Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Strategische Ziele
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            {dummyObjectives.map((objective) => (
              <div key={objective.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{objective.title}</h4>
                    {objective.description && (
                      <p className="text-sm text-gray-600 mt-1">{objective.description}</p>
                    )}
                  </div>
                  <Badge className={getStatusColor(objective.status || 'planning')}>
                    {getStatusLabel(objective.status || 'planning')}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-500">Fortschritt</span>
                      <span className="text-sm font-medium">{objective.progress || 0}%</span>
                    </div>
                    <Progress value={objective.progress || 0} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{objective.owner}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Ziel: {formatDate(objective.target_date)}</span>
                    </div>
                  </div>
                  
                  {objective.kpis && objective.kpis.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {objective.kpis.map((kpi, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {kpi}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectRoadmap;
