
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Loader2, HelpCircle } from "lucide-react";
import { askHrAssistant } from "@/utils/chatGptService";

export function PayrollAssistant() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    const response = await askHrAssistant(question);
    if (response) {
      setAnswer(response);
    }
    setIsLoading(false);
  };

  const exampleQuestions = [
    "Wie wird mein Bruttogehalt berechnet?",
    "Was sind die aktuellen Steuersätze?",
    "Wie funktionieren Bonuszahlungen?",
    "Wie kann ich Reisekosten abrechnen?"
  ];

  return (
    <Card className="border-primary/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          HR-Assistent für Lohn & Gehalt
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Beispielfragen:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQuestions.map((q, i) => (
              <Button
                key={i}
                variant="outline"
                className="justify-start h-auto py-2 px-3 text-sm"
                onClick={() => setQuestion(q)}
              >
                {q}
              </Button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Stellen Sie Ihre Frage zum Thema Lohn & Gehalt..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !question.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verarbeite Anfrage...
              </>
            ) : (
              "Frage senden"
            )}
          </Button>
        </form>
        
        {answer && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">Antwort:</h4>
            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
              {answer}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
