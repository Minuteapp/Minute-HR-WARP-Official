import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, CreditCard, Leaf, Info } from "lucide-react";

interface TravelGuideline {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  iconColor: string;
  bgColor: string;
}

export const TravelGuidelines = () => {
  const guidelines: TravelGuideline[] = [
    {
      icon: CheckCircle,
      title: "Genehmigung",
      description: "Reisen über 500€ benötigen Freigabe durch CFO",
      iconColor: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: FileText,
      title: "Spesenabrechnung",
      description: "Belege innerhalb von 30 Tagen nach Rückkehr einreichen",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: CreditCard,
      title: "Firmenkreditkarte",
      description: "Für Reisekosten über 1000€ nutzen Sie die Firmenkreditkarte",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      icon: Leaf,
      title: "Nachhaltigkeit",
      description: "Alle Dienstreisen werden automatisch CO₂-kompensiert",
      iconColor: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Reiserichtlinien & Wichtige Hinweise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guidelines.map((guideline, index) => {
            const Icon = guideline.icon;
            return (
              <div key={index} className="p-4 rounded-lg border bg-white">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${guideline.bgColor}`}>
                    <Icon className={`h-5 w-5 ${guideline.iconColor}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{guideline.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{guideline.description}</p>
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
