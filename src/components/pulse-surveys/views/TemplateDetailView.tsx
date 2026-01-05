import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, FileText, Users, FolderOpen } from "lucide-react";

interface TemplateDetailViewProps {
  templateId: string;
  onBack: () => void;
}

const templateData = {
  id: "1",
  title: "Engagement Standard",
  description: "Bewährte Fragen zur Messung des Mitarbeiterengagements. Diese Vorlage enthält validierte Fragen, die in über 150 Unternehmen erfolgreich eingesetzt wurden.",
  rating: 4.8,
  questions: 24,
  usedCount: 156,
  category: "Engagement",
  tags: ["Standard", "Bewährt", "Validiert"],
  questionsList: [
    { id: "1", question: "Ich bin stolz darauf, für dieses Unternehmen zu arbeiten.", category: "Zugehörigkeit", type: "Likert 1-5" },
    { id: "2", question: "Meine Arbeit gibt mir das Gefühl, einen Beitrag zu leisten.", category: "Sinn", type: "Likert 1-5" },
    { id: "3", question: "Ich würde dieses Unternehmen als Arbeitgeber weiterempfehlen.", category: "eNPS", type: "eNPS 0-10" },
    { id: "4", question: "Mein Vorgesetzter gibt mir regelmäßig konstruktives Feedback.", category: "Führung", type: "Likert 1-5" },
    { id: "5", question: "Ich habe die Möglichkeiten, mich beruflich weiterzuentwickeln.", category: "Entwicklung", type: "Likert 1-5" },
    { id: "6", question: "Die Zusammenarbeit im Team funktioniert gut.", category: "Team", type: "Likert 1-5" },
  ],
};

export const TemplateDetailView = ({ templateId, onBack }: TemplateDetailViewProps) => {
  return (
    <div className="space-y-6">
      {/* Back Link */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Vorlagen
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold">{templateData.title}</h2>
            <div className="flex items-center gap-1 text-orange-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">{templateData.rating}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {templateData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {templateData.description}
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            Vorlage verwenden
          </Button>
          <Button variant="outline">
            Kopieren & Bearbeiten
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Fragen</p>
          <p className="text-2xl font-bold">{templateData.questions}</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Verwendet</p>
          <p className="text-2xl font-bold">{templateData.usedCount}×</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Kategorie</p>
          <p className="text-2xl font-bold">{templateData.category}</p>
        </div>
      </div>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fragen in dieser Vorlage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {templateData.questionsList.map((q, index) => (
            <div
              key={q.id}
              className="flex items-start justify-between gap-3 p-3 bg-muted/30 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{q.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">{q.category}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                {q.type}
              </Badge>
            </div>
          ))}
          {templateData.questions > templateData.questionsList.length && (
            <button className="text-sm text-primary hover:underline">
              ... und {templateData.questions - templateData.questionsList.length} weitere Fragen anzeigen
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
