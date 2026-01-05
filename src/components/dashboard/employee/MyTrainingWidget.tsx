import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Award, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';

export const MyTrainingWidget: React.FC = () => {
  const { companyId } = useCompanyId();

  const { data: trainingData, isLoading } = useQuery({
    queryKey: ['employee-training', companyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !companyId) return null;

      // Hole Mitarbeiter-ID
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('auth_user_id', user.id)
        .eq('company_id', companyId)
        .maybeSingle();

      if (!employee) return null;

      // Hole Trainings/Kurse des Mitarbeiters
      const { data: trainings } = await supabase
        .from('training_enrollments')
        .select(`
          *,
          training:training_courses(title, duration_hours)
        `)
        .eq('employee_id', employee.id);

      const activeCourses = trainings?.filter(t => t.status !== 'completed') || [];
      const completedCourses = trainings?.filter(t => t.status === 'completed') || [];

      return {
        activeCount: activeCourses.length,
        certificatesCount: completedCourses.length,
        courses: activeCourses.slice(0, 2).map(t => ({
          title: t.training?.title || 'Unbekannter Kurs',
          progress: t.progress || 0
        }))
      };
    },
    enabled: !!companyId
  });

  const activeCourses = trainingData?.activeCount || 0;
  const certificates = trainingData?.certificatesCount || 0;
  const courses = trainingData?.courses || [];

  return (
    <Card className="h-full bg-background border-primary/40 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-primary" />
          Meine Weiterbildung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-muted/30 rounded-lg p-2">
                <div className="text-2xl font-bold text-primary">{activeCourses}</div>
                <p className="text-[10px] text-muted-foreground">Aktive Kurse</p>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 flex items-center justify-center gap-1">
                <Award className="h-4 w-4 text-amber-500" />
                <div>
                  <div className="text-2xl font-bold text-amber-600">{certificates}</div>
                  <p className="text-[10px] text-muted-foreground">Zertifikate</p>
                </div>
              </div>
            </div>

            {courses.length > 0 ? (
              <div className="space-y-3">
                {courses.map((course, index) => (
                  <div key={index} className="bg-muted/30 rounded-lg p-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium truncate flex-1">{course.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={course.progress} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground w-8">{course.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">Keine aktiven Kurse</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
