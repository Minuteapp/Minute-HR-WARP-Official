import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SettingsHeader } from '../settings/SettingsHeader';
import { ReviewCycleSettings } from '../settings/ReviewCycleSettings';
import { FeedbackSettings } from '../settings/FeedbackSettings';
import { AISettingsSection } from '../settings/AISettingsSection';
import { IntegrationsSettings } from '../settings/IntegrationsSettings';
import { RolesPermissionsTable } from '../settings/RolesPermissionsTable';
import { InspirationalQuote } from '../settings/InspirationalQuote';
import { toast } from 'sonner';

export const SettingsTab = () => {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['performance-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
  });

  const [reviewCycle, setReviewCycle] = useState('quarterly');
  const [mandatoryCheckins, setMandatoryCheckins] = useState(true);
  const [anonymousFeedback, setAnonymousFeedback] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [goalsIntegration, setGoalsIntegration] = useState(true);

  useEffect(() => {
    if (settings) {
      setReviewCycle(settings.review_cycle || 'quarterly');
      setMandatoryCheckins(settings.mandatory_checkins ?? true);
      setAnonymousFeedback(settings.anonymous_feedback ?? false);
      setAiEnabled(settings.ai_enabled ?? true);
      setGoalsIntegration(settings.goals_integration ?? true);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<typeof settings>) => {
      if (settings?.id) {
        const { error } = await supabase
          .from('performance_settings')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('performance_settings')
          .insert(updates);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-settings'] });
      toast.success('Einstellungen gespeichert');
    },
    onError: () => {
      toast.error('Fehler beim Speichern');
    }
  });

  const handleChange = (key: string, value: string | boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <SettingsHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReviewCycleSettings
          reviewCycle={reviewCycle}
          mandatoryCheckins={mandatoryCheckins}
          onReviewCycleChange={(v) => {
            setReviewCycle(v);
            handleChange('review_cycle', v);
          }}
          onMandatoryCheckinsChange={(v) => {
            setMandatoryCheckins(v);
            handleChange('mandatory_checkins', v);
          }}
        />
        <FeedbackSettings
          anonymousFeedback={anonymousFeedback}
          onAnonymousFeedbackChange={(v) => {
            setAnonymousFeedback(v);
            handleChange('anonymous_feedback', v);
          }}
        />
      </div>

      <AISettingsSection
        aiEnabled={aiEnabled}
        onAiEnabledChange={(v) => {
          setAiEnabled(v);
          handleChange('ai_enabled', v);
        }}
      />

      <IntegrationsSettings
        goalsIntegration={goalsIntegration}
        onGoalsIntegrationChange={(v) => {
          setGoalsIntegration(v);
          handleChange('goals_integration', v);
        }}
      />

      <RolesPermissionsTable />
      
      <InspirationalQuote />
    </div>
  );
};
