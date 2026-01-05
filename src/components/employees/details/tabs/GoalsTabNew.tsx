import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployeeGoals } from '@/hooks/employee-tabs/useEmployeeGoals';
import { GoalDialog } from '../dialogs/GoalDialog';
import { Plus, Edit, Trash2, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { GoalFormData } from '@/lib/validations/priority2Schemas';
import { EmployeeTabEditProps } from '@/types/employee-tab-props.types';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GoalsTabNewProps extends EmployeeTabEditProps {}

export const GoalsTabNew = ({ 
  employeeId,
  isEditing: globalIsEditing = false,
  onFieldChange,
  pendingChanges
}: GoalsTabNewProps) => {
  const { goals, statistics, createGoal, updateGoal, deleteGoal, updateProgress } = useEmployeeGoals(employeeId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [progressGoal, setProgressGoal] = useState<any>(null);
  const [newProgress, setNewProgress] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleCreateGoal = async (data: GoalFormData) => {
    await createGoal({
      goal_title: data.goal_title!,
      description: data.description,
      category: data.category!,
      type: data.type!,
      target_value: data.target_value,
      unit: data.unit,
      target_date: data.target_date,
      priority: data.priority!,
      employee_id: employeeId,
      status: 'draft',
    });
  };

  const handleUpdateGoal = async (data: GoalFormData) => {
    if (!selectedGoal) return;
    await updateGoal({
      goalId: selectedGoal.id,
      updates: data,
    });
  };

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;
    await deleteGoal(goalToDelete);
    setDeleteDialogOpen(false);
    setGoalToDelete(null);
  };

  const openEditDialog = (goal: any) => {
    setSelectedGoal(goal);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setSelectedGoal(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const openProgressDialog = (goal: any) => {
    setProgressGoal(goal);
    setNewProgress(goal.current_progress || 0);
    setProgressDialogOpen(true);
  };

  const handleUpdateProgress = async () => {
    if (!progressGoal) return;
    await updateProgress({
      goalId: progressGoal.id,
      updates: { progress: newProgress },
    });
    setProgressDialogOpen(false);
  };

  const getFilteredGoals = () => {
    let filtered = goals;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(g => g.status === statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(g => g.category === categoryFilter);
    }
    
    return filtered;
  };

  const filteredGoals = getFilteredGoals();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      not_started: { label: 'Nicht gestartet', className: 'bg-gray-100 text-gray-800' },
      in_progress: { label: 'Im Plan', className: 'bg-blue-100 text-blue-800' },
      at_risk: { label: 'Gefährdet', className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Erreicht', className: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Abgebrochen', className: 'bg-red-100 text-red-800' },
    };
    const variant = variants[status] || variants.not_started;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      personal: { label: 'Persönlich', className: 'bg-purple-100 text-purple-800' },
      team: { label: 'Team', className: 'bg-blue-100 text-blue-800' },
      company: { label: 'Unternehmen', className: 'bg-green-100 text-green-800' },
      skill: { label: 'Kompetenz', className: 'bg-orange-100 text-orange-800' },
      performance: { label: 'Leistung', className: 'bg-pink-100 text-pink-800' },
      development: { label: 'Entwicklung', className: 'bg-indigo-100 text-indigo-800' },
    };
    const variant = variants[category] || variants.personal;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktive Ziele</p>
              <p className="text-2xl font-bold">{statistics.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Im Plan</p>
              <p className="text-2xl font-bold">{statistics.onTrack}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gefährdet</p>
              <p className="text-2xl font-bold">{statistics.atRisk}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ø Fortschritt</p>
              <p className="text-2xl font-bold">{statistics.avgProgress}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter & Actions */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="in_progress">Im Plan</SelectItem>
              <SelectItem value="at_risk">Gefährdet</SelectItem>
              <SelectItem value="completed">Erreicht</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              <SelectItem value="personal">Persönlich</SelectItem>
              <SelectItem value="team">Team</SelectItem>
              <SelectItem value="company">Unternehmen</SelectItem>
              <SelectItem value="skill">Kompetenz</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Neues Ziel
        </Button>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Keine Ziele gefunden.</p>
          </Card>
        ) : (
          filteredGoals.map((goal) => (
            <Card key={goal.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{goal.goal_title}</h3>
                    {getStatusBadge(goal.status)}
                    {getCategoryBadge(goal.category)}
                  </div>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(goal)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setGoalToDelete(goal.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Fortschritt</span>
                    <span className="font-medium">{goal.progress || 0}%</span>
                  </div>
                  <Progress value={goal.progress || 0} />
                </div>

                <div className="flex justify-between items-center">
                  <div className="grid grid-cols-3 gap-4 text-sm flex-1">
                    {goal.target_value && (
                      <div>
                        <p className="text-muted-foreground">Zielwert</p>
                        <p className="font-medium">
                          {goal.target_value} {goal.unit || ''}
                        </p>
                      </div>
                    )}
                    {goal.target_date && (
                      <div>
                        <p className="text-muted-foreground">Zieldatum</p>
                        <p className="font-medium">
                          {new Date(goal.target_date).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Typ</p>
                      <p className="font-medium uppercase">{goal.type}</p>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openProgressDialog(goal)}
                  >
                    Fortschritt aktualisieren
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <GoalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={dialogMode === 'create' ? handleCreateGoal : handleUpdateGoal}
        goal={selectedGoal}
        mode={dialogMode}
      />

      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fortschritt aktualisieren</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Aktueller Fortschritt: {newProgress}%</Label>
              <Input
                type="range"
                min="0"
                max="100"
                value={newProgress}
                onChange={(e) => setNewProgress(parseInt(e.target.value))}
                className="mt-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setProgressDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleUpdateProgress}>
                Speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ziel löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGoal}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
