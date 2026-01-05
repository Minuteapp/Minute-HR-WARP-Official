import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import WorkflowRow from './WorkflowRow';

interface Workflow {
  id: string;
  name: string;
  stepCount: number;
  phases: string[];
  isActive: boolean;
}

const defaultWorkflows: Workflow[] = [
  {
    id: 'workflow-1',
    name: 'Standard Projekt-Workflow',
    stepCount: 5,
    phases: ['Planung', 'Durchführung', 'Monitoring', 'Abschluss'],
    isActive: true
  },
  {
    id: 'workflow-2',
    name: 'Agile Sprint Workflow',
    stepCount: 4,
    phases: ['Backlog', 'Sprint Planning', 'Execution', 'Review'],
    isActive: true
  },
  {
    id: 'workflow-3',
    name: 'Change Management Workflow',
    stepCount: 6,
    phases: ['Assessment', 'Planning', 'Implementation', 'Reinforcement'],
    isActive: false
  }
];

const WorkflowsSection = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(defaultWorkflows);

  const handleToggle = (id: string, value: boolean) => {
    setWorkflows(prev =>
      prev.map(workflow =>
        workflow.id === id ? { ...workflow, isActive: value } : workflow
      )
    );
  };

  const handleEdit = (id: string) => {
    console.log('Edit workflow:', id);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Workflows</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Projekt-Workflows und Phasen konfigurieren
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Workflow
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {workflows.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            Keine Workflows konfiguriert
          </p>
        ) : (
          <div>
            {workflows.map(workflow => (
              <WorkflowRow
                key={workflow.id}
                name={workflow.name}
                stepCount={workflow.stepCount}
                phases={workflow.phases}
                isActive={workflow.isActive}
                onToggleChange={(value) => handleToggle(workflow.id, value)}
                onEdit={() => handleEdit(workflow.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkflowsSection;
