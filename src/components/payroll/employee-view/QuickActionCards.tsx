import { Card, CardContent } from "@/components/ui/card";
import { FileText, Calendar, Mail, ChevronRight } from "lucide-react";

const QuickActionCards = () => {
  const actions = [
    {
      icon: FileText,
      title: "Steuerbescheinigung",
      subtitle: "2023 verfügbar",
      color: "bg-purple-100 text-purple-600",
      hoverColor: "hover:bg-purple-50"
    },
    {
      icon: Calendar,
      title: "Urlaubsantrag",
      subtitle: "Neuen Antrag stellen",
      color: "bg-green-100 text-green-600",
      hoverColor: "hover:bg-green-50"
    },
    {
      icon: Mail,
      title: "HR kontaktieren",
      subtitle: "Frage stellen",
      color: "bg-pink-100 text-pink-600",
      hoverColor: "hover:bg-pink-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action, index) => (
        <Card 
          key={index} 
          className={`cursor-pointer transition-all ${action.hoverColor} hover:shadow-md`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.subtitle}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickActionCards;
