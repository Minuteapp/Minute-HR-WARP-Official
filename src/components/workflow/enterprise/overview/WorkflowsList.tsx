import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowCard } from './WorkflowCard';

interface WorkflowsListProps {
  onCreateNew?: () => void;
}

export const WorkflowsList: React.FC<WorkflowsListProps> = ({ onCreateNew }) => {
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflow-definitions', moduleFilter, statusFilter, search],
    queryFn: async () => {
      let query = supabase
        .from('workflow_definitions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (moduleFilter !== 'all') {
        query = query.eq('module', moduleFilter);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Alle Workflows</CardTitle>
              <CardDescription>{workflows.length} Workflows konfiguriert</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Module</SelectItem>
                <SelectItem value="Abwesenheit">Abwesenheit</SelectItem>
                <SelectItem value="Krankmeldungen">Krankmeldungen</SelectItem>
                <SelectItem value="Lohn & Gehalt">Lohn & Gehalt</SelectItem>
                <SelectItem value="Recruiting">Recruiting</SelectItem>
                <SelectItem value="Spesen">Spesen</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="paused">Pausiert</SelectItem>
                <SelectItem value="draft">Entwurf</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-primary text-primary-foreground" onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Workflow
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Laden...</div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Keine Workflows gefunden</p>
            <p className="text-sm mt-1">Erstellen Sie Ihren ersten Workflow</p>
            <Button className="mt-4" onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Workflow erstellen
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {workflows.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
