import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSuperadminApi } from '@/hooks/useSuperadminApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Search,
  FileJson,
  FileText,
  Shield,
  Activity,
  Settings,
  Zap,
  Users,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface InventorySummary {
  total_actions: number;
  actions_with_events: number;
  actions_without_events: number;
  total_settings: number;
  settings_enforced: number;
  settings_unenforced: number;
  total_events: number;
  total_effects: number;
  total_triggers: number;
  total_permissions: number;
  defects_p0: number;
  defects_p1: number;
  defects_p2: number;
  unverified_count: number;
}

interface InventoryDefect {
  id: string;
  type: string;
  severity: 'P0' | 'P1' | 'P2';
  component_type: string;
  component_name: string;
  description: string;
  suggested_fix?: string;
}

interface InventoryAction {
  name: string;
  module: string;
  entity_type: string;
  has_event: boolean;
  event_names: string[];
  effect_count: number;
  triggerable_by_roles: string[];
  verification_status: 'verified' | 'unverified' | 'no_event';
}

interface InventorySetting {
  key: string;
  module: string;
  label: string;
  data_type: string;
  enforcement_points: string[];
  has_enforcement: boolean;
  is_defect: boolean;
}

interface SystemInventory {
  generated_at: string;
  version: string;
  scan_duration_ms: number;
  summary: InventorySummary;
  actions: InventoryAction[];
  settings: InventorySetting[];
  events: any[];
  effects: any[];
  triggers: any[];
  permissions: { role: string; permissions: string[] }[];
  defects: InventoryDefect[];
  unverified: { component: string; reason: string }[];
}

export default function SystemIntrospection() {
  const { getSystemInventory, isLoading: apiLoading } = useSuperadminApi();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: inventory, isLoading, refetch, error } = useQuery<SystemInventory>({
    queryKey: ['system-inventory'],
    queryFn: () => getSystemInventory(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleDownloadJson = () => {
    if (!inventory) return;
    const blob = new Blob([JSON.stringify(inventory, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('inventory.json heruntergeladen');
  };

  const handleDownloadMarkdown = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://teydpbqficbdgqovoqlo.supabase.co'}/functions/v1/introspect-system?format=md`,
        {
          headers: {
            'Authorization': `Bearer ${(await import('@/integrations/supabase/client')).supabase.auth.getSession().then(s => s.data.session?.access_token)}`
          }
        }
      );
      const markdown = await response.text();
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('inventory.md heruntergeladen');
    } catch (err) {
      toast.error('Fehler beim Download');
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.info('Scan wird ausgeführt...');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">System-Inventar wird gescannt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Fehler beim Laden</p>
            <p className="text-muted-foreground mb-4">{String(error)}</p>
            <Button onClick={() => refetch()}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!inventory) return null;

  const filteredDefects = inventory.defects.filter(d =>
    d.component_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredActions = inventory.actions.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSettings = inventory.settings.filter(s =>
    s.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">System-Inventarisierung</h1>
          <p className="text-muted-foreground mt-1">
            Vollständige Introspection aller Actions, Settings, Events und Defekte
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Neu scannen
          </Button>
          <Button variant="outline" onClick={handleDownloadJson}>
            <FileJson className="h-4 w-4 mr-2" />
            JSON
          </Button>
          <Button variant="outline" onClick={handleDownloadMarkdown}>
            <FileText className="h-4 w-4 mr-2" />
            Markdown
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{inventory.summary.total_actions}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Actions</p>
            <div className="flex gap-1 mt-2">
              <Badge variant="default" className="text-xs">{inventory.summary.actions_with_events} ✓</Badge>
              <Badge variant="destructive" className="text-xs">{inventory.summary.actions_without_events} ✗</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Settings className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{inventory.summary.total_settings}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Settings</p>
            <div className="flex gap-1 mt-2">
              <Badge variant="default" className="text-xs">{inventory.summary.settings_enforced} ✓</Badge>
              <Badge variant="destructive" className="text-xs">{inventory.summary.settings_unenforced} ✗</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{inventory.summary.total_effects}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Effects</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Clock className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{inventory.summary.total_triggers}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Triggers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-indigo-500" />
              <span className="text-2xl font-bold">{inventory.summary.total_permissions}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Permissions</p>
          </CardContent>
        </Card>

        <Card className={inventory.summary.defects_p0 > 0 ? 'border-destructive' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Shield className={`h-5 w-5 ${inventory.summary.defects_p0 > 0 ? 'text-destructive' : 'text-green-500'}`} />
              <span className="text-2xl font-bold">{inventory.defects.length}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Defekte</p>
            <div className="flex gap-1 mt-2">
              {inventory.summary.defects_p0 > 0 && (
                <Badge variant="destructive" className="text-xs">P0: {inventory.summary.defects_p0}</Badge>
              )}
              {inventory.summary.defects_p1 > 0 && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">P1: {inventory.summary.defects_p1}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meta Info */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Version: <strong>{inventory.version}</strong></span>
            <span>Generiert: <strong>{new Date(inventory.generated_at).toLocaleString('de-DE')}</strong></span>
            <span>Scan-Dauer: <strong>{inventory.scan_duration_ms}ms</strong></span>
            <span>UNVERIFIED: <strong>{inventory.summary.unverified_count}</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suchen in Actions, Settings, Defekten..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="defects" className="relative">
            Defekte
            {inventory.summary.defects_p0 > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
                {inventory.summary.defects_p0}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Actions by Module */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions nach Modul</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {Array.from(new Set(inventory.actions.map(a => a.module))).map(module => {
                    const moduleActions = inventory.actions.filter(a => a.module === module);
                    const withEvents = moduleActions.filter(a => a.has_event).length;
                    const percentage = Math.round((withEvents / moduleActions.length) * 100);
                    
                    return (
                      <div key={module} className="flex items-center justify-between py-2 border-b last:border-0">
                        <span className="font-medium">{module}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${percentage === 100 ? 'bg-green-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-20">
                            {withEvents}/{moduleActions.length} ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Permissions by Role */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Berechtigungen nach Rolle</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {inventory.permissions.map(rp => (
                    <div key={rp.role} className="py-2 border-b last:border-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{rp.role}</span>
                        <Badge variant="outline">{rp.permissions.length}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {rp.permissions.slice(0, 5).map(p => (
                          <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                        ))}
                        {rp.permissions.length > 5 && (
                          <Badge variant="outline" className="text-xs">+{rp.permissions.length - 5}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Defects Tab */}
        <TabsContent value="defects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Defekte ({filteredDefects.length})
              </CardTitle>
              <CardDescription>
                Alle identifizierten Probleme sortiert nach Schweregrad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredDefects.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'Keine Defekte gefunden für diese Suche' : 'Keine Defekte vorhanden'}
                    </div>
                  ) : (
                    filteredDefects
                      .sort((a, b) => {
                        const severityOrder = { P0: 0, P1: 1, P2: 2 };
                        return severityOrder[a.severity] - severityOrder[b.severity];
                      })
                      .map((defect, index) => (
                        <div
                          key={defect.id || index}
                          className={`p-4 rounded-lg border ${
                            defect.severity === 'P0' ? 'border-destructive bg-destructive/5' :
                            defect.severity === 'P1' ? 'border-orange-300 bg-orange-50' :
                            'border-muted'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={defect.severity === 'P0' ? 'destructive' : 'secondary'}>
                                  {defect.severity}
                                </Badge>
                                <Badge variant="outline">{defect.component_type}</Badge>
                                <span className="font-mono text-sm font-medium">{defect.component_name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{defect.description}</p>
                              {defect.suggested_fix && (
                                <p className="text-sm text-blue-600 mt-2">
                                  <strong>Fix:</strong> {defect.suggested_fix}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Actions ({filteredActions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Action</th>
                      <th className="text-left py-2 px-2">Modul</th>
                      <th className="text-left py-2 px-2">Entity</th>
                      <th className="text-center py-2 px-2">Events</th>
                      <th className="text-center py-2 px-2">Effects</th>
                      <th className="text-center py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActions.map((action, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 px-2 font-mono text-sm">{action.name}</td>
                        <td className="py-2 px-2">{action.module}</td>
                        <td className="py-2 px-2">{action.entity_type}</td>
                        <td className="py-2 px-2 text-center">{action.event_names.length}</td>
                        <td className="py-2 px-2 text-center">{action.effect_count}</td>
                        <td className="py-2 px-2 text-center">
                          {action.has_event ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings ({filteredSettings.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Key</th>
                      <th className="text-left py-2 px-2">Modul</th>
                      <th className="text-left py-2 px-2">Label</th>
                      <th className="text-left py-2 px-2">Typ</th>
                      <th className="text-left py-2 px-2">Enforcement</th>
                      <th className="text-center py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSettings.map((setting, index) => (
                      <tr key={index} className={`border-b last:border-0 hover:bg-muted/50 ${setting.is_defect ? 'bg-destructive/5' : ''}`}>
                        <td className="py-2 px-2 font-mono text-sm">{setting.key}</td>
                        <td className="py-2 px-2">{setting.module}</td>
                        <td className="py-2 px-2">{setting.label}</td>
                        <td className="py-2 px-2">{setting.data_type}</td>
                        <td className="py-2 px-2">
                          <div className="flex gap-1 flex-wrap">
                            {setting.enforcement_points.length > 0 ? (
                              setting.enforcement_points.map(ep => (
                                <Badge key={ep} variant="outline" className="text-xs">{ep}</Badge>
                              ))
                            ) : (
                              <Badge variant="destructive" className="text-xs">Keine</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          {setting.has_enforcement ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects">
          <Card>
            <CardHeader>
              <CardTitle>Effects ({inventory.effects.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Effect</th>
                      <th className="text-left py-2 px-2">Kategorie</th>
                      <th className="text-center py-2 px-2">Trigger-Events</th>
                      <th className="text-center py-2 px-2">Async</th>
                      <th className="text-center py-2 px-2">Aktiv</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.effects.map((effect, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 px-2 font-mono text-sm">{effect.name}</td>
                        <td className="py-2 px-2">{effect.category}</td>
                        <td className="py-2 px-2 text-center">{effect.trigger_events?.length || 0}</td>
                        <td className="py-2 px-2 text-center">
                          {effect.is_async ? <Zap className="h-4 w-4 text-yellow-500 mx-auto" /> : '-'}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {effect.is_active ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
