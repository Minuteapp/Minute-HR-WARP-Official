import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Lock, Edit, Copy, Play, Pause, Bell } from "lucide-react";
import { Survey } from "../PulseSurveysDashboard";

interface SurveyDetailViewProps {
  survey: Survey;
  onBack: () => void;
  onViewResponses: () => void;
}

export const SurveyDetailView = ({ survey, onBack, onViewResponses }: SurveyDetailViewProps) => {
  const participationRate = survey.totalParticipants > 0 
    ? Math.round((survey.completedResponses / survey.totalParticipants) * 100) 
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Aktiv</Badge>;
      case 'planned':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Geplant</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Abgeschlossen</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Entwurf</Badge>;
      default:
        return null;
    }
  };

  const demoQuestions = survey.questions || [
    { id: '1', text: 'Wie zufrieden sind Sie mit Ihrer Arbeit insgesamt?', category: 'Engagement', type: 'likert' },
    { id: '2', text: 'Würden Sie unser Unternehmen als Arbeitgeber weiterempfehlen?', category: 'eNPS', type: 'likert' },
    { id: '3', text: 'Wie bewerten Sie die Kommunikation in Ihrem Team?', category: 'Kommunikation', type: 'likert' },
    { id: '4', text: 'Fühlen Sie sich von Ihrer Führungskraft unterstützt?', category: 'Führung', type: 'likert' },
    { id: '5', text: 'Was können wir verbessern, um Ihre Arbeitszufriedenheit zu steigern?', category: 'Freitext', type: 'text' },
  ];

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Übersicht
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold">{survey.name}</h1>
            {getStatusBadge(survey.status)}
            {survey.isAnonymous && (
              <Badge variant="outline" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Anonym
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{survey.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Duplizieren
          </Button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Typ</p>
          <p className="font-medium">{survey.type}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Zeitraum</p>
          <p className="font-medium">
            {survey.startDate && survey.endDate 
              ? `${survey.startDate} - ${survey.endDate}`
              : 'Nicht festgelegt'}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Zielgruppe</p>
          <p className="font-medium">{survey.targetGroup}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Fragen</p>
          <p className="font-medium">{demoQuestions.length} Fragen</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Teilnehmer</p>
            <p className="text-2xl font-bold">{survey.totalParticipants}</p>
            <p className="text-xs text-muted-foreground">Eingeladen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Antworten</p>
            <p className="text-2xl font-bold">{survey.completedResponses}</p>
            <p className="text-xs text-muted-foreground">Abgeschlossen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Rücklaufquote</p>
            <p className="text-2xl font-bold">{participationRate}%</p>
            <Progress value={participationRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Questions List */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fragen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoQuestions.map((question, index) => (
                <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                    <div>
                      <p className="text-sm font-medium">{question.text}</p>
                      <p className="text-xs text-muted-foreground">{question.category}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {question.type === 'likert' ? 'Likert 1-5' : 'Freitext'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actions Box */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aktionen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full bg-violet-600 hover:bg-violet-700"
                onClick={onViewResponses}
              >
                Antworten anzeigen ({survey.completedResponses})
              </Button>
              <Button className="w-full bg-violet-600 hover:bg-violet-700">
                Ergebnisse anzeigen
              </Button>
              <Button variant="outline" className="w-full">
                {survey.status === 'active' ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Umfrage pausieren
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Umfrage starten
                  </>
                )}
              </Button>
              <Button variant="outline" className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Erinnerung senden
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
