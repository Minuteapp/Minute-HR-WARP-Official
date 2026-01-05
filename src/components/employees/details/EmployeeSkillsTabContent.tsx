import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, CheckCircle2, ExternalLink, Star } from "lucide-react";
import { EditableField } from "@/components/employees/shared/EditableField";
import { EmployeeTabEditProps } from "@/types/employee-tab-props.types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeSkillsTabContentProps extends EmployeeTabEditProps {}

interface Skill {
  name: string;
  level: number;
  badge?: string;
  updated?: string;
  category?: string;
}

interface Certificate {
  id?: string;
  title: string;
  issuer: string;
  issued: string;
  validUntil?: string;
  badge?: string;
  status?: string;
}

const getSkillBadge = (level: number): { badge: string; color: string } => {
  if (level >= 90) return { badge: 'Expert', color: 'bg-green-600' };
  if (level >= 70) return { badge: 'Advanced', color: 'bg-blue-600' };
  if (level >= 40) return { badge: 'Intermediate', color: 'bg-orange-600' };
  return { badge: 'Beginner', color: 'bg-gray-500' };
};

export const EmployeeSkillsTabContent = ({ 
  employeeId,
  isEditing = false,
  onFieldChange,
  pendingChanges
}: EmployeeSkillsTabContentProps) => {
  
  // Lade Skills und Zertifikate aus der Datenbank
  const { data: employeeData, isLoading } = useQuery({
    queryKey: ['employee-skills-certifications', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('skills, certifications')
        .eq('id', employeeId)
        .single();
      
      if (error) {
        console.error('Fehler beim Laden der Skills:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!employeeId,
  });

  // Parse skills aus JSONB
  const skills: Skill[] = employeeData?.skills 
    ? (Array.isArray(employeeData.skills) 
        ? employeeData.skills.map((skill: any) => ({
            name: skill.name || 'Unbekannt',
            level: skill.level || 50,
            badge: skill.badge,
            updated: skill.updated,
            category: skill.category || 'Technisch',
          }))
        : [])
    : [];

  // Parse certifications aus JSONB
  const certificates: Certificate[] = employeeData?.certifications 
    ? (Array.isArray(employeeData.certifications) 
        ? employeeData.certifications.map((cert: any, index: number) => ({
            id: cert.id || `cert-${index}`,
            title: cert.title || cert.name || 'Unbekanntes Zertifikat',
            issuer: cert.issuer || 'Unbekannt',
            issued: cert.issued || cert.date || '-',
            validUntil: cert.validUntil || cert.valid_until || 'Unbegrenzt',
            badge: cert.badge || 'Certificate',
            status: cert.status || 'active',
          }))
        : [])
    : [];

  const technicalSkills = skills.filter(s => s.category === 'Technisch' || !s.category);
  const softSkills = skills.filter(s => s.category === 'Soft Skills');

  // Statistiken berechnen
  const stats = {
    totalSkills: skills.length,
    expertLevel: skills.filter(s => s.level >= 90).length,
    certificates: certificates.length,
    activeCertificates: certificates.filter(c => c.status === 'active').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  // Leerer Zustand
  if (skills.length === 0 && certificates.length === 0) {
    return (
      <div className="space-y-6">
        {/* Empty State */}
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-30" />
            <h3 className="text-lg font-medium mb-2">Keine Skills oder Zertifikate hinterlegt</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Fügen Sie Skills und Qualifikationen hinzu, um das Profil zu vervollständigen.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="sm">
                Skill hinzufügen
              </Button>
              <Button variant="outline" size="sm">
                Zertifikat hochladen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Gesamtskills</div>
              <div className="text-3xl font-bold">{stats.totalSkills}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Expert Level</div>
              <div className="text-3xl font-bold">{stats.expertLevel}</div>
              <div className="text-xs text-muted-foreground">
                {stats.totalSkills > 0 ? Math.round((stats.expertLevel / stats.totalSkills) * 100) : 0}% aller Skills
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Zertifikate</div>
              <div className="text-3xl font-bold">{stats.certificates}</div>
              <div className="text-xs text-muted-foreground">
                {stats.activeCertificates} aktiv
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Skill Score</div>
              <div className="text-3xl font-bold text-primary">
                {stats.totalSkills > 0 
                  ? Math.round(skills.reduce((acc, s) => acc + s.level, 0) / stats.totalSkills)
                  : 0
                }/100
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Skills */}
      {technicalSkills.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Technische Kompetenzen</CardTitle>
            </div>
            <Button variant="outline" size="sm">
              Skill hinzufügen
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {technicalSkills.map((skill, index) => {
                const { badge, color } = getSkillBadge(skill.level);
                return (
                  <div key={index} className="space-y-3 p-4 bg-background border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{skill.name}</span>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${
                          badge === "Expert"
                            ? "bg-green-100 text-green-700"
                            : badge === "Advanced"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {skill.badge || badge}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold">{skill.level}%</span>
                        {skill.updated && (
                          <span className="text-muted-foreground">Update: {skill.updated}</span>
                        )}
                      </div>
                      <Progress value={skill.level} className="h-2" indicatorClassName={color} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Soft Skills */}
      {softSkills.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Soft Skills & Führungskompetenzen</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {softSkills.map((skill, index) => (
                <Card key={index} className="bg-background">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="font-semibold text-sm mb-1">{skill.name}</div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold">{skill.level}%</span>
                        </div>
                      </div>
                      <Progress value={skill.level} className="h-2" indicatorClassName="bg-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Zertifikate & Qualifikationen</CardTitle>
            </div>
            <Button variant="outline" size="sm">
              Zertifikat hochladen
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className="bg-background">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{cert.title}</h4>
                            <Badge variant="secondary" className="bg-black text-white text-xs">
                              {cert.badge}
                            </Badge>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>
                            <span className="font-medium">Ausgestellt von:</span> {cert.issuer}
                          </div>
                          <div className="flex items-center gap-4">
                            <span>
                              <span className="font-medium">Erhalten:</span> {cert.issued}
                            </span>
                            <span>•</span>
                            <span>
                              <span className="font-medium">Gültig bis:</span> {cert.validUntil}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
