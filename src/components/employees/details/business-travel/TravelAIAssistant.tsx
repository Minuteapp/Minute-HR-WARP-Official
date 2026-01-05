import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Train, Clock, Lightbulb, Sparkles } from "lucide-react";

interface TravelAIRecommendation {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  iconColor: string;
  bgColor: string;
}

export const TravelAIAssistant = () => {
  const recommendations: TravelAIRecommendation[] = [
    {
      icon: Train,
      title: "Bevorzugtes Transportmittel",
      description: "Bahn für Strecken unter 500km - 35% CO₂-Einsparung",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: Clock,
      title: "Optimale Reisezeit",
      description: "Dienstag-Donnerstag - beste Verfügbarkeit & Preise",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      icon: Lightbulb,
      title: "Empfehlung",
      description: "Kombination aus Videokonferenzen kann 2 Reisen einsparen",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          KI-Reiseassistent
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <div key={index} className="p-4 rounded-lg border bg-white">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${rec.bgColor}`}>
                    <Icon className={`h-5 w-5 ${rec.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
