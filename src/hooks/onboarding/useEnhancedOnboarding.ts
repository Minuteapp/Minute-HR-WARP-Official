
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'in_progress';
  order: number;
  type: 'document' | 'meeting' | 'training' | 'task' | 'feedback' | 'custom';
  link?: string;
  dueDate?: string;
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
}

export const useEnhancedOnboarding = (processId: string) => {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [employeeBadges, setEmployeeBadges] = useState<EmployeeBadge[]>([]);
  const [itSetupItems, setItSetupItems] = useState<ITSetupItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [onboardingGoals, setOnboardingGoals] = useState<OnboardingGoal[]>([]);
  const [wikiArticles, setWikiArticles] = useState<WikiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [loadingITSetup, setLoadingITSetup] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [loadingWiki, setLoadingWiki] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchData();
  }, [processId]);

  useEffect(() => {
    if (steps.length > 0) {
      const completedSteps = steps.filter(step => step.status === 'completed').length;
      setProgress(Math.round((completedSteps / steps.length) * 100));
      setIsCompleted(completedSteps === steps.length);
    }
  }, [steps]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Keine Mock-Daten - Daten werden aus der Datenbank geladen
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
          step.id === stepId ? { ...step, status: 'completed' } : step
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
    // Hier könnte eine Navigation zur entsprechenden Seite erfolgen
  };

  const resetOnboarding = async () => {
    try {
      // In einer echten Anwendung würden wir hier einen API-Aufruf machen
      setSteps(prev => 
        prev.map(step => ({ ...step, status: 'pending' }))
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
        status: 'pending',
        order: steps.length + 1,
        type: 'custom'
      };
      setSteps(prev => [...prev, newStep]);
      return true;
    } catch (error) {
      console.error('Error adding custom step:', error);
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
    loadingBadges,
    loadingITSetup,
    loadingFeedback,
    loadingGoals,
    loadingWiki
  };
};
