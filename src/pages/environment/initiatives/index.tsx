// Ich aktualisiere die vorhandene Datei src/pages/environment/initiatives/index.tsx
// und integriere die neue Timeline-Komponente
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter, Star, Calendar, ArrowLeft, CalendarDays } from 'lucide-react';
import { useEnvironmentStore } from '@/stores/useEnvironmentStore';
import { InitiativeCard } from '@/components/environment/initiatives/InitiativeCard';
import { InitiativeFormDialog } from '@/components/environment/initiatives/InitiativeFormDialog';
import { InitiativeDetailDialog } from '@/components/environment/initiatives/InitiativeDetailDialog';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { InitiativeFilterDialog } from '@/components/environment/initiatives/InitiativeFilterDialog';
import { Task } from '@/types/tasks';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { InitiativeTimeline } from '@/components/environment/initiatives/InitiativeTimeline';

const InitiativesPage = () => {
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const { initiatives, addInitiative, updateInitiative, deleteInitiative } = useEnvironmentStore();
  const [activeView, setActiveView] = useState('grid');
  const [pinnedInitiatives, setPinnedInitiatives] = useState<string[]>([]);
  
  // Mock-Tasks für Kanban-Board mit korrekten Status-Typen
  const [mockTasks, setMockTasks] = useState<Task[]>([
    { id: '1', title: 'Initiative 1: Papierloses Büro - Planung', status: 'todo', priority: 'high', assignedTo: ['Max'] },
    { id: '2', title: 'Initiative 2: Energiesparmaßnahmen - Kickoff', status: 'in-progress', priority: 'medium', assignedTo: ['Anna'] },
    { id: '3', title: 'Initiative 3: Recyclingprogramm - Implementierung', status: 'in-progress', priority: 'high', assignedTo: ['Tom'] },
    { id: '4', title: 'Initiative 4: CO2-Reduzierung - Konzeptphase', status: 'todo', priority: 'medium', assignedTo: ['Lisa'] },
    { id: '5', title: 'Initiative 5: Wassersparmaßnahmen - Abschluss', status: 'done', priority: 'low', assignedTo: ['Markus'] }
  ]);

  const handleOpenFormDialog = () => {
    setIsFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setIsFormDialogOpen(false);
  };

  const handleOpenDetailDialog = (initiative) => {
    setSelectedInitiative(initiative);
    setIsDetailDialogOpen(true);
  };

  const handleCloseDetailDialog = () => {
    setIsDetailDialogOpen(false);
  };

  const handleAddInitiative = (newInitiative) => {
    addInitiative(newInitiative);
    handleCloseFormDialog();
  };

  const handleUpdateInitiative = (updatedInitiative) => {
    updateInitiative(updatedInitiative);
    handleCloseDetailDialog();
  };

  const handleDeleteInitiative = (id) => {
    deleteInitiative(id);
    handleCloseDetailDialog();
  };

  const handleOpenFilterDialog = () => {
    setIsFilterDialogOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };

  const togglePinInitiative = (initiativeId: string) => {
    if (pinnedInitiatives.includes(initiativeId)) {
      setPinnedInitiatives(pinnedInitiatives.filter(id => id !== initiativeId));
    } else {
      setPinnedInitiatives([...pinnedInitiatives, initiativeId]);
    }
  };
  
  // Handler für Kanban-Board - Jetzt mit Promise-Rückgabe
  const handleTaskStatusChange = async (taskId: string, newStatus: string): Promise<boolean> => {
    setMockTasks(mockTasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
    ));
    return true; // Erfolgreiche Änderung zurückgeben
  };
  
  const handleTaskClick = (task: Task) => {
    console.log(`Task ${task.id} clicked`);
  };

  const sortedInitiatives = [...initiatives].sort((a, b) => {
    const aIsPinned = pinnedInitiatives.includes(a.id);
    const bIsPinned = pinnedInitiatives.includes(b.id);
    
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    
    return 0;
  });

  return (
    <div className="w-full py-8">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-4">
            <Link to="/environment">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Zurück</span>
              </Button>
            </Link>
            <CardTitle className="text-xl">Umweltinitiativen</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleOpenFilterDialog}>
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button onClick={handleOpenFormDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Initiative hinzufügen
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs defaultValue="grid" className="mb-6" onValueChange={setActiveView}>
            <TabsList className="mb-4">
              <TabsTrigger value="grid">
                Karten
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <CalendarDays className="mr-2 h-4 w-4" />
                Zeitleiste
              </TabsTrigger>
              <TabsTrigger value="board">
                Kanban
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedInitiatives.map((initiative) => (
                  <InitiativeCard
                    key={initiative.id}
                    initiative={initiative}
                    onCardClick={() => handleOpenDetailDialog(initiative)}
                    isPinned={pinnedInitiatives.includes(initiative.id)}
                    onTogglePin={() => togglePinInitiative(initiative.id)}
                  />
                ))}
              </div>
              
              {sortedInitiatives.length === 0 && (
                <div className="text-center py-12 border border-dashed rounded-md bg-gray-50">
                  <h3 className="text-lg font-medium mb-2">Keine Initiativen gefunden</h3>
                  <p className="text-gray-500 mb-4">
                    Starte jetzt deine erste Umweltinitiative und dokumentiere Fortschritte.
                  </p>
                  <Button onClick={handleOpenFormDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Initiative hinzufügen
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="timeline">
              <InitiativeTimeline initiatives={initiatives} />
            </TabsContent>
            
            <TabsContent value="board">
              <KanbanBoard 
                tasks={mockTasks}
                onTaskStatusChange={handleTaskStatusChange}
                onTaskClick={handleTaskClick}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <InitiativeFormDialog
        open={isFormDialogOpen}
        onOpenChange={handleCloseFormDialog}
        onSubmit={handleAddInitiative}
      />

      {selectedInitiative && (
        <InitiativeDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={handleCloseDetailDialog}
          initiative={selectedInitiative}
          onUpdate={handleUpdateInitiative}
          onDelete={handleDeleteInitiative}
        />
      )}

      <InitiativeFilterDialog
        open={isFilterDialogOpen}
        onOpenChange={handleCloseFilterDialog}
      />
    </div>
  );
};

export default InitiativesPage;
