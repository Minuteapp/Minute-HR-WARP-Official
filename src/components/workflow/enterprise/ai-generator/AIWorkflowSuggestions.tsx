import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AISuggestionCard } from './AISuggestionCard';

export const AIWorkflowSuggestions = () => {
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['ai-workflow-suggestions-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_workflow_suggestions')
        .select('*')
        .eq('is_generated', false)
        .order('impact', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">KI-erkannte Optimierungspotenziale</CardTitle>
            <CardDescription>
              Basierend auf Ihren Daten und Best Practices
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Laden...</div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Keine KI-Vorschläge vorhanden</p>
            <p className="text-sm text-muted-foreground mt-1">
              Die KI analysiert kontinuierlich Ihre Prozesse und schlägt Optimierungen vor.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {suggestions.map((suggestion) => (
              <AISuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
