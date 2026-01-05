import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RiskScoreItem } from './RiskScoreItem';
import { Skeleton } from '@/components/ui/skeleton';

export const BudgetRiskScoring: React.FC = () => {
  const { data: riskScores, isLoading } = useQuery({
    queryKey: ['budget-risk-scores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budget_risk_scores')
        .select('*')
        .order('risk_score', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Budget-Risiko-Scoring
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        ) : riskScores && riskScores.length > 0 ? (
          riskScores.map((score) => (
            <RiskScoreItem
              key={score.id}
              costCenterName={score.cost_center_name}
              riskScore={score.risk_score || 0}
              riskLevel={score.risk_level as 'low' | 'medium' | 'high' | 'critical'}
              riskDescription={score.risk_description || ''}
            />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Keine Risiko-Bewertungen vorhanden.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
