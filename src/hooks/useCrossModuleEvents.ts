
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crossModuleEventService, CrossModuleEvent } from '@/services/crossModuleEventService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useCrossModuleEvents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Alle Events abrufen
  const { data: events = [], isLoading, refetch } = useQuery({
    queryKey: ['crossModuleEvents'],
    queryFn: () => crossModuleEventService.getEvents(),
    refetchInterval: 30000, // Alle 30 Sekunden aktualisieren
  });

  // Benutzer-spezifische Events abrufen
  const { data: userEvents = [] } = useQuery({
    queryKey: ['crossModuleEvents', 'user', user?.id],
    queryFn: () => user?.id ? crossModuleEventService.getUserEvents(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  // Schichtkonflikte abrufen
  const { data: shiftConflicts = [] } = useQuery({
    queryKey: ['crossModuleEvents', 'conflicts'],
    queryFn: () => crossModuleEventService.getShiftConflicts(),
    refetchInterval: 30000,
  });

  // Real-time Updates für Events - erweitert für alle Kerntabellen
  useEffect(() => {
    const channels = [
      // Cross-Module Events Channel
      supabase
        .channel('cross-module-events')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cross_module_events'
          },
          (payload) => {
            console.log('[useCrossModuleEvents] Cross-Module-Event Update:', payload);
            refetch();
          }
        )
        .subscribe(),

      // System Events Channel  
      supabase
        .channel('system-events-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'system_events'
          },
          (payload) => {
            console.log('[useCrossModuleEvents] System-Event Update:', payload);
            queryClient.invalidateQueries({ queryKey: ['system-events'] });
            refetch();
          }
        )
        .subscribe()
    ];

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [refetch, queryClient]);

  // Event-Status aktualisieren
  const { mutate: updateEventStatus } = useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: string }) =>
      crossModuleEventService.updateEventStatus(eventId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crossModuleEvents'] });
      toast.success('Event-Status erfolgreich aktualisiert');
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren des Event-Status');
    }
  });

  // Event auflösen
  const { mutate: resolveEvent } = useMutation({
    mutationFn: ({ eventId, resolution }: { eventId: string; resolution: string }) =>
      crossModuleEventService.resolveEvent(eventId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crossModuleEvents'] });
      toast.success('Event erfolgreich aufgelöst');
    },
    onError: () => {
      toast.error('Fehler beim Auflösen des Events');
    }
  });

  // Statistiken berechnen
  const statistics = {
    totalEvents: events.length,
    unresolvedConflicts: shiftConflicts.filter(e => e.status === 'conflict').length,
    recentEvents: events.filter(e => {
      const eventDate = new Date(e.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return eventDate >= weekAgo;
    }).length,
    eventsByType: events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return {
    events,
    userEvents,
    shiftConflicts,
    statistics,
    isLoading,
    updateEventStatus,
    resolveEvent,
    refetch
  };
};
