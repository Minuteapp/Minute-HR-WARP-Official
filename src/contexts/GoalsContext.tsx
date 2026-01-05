
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Goal, GoalCategory } from '@/types/goals';
import { goalService } from '@/services/goalService';
import { useToast } from '@/components/ui/use-toast';

interface GoalsContextType {
  goals: Goal[];
  loading: boolean;
  error: Error | null;
  loadGoals: (category?: GoalCategory) => Promise<void>;
  createGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  archiveGoal: (id: string) => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const loadGoals = useCallback(async (category?: GoalCategory) => {
    setLoading(true);
    try {
      const data = await goalService.getGoals(category);
      setGoals(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Fehler beim Laden der Ziele",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createGoal = useCallback(async (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await goalService.createGoal(goal);
      loadGoals();
      toast({
        title: "Ziel erstellt",
        description: "Das Ziel wurde erfolgreich erstellt.",
      });
    } catch (err) {
      toast({
        title: "Fehler beim Erstellen des Ziels",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    }
  }, [loadGoals, toast]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    try {
      await goalService.updateGoal(id, updates);
      loadGoals();
      toast({
        title: "Ziel aktualisiert",
        description: "Das Ziel wurde erfolgreich aktualisiert.",
      });
    } catch (err) {
      toast({
        title: "Fehler beim Aktualisieren des Ziels",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    }
  }, [loadGoals, toast]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      await goalService.deleteGoal(id);
      loadGoals();
      toast({
        title: "Ziel gelöscht",
        description: "Das Ziel wurde erfolgreich gelöscht.",
      });
    } catch (err) {
      toast({
        title: "Fehler beim Löschen des Ziels",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    }
  }, [loadGoals, toast]);

  const archiveGoal = useCallback(async (id: string) => {
    try {
      await goalService.archiveGoal(id);
      loadGoals();
      toast({
        title: "Ziel archiviert",
        description: "Das Ziel wurde erfolgreich archiviert.",
      });
    } catch (err) {
      toast({
        title: "Fehler beim Archivieren des Ziels",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive",
      });
    }
  }, [loadGoals, toast]);

  return (
    <GoalsContext.Provider value={{
      goals,
      loading,
      error,
      loadGoals,
      createGoal,
      updateGoal,
      deleteGoal,
      archiveGoal,
    }}>
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};
