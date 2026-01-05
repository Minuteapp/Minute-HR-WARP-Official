import React, { useState } from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { useObjectivesDashboard, useObjectives } from '@/hooks/useObjectives';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { ObjectiveFilters } from '@/types/objectives';
import { CreateObjectiveWizard } from '@/components/objectives/CreateObjectiveWizard';
import { ObjectiveCard } from '@/components/objectives/ObjectiveCard';
import { ObjectivesHeatmap } from '@/components/objectives/ObjectivesHeatmap';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';

const ObjectivesPage = () => {
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [filters, setFilters] = useState<ObjectiveFilters>({});
  const [activeView, setActiveView] = useState<'grid' | 'list' | 'heatmap'>('grid');

  const { data: dashboardData, isLoading: dashboardLoading } = useObjectivesDashboard();
  const { data: objectives, isLoading: objectivesLoading } = useObjectives(filters);
  
  const { hasAction } = useEnterprisePermissions();
  
  // Berechtigungen basierend auf Rolle
  const canCreateGoal = hasAction('goals', 'create') || hasAction('goals', 'update');
  const canViewHeatmap = hasAction('goals', 'update') || hasAction('goals', 'approve');

  const handleFilterChange = (key: keyof ObjectiveFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore < 30) return 'text-success';
    if (riskScore < 60) return 'text-warning';
    if (riskScore < 80) return 'text-destructive';
    return 'text-destructive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'default';
      case 'on_hold': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <>
      <StandardPageLayout
        title="Ziele"
        subtitle="Objectives, Key Results und KPIs verwalten"
      >
        <div className="space-y-6">
          {/* Dashboard Stats */}
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Aktive Ziele</p>
                    <p className="text-2xl font-bold">{dashboardData.active_objectives}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Abgeschlossen</p>
                    <p className="text-2xl font-bold">{dashboardData.completed_objectives}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Risiko</p>
                    <p className="text-2xl font-bold">{dashboardData.at_risk_objectives}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ø Fortschritt</p>
                    <p className="text-2xl font-bold">{dashboardData.avg_progress}%</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Filters and Actions */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ziele durchsuchen..."
                  className="pl-10"
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <Select value={filters.status?.[0] || ''} onValueChange={(value) => handleFilterChange('status', value ? [value] : undefined)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Status</SelectItem>
                  <SelectItem value="draft">Entwurf</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="on_hold">Pausiert</SelectItem>
                  <SelectItem value="cancelled">Abgebrochen</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priority?.[0] || ''} onValueChange={(value) => handleFilterChange('priority', value ? [value] : undefined)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Priorität wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Alle Prioritäten</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="critical">Kritisch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {canCreateGoal && (
              <Button onClick={() => setShowCreateWizard(true)} className="shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Neues Ziel
              </Button>
            )}
          </div>

          {/* View Tabs */}
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
            <TabsList>
              <TabsTrigger value="grid">Karten</TabsTrigger>
              <TabsTrigger value="list">Liste</TabsTrigger>
              {canViewHeatmap && (
                <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="grid" className="space-y-4">
              {objectivesLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="h-48 animate-pulse bg-muted" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {objectives?.map((objective) => (
                    <ObjectiveCard key={objective.id} objective={objective} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Titel</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Fortschritt</th>
                        <th className="text-left p-4">Risiko</th>
                        <th className="text-left p-4">Zeitraum</th>
                        <th className="text-left p-4">Priorität</th>
                      </tr>
                    </thead>
                    <tbody>
                      {objectives?.map((objective) => (
                        <tr key={objective.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{objective.title}</p>
                              <p className="text-sm text-muted-foreground">{objective.description}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant={getStatusColor(objective.status)}>
                              {objective.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Progress value={objective.progress} className="w-20" />
                              <span className="text-sm">{objective.progress}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`text-sm font-medium ${getRiskColor(objective.risk_score)}`}>
                              {objective.risk_score}%
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">
                              {new Date(objective.period_start).toLocaleDateString()} - 
                              {new Date(objective.period_end).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">
                              {objective.priority}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            {canViewHeatmap && (
              <TabsContent value="heatmap" className="space-y-4">
                <ObjectivesHeatmap objectives={objectives || []} />
              </TabsContent>
            )}
          </Tabs>

          {objectives?.length === 0 && !objectivesLoading && (
            <Card className="p-12 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Ziele gefunden</h3>
              <p className="text-muted-foreground mb-4">
                Erstellen Sie Ihr erstes Ziel, um loszulegen.
              </p>
              {canCreateGoal && (
                <Button onClick={() => setShowCreateWizard(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Erstes Ziel erstellen
                </Button>
              )}
            </Card>
          )}
        </div>
      </StandardPageLayout>

      {/* Create Wizard Modal */}
      {showCreateWizard && (
        <CreateObjectiveWizard
          open={showCreateWizard}
          onClose={() => setShowCreateWizard(false)}
        />
      )}
    </>
  );
};

export default ObjectivesPage;