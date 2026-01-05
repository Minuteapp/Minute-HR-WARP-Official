import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, Eye, Copy } from "lucide-react";

interface TemplatesSubTabProps {
  onSelectTemplate: (id: string) => void;
  onOpenAIGenerator: () => void;
}

const templates = [
  {
    id: "1",
    title: "Engagement Standard",
    description: "Bewährte Fragen zur Messung des Mitarbeiterengagements",
    rating: 4.8,
    questions: 24,
    usedCount: 156,
    tags: ["Standard", "Bewährt"],
  },
  {
    id: "2",
    title: "Führung & Vertrauen",
    description: "Bewertung der Führungsqualität und des Vertrauens",
    rating: 4.6,
    questions: 18,
    usedCount: 89,
    tags: ["Führung", "Kultur"],
  },
  {
    id: "3",
    title: "Work-Life-Balance",
    description: "Fragen zur Vereinbarkeit von Beruf und Privatleben",
    rating: 4.7,
    questions: 12,
    usedCount: 134,
    tags: ["Wellbeing", "Balance"],
  },
  {
    id: "4",
    title: "Onboarding Feedback",
    description: "Feedback-Fragen für neue Mitarbeiter",
    rating: 4.5,
    questions: 15,
    usedCount: 67,
    tags: ["Onboarding", "Neu"],
  },
  {
    id: "5",
    title: "Remote Work",
    description: "Bewertung der Remote-Arbeitsbedingungen",
    rating: 4.4,
    questions: 20,
    usedCount: 98,
    tags: ["Remote", "Hybrid"],
  },
  {
    id: "6",
    title: "Team-Zusammenarbeit",
    description: "Fragen zur Teamdynamik und Zusammenarbeit",
    rating: 4.9,
    questions: 16,
    usedCount: 112,
    tags: ["Team", "Kollaboration"],
  },
  {
    id: "7",
    title: "Zusammenarbeit & Kommunikation",
    description: "Effektivität der Team- und Abteilungskommunikation",
    rating: 4.5,
    questions: 14,
    usedCount: 78,
    tags: ["Kommunikation", "Team"],
  },
  {
    id: "8",
    title: "Change Readiness",
    description: "Bereitschaft und Umgang mit Veränderungen",
    rating: 4.3,
    questions: 16,
    usedCount: 45,
    tags: ["Change", "Kultur"],
  },
];

export const TemplatesSubTab = ({ onSelectTemplate, onOpenAIGenerator }: TemplatesSubTabProps) => {
  return (
    <div className="space-y-6">
      {/* KI-Generator Box */}
      <Card className="bg-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">KI-Fragenset-Generator</h3>
                <p className="text-sm text-muted-foreground">
                  Lassen Sie die KI basierend auf Ihren Zielen passende Fragen generieren
                </p>
              </div>
            </div>
            <Button onClick={onOpenAIGenerator} className="bg-primary hover:bg-primary/90">
              KI-Generator öffnen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-foreground">{template.title}</h3>
                <div className="flex items-center gap-1 text-orange-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">{template.rating}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {template.questions} Fragen · {template.usedCount}× verwendet
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onSelectTemplate(template.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => onSelectTemplate(template.id)}
                  >
                    Verwenden
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
