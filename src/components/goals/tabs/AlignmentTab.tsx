import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  GitBranch, 
  Target, 
  TrendingUp, 
  AlertCircle,
  Users,
  Building2
} from 'lucide-react';
import { goalEnhancedService } from '@/services/goalEnhancedService';
import { AlignmentTreeNode } from '@/types/goals-enhanced';
import { AlignmentTreeView } from '../components/AlignmentTreeView';
import { CreateGoalDialog } from '../dialogs/CreateGoalDialog';
import { useToast } from '@/components/ui/use-toast';

export const AlignmentTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const { data: alignmentTree = [], isLoading, refetch } = useQuery({
    queryKey: ['alignmentTree'],
    queryFn: () => goalEnhancedService.getAlignmentTree(),
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['goalsDashboard', 'org'],
    queryFn: () => goalEnhancedService.getDashboardData('org'),
  });

  const handleAlignGoal = useCallback(async (goalId: string, parentGoalId: string) => {
    try {
      await goalEnhancedService.alignGoalToParent(goalId, parentGoalId);
      await refetch();
      toast({
        title: "Alignment aktualisiert",
        description: "Das Ziel wurde erfolgreich zugeordnet.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Das Alignment konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    }
  }, [refetch, toast]);

  const filterTree = (nodes: AlignmentTreeNode[], term: string): AlignmentTreeNode[] => {
    if (!term) return nodes;
    
    return nodes.filter(node => 
      node.title.toLowerCase().includes(term.toLowerCase()) ||
      node.children.some(child => filterTree([child], term).length > 0)
    ).map(node => ({
      ...node,
      children: filterTree(node.children, term)
    }));
  };

  const filteredTree = filterTree(alignmentTree, searchTerm);

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
          <h1 className="text-2xl font-bold">Ziel-Alignment</h1>
          <p className="text-muted-foreground">
            Visualisierung und Verwaltung der Ziel-Hierarchie
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neues Ziel
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unternehmensziele</p>
              <p className="text-2xl font-bold">
                {alignmentTree.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durchschnittlicher Fortschritt</p>
              <p className="text-2xl font-bold">
                {dashboardData?.averageProgress || 0}%
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">At-Risk Ziele</p>
              <p className="text-2xl font-bold">
                {dashboardData?.atRiskGoals || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <GitBranch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alignment-Ebenen</p>
              <p className="text-2xl font-bold">
                {alignmentTree.length > 0 ? 3 : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ziele durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Alignment Tree */}
      <Card className="flex-1 min-h-[600px]">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Alignment-Baum</h2>
          </div>
          
          {filteredTree.length > 0 ? (
            <AlignmentTreeView 
              nodes={filteredTree}
              selectedNode={selectedNode}
              onNodeSelect={setSelectedNode}
              onAlign={handleAlignGoal}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Target className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Keine Ziele gefunden</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Versuchen Sie andere Suchbegriffe oder löschen Sie den Filter."
                  : "Erstellen Sie Ihr erstes Unternehmensziel, um die Alignment-Struktur aufzubauen."
                }
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Erstes Ziel erstellen
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Create Goal Dialog */}
      <CreateGoalDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          refetch();
          setShowCreateDialog(false);
        }}
      />
    </div>
  );
};