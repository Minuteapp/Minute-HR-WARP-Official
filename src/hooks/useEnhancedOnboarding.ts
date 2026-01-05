import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link?: string;
  priority: number;
  status?: 'completed' | 'pending' | 'in_progress';
  type?: 'document' | 'meeting' | 'training' | 'task' | 'feedback' | 'custom';
  dueDate?: string;
  order?: number;
}

export interface EmployeeBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export interface ITSetupItem {
  id: string;
  name: string;
  status: 'completed' | 'pending' | 'in_progress';
  type: 'hardware' | 'software' | 'account';
  assignedTo: string;
  dueDate?: string;
  assignee_role?: string;
  title?: string;
  description?: string;
  reminder_sent_at?: string;
  completed_at?: string;
}

export interface Feedback {
  id: string;
  from: string;
  message: string;
  rating: number;
  date: string;
  type: 'manager' | 'peer' | 'self';
}

export interface OnboardingGoal {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'in_progress';
  dueDate: string;
  completedDate?: string;
}

export interface WikiArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  link: string;
  readTime: number;
  recommended: boolean;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useEnhancedOnboarding = (processId?: string) => {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [employeeBadges, setEmployeeBadges] = useState<EmployeeBadge[]>([]);
  const [itSetupItems, setItSetupItems] = useState<ITSetupItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [onboardingGoals, setOnboardingGoals] = useState<OnboardingGoal[]>([]);
  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([]);
  const [onboardingProcesses, setOnboardingProcesses] = useState<any[]>([]);
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [loadingITSetup, setLoadingITSetup] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [loadingWiki, setLoadingWiki] = useState(true);
  const [loadingProcesses, setLoadingProcesses] = useState(true);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [filtering, setFiltering] = useState<string>('all');
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [processId]);

  useEffect(() => {
    if (steps.length > 0) {
      const completedSteps = steps.filter(step => step.completed || step.status === 'completed').length;
      setProgress(Math.round((completedSteps / steps.length) * 100));
      setIsCompleted(completedSteps === steps.length);
    }
  }, [steps]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In einer echten Anwendung würden wir hier eine API-Anfrage stellen
      // Simulieren von Daten für Demo-Zwecke
      const mockSteps: OnboardingStep[] = [];

      const mockBadges: EmployeeBadge[] = [];

      const mockITItems: ITSetupItem[] = [];

      const mockFeedback: Feedback[] = [];

      const mockGoals: OnboardingGoal[] = [];

      const mockWiki: WikiArticle[] = [];

      setSteps(mockSteps);
      setEmployeeBadges(mockBadges);
      setItSetupItems(mockITItems);
      setFeedbacks(mockFeedback);
      setOnboardingGoals(mockGoals);
      setWikiArticles(mockWiki);
    } catch (error) {
      console.error('Error fetching onboarding data:', error);
    } finally {
      setLoading(false);
      setLoadingBadges(false);
      setLoadingITSetup(false);
      setLoadingFeedback(false);
      setLoadingGoals(false);
      setLoadingWiki(false);
    }
  };

  const markStepAsCompleted = async (stepId: string) => {
    try {
      // In einer echten Anwendung würden wir hier einen API-Aufruf machen
      setSteps(prev => 
        prev.map(step => 
          step.id === stepId ? { ...step, completed: true, status: 'completed' } : step
        )
      );
      return true;
    } catch (error) {
      console.error('Error updating step status:', error);
      return false;
    }
  };

  const navigateToStep = (stepId: string) => {
    console.log(`Navigating to step ${stepId}`);
    const step = steps.find(s => s.id === stepId);
    if (step && step.link) {
      navigate(step.link);
    }
  };

  const resetOnboarding = async () => {
    try {
      // In einer echten Anwendung würden wir hier einen API-Aufruf machen
      setSteps(prev => 
        prev.map(step => ({ ...step, completed: false, status: 'pending' }))
      );
      return true;
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      return false;
    }
  };

  const addCustomStep = async (title: string, description: string, link?: string) => {
    try {
      // In einer echten Anwendung würden wir hier einen API-Aufruf machen
      const newStep: OnboardingStep = {
        id: `custom_${Date.now()}`,
        title,
        description,
        link,
        completed: false,
        status: 'pending',
        order: steps.length + 1,
        type: 'custom',
        priority: steps.length + 1
      };
      setSteps(prev => [...prev, newStep]);
      return true;
    } catch (error) {
      console.error('Error adding custom step:', error);
      return false;
    }
  };

  // Zusätzliche Funktionen für ITSetupChecklist, OnboardingFeedback und OnboardingGoals
  const updateITSetupItem = async (id: string, updates: Partial<ITSetupItem>) => {
    try {
      setItSetupItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
      return true;
    } catch (error) {
      console.error('Error updating IT setup item:', error);
      return false;
    }
  };

  const updateGamificationScore = async (processId: string, points: number) => {
    try {
      console.log(`Added ${points} points to process ${processId}`);
      return true;
    } catch (error) {
      console.error('Error updating gamification score:', error);
      return false;
    }
  };

  const submitFeedback = async (feedback: Omit<Feedback, "id" | "date">) => {
    try {
      const newFeedback: Feedback = {
        ...feedback,
        id: `feedback_${Date.now()}`,
        date: new Date().toISOString()
      };
      setFeedbacks(prev => [...prev, newFeedback]);
      return true;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return false;
    }
  };

  const createGoal = async (goal: Omit<OnboardingGoal, "id" | "completedDate">) => {
    try {
      const newGoal: OnboardingGoal = {
        ...goal,
        id: `goal_${Date.now()}`,
        completedDate: undefined
      };
      setOnboardingGoals(prev => [...prev, newGoal]);
      return true;
    } catch (error) {
      console.error('Error creating goal:', error);
      return false;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<OnboardingGoal>) => {
    try {
      setOnboardingGoals(prev => 
        prev.map(goal => 
          goal.id === goalId ? { ...goal, ...updates } : goal
        )
      );
      return true;
    } catch (error) {
      console.error('Error updating goal:', error);
      return false;
    }
  };

  const addChecklistItem = async (processId: string, item: any) => {
    try {
      // Mock implementation - in real app this would call Supabase
      const newItem = {
        id: `item_${Date.now()}`,
        process_id: processId,
        ...item,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setChecklistItems(prev => [...prev, newItem]);
      return true;
    } catch (error) {
      console.error('Error adding checklist item:', error);
      return false;
    }
  };

  const updateChecklistItem = async (itemId: string, updates: any) => {
    try {
      setChecklistItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      );
      return true;
    } catch (error) {
      console.error('Error updating checklist item:', error);
      return false;
    }
  };

  return {
    steps,
    loading,
    progress,
    isCompleted,
    markStepAsCompleted,
    navigateToStep,
    resetOnboarding,
    addCustomStep,
    employeeBadges,
    itSetupItems,
    feedbacks,
    onboardingGoals,
    wikiArticles,
    onboardingProcesses,
    checklistItems,
    loadingBadges,
    loadingITSetup,
    loadingFeedback,
    loadingGoals,
    loadingWiki,
    loadingProcesses,
    loadingChecklist,
    filtering,
    setFiltering,
    updateITSetupItem,
    updateGamificationScore,
    submitFeedback,
    createGoal,
    updateGoal,
    addChecklistItem,
    updateChecklistItem
  };
};

export default useEnhancedOnboarding;
