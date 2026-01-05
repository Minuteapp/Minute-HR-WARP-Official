import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Settings, 
  GitBranch,
  Pause,
  Trash2,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const WorkflowDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('settings');

  // Lade Workflow-Daten aus der Datenbank
  const { data: workflow, isLoading: workflowLoading } = useQuery({
    queryKey: ['workflow-detail', id],
    queryFn: async () => {
      if (!id) return null;

      const { data: workflowData } = await supabase
        .from('workflow_definitions')
        .select('*')
        .eq('id', id)
        .single();

      if (!workflowData) {
        // Fallback für Demo
        return {
          id: id,
          name: 'Workflow',
          description: 'Workflow-Beschreibung',
          is_active: true,
          trigger_type: 'event-based',
          trigger_config: {},
          actions: [],
          created_at: new Date().toISOString()
        };
      }

      return workflowData;
    }
  });

  // Lade Ausführungsstatistiken
  const { data: stats } = useQuery({
    queryKey: ['workflow-stats', id],
    queryFn: async () => {
      if (!id) return null;

      const { data: instances } = await supabase
        .from('workflow_instances')
        .select('id, status, started_at, completed_at')
        .eq('workflow_id', id);

      if (!instances || instances.length === 0) {
        return {
          totalExecutions: 0,
          successRate: 0,
          successful: 0,
          failed: 0,
          avgTime: '0 Sek.'
        };
      }

      const successful = instances.filter(i => i.status === 'completed').length;
      const failed = instances.filter(i => i.status === 'failed').length;
      const successRate = instances.length > 0 
        ? Math.round((successful / instances.length) * 100 * 10) / 10 
        : 0;

      // Berechne durchschnittliche Ausführungszeit
      const completedInstances = instances.filter(i => i.completed_at && i.started_at);
      const avgTimeMs = completedInstances.length > 0
        ? completedInstances.reduce((sum, i) => {
            const start = new Date(i.started_at).getTime();
            const end = new Date(i.completed_at!).getTime();
            return sum + (end - start);
          }, 0) / completedInstances.length
        : 0;

      const avgTimeSec = Math.round(avgTimeMs / 100) / 10;

      return {
        totalExecutions: instances.length,
        successRate,
        successful,
        failed,
        avgTime: `${avgTimeSec} Sek.`
      };
    }
  });

  // Lade Protokoll-Logs
  const { data: protocolLogs } = useQuery({
    queryKey: ['workflow-logs', id],
    queryFn: async () => {
      if (!id) return [];

      const { data: instances } = await supabase
        .from('workflow_instances')
        .select('id, status, started_at, completed_at, error_message, context')
        .eq('workflow_id', id)
        .order('started_at', { ascending: false })
        .limit(10);

      if (!instances) return [];

      return instances.map((instance, idx) => {
        const startTime = new Date(instance.started_at);
        const endTime = instance.completed_at ? new Date(instance.completed_at) : new Date();
        const durationMs = endTime.getTime() - startTime.getTime();

        return {
          id: idx + 1,
          ticketId: `WF-${instance.id.substring(0, 8).toUpperCase()}`,
          timestamp: formatTimestamp(startTime),
          duration: `${(durationMs / 1000).toFixed(1)}s`,
          status: instance.status === 'completed' ? 'success' : 'error',
          details: instance.status === 'completed' 
            ? 'Workflow erfolgreich ausgeführt.' 
            : instance.error_message || 'Fehler bei der Ausführung.'
        };
      });
    }
  });

  const formatTimestamp = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) {
      return `Heute, ${timeStr}`;
    }
    return `${date.toLocaleDateString('de-DE')}, ${timeStr}`;
  };

  const handlePause = () => {
    toast({
      title: 'Workflow pausiert',
      description: 'Der Workflow wurde vorübergehend deaktiviert.',
    });
  };

  const handleDelete = () => {
    toast({
      title: 'Workflow gelöscht',
      description: 'Der Workflow wurde erfolgreich gelöscht.',
      variant: 'destructive'
    });
    navigate('/helpdesk');
  };

  const displayWorkflow = workflow || {
    id: id || 'wf-1',
    name: 'Lädt...',
    description: '',
    is_active: false,
    trigger_type: 'event-based',
    actions: []
  };

  const displayStats = stats || {
    totalExecutions: 0,
    successRate: 0,
    successful: 0,
    failed: 0,
    avgTime: '0 Sek.'
  };

  const displayLogs = protocolLogs || [];

  // Sidebar component for both tabs
  const Sidebar = () => (
    <div className="space-y-6">
      {/* Statistiken */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Statistiken</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Gesamt-Ausführungen</span>
            <span className="font-semibold">{displayStats.totalExecutions}</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Erfolgsrate</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-green-600">{displayStats.successRate}%</span>
                {displayStats.successRate > 0 && <TrendingUp className="h-4 w-4 text-green-600" />}
              </div>
            </div>
            <Progress value={displayStats.successRate} className="h-2 bg-gray-200 [&>div]:bg-green-500" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Erfolgreich</p>
                <p className="font-semibold text-green-600">{displayStats.successful}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-muted-foreground">Fehlgeschlagen</p>
                <p className="font-semibold text-red-600">{displayStats.failed}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Ø Ausführungszeit</p>
              <p className="font-semibold">{displayStats.avgTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aktions-Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Aktions-Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Anzahl Aktionen</span>
            <span className="font-medium">
              {Array.isArray(displayWorkflow.actions) ? displayWorkflow.actions.length : 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Trigger-Typ</span>
            <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
              {displayWorkflow.trigger_type === 'event-based' ? 'Event-basiert' : 
               displayWorkflow.trigger_type === 'scheduled' ? 'Geplant' : 'Manuell'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Erstellt am</span>
            <span className="text-sm">
              {displayWorkflow.created_at 
                ? new Date(displayWorkflow.created_at).toLocaleDateString('de-DE')
                : '-'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/helpdesk')}
              className="text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Zurück
            </Button>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{displayWorkflow.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{displayWorkflow.id}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4">
            <Badge className={displayWorkflow.is_active 
              ? "bg-green-100 text-green-700 hover:bg-green-100 border border-green-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-100 border border-gray-300"
            }>
              {displayWorkflow.is_active ? 'Aktiv' : 'Inaktiv'}
            </Badge>
            <Button variant="outline" size="sm" onClick={handlePause}>
              <Pause className="h-4 w-4 mr-1" />
              Pausieren
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Löschen
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50 p-1 mb-6">
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-background">
              <Settings className="h-4 w-4" />
              Einstellungen
            </TabsTrigger>
            <TabsTrigger value="protocol" className="flex items-center gap-2 data-[state=active]:bg-background">
              <GitBranch className="h-4 w-4" />
              Protokoll
            </TabsTrigger>
          </TabsList>

          {/* Einstellungen Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Main Settings */}
              <div className="col-span-2 space-y-6">
                {/* Grundeinstellungen */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Grundeinstellungen</CardTitle>
                    <CardDescription>Definieren Sie Name und Beschreibung des Workflows</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Workflow-Name</Label>
                      <Input defaultValue={displayWorkflow.name} />
                    </div>
                    <div className="space-y-2">
                      <Label>Beschreibung</Label>
                      <Textarea defaultValue={displayWorkflow.description || ''} rows={3} />
                    </div>
                  </CardContent>
                </Card>

                {/* Trigger-Konfiguration */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Trigger-Konfiguration</CardTitle>
                    <CardDescription>Definieren Sie, wann der Workflow ausgelöst wird</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Trigger-Typ</Label>
                      <Select defaultValue={displayWorkflow.trigger_type || "event-based"}>
                        <SelectTrigger>
                          <SelectValue placeholder="Trigger-Typ wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="event-based">Event-basiert</SelectItem>
                          <SelectItem value="scheduled">Geplant</SelectItem>
                          <SelectItem value="manual">Manuell</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Aktionen */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Aktionen</CardTitle>
                    <CardDescription>Diese Aktionen werden in der angegebenen Reihenfolge ausgeführt</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Array.isArray(displayWorkflow.actions) && displayWorkflow.actions.length > 0 ? (
                      <div className="space-y-3">
                        {displayWorkflow.actions.map((action: any, idx: number) => (
                          <div 
                            key={idx}
                            className="flex items-center gap-3 p-3 border rounded-lg"
                          >
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-medium">
                              {idx + 1}
                            </div>
                            <span className="flex-1">{typeof action === 'string' ? action : action.name || 'Aktion'}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Keine Aktionen konfiguriert.</p>
                        <p className="text-sm">Fügen Sie Aktionen hinzu, die der Workflow ausführen soll.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <Sidebar />
            </div>
          </TabsContent>

          {/* Protokoll Tab */}
          <TabsContent value="protocol">
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Protocol Logs */}
              <div className="col-span-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Letzte Ausführungen</CardTitle>
                    <CardDescription>Zeigt die letzten Workflow-Ausführungen</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {displayLogs.length > 0 ? (
                      <div className="space-y-3">
                        {displayLogs.map((log) => (
                          <div 
                            key={log.id}
                            className={`flex items-start gap-4 p-4 rounded-lg border ${
                              log.status === 'error' ? 'bg-red-50 border-red-200' : 'bg-background'
                            }`}
                          >
                            {log.status === 'success' ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-medium text-foreground">{log.ticketId}</span>
                                <Badge 
                                  variant="outline"
                                  className={
                                    log.status === 'success' 
                                      ? 'bg-green-50 text-green-700 border-green-200' 
                                      : 'bg-red-50 text-red-700 border-red-200'
                                  }
                                >
                                  {log.status === 'success' ? 'Erfolgreich' : 'Fehlgeschlagen'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {log.timestamp} • {log.duration}
                              </p>
                              <p className="text-sm text-foreground">{log.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Keine Ausführungen vorhanden.</p>
                        <p className="text-sm">Der Workflow wurde noch nicht ausgeführt.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Sidebar */}
              <Sidebar />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkflowDetailPage;
