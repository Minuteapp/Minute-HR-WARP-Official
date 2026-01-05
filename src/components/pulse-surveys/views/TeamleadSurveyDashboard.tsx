import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  BarChart3,
  ClipboardList,
  ArrowRight,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { usePulseSurveys } from "@/hooks/usePulseSurveys";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeamSurvey {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'planned' | 'draft';
  teamParticipation: number;
  totalTeamMembers: number;
  respondedMembers: number;
  endDate: string;
  averageScore?: number;
}

export const TeamleadSurveyDashboard = () => {
  const [selectedSurvey, setSelectedSurvey] = useState<TeamSurvey | null>(null);
  const { surveys, isLoading: isSurveysLoading } = usePulseSurveys();

  // Lade Team-Mitglieder für den Teamleiter
  const { data: teamData, isLoading: isTeamLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { teamSize: 0, members: [] };

      // Versuche zuerst, die Teamgröße aus employees zu holen
      const { data: employees, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department')
        .limit(20);

      if (error) {
        console.error('Error fetching team members:', error);
        return { teamSize: 0, members: [] };
      }

      return {
        teamSize: employees?.length || 0,
        members: employees || []
      };
    }
  });

  // Lade Antworten für die Umfragen
  const { data: responsesData } = useQuery({
    queryKey: ['survey-responses', surveys?.map(s => s.id)],
    queryFn: async () => {
      if (!surveys || surveys.length === 0) return {};

      const surveyIds = surveys.map(s => s.id);
      const { data: responses, error } = await supabase
        .from('pulse_survey_responses')
        .select('survey_id, respondent_id')
        .in('survey_id', surveyIds);

      if (error) {
        console.error('Error fetching responses:', error);
        return {};
      }

      // Gruppiere Antworten nach Survey
      const responseMap: Record<string, Set<string>> = {};
      responses?.forEach(r => {
        if (!responseMap[r.survey_id]) {
          responseMap[r.survey_id] = new Set();
        }
        responseMap[r.survey_id].add(r.respondent_id);
      });

      return responseMap;
    },
    enabled: !!surveys && surveys.length > 0
  });

  // Transformiere Surveys in TeamSurvey Format
  const teamSurveys: TeamSurvey[] = (surveys || []).map(survey => {
    const respondentCount = responsesData?.[survey.id]?.size || 0;
    const teamSize = teamData?.teamSize || 1;
    const participation = teamSize > 0 ? Math.round((respondentCount / teamSize) * 100) : 0;

    return {
      id: survey.id,
      name: survey.title || 'Unbenannte Umfrage',
      status: survey.status as 'active' | 'completed' | 'planned' | 'draft',
      teamParticipation: Math.min(participation, 100),
      totalTeamMembers: teamSize,
      respondedMembers: respondentCount,
      endDate: survey.end_date || new Date().toISOString(),
      averageScore: undefined // Könnte aus Antworten berechnet werden
    };
  });

  const teamStats = {
    activeSurveys: teamSurveys.filter(s => s.status === 'active').length,
    avgParticipation: teamSurveys.length > 0 
      ? Math.round(teamSurveys.reduce((acc, s) => acc + s.teamParticipation, 0) / teamSurveys.length)
      : 0,
    pendingActions: 0,
    teamSize: teamData?.teamSize || 0
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Aktiv</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700">Abgeschlossen</Badge>;
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-700">Geplant</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-700">Entwurf</Badge>;
      default:
        return null;
    }
  };

  const isLoading = isSurveysLoading || isTeamLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team-Info Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Mein Team</h2>
            <p className="text-sm text-muted-foreground">{teamStats.teamSize} Teammitglieder</p>
          </div>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-200">
          Teamleiter-Ansicht
        </Badge>
      </div>

      {/* Team KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Umfragen</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.activeSurveys}</div>
            <p className="text-xs text-muted-foreground">für Ihr Team relevant</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team-Teilnahme</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.avgParticipation}%</div>
            <p className="text-xs text-muted-foreground">Durchschnitt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Maßnahmen</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.pendingActions}</div>
            <p className="text-xs text-muted-foreground">aus Umfragen abgeleitet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teamgröße</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.teamSize}</div>
            <p className="text-xs text-muted-foreground">aktive Mitarbeiter</p>
          </CardContent>
        </Card>
      </div>

      {/* Aktive Umfragen für Team */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Team-Umfragen</h3>
          <Button variant="outline" size="sm">
            Alle anzeigen
          </Button>
        </div>

        {teamSurveys.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg">Keine Umfragen vorhanden</h3>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Es sind derzeit keine Umfragen für Ihr Team verfügbar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {teamSurveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{survey.name}</CardTitle>
                    {getStatusBadge(survey.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Team-Teilnahme</span>
                      <span className="font-medium">{survey.respondedMembers}/{survey.totalTeamMembers}</span>
                    </div>
                    <Progress value={survey.teamParticipation} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {survey.teamParticipation}% haben teilgenommen
                    </p>
                  </div>

                  {survey.averageScore && (
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span>Durchschnitt: {survey.averageScore}/5</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Endet: {new Date(survey.endDate).toLocaleDateString('de-DE')}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {survey.status === 'active' && (
                      <Button size="sm" variant="outline" className="flex-1">
                        Erinnern
                      </Button>
                    )}
                    <Button size="sm" className="flex-1">
                      {survey.status === 'completed' ? 'Ergebnisse' : 'Details'}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Hinweis für niedrige Teilnahme */}
      {teamSurveys.some(s => s.status === 'active' && s.teamParticipation < 50) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-orange-800">Niedrige Teilnahme bei aktiven Umfragen</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Einige aktive Umfragen haben eine Teilnahmequote unter 50%. 
                  Erwägen Sie, Ihr Team an die Umfragen zu erinnern.
                </p>
                <Button size="sm" variant="outline" className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100">
                  Team erinnern
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
