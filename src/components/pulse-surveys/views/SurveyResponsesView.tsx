import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, AlertTriangle } from "lucide-react";
import { Survey } from "../PulseSurveysDashboard";

interface SurveyResponsesViewProps {
  survey: Survey;
  onBack: () => void;
}

const demoResponses = [
  {
    id: '1',
    responseNumber: 1,
    date: '15.12.2024, 14:32',
    answers: [
      { question: 'Wie zufrieden sind Sie mit Ihrer Arbeit insgesamt?', rating: 4 },
      { question: 'Würden Sie unser Unternehmen als Arbeitgeber weiterempfehlen?', rating: 5 },
      { question: 'Wie bewerten Sie die Kommunikation in Ihrem Team?', rating: 4 },
      { question: 'Fühlen Sie sich von Ihrer Führungskraft unterstützt?', rating: 3 },
      { question: 'Was können wir verbessern?', text: 'Mehr Transparenz bei Entscheidungen und regelmäßigere Team-Meetings wären hilfreich.' },
    ]
  },
  {
    id: '2',
    responseNumber: 2,
    date: '15.12.2024, 13:18',
    answers: [
      { question: 'Wie zufrieden sind Sie mit Ihrer Arbeit insgesamt?', rating: 5 },
      { question: 'Würden Sie unser Unternehmen als Arbeitgeber weiterempfehlen?', rating: 5 },
      { question: 'Wie bewerten Sie die Kommunikation in Ihrem Team?', rating: 5 },
      { question: 'Fühlen Sie sich von Ihrer Führungskraft unterstützt?', rating: 4 },
      { question: 'Was können wir verbessern?', text: 'Insgesamt sehr zufrieden. Vielleicht mehr Weiterbildungsmöglichkeiten.' },
    ]
  },
  {
    id: '3',
    responseNumber: 3,
    date: '15.12.2024, 11:45',
    answers: [
      { question: 'Wie zufrieden sind Sie mit Ihrer Arbeit insgesamt?', rating: 3 },
      { question: 'Würden Sie unser Unternehmen als Arbeitgeber weiterempfehlen?', rating: 3 },
      { question: 'Wie bewerten Sie die Kommunikation in Ihrem Team?', rating: 2 },
      { question: 'Fühlen Sie sich von Ihrer Führungskraft unterstützt?', rating: 2 },
      { question: 'Was können wir verbessern?', text: 'Die Kommunikation zwischen den Abteilungen könnte verbessert werden. Oft fehlen wichtige Informationen.' },
    ]
  },
];

export const SurveyResponsesView = ({ survey, onBack }: SurveyResponsesViewProps) => {
  const getRatingBadge = (rating: number) => {
    if (rating >= 4) {
      return <Badge className="bg-green-100 text-green-700 border-green-200">{rating}/5</Badge>;
    } else if (rating === 3) {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">{rating}/5</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-700 border-red-200">{rating}/5</Badge>;
    }
  };

  const averageRating = 3.8;
  const lastResponseDate = '15.12.2024, 14:32';

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Umfrage
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Antworten: {survey.name}</h1>
          <p className="text-muted-foreground">{survey.completedResponses} abgeschlossene Antworten</p>
        </div>
        {survey.isAnonymous && (
          <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
            <Lock className="h-3 w-3 mr-1" />
            Anonyme Umfrage
          </Badge>
        )}
      </div>

      {/* Privacy Notice */}
      {survey.isAnonymous && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Datenschutz-Hinweis</p>
                <p className="text-sm text-yellow-700">
                  Diese Umfrage wurde anonym durchgeführt. Die Antworten können nicht einzelnen 
                  Mitarbeitern zugeordnet werden. Alle personenbezogenen Daten wurden gemäß DSGVO geschützt.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Gesamt Antworten</p>
              <p className="text-2xl font-bold">{survey.completedResponses}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Durchschnittliche Bewertung</p>
              <p className="text-2xl font-bold">{averageRating}/5</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Letzte Antwort</p>
              <p className="text-2xl font-bold text-sm mt-1">{lastResponseDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Cards */}
      <div className="space-y-4">
        {demoResponses.map((response) => (
          <Card key={response.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-violet-100 text-violet-700 border-violet-200">
                    #{response.responseNumber}
                  </Badge>
                  <span className="font-medium">Anonyme Antwort #{response.responseNumber}</span>
                </div>
                <span className="text-sm text-muted-foreground">{response.date}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {response.answers.map((answer, index) => (
                <div key={index} className="flex items-start justify-between py-2 border-b last:border-0">
                  <p className="text-sm flex-1">{answer.question}</p>
                  {answer.rating !== undefined ? (
                    getRatingBadge(answer.rating)
                  ) : (
                    <div className="mt-2 w-full">
                      <p className="text-sm bg-gray-100 p-3 rounded-lg mt-1">{answer.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
