import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { NaturalLanguageWorkflow } from '../ai-generator/NaturalLanguageWorkflow';
import { AIWorkflowSuggestions } from '../ai-generator/AIWorkflowSuggestions';
import { WorkflowOptimization } from '../ai-generator/WorkflowOptimization';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AIGeneratorTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('natural-language');

  const { data: suggestionsCount = 0 } = useQuery({
    queryKey: ['ai-workflow-suggestions-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('ai_workflow_suggestions')
        .select('*', { count: 'exact', head: true })
        .eq('is_generated', false);
      
      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="natural-language" className="data-[state=active]:bg-background">
            Natural Language → Workflow
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2 data-[state=active]:bg-background">
            KI-Vorschläge
            {suggestionsCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {suggestionsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="optimization" className="data-[state=active]:bg-background">
            Optimierung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="natural-language" className="mt-6">
          <NaturalLanguageWorkflow />
        </TabsContent>

        <TabsContent value="suggestions" className="mt-6">
          <AIWorkflowSuggestions />
        </TabsContent>

        <TabsContent value="optimization" className="mt-6">
          <WorkflowOptimization />
        </TabsContent>
      </Tabs>
    </div>
  );
};
