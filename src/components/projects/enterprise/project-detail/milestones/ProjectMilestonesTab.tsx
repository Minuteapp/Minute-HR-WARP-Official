
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MilestoneTimeline } from "./MilestoneTimeline";

interface ProjectMilestonesTabProps {
  projectId: string;
}

export const ProjectMilestonesTab = ({ projectId }: ProjectMilestonesTabProps) => {
  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Meilensteine</h2>
          <p className="text-sm text-muted-foreground">
            Zeitliche Übersicht der Projekt-Meilensteine
          </p>
        </div>
        <Button className="bg-gray-900 text-white hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Meilenstein hinzufügen
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : milestones.length === 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Keine Meilensteine vorhanden.</p>
          </CardContent>
        </Card>
      ) : (
        <MilestoneTimeline milestones={milestones} />
      )}
    </div>
  );
};
