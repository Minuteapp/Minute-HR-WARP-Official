import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AIOptimizationSuggestions = () => {
  const { data: suggestions = [] } = useQuery({
    queryKey: ['ai-optimization-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_workflow_suggestions')
        .select('*')
        .eq('is_generated', false)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
  });

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'very_high':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Sehr Hoch Impact</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Hoch Impact</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Mittel Impact</Badge>;
      default:
        return <Badge variant="secondary">Niedrig Impact</Badge>;
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">KI-Optimierungsvorschläge</CardTitle>
              <CardDescription>{suggestions.length} Verbesserungen erkannt</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="flex items-start justify-between p-4 rounded-lg border bg-muted/30"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-foreground">{suggestion.title}</h4>
                {getImpactBadge(suggestion.impact || 'medium')}
              </div>
              <p className="text-sm text-muted-foreground">{suggestion.description}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Ersparnis: {suggestion.time_savings_hours || 0} Std/Monat</span>
              </div>
            </div>
            <Button variant="default" size="sm" className="ml-4">
              Details
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
