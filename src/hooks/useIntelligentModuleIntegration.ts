import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { intelligentModuleIntegration } from '@/services/intelligentModuleIntegration';
import { supabase } from '@/integrations/supabase/client';

export const useIntelligentModuleIntegration = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [integrationStats, setIntegrationStats] = useState({
    totalEvents: 0,
    automatedActions: 0,
    successRate: 0,
    patterns: {}
  });

  // Real-time Integration Monitoring
  useEffect(() => {
    const channel = supabase
      .channel('module-integration-monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cross_module_events'
        },
        (payload) => {
          console.log('🔄 Cross-Module Event:', payload);
          handleRealTimeEvent(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'absence_requests'
        },
        (payload) => {
          if (payload.new.type === 'sick_leave') {
            handleSickLeaveEvent(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'documents'
        },
        (payload) => {
          handleDocumentEvent(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'time_entries'
        },
        (payload) => {
          handleTimeTrackingEvent(payload.new);
        }
      )
      // ==========================================
      // GESCHÄFTSREISEN REAL-TIME LISTENER
      // ==========================================
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'business_trips'
        },
        (payload) => {
          handleBusinessTripCreated(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'business_trips'
        },
        (payload) => {
          // Prüfe Status-Änderungen
          if (payload.new.status === 'approved' && payload.old?.status !== 'approved') {
            handleBusinessTripApproved(payload.new);
          }
          if (payload.new.status === 'completed' && payload.old?.status !== 'completed') {
            handleBusinessTripCompleted(payload.new);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'business_trip_expenses'
        },
        (payload) => {
          handleExpenseSubmitted(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRealTimeEvent = async (payload: any) => {
    console.log('📊 Processing real-time integration event:', payload.eventType);
    
    // Update Integration Stats
    await updateIntegrationStats();
    
    // Show user notification for important integrations
    if (payload.new?.metadata?.automated_actions?.length > 0) {
        toast({
          title: 'Automatische Integration',
          description: `${payload.new.metadata.automated_actions.length} automatische Aktionen ausgeführt`,
        });
    }
  };

  const handleSickLeaveEvent = async (sickLeaveData: any) => {
    console.log('🤒 Processing sick leave integration:', sickLeaveData.id);
    setIsProcessing(true);
    
    try {
      const result = await intelligentModuleIntegration.handleSickLeaveCreated(sickLeaveData);
      
      if (result.success) {
        toast({
          title: 'Krankmeldung verarbeitet',
          description: `${result.actions.length} automatische Aktionen ausgeführt`,
        });
      } else {
        toast({
          title: 'Integration Fehler',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Fehler bei Sick Leave Integration:', error);
      toast({
        title: 'Integrationsfehler',
        description: 'Krankmeldung konnte nicht vollständig verarbeitet werden',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDocumentEvent = async (documentData: any) => {
    console.log('📄 Processing document integration:', documentData.id);
    setIsProcessing(true);
    
    try {
      const result = await intelligentModuleIntegration.handleDocumentUploaded(documentData);
      
      if (result.success) {
        toast({
          title: 'Dokument automatisch kategorisiert',
          description: `Kategorie: ${result.category} - ${result.actions.length} Aktionen ausgeführt`,
        });
      }
    } catch (error) {
      console.error('Fehler bei Document Integration:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTimeTrackingEvent = async (timeEntry: any) => {
    console.log('⏰ Processing time tracking integration:', timeEntry.id);
    setIsProcessing(true);
    
    try {
      const result = await intelligentModuleIntegration.handleTimeTrackingCompleted(timeEntry);
      
      if (result.success && result.actions.includes('overtime_approval_requested')) {
        toast({
          title: 'Überstunden erkannt',
          description: 'Genehmigungsantrag wurde automatisch erstellt',
        });
      }
    } catch (error) {
      console.error('Fehler bei Time Tracking Integration:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // GESCHÄFTSREISEN EVENT HANDLER
  // ==========================================

  const handleBusinessTripCreated = async (tripData: any) => {
    console.log('✈️ Processing business trip created:', tripData.id);
    setIsProcessing(true);
    
    try {
      const result = await intelligentModuleIntegration.handleBusinessTripCreated(tripData);
      
      if (result.success) {
        toast({
          title: 'Reiseantrag verarbeitet',
          description: `${result.actions.length} automatische Aktionen ausgeführt`,
        });
      }
    } catch (error) {
      console.error('Fehler bei Business Trip Created Integration:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBusinessTripApproved = async (tripData: any) => {
    console.log('✅ Processing business trip approved:', tripData.id);
    setIsProcessing(true);
    
    try {
      const result = await intelligentModuleIntegration.handleBusinessTripApproved(tripData);
      
      if (result.success) {
        toast({
          title: 'Reise genehmigt',
          description: `${result.actions.length} Module automatisch aktualisiert (Budget, Kalender, Abwesenheit)`,
        });
      }
    } catch (error) {
      console.error('Fehler bei Business Trip Approved Integration:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBusinessTripCompleted = async (tripData: any) => {
    console.log('🏁 Processing business trip completed:', tripData.id);
    setIsProcessing(true);
    
    try {
      const result = await intelligentModuleIntegration.handleBusinessTripCompleted(tripData);
      
      if (result.success) {
        toast({
          title: 'Reise abgeschlossen',
          description: 'Spesen-Erinnerung gesendet, Budget aktualisiert',
        });
      }
    } catch (error) {
      console.error('Fehler bei Business Trip Completed Integration:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExpenseSubmitted = async (expenseData: any) => {
    console.log('💰 Processing expense submitted:', expenseData.id);
    setIsProcessing(true);
    
    try {
      const result = await intelligentModuleIntegration.handleExpenseSubmitted(expenseData);
      
      if (result.success) {
        toast({
          title: 'Spesen eingereicht',
          description: `Kategorie: ${result.category} - Zur Genehmigung weitergeleitet`,
        });
      }
    } catch (error) {
      console.error('Fehler bei Expense Submitted Integration:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateIntegrationStats = async () => {
    try {
      // Hole Integration Statistics
      const { data: events, count } = await supabase
        .from('cross_module_events')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(100);

      if (events) {
        const automatedActions = events.reduce((sum, event) => 
          sum + (event.metadata?.automated_actions?.length || 0), 0
        );
        
        const successfulEvents = events.filter(event => 
          event.status === 'resolved' || event.metadata?.automated_actions?.length > 0
        ).length;
        
        const successRate = events.length > 0 ? (successfulEvents / events.length) * 100 : 0;
        
        // Analysiere Patterns
        const patterns = await intelligentModuleIntegration.analyzeModuleInteractions();
        
        setIntegrationStats({
          totalEvents: count || 0,
          automatedActions,
          successRate: Math.round(successRate),
          patterns
        });
      }
    } catch (error) {
      console.error('Fehler beim Update der Integration Stats:', error);
    }
  };

  // Manual Integration Triggers
  const triggerEmployeeOnboarding = async (employeeData: any) => {
    setIsProcessing(true);
    try {
      const result = await intelligentModuleIntegration.handleEmployeeOnboarding(employeeData);
      
      if (result.success) {
        toast({
          title: 'Onboarding Integration',
          description: `${result.actions.length} Module automatisch eingerichtet`,
        });
      }
      
      return result;
    } catch (error) {
      console.error('Fehler bei Employee Onboarding:', error);
      toast({
        title: 'Onboarding Fehler',
        description: 'Automatisches Setup konnte nicht vollständig ausgeführt werden',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerShiftPlanUpdate = async (shiftData: any) => {
    setIsProcessing(true);
    try {
      const result = await intelligentModuleIntegration.handleShiftPlanChanged(shiftData);
      
      if (result.success) {
        toast({
          title: 'Schichtplan aktualisiert',
          description: 'Alle verbundenen Module wurden benachrichtigt',
        });
      }
      
      return result;
    } catch (error) {
      console.error('Fehler bei Shift Plan Update:', error);
      return { success: false, error: error.message };
    } finally {
      setIsProcessing(false);
    }
  };

  // Load initial stats
  useEffect(() => {
    updateIntegrationStats();
  }, []);

  return {
    isProcessing,
    integrationStats,
    triggerEmployeeOnboarding,
    triggerShiftPlanUpdate,
    updateIntegrationStats,
    handleSickLeaveEvent,
    handleDocumentEvent,
    handleTimeTrackingEvent,
    // Geschäftsreisen-Handler
    handleBusinessTripCreated,
    handleBusinessTripApproved,
    handleBusinessTripCompleted,
    handleExpenseSubmitted
  };
};