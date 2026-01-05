
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RiskStatsCards } from "./RiskStatsCards";
import { RiskCard } from "./RiskCard";

interface ProjectRisksDetailTabProps {
  projectId: string;
}

export const ProjectRisksDetailTab = ({ projectId }: ProjectRisksDetailTabProps) => {
  const { data: risks = [], isLoading } = useQuery({
    queryKey: ['project-risks-detail', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_risks')
        .select('*')
        .eq('project_id', projectId)
        .order('risk_score', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const totalRisks = risks.length;

  // Count by severity
  const riskCounts = {
    critical: risks.filter((r: any) => r.severity === 'critical').length,
    high: risks.filter((r: any) => r.severity === 'high').length,
    medium: risks.filter((r: any) => r.severity === 'medium').length,
    low: risks.filter((r: any) => r.severity === 'low').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Risiken & Bedrohungen</h2>
          <span className="text-sm text-muted-foreground">{totalRisks} Risiken erfasst</span>
        </div>
        <Button className="bg-gray-900 text-white hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Risiko hinzufügen
        </Button>
      </div>

      <RiskStatsCards counts={riskCounts} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : totalRisks === 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Keine Risiken erfasst.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {risks.map((risk: any) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
        </div>
      )}
    </div>
  );
};
