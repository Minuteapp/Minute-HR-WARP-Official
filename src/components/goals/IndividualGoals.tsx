
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Skeleton
} from "@/components/ui/skeleton";
import { 
  Plus, Search, Filter, SlidersHorizontal
} from 'lucide-react';
import { GoalItem } from './GoalItem';
import { GoalDialog } from './GoalDialog';
import { useGoals } from '@/contexts/GoalsContext';
import { Goal } from '@/types/goals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const IndividualGoals: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const { toast } = useToast();
  
  const { 
    goals, 
    loading, 
    loadGoals, 
    createGoal, 
    updateGoal,
    deleteGoal,
    archiveGoal
  } = useGoals();
  
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    };
    
    getUser();
    loadGoals('personal');
  }, [loadGoals]);

  useEffect(() => {
    if (goals) {
      // Filter by search query and only show personal goals where the user is the creator or is assigned
      const filtered = goals.filter(goal => {
        const matchesSearch = searchQuery === '' || 
          goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (goal.description && goal.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const isUserGoal = goal.category === 'personal' && 
          (goal.created_by === currentUserId || goal.assigned_to === currentUserId);
        
        return matchesSearch && isUserGoal;
      });
      
      setFilteredGoals(filtered);
    }
  }, [goals, searchQuery, currentUserId]);

  const handleCreateGoal = () => {
    setDialogMode('create');
    setSelectedGoal(undefined);
    setDialogOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setDialogMode('edit');
    setSelectedGoal(goal);
    setDialogOpen(true);
  };

  const handleSaveGoal = async (goalData: Partial<Goal>) => {
    try {
      if (dialogMode === 'create') {
        await createGoal({
          ...goalData as Omit<Goal, 'id' | 'created_at' | 'updated_at'>,
          created_by: currentUserId || undefined
        });
        toast({
          title: "Ziel erstellt",
          description: "Ihr persönliches Ziel wurde erfolgreich erstellt."
        });
      } else if (dialogMode === 'edit' && selectedGoal) {
        await updateGoal(selectedGoal.id, goalData);
        toast({
          title: "Ziel aktualisiert",
          description: "Das Ziel wurde erfolgreich aktualisiert."
        });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      toast({
        title: "Ziel gelöscht",
        description: "Das Ziel wurde erfolgreich gelöscht."
      });
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: "Fehler",
        description: "Das Ziel konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    }
  };
  
  const handleCompleteGoal = async (goalId: string) => {
    try {
      await updateGoal(goalId, { 
        status: 'completed', 
        progress: 100 
      });
      toast({
        title: "Ziel abgeschlossen",
        description: "Herzlichen Glückwunsch! Das Ziel wurde als abgeschlossen markiert."
      });
    } catch (error) {
      console.error('Error completing goal:', error);
      toast({
        title: "Fehler",
        description: "Das Ziel konnte nicht als abgeschlossen markiert werden.",
        variant: "destructive"
      });
    }
  };
  
  const handleProgressUpdate = async (goalId: string, progress: number) => {
    try {
      await updateGoal(goalId, { progress });
      toast({
        title: "Fortschritt aktualisiert",
        description: `Der Fortschritt wurde auf ${progress}% aktualisiert.`
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Fehler",
        description: "Der Fortschritt konnte nicht aktualisiert werden.",
        variant: "destructive"
      });
    }
  };
  
  const activeGoals = filteredGoals.filter(goal => goal.status === 'active');
  const completedGoals = filteredGoals.filter(goal => goal.status === 'completed');
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[150px] w-full" />
        <Skeleton className="h-[150px] w-full" />
        <Skeleton className="h-[150px] w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ziele durchsuchen..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="icon"
          >
            <Filter className="h-4 w-4" />
          </Button>
          
          <Button onClick={handleCreateGoal} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span>Neues Ziel</span>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Aktive Ziele ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Abgeschlossene Ziele ({completedGoals.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {activeGoals.length > 0 ? (
            <div className="space-y-4 mt-4">
              {activeGoals.map((goal) => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                  onCompleteGoal={handleCompleteGoal}
                  onProgressUpdate={handleProgressUpdate}
                />
              ))}
            </div>
          ) : (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <SlidersHorizontal className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Keine aktiven Ziele</h3>
                <p className="text-muted-foreground mb-4">
                  Sie haben noch keine persönlichen Ziele erstellt. Nutzen Sie die Chance, Ihre Entwicklung zu strukturieren.
                </p>
                <Button onClick={handleCreateGoal}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erstes Ziel erstellen
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedGoals.length > 0 ? (
            <div className="space-y-4 mt-4">
              {completedGoals.map((goal) => (
                <GoalItem 
                  key={goal.id} 
                  goal={goal} 
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          ) : (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <SlidersHorizontal className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Keine abgeschlossenen Ziele</h3>
                <p className="text-muted-foreground">
                  Wenn Sie Ziele abschließen, werden diese hier angezeigt.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goal={selectedGoal}
        onSave={handleSaveGoal}
        title={dialogMode === 'create' ? 'Persönliches Ziel erstellen' : 'Ziel bearbeiten'}
        mode={dialogMode}
      />
    </div>
  );
};

export default IndividualGoals;
