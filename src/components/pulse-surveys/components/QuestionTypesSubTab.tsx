import { Card, CardContent } from "@/components/ui/card";

const questionTypes = [
  {
    id: "likert",
    title: "Likert-Skala (1-5 / 1-10)",
    description: "Klassische Skala von 'Stimme nicht zu' bis 'Stimme voll zu'",
    emoji: "📊",
    color: "bg-blue-100",
  },
  {
    id: "single-choice",
    title: "Single Choice",
    description: "Eine Antwort aus mehreren Optionen auswählen",
    emoji: "⭕",
    color: "bg-green-100",
  },
  {
    id: "multiple-choice",
    title: "Multiple Choice",
    description: "Mehrere Antworten aus einer Liste auswählen",
    emoji: "☑️",
    color: "bg-green-100",
  },
  {
    id: "freitext",
    title: "Freitext",
    description: "Offene Frage für ausführliche Antworten",
    emoji: "✏️",
    color: "bg-purple-100",
  },
  {
    id: "ranking",
    title: "Ranking",
    description: "Optionen in eine Reihenfolge bringen",
    emoji: "🔢",
    color: "bg-orange-100",
  },
  {
    id: "matrix",
    title: "Matrix",
    description: "Mehrere Aussagen mit gleicher Skala bewerten",
    emoji: "📋",
    color: "bg-red-100",
  },
  {
    id: "nps",
    title: "NPS / eNPS",
    description: "Net Promoter Score auf einer Skala von 0-10",
    emoji: "🎯",
    color: "bg-yellow-100",
  },
  {
    id: "stimmung",
    title: "Stimmungsbarometer",
    description: "Emotionale Bewertung mit Emojis oder Symbolen",
    emoji: "😊",
    color: "bg-pink-100",
  },
];

export const QuestionTypesSubTab = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {questionTypes.map((type) => (
        <Card key={type.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${type.color} text-2xl`}>
                {type.emoji}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">{type.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
                <button className="text-sm text-primary hover:text-primary/80 font-medium">
                  Beispiel ansehen
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
