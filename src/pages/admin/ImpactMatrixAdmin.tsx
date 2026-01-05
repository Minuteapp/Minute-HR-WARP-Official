/**
 * Impact Matrix Admin
 * 
 * Admin-Oberfläche zur Verwaltung der Event-Effect-Zuordnungen.
 * Ermöglicht das Aktivieren/Deaktivieren von Effects und das Anpassen von Prioritäten.
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Plus, Settings, Zap, Bell, CheckSquare, GitBranch, RefreshCw, BarChart, Shield, Users } from "lucide-react";

interface ImpactMatrixEntry {
  id: string;
  action_name: string;
  effect_type: string;
  effect_category: string;
  target_resolution_rule: Record<string, unknown>;
  conditions: Record<string, unknown> | null;
  priority: string;
  execution_mode: string;
  retry_policy: Record<string, unknown>;
  failure_handling: string;
  is_active: boolean;
  is_tenant_customizable: boolean;
}

interface ActionRegistryEntry {
  id: string;
  action_name: string;
  module: string;
  entity_type: string;
  description: string | null;
  description_de: string | null;
}

interface EffectType {
  effect_type: string;
  category: string;
  description: string | null;
  description_de: string | null;
}

const PRIORITY_OPTIONS = ["P0", "P1", "P2", "P3"];
const EXECUTION_MODE_OPTIONS = ["sync", "async"];
const FAILURE_HANDLING_OPTIONS = ["retry", "skip", "escalate", "dead_letter"];

const CATEGORY_ICONS: Record<string, typeof Zap> = {
  ui: RefreshCw,
  notification: Bell,
  task: CheckSquare,
  workflow: GitBranch,
  analytics: BarChart,
  compliance: Shield,
  access: Users,
};

export default function ImpactMatrixAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch impact matrix entries
  const { data: matrixEntries = [], isLoading: isLoadingMatrix } = useQuery({
    queryKey: ["impact-matrix"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("impact_matrix")
        .select("*")
        .order("action_name", { ascending: true });
      if (error) throw error;
      return data as ImpactMatrixEntry[];
    },
  });

  // Fetch action registry for available actions
  const { data: actions = [] } = useQuery({
    queryKey: ["action-registry"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("action_registry")
        .select("*")
        .eq("is_active", true)
        .order("module", { ascending: true });
      if (error) throw error;
      return data as ActionRegistryEntry[];
    },
  });

  // Fetch effect types
  const { data: effectTypes = [] } = useQuery({
    queryKey: ["effect-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("effect_types")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });
      if (error) throw error;
      return data as EffectType[];
    },
  });

  // Get unique modules from actions
  const modules = useMemo(() => {
    const moduleSet = new Set(actions.map(a => a.module));
    return Array.from(moduleSet).sort();
  }, [actions]);

  // Get unique categories from effect types
  const categories = useMemo(() => {
    const categorySet = new Set(effectTypes.map(e => e.category));
    return Array.from(categorySet).sort();
  }, [effectTypes]);

  // Filter matrix entries
  const filteredEntries = useMemo(() => {
    return matrixEntries.filter(entry => {
      const matchesSearch = 
        entry.action_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.effect_type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModule = selectedModule === "all" || entry.action_name.startsWith(`${selectedModule}.`);
      const matchesCategory = selectedCategory === "all" || entry.effect_category === selectedCategory;
      return matchesSearch && matchesModule && matchesCategory;
    });
  }, [matrixEntries, searchQuery, selectedModule, selectedCategory]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ImpactMatrixEntry> }) => {
      const { error } = await supabase
        .from("impact_matrix")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["impact-matrix"] });
      toast.success("Eintrag aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  // Toggle active status
  const handleToggleActive = (entry: ImpactMatrixEntry) => {
    updateMutation.mutate({
      id: entry.id,
      updates: { is_active: !entry.is_active },
    });
  };

  // Update priority
  const handlePriorityChange = (entry: ImpactMatrixEntry, priority: string) => {
    updateMutation.mutate({
      id: entry.id,
      updates: { priority },
    });
  };

  // Update execution mode
  const handleExecutionModeChange = (entry: ImpactMatrixEntry, execution_mode: string) => {
    updateMutation.mutate({
      id: entry.id,
      updates: { execution_mode },
    });
  };

  // Update failure handling
  const handleFailureHandlingChange = (entry: ImpactMatrixEntry, failure_handling: string) => {
    updateMutation.mutate({
      id: entry.id,
      updates: { failure_handling },
    });
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent = CATEGORY_ICONS[category] || Zap;
    return <IconComponent className="h-4 w-4" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "P0": return "bg-red-500";
      case "P1": return "bg-orange-500";
      case "P2": return "bg-yellow-500";
      case "P3": return "bg-green-500";
      default: return "bg-muted";
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Impact Matrix</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Event-Effect-Zuordnungen
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neue Zuordnung
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Neue Effect-Zuordnung</DialogTitle>
              <DialogDescription>
                Verknüpfen Sie eine Aktion mit einem Effect
              </DialogDescription>
            </DialogHeader>
            <AddMatrixEntryForm
              actions={actions}
              effectTypes={effectTypes}
              onSuccess={() => {
                setIsAddDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["impact-matrix"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{matrixEntries.length}</p>
              </div>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktiv</p>
                <p className="text-2xl font-bold text-green-600">
                  {matrixEntries.filter(e => e.is_active).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Module</p>
                <p className="text-2xl font-bold">{modules.length}</p>
              </div>
              <GitBranch className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Effect-Typen</p>
                <p className="text-2xl font-bold">{effectTypes.length}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suchen nach Action oder Effect..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Modul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Module</SelectItem>
                {modules.map(module => (
                  <SelectItem key={module} value={module}>
                    {module}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Matrix Table */}
      <Card>
        <CardHeader>
          <CardTitle>Effect-Zuordnungen ({filteredEntries.length})</CardTitle>
          <CardDescription>
            Klicken Sie auf die Schalter und Dropdowns, um Einstellungen anzupassen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMatrix ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aktiv</TableHead>
                    <TableHead>Aktion</TableHead>
                    <TableHead>Effect</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Priorität</TableHead>
                    <TableHead>Modus</TableHead>
                    <TableHead>Fehlerbehandlung</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry) => (
                    <TableRow key={entry.id} className={!entry.is_active ? "opacity-50" : ""}>
                      <TableCell>
                        <Switch
                          checked={entry.is_active}
                          onCheckedChange={() => handleToggleActive(entry)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {entry.action_name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {entry.effect_type}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {getCategoryIcon(entry.effect_category)}
                          {entry.effect_category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.priority}
                          onValueChange={(val) => handlePriorityChange(entry, val)}
                        >
                          <SelectTrigger className="w-[80px]">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(entry.priority)}`} />
                              <span>{entry.priority}</span>
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map(p => (
                              <SelectItem key={p} value={p}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(p)}`} />
                                  {p}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.execution_mode}
                          onValueChange={(val) => handleExecutionModeChange(entry, val)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EXECUTION_MODE_OPTIONS.map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={entry.failure_handling}
                          onValueChange={(val) => handleFailureHandlingChange(entry, val)}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FAILURE_HANDLING_OPTIONS.map(f => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Keine Einträge gefunden
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Add Entry Form Component
function AddMatrixEntryForm({
  actions,
  effectTypes,
  onSuccess,
}: {
  actions: ActionRegistryEntry[];
  effectTypes: EffectType[];
  onSuccess: () => void;
}) {
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedEffect, setSelectedEffect] = useState("");
  const [priority, setPriority] = useState("P1");
  const [executionMode, setExecutionMode] = useState("async");
  const [failureHandling, setFailureHandling] = useState("retry");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedEffectType = effectTypes.find(e => e.effect_type === selectedEffect);

  const handleSubmit = async () => {
    if (!selectedAction || !selectedEffect) {
      toast.error("Bitte wählen Sie eine Aktion und einen Effect aus");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("impact_matrix").insert({
        action_name: selectedAction,
        effect_type: selectedEffect,
        effect_category: selectedEffectType?.category || "notification",
        target_resolution_rule: { type: "actor" },
        priority,
        execution_mode: executionMode,
        retry_policy: { max_attempts: 3, backoff: "exponential" },
        failure_handling: failureHandling,
      });

      if (error) throw error;

      toast.success("Zuordnung erstellt");
      onSuccess();
    } catch (error) {
      toast.error(`Fehler: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Aktion</Label>
        <Select value={selectedAction} onValueChange={setSelectedAction}>
          <SelectTrigger>
            <SelectValue placeholder="Aktion auswählen..." />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {actions.map(action => (
              <SelectItem key={action.id} value={action.action_name}>
                <div className="flex flex-col">
                  <span className="font-mono text-sm">{action.action_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {action.description_de || action.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Effect</Label>
        <Select value={selectedEffect} onValueChange={setSelectedEffect}>
          <SelectTrigger>
            <SelectValue placeholder="Effect auswählen..." />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {effectTypes.map(effect => (
              <SelectItem key={effect.effect_type} value={effect.effect_type}>
                <div className="flex flex-col">
                  <span className="font-mono text-sm">{effect.effect_type}</span>
                  <span className="text-xs text-muted-foreground">
                    {effect.description_de || effect.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Priorität</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Modus</Label>
          <Select value={executionMode} onValueChange={setExecutionMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXECUTION_MODE_OPTIONS.map(m => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Fehlerbehandlung</Label>
          <Select value={failureHandling} onValueChange={setFailureHandling}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FAILURE_HANDLING_OPTIONS.map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Erstelle..." : "Erstellen"}
        </Button>
      </DialogFooter>
    </div>
  );
}
