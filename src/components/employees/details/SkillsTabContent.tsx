import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X, Trophy, TrendingUp, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SkillsTabContentProps {
  employeeId: string;
}

interface Skill {
  id: string;
  skill_name: string;
  level: number;
  certification_date?: string;
  notes?: string;
}

export const SkillsTabContent = ({ employeeId }: SkillsTabContentProps) => {
  const [newSkill, setNewSkill] = useState("");
  const [newLevel, setNewLevel] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ['employee-skills', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_skills')
        .select('*')
        .eq('employee_id', employeeId)
        .order('level', { ascending: false });
      
      if (error) throw error;
      return data as Skill[];
    }
  });

  const addSkillMutation = useMutation({
    mutationFn: async ({ skill_name, level }: { skill_name: string; level: number }) => {
      const { error } = await supabase
        .from('employee_skills')
        .insert({
          employee_id: employeeId,
          skill_name,
          level
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-skills', employeeId] });
      setNewSkill("");
      setNewLevel(1);
      toast({ title: "Skill hinzugefügt", description: "Das Skill wurde erfolgreich hinzugefügt." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Fehler", description: "Skill konnte nicht hinzugefügt werden." });
    }
  });

  const removeSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const { error } = await supabase
        .from('employee_skills')
        .delete()
        .eq('id', skillId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-skills', employeeId] });
      toast({ title: "Skill entfernt", description: "Das Skill wurde erfolgreich entfernt." });
    }
  });

  const getSkillLevelColor = (level: number) => {
    if (level >= 4) return "bg-green-100 text-green-800 border-green-200";
    if (level >= 3) return "bg-blue-100 text-blue-800 border-blue-200";
    if (level >= 2) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getSkillLevelIcon = (level: number) => {
    if (level >= 4) return <Trophy className="h-3 w-3" />;
    if (level >= 3) return <TrendingUp className="h-3 w-3" />;
    return <Star className="h-3 w-3" />;
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addSkillMutation.mutate({ skill_name: newSkill.trim(), level: newLevel });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Skills & Fähigkeiten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add new skill */}
            <div className="flex gap-2">
              <Input
                placeholder="Neues Skill eingeben..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                min="1"
                max="5"
                value={newLevel}
                onChange={(e) => setNewLevel(parseInt(e.target.value))}
                className="w-20"
              />
              <Button 
                onClick={handleAddSkill}
                disabled={!newSkill.trim() || addSkillMutation.isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Skills list */}
            {skills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Noch keine Skills hinzugefügt</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {getSkillLevelIcon(skill.level)}
                        <span className="font-medium">{skill.skill_name}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getSkillLevelColor(skill.level)}`}
                      >
                        Level {skill.level}/5
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSkillMutation.mutate(skill.id)}
                      disabled={removeSkillMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skills Categories */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Technische Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {skills
                .filter(skill => 
                  skill.skill_name.toLowerCase().includes('programming') ||
                  skill.skill_name.toLowerCase().includes('software') ||
                  skill.skill_name.toLowerCase().includes('techno')
                )
                .map(skill => (
                  <Badge key={skill.id} variant="outline" className="mr-2">
                    {skill.skill_name}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Soft Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {skills
                .filter(skill => 
                  skill.skill_name.toLowerCase().includes('kommunikation') ||
                  skill.skill_name.toLowerCase().includes('führung') ||
                  skill.skill_name.toLowerCase().includes('teamwork')
                )
                .map(skill => (
                  <Badge key={skill.id} variant="outline" className="mr-2">
                    {skill.skill_name}
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};