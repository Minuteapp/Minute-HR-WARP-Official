import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Calendar, Users, Settings } from 'lucide-react';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { RoadmapList } from './RoadmapList';
import { VisualRoadmapPlanning } from './VisualRoadmapPlanning';
import { EnhancedVisualPlanning } from './planning/EnhancedVisualPlanning';
import { RoadmapKanbanBoard } from './planning/RoadmapKanbanBoard';

export const RoadmapPlanningView = () => {
  const { roadmaps, isLoading } = useRoadmaps();
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [planningView, setPlanningView] = useState<'kanban' | 'visual' | 'enhanced'>('kanban');

  const selectedRoadmap = roadmaps.find(r => r.id === selectedRoadmapId);

  if (selectedRoadmapId && selectedRoadmap) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedRoadmapId(null)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Übersicht
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{selectedRoadmap.title}</h2>
            <p className="text-sm text-muted-foreground">Visuelle Planung</p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Roadmap Planung: {selectedRoadmap.title}</CardTitle>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant={planningView === 'kanban' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPlanningView('kanban')}
                  >
                    Kanban Board
                  </Button>
                  <Button
                    variant={planningView === 'visual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPlanningView('visual')}
                  >
                    Visuell
                  </Button>
                  <Button
                    variant={planningView === 'enhanced' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPlanningView('enhanced')}
                  >
                    Erweitert
                  </Button>
                </div>
                <Badge variant={selectedRoadmap.status === 'active' ? 'default' : 'secondary'}>
                  {selectedRoadmap.status === 'active' ? 'Aktiv' : selectedRoadmap.status}
                </Badge>
              </div>
            </div>
            {selectedRoadmap.description && (
              <p className="text-sm text-muted-foreground">{selectedRoadmap.description}</p>
            )}
          </CardHeader>
          <CardContent>
            {planningView === 'kanban' ? (
              <RoadmapKanbanBoard roadmapId={selectedRoadmapId} />
            ) : planningView === 'visual' ? (
              <VisualRoadmapPlanning roadmapId={selectedRoadmapId} />
            ) : (
              <EnhancedVisualPlanning roadmapId={selectedRoadmapId} />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">Roadmap Planung</h2>
          <p className="text-sm text-muted-foreground">
            Wählen Sie eine Roadmap für die visuelle Planung aus
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Roadmaps werden geladen...</p>
          </div>
        </div>
      ) : roadmaps.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Roadmaps vorhanden</h3>
            <p className="text-muted-foreground">
              Erstellen Sie zuerst eine Roadmap in der Übersicht, um mit der Planung zu beginnen.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Verfügbare Roadmaps</h3>
          <RoadmapList onSelectRoadmap={setSelectedRoadmapId} />
        </div>
      )}
    </div>
  );
};