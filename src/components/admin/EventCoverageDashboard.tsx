import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  TrendingUp,
  Zap,
  XCircle,
  Radio
} from "lucide-react";
import { EventLiveMonitor } from "./monitoring/EventLiveMonitor";

interface ActionRegistry {
  action_name: string;
  module: string;
  entity_type: string;
  is_active: boolean;
  description_de: string | null;
}

interface ImpactMatrixEntry {
  action_name: string;
  effect_type: string;
  effect_category: string;
  priority: string;
  is_active: boolean;
}

interface EffectType {
  effect_type: string;
  category: string;
  is_active: boolean;
}

interface EventMetrics {
  event_name: string;
  event_count: number;
}

interface EffectRun {
  status: string;
  effect_type: string;
}

export function EventCoverageDashboard() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Fetch all registered actions
  const { data: actions = [] } = useQuery<ActionRegistry[]>({
    queryKey: ['action-registry'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('action_registry')
        .select('action_name, module, entity_type, is_active, description_de')
        .order('module', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch impact matrix mappings
  const { data: impactMatrix = [] } = useQuery<ImpactMatrixEntry[]>({
    queryKey: ['impact-matrix'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('impact_matrix')
        .select('action_name, effect_type, effect_category, priority, is_active');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch effect types
  const { data: effectTypes = [] } = useQuery<EffectType[]>({
    queryKey: ['effect-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('effect_types')
        .select('effect_type, category, is_active');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch recent event metrics
  const { data: eventMetrics = [] } = useQuery<EventMetrics[]>({
    queryKey: ['event-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_metrics')
        .select('event_name, event_count')
        .order('event_count', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch effect run statistics
  const { data: effectRuns = [] } = useQuery<EffectRun[]>({
    queryKey: ['effect-runs-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('effect_runs')
        .select('status, effect_type')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate statistics
  const totalActions = actions.length;
  const activeActions = actions.filter(a => a.is_active).length;
  const actionsWithEffects = new Set(impactMatrix.map(m => m.action_name)).size;
  const coveragePercent = totalActions > 0 ? Math.round((actionsWithEffects / totalActions) * 100) : 0;

  const totalEffectTypes = effectTypes.length;
  const usedEffectTypes = new Set(impactMatrix.map(m => m.effect_type)).size;
  const effectCoverage = totalEffectTypes > 0 ? Math.round((usedEffectTypes / totalEffectTypes) * 100) : 0;

  const totalMappings = impactMatrix.length;
  const activeMappings = impactMatrix.filter(m => m.is_active).length;

  const successfulRuns = effectRuns.filter(r => r.status === 'completed').length;
  const failedRuns = effectRuns.filter(r => r.status === 'failed').length;
  const successRate = effectRuns.length > 0 ? Math.round((successfulRuns / effectRuns.length) * 100) : 100;

  // Group actions by module
  const modules = [...new Set(actions.map(a => a.module))];
  const actionsByModule = modules.map(module => ({
    module,
    actions: actions.filter(a => a.module === module),
    mappingsCount: impactMatrix.filter(m => 
      actions.find(a => a.action_name === m.action_name && a.module === module)
    ).length
  }));

  // Effects by category
  const effectCategories = [...new Set(effectTypes.map(e => e.category))];
  const effectsByCategory = effectCategories.map(category => ({
    category,
    types: effectTypes.filter(e => e.category === category),
    usedCount: impactMatrix.filter(m => 
      effectTypes.find(e => e.effect_type === m.effect_type && e.category === category)
    ).length
  }));

  // Actions without effects (gaps)
  const actionsWithoutEffects = actions.filter(a => 
    !impactMatrix.some(m => m.action_name === a.action_name)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Event-System Coverage</h2>
          <p className="text-muted-foreground">
            Übersicht über registrierte Actions, Effect-Mappings und Ausführungsstatistiken
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions Coverage</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coveragePercent}%</div>
            <Progress value={coveragePercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {actionsWithEffects} von {totalActions} Actions haben Mappings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Effect Types Nutzung</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{effectCoverage}%</div>
            <Progress value={effectCoverage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {usedEffectTypes} von {totalEffectTypes} Effect Types genutzt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact Mappings</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMappings}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeMappings} aktiv, {totalMappings - activeMappings} inaktiv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erfolgsrate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="text-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {successfulRuns}
              </Badge>
              <Badge variant="outline" className="text-red-600">
                <XCircle className="h-3 w-3 mr-1" />
                {failedRuns}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">
            <Radio className="h-4 w-4 mr-1" />
            Live Monitor
          </TabsTrigger>
          <TabsTrigger value="modules">Module</TabsTrigger>
          <TabsTrigger value="effects">Effect Types</TabsTrigger>
          <TabsTrigger value="gaps">Lücken</TabsTrigger>
          <TabsTrigger value="recent">Letzte Events</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <EventLiveMonitor />
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {actionsByModule.map(({ module, actions: moduleActions, mappingsCount }) => (
              <Card 
                key={module} 
                className={`cursor-pointer transition-colors ${selectedModule === module ? 'border-primary' : ''}`}
                onClick={() => setSelectedModule(selectedModule === module ? null : module)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg capitalize">{module}</CardTitle>
                  <CardDescription>
                    {moduleActions.length} Actions, {mappingsCount} Mappings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {moduleActions.slice(0, 5).map(action => (
                      <Badge 
                        key={action.action_name} 
                        variant={impactMatrix.some(m => m.action_name === action.action_name) ? "default" : "outline"}
                        className="text-xs"
                      >
                        {action.action_name.split('.')[1]}
                      </Badge>
                    ))}
                    {moduleActions.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{moduleActions.length - 5}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedModule && (
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{selectedModule} Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead>Effects</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actions
                      .filter(a => a.module === selectedModule)
                      .map(action => {
                        const effects = impactMatrix.filter(m => m.action_name === action.action_name);
                        return (
                          <TableRow key={action.action_name}>
                            <TableCell className="font-mono text-sm">{action.action_name}</TableCell>
                            <TableCell className="text-muted-foreground">{action.description_de || '-'}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {effects.map(e => (
                                  <Badge key={e.effect_type} variant="outline" className="text-xs">
                                    {e.effect_type}
                                  </Badge>
                                ))}
                                {effects.length === 0 && (
                                  <span className="text-muted-foreground text-xs">Keine</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {effects.length > 0 ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="effects" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {effectsByCategory.map(({ category, types, usedCount }) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="capitalize">{category}</CardTitle>
                  <CardDescription>
                    {usedCount} von {types.length} Effect Types in Verwendung
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {types.map(type => {
                      const usageCount = impactMatrix.filter(m => m.effect_type === type.effect_type).length;
                      return (
                        <div key={type.effect_type} className="flex items-center justify-between">
                          <span className="font-mono text-sm">{type.effect_type}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={usageCount > 0 ? "default" : "secondary"}>
                              {usageCount}x
                            </Badge>
                            {type.is_active ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Actions ohne Effect-Mappings
              </CardTitle>
              <CardDescription>
                Diese Actions emittieren Events, haben aber keine konfigurierten Effekte
              </CardDescription>
            </CardHeader>
            <CardContent>
              {actionsWithoutEffects.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Alle Actions haben mindestens ein Effect-Mapping!</span>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Modul</TableHead>
                        <TableHead>Entity Type</TableHead>
                        <TableHead>Beschreibung</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {actionsWithoutEffects.map(action => (
                        <TableRow key={action.action_name}>
                          <TableCell className="font-mono text-sm">{action.action_name}</TableCell>
                          <TableCell className="capitalize">{action.module}</TableCell>
                          <TableCell>{action.entity_type}</TableCell>
                          <TableCell className="text-muted-foreground">{action.description_de || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Häufigste Events
              </CardTitle>
              <CardDescription>
                Die am häufigsten ausgelösten Events basierend auf event_metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventMetrics.length === 0 ? (
                <div className="text-muted-foreground text-center py-8">
                  Noch keine Event-Metriken erfasst. Events werden nach Ausführung hier angezeigt.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Name</TableHead>
                      <TableHead className="text-right">Anzahl</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventMetrics.map(metric => (
                      <TableRow key={metric.event_name}>
                        <TableCell className="font-mono text-sm">{metric.event_name}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{metric.event_count}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
