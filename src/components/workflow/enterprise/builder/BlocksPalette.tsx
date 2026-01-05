import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlockItem } from './BlockItem';
import { Zap, Clock, Play, GitBranch, Mail, FileText, Database, Calendar, DollarSign, Filter, GitMerge } from 'lucide-react';
import type { WorkflowNode } from '../tabs/BuilderTab';

interface BlocksPaletteProps {
  onAddNode: (node: Omit<WorkflowNode, 'id'>) => void;
}

export const BlocksPalette: React.FC<BlocksPaletteProps> = ({ onAddNode }) => {
  const [activeTab, setActiveTab] = useState('trigger');

  const triggerBlocks = [
    { icon: Zap, label: 'Event', description: 'Wenn Datensatz erstellt/geändert', type: 'trigger' as const },
    { icon: Clock, label: 'Zeitplan', description: 'Täglich/Wöchentlich/Monatlich', type: 'trigger' as const },
    { icon: Play, label: 'Manuell', description: 'Per Button ausgelöst', type: 'trigger' as const },
    { icon: GitBranch, label: 'Webhook', description: 'Externe API', type: 'trigger' as const },
  ];

  const actionBlocks = [
    { icon: Mail, label: 'Benachrichtigung', description: 'E-Mail/Push senden', type: 'action' as const, module: 'System' },
    { icon: GitMerge, label: 'Genehmigung', description: 'Freigabeprozess', type: 'action' as const, module: 'System' },
    { icon: FileText, label: 'Task erstellen', description: 'Aufgabe anlegen', type: 'action' as const, module: 'Aufgaben' },
    { icon: Database, label: 'Datensatz ändern', description: 'Feld aktualisieren', type: 'action' as const, module: 'System' },
    { icon: Calendar, label: 'Kalendereintrag', description: 'Event erstellen', type: 'action' as const, module: 'Kalender' },
    { icon: DollarSign, label: 'Payroll starten', description: 'Gehaltsabrechnung', type: 'action' as const, module: 'Lohn & Gehalt' },
  ];

  const logicBlocks = [
    { icon: GitBranch, label: 'Bedingung (IF)', description: 'Wenn...dann...sonst', type: 'condition' as const },
    { icon: Filter, label: 'Filter', description: 'Datensätze filtern', type: 'condition' as const },
  ];

  const handleBlockClick = (block: { type: 'trigger' | 'action' | 'condition'; label: string }) => {
    onAddNode({
      type: block.type,
      label: block.label,
      icon: block.label,
      config: {},
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Bausteine</CardTitle>
        <CardDescription className="text-xs">Drag & Drop auf Canvas</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-3">
            <TabsTrigger value="trigger" className="text-xs">Trigger</TabsTrigger>
            <TabsTrigger value="actions" className="text-xs">Aktionen</TabsTrigger>
            <TabsTrigger value="logic" className="text-xs">Logik</TabsTrigger>
          </TabsList>

          <TabsContent value="trigger" className="mt-0 space-y-2">
            {triggerBlocks.map((block) => (
              <BlockItem
                key={block.label}
                icon={block.icon}
                label={block.label}
                description={block.description}
                onClick={() => handleBlockClick(block)}
              />
            ))}
          </TabsContent>

          <TabsContent value="actions" className="mt-0 space-y-2">
            {actionBlocks.map((block) => (
              <BlockItem
                key={block.label}
                icon={block.icon}
                label={block.label}
                description={block.description}
                module={block.module}
                onClick={() => handleBlockClick(block)}
              />
            ))}
          </TabsContent>

          <TabsContent value="logic" className="mt-0 space-y-2">
            {logicBlocks.map((block) => (
              <BlockItem
                key={block.label}
                icon={block.icon}
                label={block.label}
                description={block.description}
                onClick={() => handleBlockClick(block)}
              />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
