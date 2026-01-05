import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Briefcase, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Target,
  CheckSquare,
  AlertCircle,
  Award,
  Building2,
  Users,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Zap,
  Shield,
  Activity,
  FileText,
  Settings,
  Timer,
  Plus,
  Minus,
  Lightbulb,
  Route,
  Sparkles,
  Loader2,
  BookOpen,
  MessageCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEmployeeData } from "@/hooks/useEmployeeData";
import { useEmployeeAIInsights } from "@/hooks/useEmployeeAIInsights";

interface OverviewTabProps {
  employeeId: string;
}

export const OverviewTab = ({ employeeId }: OverviewTabProps) => {
  const { employee, isLoading } = useEmployeeData(employeeId);
  const { data: aiInsights, isLoading: isLoadingInsights } = useEmployeeAIInsights(employeeId);

  // Organisational data
  const { data: orgData } = useQuery({
    queryKey: ['orgData', employeeId],
    queryFn: async () => {
      const [projectsRes, tasksRes] = await Promise.all([
        supabase.from('projects').select('*').contains('team_members', [employeeId]).limit(3),
        supabase
          .from('tasks')
          .select('*')
          .contains('assigned_to', [employeeId])
          .neq('status', 'completed')
          .limit(5)
      ]);
      return {
        projects: projectsRes.data || [],
        activeTasks: tasksRes.data || [],
        supervisor: null
      };
    },
    enabled: !!employee
  });

  // Time & Absence data
  const { data: timeData } = useQuery({
    queryKey: ['timeData', employeeId],
    queryFn: async () => {
      const today = new Date();
      const thisYear = today.getFullYear();
      const startOfYear = new Date(thisYear, 0, 1);
      
      const [absenceRes, timeRes, sickRes] = await Promise.all([
        supabase.from('absence_requests')
          .select('*, absence_type')
          .eq('user_id', employeeId)
          .gte('start_date', startOfYear.toISOString())
          .eq('status', 'approved'),
        supabase.from('time_entries')
          .select('start_time, end_time, break_minutes')
          .eq('user_id', employeeId)
          .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('sick_leaves')
          .select('start_date, end_date')
          .eq('user_id', employeeId)
          .gte('start_date', startOfYear.toISOString())
      ]);

      const vacationDays = absenceRes.data?.filter(a => a.absence_type === 'vacation').length || 0;
      const sickDays = sickRes.data?.reduce((sum, s) => {
        const start = new Date(s.start_date);
        const end = new Date(s.end_date);
        return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }, 0) || 0;

      const totalHours = timeRes.data?.reduce((sum, entry) => {
        if (!entry.end_time) return sum;
        const start = new Date(entry.start_time);
        const end = new Date(entry.end_time);
        const breakTime = entry.break_minutes || 0;
        const workHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60) - (breakTime / 60);
        return sum + workHours;
      }, 0) || 0;

      const expectedHours = (employee?.working_hours || 40) * 4;
      const overtimeHours = Math.max(0, totalHours - expectedHours);

      return {
        vacationUsed: vacationDays,
        vacationTotal: 30,
        sickDays,
        overtimeHours: Math.round(overtimeHours),
        workingModel: employee?.employment_type === 'full_time' ? 'Vollzeit' : 'Teilzeit'
      };
    },
    enabled: !!employee
  });

  // Performance & Goals
  const { data: performanceData } = useQuery({
    queryKey: ['performanceData', employeeId],
    queryFn: async () => {
      const [goalsRes, reviewRes, trainingRes] = await Promise.all([
        supabase.from('personal_goals').select('*').eq('user_id', employeeId).eq('status', 'active'),
        supabase.from('performance_reviews').select('*').eq('employee_id', employeeId).order('created_at', { ascending: false }).limit(1),
        supabase.from('training_sessions').select('*').eq('employee_id', employeeId).eq('status', 'in_progress')
      ]);

      const goalProgress = goalsRes.data?.length > 0 
        ? Math.round(goalsRes.data.reduce((sum, g) => sum + (g.progress || 0), 0) / goalsRes.data.length)
        : 0;

      return {
        activeGoals: goalsRes.data?.length || 0,
        goalProgress,
        lastReview: reviewRes.data?.[0] || null,
        activeTrainings: trainingRes.data?.length || 0
      };
    }
  });

  if (isLoading || !employee) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KI-Insights & Empfehlungen - Nur anzeigen wenn echte Daten vorhanden */}
      {aiInsights && !isLoadingInsights ? (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              KI-Insights & Empfehlungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {aiInsights.summary || 'Noch keine KI-Analyse verfügbar.'}
            </p>

            {(aiInsights.leadership_potential !== undefined || aiInsights.technical_skills !== undefined || aiInsights.collaboration !== undefined) && (
              <div className="grid grid-cols-3 gap-4">
                {aiInsights.leadership_potential !== undefined && (
                  <div className="bg-white rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Leadership-Potenzial</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-green-600">{aiInsights.leadership_potential}%</span>
                      <Progress value={aiInsights.leadership_potential} className="h-2 flex-1" />
                    </div>
                  </div>
                )}
                {aiInsights.technical_skills !== undefined && (
                  <div className="bg-white rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Technische Skills</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-green-600">{aiInsights.technical_skills}%</span>
                      <Progress value={aiInsights.technical_skills} className="h-2 flex-1" />
                    </div>
                  </div>
                )}
                {aiInsights.collaboration !== undefined && (
                  <div className="bg-white rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Kollaboration</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-green-600">{aiInsights.collaboration}%</span>
                      <Progress value={aiInsights.collaboration} className="h-2 flex-1" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {aiInsights.recommendations && aiInsights.recommendations.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Empfohlene Maßnahmen</p>
                <div className="space-y-2">
                  {aiInsights.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-border">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{rec.title}</span>
                      </div>
                      <Badge className={`border-0 text-xs ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'medium' ? 'bg-gray-100 text-gray-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {rec.priority === 'high' ? 'hoch' : rec.priority === 'medium' ? 'mittel' : 'niedrig'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : isLoadingInsights ? (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="py-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-muted-foreground">KI-Analyse wird geladen...</span>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200 bg-gray-50/30">
          <CardContent className="py-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm">Noch keine Daten für KI-Analyse verfügbar. Mehr Mitarbeiterdaten werden benötigt.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Grid - 3 Karten */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Organisatorisch */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-muted-foreground" />
              Organisatorisch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Aktuelle Projekte</span>
              <span className="font-semibold">{orgData?.projects?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Offene Aufgaben</span>
              <span className="font-semibold">{orgData?.activeTasks?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sonstige Aktivitäten</span>
              <span className="font-semibold">0</span>
            </div>
          </CardContent>
        </Card>

        {/* Zeit & Abwesenheiten */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Zeit & Abwesenheiten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {employee.working_hours ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Arbeitszeitmodell</span>
                <span className="font-semibold">{employee.employment_type === 'full_time' ? 'Vollzeit' : 'Teilzeit'} ({employee.working_hours}h)</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Arbeitszeitmodell</span>
                <span className="text-sm text-muted-foreground italic">Nicht hinterlegt</span>
              </div>
            )}
            {employee.vacation_days ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Resturlaub</span>
                <span className="font-semibold text-green-600">
                  {employee.vacation_days - (timeData?.vacationUsed || 0)} Tage
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Resturlaub</span>
                <span className="text-sm text-muted-foreground italic">Nicht hinterlegt</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Überstunden</span>
              <span className="font-semibold">
                {timeData?.overtimeHours && timeData.overtimeHours > 0 ? '+' : ''}{timeData?.overtimeHours || 0}h
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Krankheit (YTD)</span>
              <span className="font-semibold">{timeData?.sickDays || 0} Tage</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance & Ziele */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-5 w-5 text-muted-foreground" />
              Performance & Ziele
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Aktuelle Ziele</span>
                <span className="font-semibold">{performanceData?.activeGoals || 0}</span>
              </div>
              {performanceData?.goalProgress !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Zielerreichung</span>
                    <span>{performanceData.goalProgress}%</span>
                  </div>
                  <Progress value={performanceData.goalProgress} className="h-2" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Laufende Schulungen</span>
              <span className="font-semibold">{performanceData?.activeTrainings || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sonstige Aktivitäten Container */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-muted-foreground" />
            Sonstige Aktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Innovation Hub */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span className="font-medium">Innovation Hub</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Eingereichte Ideen</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bewertungen erhalten</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Implementierte Ideen</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>

            {/* Roadmap */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Roadmap Beteiligung</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Zugewiesene Meilensteine</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Abgeschlossene Meilensteine</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kommende Deadlines</span>
                  <span className="font-semibold">0</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};