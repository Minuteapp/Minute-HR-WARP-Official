import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Sparkles, 
  Play, 
  Pause, 
  Pencil, 
  Trash2, 
  Eye,
  Zap,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Target,
  ListTodo,
  Calendar,
  ClipboardList
} from 'lucide-react';
import { useIncentiveRules } from '@/hooks/useIncentiveRules';
import { CreateIncentiveRuleDialog } from './CreateIncentiveRuleDialog';
import { 
  categoryLabels, 
  categoryColors, 
  frequencyLabels,
  type IncentiveRule 
} from '@/types/incentive-rules';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const categoryIcons: Record<string, any> = {
  performance: TrendingUp,
  goals: Target,
  tasks: ListTodo,
  shifts: Calendar,
  surveys: ClipboardList,
  general: Sparkles
};

export const IncentiveRulesTab = () => {
  const { rules, isLoading, statistics, deleteRule, toggleRuleActive } = useIncentiveRules();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<IncentiveRule | null>(null);

  const handleDelete = async () => {
    if (selectedRule) {
      await deleteRule.mutateAsync(selectedRule.id);
      setDeleteDialogOpen(false);
      setSelectedRule(null);
    }
  };

  const handleToggleActive = async (rule: IncentiveRule) => {
    await toggleRuleActive.mutateAsync({ id: rule.id, is_active: !rule.is_active });
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nie';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-10">Lade Regeln...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Regeln</p>
                <p className="text-2xl font-bold">{statistics?.activeRules || 0}</p>
                <p className="text-xs text-muted-foreground">von {statistics?.totalRules || 0} gesamt</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ausführungen (Gesamt)</p>
                <p className="text-2xl font-bold">{statistics?.totalExecutions || 0}</p>
                <p className="text-xs text-muted-foreground">Automatische Belohnungen</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Automatisierung</p>
                <p className="text-2xl font-bold">{statistics?.automatedPercentage || 0}%</p>
                <p className="text-xs text-muted-foreground">Automatische Regeln</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Budget Impact</p>
                <p className="text-2xl font-bold">{formatCurrency(statistics?.budgetUsed || 0)}</p>
                <p className="text-xs text-muted-foreground">von {formatCurrency(statistics?.budgetTotal || 0)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Incentive-Regeln</h2>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Neue Regel
        </Button>
      </div>

      {/* Rules Grid */}
      {rules.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Incentive-Regeln vorhanden.</p>
            <p className="text-sm">Erstellen Sie Ihre erste automatische Belohnungsregel.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rules.map((rule) => {
            const CategoryIcon = categoryIcons[rule.category] || Sparkles;
            
            return (
              <Card key={rule.id} className={!rule.is_active ? 'opacity-60' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CategoryIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{rule.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {rule.is_automatic && (
                            <Badge variant="secondary" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              Automatisch
                            </Badge>
                          )}
                          <Badge className={`text-xs ${categoryColors[rule.category]}`}>
                            {categoryLabels[rule.category]}
                          </Badge>
                          {rule.is_active ? (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                              Aktiv
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              Pausiert
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Trigger */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Auslöser</p>
                    <p className="text-sm">{rule.trigger_description}</p>
                    {rule.conditions_count > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {rule.conditions_count} Bedingung{rule.conditions_count > 1 ? 'en' : ''}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Aktion</p>
                    <p className="text-sm">{rule.action_description}</p>
                    {rule.action_frequency && (
                      <p className="text-xs text-muted-foreground">
                        {frequencyLabels[rule.action_frequency]}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <span>{rule.execution_count} Ausführungen</span>
                    <span>Zuletzt: {formatDate(rule.last_executed_at)}</span>
                    {rule.budget && (
                      <span>Budget: {formatCurrency(rule.budget_used)} / {formatCurrency(rule.budget)}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Pencil className="h-3 w-3" />
                      Bearbeiten
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => handleToggleActive(rule)}
                    >
                      {rule.is_active ? (
                        <>
                          <Pause className="h-3 w-3" />
                          Pausieren
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3" />
                          Aktivieren
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelectedRule(rule);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1 ml-auto">
                      <Eye className="h-3 w-3" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateIncentiveRuleDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regel löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie die Regel "{selectedRule?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
