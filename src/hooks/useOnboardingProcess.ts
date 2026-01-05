import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { OnboardingProcess, OnboardingChecklistItem } from '@/types/onboarding.types';
import { useToast } from '@/hooks/use-toast';

export function useOnboardingProcess(processId?: string) {
  const [process, setProcess] = useState<OnboardingProcess | null>(null);
  const [checklistItems, setChecklistItems] = useState<OnboardingChecklistItem[]>([]);
  const [onboardingProcesses, setOnboardingProcesses] = useState<OnboardingProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [loadingProcesses, setLoadingProcesses] = useState(false);
  const [filtering, setFiltering] = useState({ status: 'all', department: 'all' });
  const { toast } = useToast();

  const fetchProcess = async () => {
    if (!processId) return;
    
    try {
      const { data, error } = await supabase
        .from('onboarding_processes')
        .select(`
          *,
          employee:employees(
            id,
            name,
            first_name,
            last_name,
            email,
            department,
            position
          )
        `)
        .eq('id', processId)
        .single();

      if (error) throw error;
      setProcess(data);
    } catch (error) {
      console.error('Error fetching onboarding process:', error);
      toast({
        title: "Fehler",
        description: "Onboarding-Prozess konnte nicht geladen werden.",
        variant: "destructive",
      });
    }
  };

  const fetchOnboardingProcesses = async () => {
    try {
      setLoadingProcesses(true);
      const { data, error } = await supabase
        .from('onboarding_processes')
        .select(`
          *,
          employee:employees(
            id,
            name,
            first_name,
            last_name,
            email,
            department,
            position
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOnboardingProcesses(data || []);
    } catch (error) {
      console.error('Error fetching onboarding processes:', error);
      toast({
        title: "Fehler",
        description: "Onboarding-Prozesse konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoadingProcesses(false);
    }
  };

  const fetchChecklistItems = async () => {
    if (!processId) return;
    
    try {
      const { data, error } = await supabase
        .from('onboarding_checklist_items')
        .select('*')
        .eq('process_id', processId)
        .order('position', { ascending: true });

      if (error) throw error;
      setChecklistItems(data || []);
    } catch (error) {
      console.error('Error fetching checklist items:', error);
      toast({
        title: "Fehler",
        description: "Checkliste konnte nicht geladen werden.",
        variant: "destructive",
      });
    }
  };

  const updateChecklistItem = async (itemId: string, updates: Partial<OnboardingChecklistItem>) => {
    try {
      const { error } = await supabase
        .from('onboarding_checklist_items')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;
      
      await fetchChecklistItems();
      
      toast({
        title: "Erfolg",
        description: "Checklist-Element wurde aktualisiert.",
      });
    } catch (error) {
      console.error('Error updating checklist item:', error);
      toast({
        title: "Fehler",
        description: "Checklist-Element konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const updateProcessStatus = async (status: OnboardingProcess['status']) => {
    if (!processId) return;
    
    try {
      const { error } = await supabase
        .from('onboarding_processes')
        .update({ 
          status,
          ...(status === 'completed' ? { completion_date: new Date().toISOString() } : {})
        })
        .eq('id', processId);

      if (error) throw error;
      
      await fetchProcess();
      
      toast({
        title: "Erfolg",
        description: "Prozess-Status wurde aktualisiert.",
      });
    } catch (error) {
      console.error('Error updating process status:', error);
      toast({
        title: "Fehler",
        description: "Prozess-Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  };

  const addChecklistItem = async (processId: string, item: Partial<OnboardingChecklistItem>) => {
    try {
      const { error } = await supabase
        .from('onboarding_checklist_items')
        .insert({
          process_id: processId,
          title: item.title || '',
          description: item.description,
          category: item.category || 'general',
          type: item.type || 'regular',
          due_date: item.due_date,
          points: item.points || 10,
          position: item.position || 0
        });

      if (error) throw error;
      
      await fetchChecklistItems();
      
      toast({
        title: "Erfolg",
        description: "Neues Checklist-Element wurde hinzugefügt.",
      });
    } catch (error) {
      console.error('Error adding checklist item:', error);
      toast({
        title: "Fehler",
        description: "Checklist-Element konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (processId) {
      setLoading(true);
      Promise.all([fetchProcess(), fetchChecklistItems()])
        .finally(() => setLoading(false));
    } else {
      // Wenn keine processId vorhanden ist, lade alle Prozesse für das Dashboard
      fetchOnboardingProcesses();
    }
  }, [processId]);

  return {
    process,
    checklistItems,
    onboardingProcesses,
    loading,
    loadingChecklist,
    loadingProcesses,
    filtering,
    setFiltering,
    addChecklistItem,
    updateChecklistItem,
    updateProcessStatus,
    refetch: () => Promise.all([fetchProcess(), fetchChecklistItems()])
  };
}