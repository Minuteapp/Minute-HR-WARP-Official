import React, { useState } from 'react';
import { BuilderHeader } from '../builder/BuilderHeader';
import { BlocksPalette } from '../builder/BlocksPalette';
import { WorkflowCanvas } from '../builder/WorkflowCanvas';
import { PropertiesPanel } from '../builder/PropertiesPanel';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  label: string;
  icon: string;
  config: Record<string, any>;
}

export const BuilderTab = () => {
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  const handleAddNode = (node: Omit<WorkflowNode, 'id'>) => {
    const newNode: WorkflowNode = {
      ...node,
      id: crypto.randomUUID(),
    };
    setNodes([...nodes, newNode]);
  };

  const handleUpdateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n));
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  const handleSave = async () => {
    if (!workflowName.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie einen Workflow-Namen ein.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: companyId, error: rpcError } = await supabase.rpc('get_effective_company_id');
      if (rpcError || !companyId) {
        throw new Error('Keine Firma zugeordnet');
      }

      const { error } = await supabase
        .from('workflow_definitions')
        .insert({
          name: workflowName,
          description: workflowDescription || null,
          company_id: companyId,
          nodes: nodes,
          edges: [],
          status: 'draft',
          module: 'Allgemein',
        });

      if (error) throw error;

      toast({
        title: 'Workflow gespeichert',
        description: `"${workflowName}" wurde erfolgreich erstellt.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['workflow-definitions'] });
      
      // Reset form
      setWorkflowName('');
      setWorkflowDescription('');
      setNodes([]);
      setSelectedNodeId(null);
    } catch (error: any) {
      toast({
        title: 'Fehler beim Speichern',
        description: error.message || 'Der Workflow konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <BuilderHeader
        name={workflowName}
        description={workflowDescription}
        onNameChange={setWorkflowName}
        onDescriptionChange={setWorkflowDescription}
        onSave={handleSave}
        isSaving={isSaving}
      />

      <div className="grid grid-cols-12 gap-4 min-h-[600px]">
        {/* Left: Blocks Palette */}
        <div className="col-span-3">
          <BlocksPalette onAddNode={handleAddNode} />
        </div>

        {/* Center: Canvas */}
        <div className="col-span-6">
          <WorkflowCanvas
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onAddNode={handleAddNode}
          />
        </div>

        {/* Right: Properties */}
        <div className="col-span-3">
          <PropertiesPanel
            node={selectedNode}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
          />
        </div>
      </div>
    </div>
  );
};
