import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  FileText,
  AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Survey {
  id: string;
  title: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  question_count: number;
  has_responded: boolean;
}

export const EmployeeSurveyView = () => {
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

  // Lade aktive Umfragen für den Mitarbeiter
  const { data: surveys, isLoading } = useQuery({
    queryKey: ['employee-surveys'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Lade alle aktiven Umfragen
      const { data: activeSurveys, error: surveysError } = await supabase
        .from('pulse_surveys')
        .select('id, title, description, status, start_date, end_date')
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false });

      if (surveysError) {
        console.error('Error fetching surveys:', surveysError);
        return [];
      }

      // Lade Antworten des Benutzers
      const { data: userResponses, error: responsesError } = await supabase
        .from('pulse_survey_responses')
        .select('survey_id')
        .eq('respondent_id', user.id);

      if (responsesError) {
        console.error('Error fetching responses:', responsesError);
      }

      const respondedSurveyIds = new Set(userResponses?.map(r => r.survey_id) || []);

      // Kombiniere die Daten
      const surveysWithStatus: Survey[] = (activeSurveys || []).map(survey => ({
        id: survey.id,
        title: survey.title || 'Unbenannte Umfrage',
        description: survey.description,
        status: survey.status,
        start_date: survey.start_date,
        end_date: survey.end_date,
        question_count: 0, // Könnte aus einer separaten Abfrage kommen
        has_responded: respondedSurveyIds.has(survey.id)
      }));

      return surveysWithStatus;
    }
  });

  const openSurveys = surveys?.filter(s => s.status === 'active' && !s.has_responded) || [];
  const completedSurveys = surveys?.filter(s => s.has_responded) || [];
  const expiredSurveys = surveys?.filter(s => s.status === 'completed' && !s.has_responded) || [];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Kein Datum';
    return format(new Date(dateString), 'dd. MMM yyyy', { locale: de });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <ClipboardList className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Meine Umfragen</h2>
          <p className="text-sm text-muted-foreground">
            Nehmen Sie an Umfragen teil und geben Sie Feedback
          </p>
        </div>
      </div>

      {/* Übersicht */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offen</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openSurveys.length}</div>
            <p className="text-xs text-muted-foreground">Umfragen warten auf Sie</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgeschlossen</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSurveys.length}</div>
            <p className="text-xs text-muted-foreground">bereits beantwortet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verpasst</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredSurveys.length}</div>
            <p className="text-xs text-muted-foreground">nicht mehr verfügbar</p>
          </CardContent>
        </Card>
      </div>

      {/* Offene Umfragen */}
      {openSurveys.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Offene Umfragen
          </h3>
          <div className="grid gap-4">
            {openSurveys.map((survey) => (
              <Card key={survey.id} className="border-orange-200 bg-orange-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{survey.title}</h4>
                        <Badge className="bg-orange-100 text-orange-700">Offen</Badge>
                      </div>
                      {survey.description && (
                        <p className="text-sm text-muted-foreground">{survey.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Endet: {formatDate(survey.end_date)}
                        </span>
                      </div>
                    </div>
                    <Button className="ml-4">
                      Teilnehmen
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Keine offenen Umfragen */}
      {openSurveys.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="font-medium text-lg">Alles erledigt!</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Sie haben keine offenen Umfragen. Vielen Dank für Ihre Teilnahme!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Abgeschlossene Umfragen */}
      {completedSurveys.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Bereits beantwortet
          </h3>
          <div className="grid gap-3">
            {completedSurveys.map((survey) => (
              <Card key={survey.id} className="bg-muted/30">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{survey.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Beendet: {formatDate(survey.end_date)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">Beantwortet</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
