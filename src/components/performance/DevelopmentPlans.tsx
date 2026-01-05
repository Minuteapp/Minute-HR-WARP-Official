import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, BookOpen, Calendar, Check } from "lucide-react";

interface DevelopmentPlan {
  id: string;
  title: string;
  description: string;
  progress: number;
  deadline: string;
  skills: string[];
}

const DevelopmentPlans = () => {
  const plans: DevelopmentPlan[] = [
    {
      id: "1",
      title: "Führungskräfteentwicklung",
      description: "Entwicklung von Führungskompetenzen durch Schulungen und Mentoring",
      progress: 60,
      deadline: "2024-06-30",
      skills: ["Kommunikation", "Teamführung", "Konfliktmanagement"]
    },
    {
      id: "2",
      title: "Technische Weiterbildung",
      description: "Vertiefung der technischen Fähigkeiten im Projektmanagement",
      progress: 35,
      deadline: "2024-09-15",
      skills: ["Agile Methoden", "Scrum", "Kanban"]
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg border-primary/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Entwicklungspläne</h3>
            <p className="text-sm text-gray-500">Karriere- und Entwicklungsziele</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Neuer Plan
          </Button>
        </div>

        <div className="space-y-6">
          {plans.length > 0 ? (
            plans.map((plan) => (
              <Card key={plan.id} className="p-4 border-primary/10">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">{plan.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(plan.deadline).toLocaleDateString('de-DE')}
                    </div>
                  </div>

                  <Progress value={plan.progress} className="h-2" />
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{plan.progress}% abgeschlossen</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {plan.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              Keine Entwicklungspläne vorhanden
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DevelopmentPlans;