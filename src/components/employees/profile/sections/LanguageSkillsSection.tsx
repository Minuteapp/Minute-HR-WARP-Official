import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface LanguageSkillsSectionProps {
  employee: Employee | null;
  isEditing: boolean;
}

interface LanguageSkill {
  name: string;
  level: string;
  progress: number;
}

const getLevelProgress = (level: string): number => {
  const levelMap: Record<string, number> = {
    'A1': 15,
    'A2': 30,
    'B1': 50,
    'B2': 70,
    'C1': 85,
    'C2': 95,
    'Muttersprache': 100,
    'native': 100,
  };
  return levelMap[level] || 50;
};

const getLevelLabel = (level: string): string => {
  const labelMap: Record<string, string> = {
    'A1': 'Anfänger (A1)',
    'A2': 'Grundkenntnisse (A2)',
    'B1': 'Fortgeschritten (B1)',
    'B2': 'Gute Kenntnisse (B2)',
    'C1': 'Fließend (C1)',
    'C2': 'Verhandlungssicher (C2)',
    'Muttersprache': 'Muttersprache',
    'native': 'Muttersprache',
  };
  return labelMap[level] || level;
};

export const LanguageSkillsSection = ({ employee, isEditing }: LanguageSkillsSectionProps) => {
  // Lade Sprachkenntnisse aus der employees-Tabelle (language_skills JSONB-Spalte)
  const { data: employeeData, isLoading } = useQuery({
    queryKey: ['employee-language-skills', employee?.id],
    queryFn: async () => {
      if (!employee?.id) return null;
      
      const { data, error } = await supabase
        .from('employees')
        .select('language_skills')
        .eq('id', employee.id)
        .single();
      
      if (error) {
        console.error('Fehler beim Laden der Sprachkenntnisse:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!employee?.id,
  });

  // Parse language_skills aus JSONB
  const languages: LanguageSkill[] = employeeData?.language_skills 
    ? (Array.isArray(employeeData.language_skills) 
        ? employeeData.language_skills.map((lang: any) => ({
            name: lang.name || lang.language || 'Unbekannt',
            level: lang.level || 'B1',
            progress: getLevelProgress(lang.level || 'B1'),
          }))
        : [])
    : [];

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Sprachkenntnisse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Languages className="h-4 w-4" />
          Sprachkenntnisse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {languages.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Languages className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Keine Sprachkenntnisse hinterlegt</p>
          </div>
        ) : (
          languages.map((lang, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{lang.name}</span>
                <span className="text-xs text-muted-foreground">{getLevelLabel(lang.level)}</span>
              </div>
              <Progress value={lang.progress} className="h-2" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
