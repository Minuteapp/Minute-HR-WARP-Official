import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileWarning, Receipt, Shield, Settings, Scale } from "lucide-react";

export const RiskCategoriesSection = () => {
  const categories = [
    {
      icon: FileWarning,
      title: "Visa-Ablauf",
      description: "Überwachung von Arbeits- und Aufenthaltsgenehmigungen",
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      icon: Receipt,
      title: "Steuerliche Risiken",
      description: "Betriebsstättenrisiken und Steuerpflichten",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      icon: Shield,
      title: "Compliance-Verstöße",
      description: "Arbeitsrecht und regulatorische Anforderungen",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      icon: Settings,
      title: "Operative Risiken",
      description: "Prozess- und Ablaufrisiken",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: Scale,
      title: "Rechtliche Risiken",
      description: "Vertragsrisiken und rechtliche Compliance",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Risikokategorien & Eskalationsstufen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div key={cat.title} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className={`p-2 rounded-lg ${cat.bgColor}`}>
                <cat.icon className={`h-4 w-4 ${cat.color}`} />
              </div>
              <div>
                <p className="font-medium text-sm">{cat.title}</p>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
