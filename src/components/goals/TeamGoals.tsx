
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Filter, SlidersHorizontal, Users } from 'lucide-react';
import { GoalItem } from './GoalItem';
import { GoalDialog } from './GoalDialog';
import { useGoals } from '@/contexts/GoalsContext';
import { Goal } from '@/types/goals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRolePermissions } from '@/hooks/useRolePermissions';

const TeamGoals: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const { toast } = useToast();
  const { hasPermission } = useRolePermissions();
  
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
    loadGoals('team');
  }, [loadGoals]);

  useEffect(() => {
    if (goals) {
      // Filter team goals
      const filtered = goals.filter(goal => {
        const matchesSearch = searchQuery === '' || 
          goal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (goal.description && goal.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Include only team goals
        const isTeamGoal = goal.category === 'team';
        
        return matchesSearch && isTeamGoal;
      });
      
      setFilteredGoals(filtered);
    }
  }, [goals, searchQuery]);

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
          created_by: currentUserId || undefined,
          category: 'team'
        });
        toast({
          title: "Teamziel erstellt",
          description: "Das Teamziel wurde erfolgreich erstellt."
        });
      } else if (dialogMode === 'edit' && selectedGoal) {
        await updateGoal(selectedGoal.id, goalData);
        toast({
          title: "Teamziel aktualisiert",
          description: "Das Teamziel wurde erfolgreich aktualisiert."
        });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving team goal:', error);
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
        title: "Teamziel gelöscht",
        description: "Das Teamziel wurde erfolgreich gelöscht."
      });
    } catch (error) {
      console.error('Error deleting team goal:', error);
      toast({
        title: "Fehler",
        description: "Das Teamziel konnte nicht gelöscht werden.",
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
        title: "Teamziel abgeschlossen",
        description: "Herzlichen Glückwunsch! Das Teamziel wurde als abgeschlossen markiert."
      });
    } catch (error) {
      console.error('Error completing team goal:', error);
      toast({
        title: "Fehler",
        description: "Das Teamziel konnte nicht als abgeschlossen markiert werden.",
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
  
  const canManageTeamGoals = hasPermission('manage:goals:team');
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
            placeholder="Teamziele durchsuchen..."
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
          
          {canManageTeamGoals && (
            <Button onClick={handleCreateGoal} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span>Neues Teamziel</span>
            </Button>
          )}
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
                  onEdit={canManageTeamGoals ? handleEditGoal : undefined}
                  onDelete={canManageTeamGoals ? handleDeleteGoal : undefined}
                  onCompleteGoal={canManageTeamGoals ? handleCompleteGoal : undefined}
                  onProgressUpdate={canManageTeamGoals ? handleProgressUpdate : undefined}
                  showActions={canManageTeamGoals}
                />
              ))}
            </div>
          ) : (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Keine aktiven Teamziele</h3>
                <p className="text-muted-foreground mb-4">
                  Es wurden noch keine Teamziele erstellt.
                </p>
                {canManageTeamGoals && (
                  <Button onClick={handleCreateGoal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Erstes Teamziel erstellen
                  </Button>
                )}
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
                  onEdit={canManageTeamGoals ? handleEditGoal : undefined}
                  onDelete={canManageTeamGoals ? handleDeleteGoal : undefined}
                  showActions={canManageTeamGoals}
                />
              ))}
            </div>
          ) : (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Keine abgeschlossenen Teamziele</h3>
                <p className="text-muted-foreground">
                  Wenn Teamziele abgeschlossen werden, werden diese hier angezeigt.
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
        title={dialogMode === 'create' ? 'Teamziel erstellen' : 'Teamziel bearbeiten'}
        mode={dialogMode}
      />
    </div>
  );
};

export default TeamGoals;
