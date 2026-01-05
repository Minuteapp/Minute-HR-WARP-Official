import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useUserOnboarding() {
  const { user, isAuthenticated } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          // Fallback: Check localStorage
          const localStatus = localStorage.getItem(`onboarding_completed_${user.id}`);
          setHasCompletedOnboarding(localStatus === 'true');
        } else {
          setHasCompletedOnboarding(data?.has_completed_onboarding ?? false);
        }
      } catch (err) {
        console.error('Error in onboarding check:', err);
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [isAuthenticated, user?.id]);

  const completeOnboarding = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_completed_onboarding: true })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating onboarding status:', error);
        // Fallback to localStorage
        localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      }

      setHasCompletedOnboarding(true);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
      setHasCompletedOnboarding(true);
    }
  };

  const skipOnboarding = async () => {
    await completeOnboarding();
  };

  // Tour deaktiviert
  const showOnboardingWizard = false;

  return {
    hasCompletedOnboarding,
    isLoading,
    showOnboardingWizard,
    completeOnboarding,
    skipOnboarding,
  };
}
