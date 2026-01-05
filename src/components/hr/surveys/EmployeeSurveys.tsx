
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BarChart3, Users, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SurveyDialog } from "./SurveyDialog";
import { SurveyList } from "./SurveyList";
import { SurveyResponseForm } from "./SurveyResponseForm";
import { SurveyResults } from "./SurveyResults";

export const EmployeeSurveys = () => {
  const [showNewSurveyDialog, setShowNewSurveyDialog] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'respond' | 'results'>('list');

  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['hr-surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_surveys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: responses = [] } = useQuery({
    queryKey: ['survey-responses-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_survey_responses')
        .select('survey_id, created_at');

      if (error) throw error;
      return data;
    }
  });

  const activeSurveys = surveys.filter(s => s.status === 'active');
  const draftSurveys = surveys.filter(s => s.status === 'draft');
  const completedSurveys = surveys.filter(s => s.status === 'completed');

  const handleViewSurvey = (survey: any) => {
    setSelectedSurvey(survey);
    if (survey.status === 'active') {
      setViewMode('respond');
    } else {
      setViewMode('results');
    }
  };

  const handleBackToList = () => {
    setSelectedSurvey(null);
    setViewMode('list');
  };

  if (viewMode === 'respond' && selectedSurvey) {
    return (
      <SurveyResponseForm
        survey={selectedSurvey}
        onSubmit={handleBackToList}
        onCancel={handleBackToList}
      />
    );
  }

  if (viewMode === 'results' && selectedSurvey) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Umfrageergebnisse</h2>
            <p className="text-gray-600">{selectedSurvey.title}</p>
          </div>
          <Button variant="outline" onClick={handleBackToList}>
            Zurück zur Übersicht
          </Button>
        </div>
        <SurveyResults survey={selectedSurvey} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mitarbeiterumfragen</h2>
        <Button onClick={() => setShowNewSurveyDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Umfrage
        </Button>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{surveys.length}</p>
                <p className="text-sm text-gray-500">Umfragen gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeSurveys.length}</p>
                <p className="text-sm text-gray-500">Aktive Umfragen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{responses.length}</p>
                <p className="text-sm text-gray-500">Antworten gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedSurveys.length}</p>
                <p className="text-sm text-gray-500">Abgeschlossen</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Umfragentabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Alle Umfragen ({surveys.length})</TabsTrigger>
          <TabsTrigger value="active">
            Aktiv ({activeSurveys.length})
            {activeSurveys.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {activeSurveys.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="draft">Entwürfe ({draftSurveys.length})</TabsTrigger>
          <TabsTrigger value="completed">Abgeschlossen ({completedSurveys.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <SurveyList onViewSurvey={handleViewSurvey} />
        </TabsContent>

        <TabsContent value="active">
          <SurveyList onViewSurvey={handleViewSurvey} />
        </TabsContent>

        <TabsContent value="draft">
          <SurveyList onViewSurvey={handleViewSurvey} />
        </TabsContent>

        <TabsContent value="completed">
          <SurveyList onViewSurvey={handleViewSurvey} />
        </TabsContent>
      </Tabs>

      <SurveyDialog
        open={showNewSurveyDialog}
        onOpenChange={setShowNewSurveyDialog}
      />
    </div>
  );
};
