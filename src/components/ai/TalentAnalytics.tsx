import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const TalentAnalytics = () => {
  const skills = [
    {
      name: "Projektmanagement",
      level: 85,
      trend: "+5%"
    },
    {
      name: "Kommunikation",
      level: 92,
      trend: "+3%"
    },
    {
      name: "Technische Fähigkeiten",
      level: 78,
      trend: "+8%"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg border-primary/20">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Talent Analytics</h2>
        </div>

        <div className="space-y-6">
          {skills.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{skill.name}</h3>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">{skill.trend}</span>
                </div>
              </div>
              <Progress value={skill.level} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Kompetenzlevel</span>
                <span>{skill.level}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center gap-2 text-primary">
            <Award className="w-5 h-5" />
            <span className="font-medium">Empfohlene Entwicklungsmaßnahmen</span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            <li>• Fortgeschrittenes Projektmanagement-Training</li>
            <li>• Workshop: Effektive Teamkommunikation</li>
            <li>• Technical Skills Bootcamp</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default TalentAnalytics;