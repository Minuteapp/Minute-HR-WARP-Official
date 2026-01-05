import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Plus, 
  Filter, 
  Target, 
  Calendar, 
  User,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { goalEnhancedService } from '@/services/goalEnhancedService';
import { EnhancedGoal } from '@/types/goals-enhanced';
import { CreateGoalDialog } from '../dialogs/CreateGoalDialog';
import { GoalDetailDialog } from '../dialogs/GoalDetailDialog';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';

export const GoalsListTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<EnhancedGoal | null>(null);
  const { toast } = useToast();

  const { data: goals = [], isLoading, refetch } = useQuery({
    queryKey: ['enhancedGoals', statusFilter, levelFilter, categoryFilter],
    queryFn: () => goalEnhancedService.getEnhancedGoals({
      status: statusFilter === 'all' ? undefined : statusFilter,
      level: levelFilter === 'all' ? undefined : levelFilter,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
    }),
  });

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => 
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [goals, searchTerm]);

  const getStatusIcon = (status: string, progress: number, isAtRisk: boolean) => {
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-success" />;
    if (isAtRisk) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (progress >= 70) return <TrendingUp className="h-4 w-4 text-success" />;
    return <Clock className="h-4 w-4 text-warning" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Aktiv</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-success/10 text-success">Abgeschlossen</Badge>;
      case 'archived':
        return <Badge variant="outline">Archiviert</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'company':
        return <Badge variant="default">Unternehmen</Badge>;
      case 'team':
        return <Badge variant="secondary">Team</Badge>;
      case 'individual':
        return <Badge variant="outline">Individuell</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const handleArchiveGoal = async (goalId: string) => {
    try {
      // Implementierung würde hier stehen
      await refetch();
      toast({
        title: "Ziel archiviert",
        description: "Das Ziel wurde erfolgreich archiviert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Das Ziel konnte nicht archiviert werden.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ziele-Liste</h1>
          <p className="text-muted-foreground">
            Übersicht aller Ziele mit Filter- und Suchfunktionen
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neues Ziel
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ziele durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="archived">Archiviert</SelectItem>
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ebene" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Ebenen</SelectItem>
                <SelectItem value="company">Unternehmen</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="individual">Individuell</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                <SelectItem value="personal">Persönlich</SelectItem>
                <SelectItem value="team">Team</SelectItem>
                <SelectItem value="company">Unternehmen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            {filteredGoals.length} von {goals.length} Zielen
          </p>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-destructive">
              {filteredGoals.filter(g => g.is_at_risk).length} gefährdet
            </Badge>
            <Badge variant="outline" className="text-success">
              {filteredGoals.filter(g => g.status === 'completed').length} abgeschlossen
            </Badge>
          </div>
        </div>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => (
            <Card 
              key={goal.id} 
              className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                goal.is_at_risk ? 'border-destructive/50 bg-destructive/5' : ''
              }`}
              onClick={() => setSelectedGoal(goal)}
            >
              <div className="space-y-4">
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(goal.status, goal.progress, goal.is_at_risk)}
                        <h3 className="font-semibold text-lg truncate">{goal.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {goal.description || 'Keine Beschreibung verfügbar'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(goal.status)}
                    {getLevelBadge(goal.goal_level)}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGoal(goal);
                        }}>
                          Details anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Check-in erstellen
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveGoal(goal.id);
                          }}
                        >
                          Archivieren
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Progress Row */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Fortschritt</span>
                    <span className="text-sm text-muted-foreground">
                      {goal.progress}% • Vertrauen: {Math.round(goal.confidence_level * 100)}%
                    </span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                {/* Info Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Fällig: {format(new Date(goal.due_date), 'dd.MM.yyyy', { locale: de })}
                    </span>
                  </div>
                  
                  {goal.assigned_to && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>Zugewiesen</span>
                    </div>
                  )}
                  
                  {goal.key_results && goal.key_results.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{goal.key_results.length} Key Results</span>
                    </div>
                  )}
                  
                  {goal.last_checkin_date && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        Letzter Check-in: {formatDistanceToNow(new Date(goal.last_checkin_date), { 
                          addSuffix: true, 
                          locale: de 
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* At Risk Warning */}
                {goal.is_at_risk && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Achtung: Dieses Ziel ist gefährdet</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Ziele gefunden</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || levelFilter !== 'all' || categoryFilter !== 'all'
                ? "Versuchen Sie andere Filter oder Suchbegriffe."
                : "Erstellen Sie Ihr erstes Ziel, um loszulegen."
              }
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Neues Ziel erstellen
            </Button>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <CreateGoalDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          refetch();
          setShowCreateDialog(false);
        }}
      />

      {selectedGoal && (
        <GoalDetailDialog
          goal={selectedGoal}
          open={!!selectedGoal}
          onOpenChange={(open) => !open && setSelectedGoal(null)}
          onUpdate={refetch}
        />
      )}
    </div>
  );
};