import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  CheckCircle2, 
  Clock, 
  XCircle,
  RefreshCw,
  Zap,
  ArrowRight,
  AlertTriangle,
  Radio
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

interface SystemEvent {
  id: string;
  event_name: string;
  entity_type: string;
  entity_id: string;
  module: string;
  occurred_at: string;
  payload: Record<string, any>;
}

interface EventOutboxEntry {
  id: string;
  event_id: string;
  status: string;
  retry_count: number;
  last_error: string | null;
  created_at: string;
  processed_at: string | null;
}

interface EffectRun {
  id: string;
  event_id: string;
  effect_type: string;
  status: string;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export function EventLiveMonitor() {
  const [isLive, setIsLive] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Fetch recent system events
  const { data: recentEvents = [], refetch: refetchEvents, isLoading: eventsLoading } = useQuery<SystemEvent[]>({
    queryKey: ['live-system-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_events')
        .select('id, event_name, entity_type, entity_id, module, occurred_at, payload')
        .order('occurred_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: isLive ? 3000 : false,
  });

  // Fetch event outbox entries
  const { data: outboxEntries = [], refetch: refetchOutbox } = useQuery<EventOutboxEntry[]>({
    queryKey: ['live-event-outbox'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_outbox')
        .select('id, event_id, status, retry_count, last_error, created_at, processed_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: isLive ? 3000 : false,
  });

  // Fetch effect runs
  const { data: effectRuns = [], refetch: refetchEffects } = useQuery<EffectRun[]>({
    queryKey: ['live-effect-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('effect_runs')
        .select('id, event_id, effect_type, status, error_message, created_at, completed_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
    refetchInterval: isLive ? 3000 : false,
  });

  const handleRefresh = () => {
    refetchEvents();
    refetchOutbox();
    refetchEffects();
  };

  // Get outbox and effects for selected event
  const selectedOutbox = selectedEventId 
    ? outboxEntries.filter(o => o.event_id === selectedEventId)
    : [];
  const selectedEffects = selectedEventId 
    ? effectRuns.filter(e => e.event_id === selectedEventId)
    : [];

  // Statistics
  const totalEvents = recentEvents.length;
  const pendingOutbox = outboxEntries.filter(o => o.status === 'pending').length;
  const processingOutbox = outboxEntries.filter(o => o.status === 'processing').length;
  const completedEffects = effectRuns.filter(e => e.status === 'completed').length;
  const failedEffects = effectRuns.filter(e => e.status === 'failed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-amber-600 bg-amber-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'processing': return <RefreshCw className="h-3 w-3 animate-spin" />;
      case 'failed': return <XCircle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className={`h-4 w-4 ${isLive ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`} />
          <span className="text-sm font-medium">
            {isLive ? 'Live-Monitoring aktiv' : 'Monitoring pausiert'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? 'Pausieren' : 'Fortsetzen'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Letzte Events</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Warteschlange</p>
                <p className="text-2xl font-bold">{pendingOutbox + processingOutbox}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Erfolgreiche Effects</p>
                <p className="text-2xl font-bold">{completedEffects}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fehlgeschlagen</p>
                <p className="text-2xl font-bold">{failedEffects}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Letzte System-Events
            </CardTitle>
            <CardDescription>
              Klicken Sie auf ein Event, um Details zu sehen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {eventsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Noch keine Events erfasst</p>
                  <p className="text-xs mt-1">Events werden bei Benutzeraktionen erstellt</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentEvents.map(event => {
                    const outbox = outboxEntries.find(o => o.event_id === event.id);
                    const effects = effectRuns.filter(e => e.event_id === event.id);
                    const isSelected = selectedEventId === event.id;
                    
                    return (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedEventId(isSelected ? null : event.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="font-mono text-xs">
                                {event.event_name}
                              </Badge>
                              <Badge variant="secondary" className="text-xs capitalize">
                                {event.module}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(event.occurred_at), { addSuffix: true, locale: de })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {outbox && (
                              <Badge className={`text-xs ${getStatusColor(outbox.status)}`}>
                                {getStatusIcon(outbox.status)}
                              </Badge>
                            )}
                            {effects.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                {effects.length}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Event Detail View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Event-Flow Details
            </CardTitle>
            <CardDescription>
              {selectedEventId ? 'Vollständiger Event-Verarbeitungsablauf' : 'Wählen Sie ein Event aus'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedEventId ? (
              <div className="text-center py-12 text-muted-foreground">
                <ArrowRight className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Wählen Sie ein Event aus der Liste</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {/* Event Details */}
                  {(() => {
                    const event = recentEvents.find(e => e.id === selectedEventId);
                    if (!event) return null;
                    return (
                      <div className="p-3 rounded-lg border border-primary bg-primary/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-primary" />
                          <span className="font-medium">Event emittiert</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Name:</span> {event.event_name}</p>
                          <p><span className="text-muted-foreground">Modul:</span> {event.module}</p>
                          <p><span className="text-muted-foreground">Entity:</span> {event.entity_type} ({event.entity_id.slice(0, 8)}...)</p>
                          <p><span className="text-muted-foreground">Zeit:</span> {new Date(event.occurred_at).toLocaleString('de-DE')}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Outbox Status */}
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">Outbox</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {selectedOutbox.length === 0 ? (
                    <div className="p-3 rounded-lg border border-dashed text-center text-muted-foreground text-sm">
                      <AlertTriangle className="h-4 w-4 mx-auto mb-1" />
                      Kein Outbox-Eintrag gefunden
                    </div>
                  ) : (
                    selectedOutbox.map(outbox => (
                      <div 
                        key={outbox.id} 
                        className={`p-3 rounded-lg border ${getStatusColor(outbox.status)}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(outbox.status)}
                          <span className="font-medium capitalize">{outbox.status}</span>
                          {outbox.retry_count > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {outbox.retry_count} Retries
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="opacity-70">Erstellt:</span> {new Date(outbox.created_at).toLocaleString('de-DE')}</p>
                          {outbox.processed_at && (
                            <p><span className="opacity-70">Verarbeitet:</span> {new Date(outbox.processed_at).toLocaleString('de-DE')}</p>
                          )}
                          {outbox.last_error && (
                            <p className="text-red-600 text-xs">{outbox.last_error}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}

                  {/* Effects */}
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">Effects ({selectedEffects.length})</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {selectedEffects.length === 0 ? (
                    <div className="p-3 rounded-lg border border-dashed text-center text-muted-foreground text-sm">
                      <Zap className="h-4 w-4 mx-auto mb-1" />
                      Keine Effects ausgeführt
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedEffects.map(effect => (
                        <div 
                          key={effect.id} 
                          className={`p-3 rounded-lg border ${getStatusColor(effect.status)}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(effect.status)}
                              <span className="font-mono text-sm">{effect.effect_type}</span>
                            </div>
                            <Badge className={`text-xs ${getStatusColor(effect.status)}`}>
                              {effect.status}
                            </Badge>
                          </div>
                          <div className="text-xs space-y-1 opacity-70">
                            <p>Gestartet: {new Date(effect.created_at).toLocaleString('de-DE')}</p>
                            {effect.completed_at && (
                              <p>Abgeschlossen: {new Date(effect.completed_at).toLocaleString('de-DE')}</p>
                            )}
                            {effect.error_message && (
                              <p className="text-red-600">{effect.error_message}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}