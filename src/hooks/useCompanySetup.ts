import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export type SetupStep = 
  | 'welcome'
  | 'locations'
  | 'departments'
  | 'teams'
  | 'employees'
  | 'modules'
  | 'complete';

const SETUP_STEPS: SetupStep[] = [
  'welcome',
  'locations',
  'departments',
  'teams',
  'employees',
  'modules',
  'complete'
];

interface SetupProgress {
  currentStep: SetupStep;
  completedSteps: SetupStep[];
  isSetupComplete: boolean;
  skippedAt?: string;
}

export const useCompanySetup = () => {
  const { tenantCompany } = useTenant();
  const [progress, setProgress] = useState<SetupProgress>({
    currentStep: 'welcome',
    completedSteps: [],
    isSetupComplete: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const companyId = tenantCompany?.id;

  // Load setup progress from company metadata
  const loadProgress = useCallback(async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('metadata, onboarding_status')
        .eq('id', companyId)
        .single();

      if (error) throw error;

      const metadata = data?.metadata as Record<string, any> | null;
      const setupProgress = metadata?.setupProgress as SetupProgress | undefined;
      
      if (setupProgress) {
        setProgress(setupProgress);
      } else if (data?.onboarding_status === 'completed') {
        setProgress({
          currentStep: 'complete',
          completedSteps: SETUP_STEPS,
          isSetupComplete: true,
        });
      }
    } catch (error) {
      console.error('Error loading setup progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Save setup progress to company metadata
  const saveProgress = async (newProgress: SetupProgress) => {
    if (!companyId) return;

    try {
      // First get current metadata
      const { data: currentData } = await supabase
        .from('companies')
        .select('metadata')
        .eq('id', companyId)
        .single();

      const currentMetadata = (currentData?.metadata as Record<string, any>) || {};
      
      const { error } = await supabase
        .from('companies')
        .update({
          metadata: {
            ...currentMetadata,
            setupProgress: newProgress
          },
          onboarding_status: newProgress.isSetupComplete ? 'completed' : 'in_progress'
        })
        .eq('id', companyId);

      if (error) throw error;
      
      setProgress(newProgress);
    } catch (error) {
      console.error('Error saving setup progress:', error);
    }
  };

  const goToStep = async (step: SetupStep) => {
    const newProgress = {
      ...progress,
      currentStep: step,
    };
    await saveProgress(newProgress);
  };

  const completeStep = async (step: SetupStep) => {
    const stepIndex = SETUP_STEPS.indexOf(step);
    const nextStep = SETUP_STEPS[stepIndex + 1] || 'complete';
    
    const newProgress: SetupProgress = {
      ...progress,
      currentStep: nextStep,
      completedSteps: [...new Set([...progress.completedSteps, step])],
      isSetupComplete: nextStep === 'complete',
    };
    
    await saveProgress(newProgress);
  };

  const skipSetup = async () => {
    const newProgress: SetupProgress = {
      currentStep: 'complete',
      completedSteps: progress.completedSteps,
      isSetupComplete: true,
      skippedAt: new Date().toISOString(),
    };
    await saveProgress(newProgress);
  };

  const resetSetup = async () => {
    const newProgress: SetupProgress = {
      currentStep: 'welcome',
      completedSteps: [],
      isSetupComplete: false,
    };
    await saveProgress(newProgress);
  };

  const isStepCompleted = (step: SetupStep) => progress.completedSteps.includes(step);
  
  const getStepIndex = (step: SetupStep) => SETUP_STEPS.indexOf(step);
  
  const getCurrentStepIndex = () => getStepIndex(progress.currentStep);

  return {
    progress,
    isLoading,
    currentStep: progress.currentStep,
    completedSteps: progress.completedSteps,
    isSetupComplete: progress.isSetupComplete,
    goToStep,
    completeStep,
    skipSetup,
    resetSetup,
    isStepCompleted,
    getStepIndex,
    getCurrentStepIndex,
    steps: SETUP_STEPS,
    reload: loadProgress,
  };
};
