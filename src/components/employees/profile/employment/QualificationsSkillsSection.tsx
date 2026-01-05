import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface QualificationsSkillsSectionProps {
  employee: Employee | null;
}

export const QualificationsSkillsSection = ({ employee }: QualificationsSkillsSectionProps) => {
  // No mock data - skills should be loaded from database
  const skills: Array<{ name: string; category: string; level: number }> = [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Software':
        return 'bg-blue-100 text-blue-800';
      case 'Soft Skills':
        return 'bg-purple-100 text-purple-800';
      case 'Fachlich':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Award className="h-4 w-4" />
          Qualifikationen & Skills
        </CardTitle>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine Qualifikationen erfasst
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {skills.map((skill, index) => (
              <div key={index} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{skill.name}</p>
                  <Badge variant="secondary" className={`text-xs ${getCategoryColor(skill.category)}`}>
                    {skill.category}
                  </Badge>
                </div>
                <Progress value={skill.level} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">{skill.level}%</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
