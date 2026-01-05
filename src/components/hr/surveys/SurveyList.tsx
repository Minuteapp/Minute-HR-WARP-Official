
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Play, Pause, BarChart3, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Survey {
  id: string;
  title: string;
  description: string;
  status: string;
  survey_type: string;
  anonymous: boolean;
  start_date: string;
  end_date: string;
  created_at: string;
  questions: any[];
}

interface SurveyListProps {
  onViewSurvey: (survey: Survey) => void;
}

export const SurveyList = ({ onViewSurvey }: SurveyListProps) => {
  const queryClient = useQueryClient();

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['hr-surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Survey[];
    }
  });

  const updateSurveyMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data, error } = await supabase
        .from('hr_surveys')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-surveys'] });
      toast.success('Umfrage-Status wurde aktualisiert');
    },
    onError: (error: any) => {
      console.error('Fehler beim Aktualisieren:', error);
      toast.error('Fehler beim Aktualisieren der Umfrage');
    }
  });

  const handleStatusChange = (surveyId: string, newStatus: string) => {
    updateSurveyMutation.mutate({ id: surveyId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Entwurf', variant: 'secondary' as const },
      active: { label: 'Aktiv', variant: 'default' as const },
      completed: { label: 'Abgeschlossen', variant: 'outline' as const },
      archived: { label: 'Archiviert', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      general: { label: 'Allgemein', color: 'bg-blue-100 text-blue-800' },
      satisfaction: { label: 'Zufriedenheit', color: 'bg-green-100 text-green-800' },
      feedback: { label: 'Feedback', color: 'bg-purple-100 text-purple-800' },
      evaluation: { label: 'Bewertung', color: 'bg-orange-100 text-orange-800' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.general;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">Noch keine Umfragen erstellt</p>
            <p className="text-sm text-gray-400">
              Erstellen Sie Ihre erste Umfrage, um Feedback von Mitarbeitern zu sammeln.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {surveys.map((survey) => (
        <Card key={survey.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-lg">{survey.title}</CardTitle>
              {getStatusBadge(survey.status)}
              {getTypeBadge(survey.survey_type)}
              {survey.anonymous && (
                <Badge variant="outline">Anonym</Badge>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onViewSurvey(survey)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Anzeigen
                </DropdownMenuItem>
                {survey.status === 'draft' && (
                  <DropdownMenuItem onClick={() => handleStatusChange(survey.id, 'active')}>
                    <Play className="h-4 w-4 mr-2" />
                    Aktivieren
                  </DropdownMenuItem>
                )}
                {survey.status === 'active' && (
                  <DropdownMenuItem onClick={() => handleStatusChange(survey.id, 'completed')}>
                    <Pause className="h-4 w-4 mr-2" />
                    Beenden
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleStatusChange(survey.id, 'archived')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Archivieren
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            {survey.description && (
              <p className="text-gray-600 mb-3">{survey.description}</p>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {survey.questions.length} Fragen
                </span>
                {survey.start_date && (
                  <span>
                    Start: {new Date(survey.start_date).toLocaleDateString('de-DE')}
                  </span>
                )}
                {survey.end_date && (
                  <span>
                    Ende: {new Date(survey.end_date).toLocaleDateString('de-DE')}
                  </span>
                )}
              </div>
              <span>
                Erstellt: {new Date(survey.created_at).toLocaleDateString('de-DE')}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
