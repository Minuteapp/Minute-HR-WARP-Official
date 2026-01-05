import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  Filter,
  Route,
  Target,
  Calendar,
  Users,
  BarChart3,
  Clock,
  Eye,
  Workflow,
  Edit,
  MoreVertical
} from 'lucide-react';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { RoadmapCreationDialog } from './RoadmapCreationDialog';
import { ComprehensiveRoadmapDialog } from './ComprehensiveRoadmapDialog';
import { RoadmapDetailDialog } from './RoadmapDetailDialog';
import { EditRoadmapDialog } from './EditRoadmapDialog';
import { TimelineView } from './TimelineView';
import { RoadmapPlanningView } from './RoadmapPlanningView';
import { StrategicThemesView } from './enterprise/StrategicThemesView';
import { ProgramManagementView } from './enterprise/ProgramManagementView';

export const RoadmapOverview = () => {
  const { roadmaps, isLoading } = useRoadmaps();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [editingRoadmap, setEditingRoadmap] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const activeRoadmaps = roadmaps.filter(r => r.status === 'active');
  const filteredRoadmaps = roadmaps.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Roadmaps werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Route className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Roadmap</h1>
            <p className="text-muted-foreground">Strategische Planung und Meilensteine</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Umfassende Roadmap erstellen
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Roadmaps durchsuchen..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="planning" className="gap-2">
            <Workflow className="h-4 w-4" />
            Planung
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="themes" className="gap-2">
            <Target className="h-4 w-4" />
            Themen
          </TabsTrigger>
          <TabsTrigger value="programs" className="gap-2">
            <Users className="h-4 w-4" />
            Programme
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Gesamt Roadmaps</p>
                    <p className="text-2xl font-bold">{roadmaps.length}</p>
                  </div>
                  <Route className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aktive Roadmaps</p>
                    <p className="text-2xl font-bold">{activeRoadmaps.length}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Meilensteine</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Team-Mitglieder</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Roadmaps List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Alle Roadmaps</h2>
            
            {filteredRoadmaps.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Keine Roadmaps gefunden</h3>
                  <p className="text-muted-foreground mb-4">
                    Erstellen Sie Ihre erste Roadmap, um zu beginnen.
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Erste Roadmap erstellen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredRoadmaps.map((roadmap) => (
                  <Card key={roadmap.id} className="border-l-4 border-l-primary hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{roadmap.title}</h3>
                            <Badge 
                              variant={roadmap.status === 'active' ? 'default' : 'secondary'}
                              className={roadmap.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {roadmap.status === 'active' ? 'Aktiv' : roadmap.status}
                            </Badge>
                          </div>
                          
                          <p className="text-muted-foreground mb-4">{roadmap.description}</p>
                          
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Start: {roadmap.start_date ? new Date(roadmap.start_date).toLocaleDateString('de-DE') : 'Nicht gesetzt'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Ende: {roadmap.end_date ? new Date(roadmap.end_date).toLocaleDateString('de-DE') : 'Nicht gesetzt'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedRoadmap(roadmap)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingRoadmap(roadmap)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Bearbeiten
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="planning">
          <RoadmapPlanningView />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineView roadmaps={roadmaps} />
        </TabsContent>

        <TabsContent value="themes">
          <StrategicThemesView roadmapId={selectedRoadmap?.id || ''} />
        </TabsContent>

        <TabsContent value="programs">
          <ProgramManagementView roadmapId={selectedRoadmap?.id || ''} />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Analytics in Entwicklung</h3>
              <p className="text-muted-foreground">
                Analytics-Features kommen bald verfügbar.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ComprehensiveRoadmapDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          // Refresh roadmaps data here if needed
        }}
      />
      
      {selectedRoadmap && (
        <RoadmapDetailDialog 
          roadmap={selectedRoadmap}
          open={!!selectedRoadmap}
          onOpenChange={(open) => !open && setSelectedRoadmap(null)}
        />
      )}

      {editingRoadmap && (
        <EditRoadmapDialog 
          roadmap={editingRoadmap}
          open={!!editingRoadmap}
          onOpenChange={(open) => !open && setEditingRoadmap(null)}
        />
      )}
    </div>
  );
};