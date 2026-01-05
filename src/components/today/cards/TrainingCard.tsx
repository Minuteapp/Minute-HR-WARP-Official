
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, MoreHorizontal, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format, addDays, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';

interface TrainingCardProps {
  darkMode: boolean;
  onToggleVisibility: () => void;
}

const TrainingCard = ({ darkMode, onToggleVisibility }: TrainingCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Lade Kurse mit Enrollments aus der Datenbank
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['user-courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // Hole zuerst die Employee ID
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!employeeData) return [];
      
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses (
            id,
            title,
            description,
            category,
            is_mandatory,
            estimated_duration
          )
        `)
        .eq('employee_id', employeeData.id)
        .in('status', ['enrolled', 'in_progress', 'completed'])
        .order('enrolled_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      
      // Transformiere die Daten für die Anzeige
      return (data || []).map(enrollment => ({
        id: enrollment.id,
        title: enrollment.course?.title || 'Unbekannter Kurs',
        description: enrollment.course?.description,
        category: enrollment.course?.category,
        type: enrollment.course?.is_mandatory ? 'mandatory' : 
              enrollment.status === 'completed' ? 'completed' : 'optional',
        progress: enrollment.progress || 0,
        duration: enrollment.course?.estimated_duration || 0,
        dueDate: enrollment.deadline,
        certificate: enrollment.certificate_issued_at ? true : false,
        status: enrollment.status
      }));
    },
    enabled: !!user?.id
  });
  
  const getMandatoryDueCourses = () => {
    return courses.filter(course => 
      course.type === 'mandatory' && 
      course.dueDate && 
      isAfter(new Date(course.dueDate), new Date()) &&
      course.progress < 100
    ).length;
  };
  
  const getCourseBadge = (course: any) => {
    if (course.type === 'mandatory') {
      return <Badge variant="destructive">Verpflichtend</Badge>;
    } else if (course.type === 'completed') {
      return <Badge variant="default" className="bg-green-500">Abgeschlossen</Badge>;
    } else {
      return <Badge variant="outline">Optional</Badge>;
    }
  };
  
  return (
    <Card className={`today-card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <GraduationCap className="h-5 w-5 text-primary" />
          Weiterbildung
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/training')}>
              Alle Kurse
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/training/certificates')}>
              Meine Zertifikate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleVisibility}>
              Card ausblenden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {getMandatoryDueCourses() > 0 && (
          <div className={`p-2 rounded-md mb-3 text-sm flex items-center font-medium ${
            darkMode ? 'bg-amber-900 text-amber-200' : 'bg-amber-50 text-amber-700'
          }`}>
            <span>⚠️ {getMandatoryDueCourses()} verpflichtende {getMandatoryDueCourses() === 1 ? 'Schulung steht' : 'Schulungen stehen'} aus</span>
          </div>
        )}
        
        <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Lade Kurse...
            </div>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <div
                key={course.id}
                className={`p-3 rounded-md flex items-start gap-3 ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium">{course.title}</h4>
                    {getCourseBadge(course)}
                  </div>
                  
                  {course.progress < 100 ? (
                    <>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{course.progress}% abgeschlossen</span>
                        <span>{course.duration} Min.</span>
                      </div>
                      <Progress value={course.progress} className="h-1.5" />
                    </>
                  ) : course.certificate && (
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-green-600 dark:text-green-400">Zertifikat verfügbar</span>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8"
                        onClick={() => navigate('/training/certificates')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Anzeigen
                      </Button>
                    </div>
                  )}
                  
                  {course.dueDate && (
                    <p className={`text-xs mt-2 ${
                      course.type === 'mandatory' 
                        ? darkMode ? 'text-red-300' : 'text-red-600'
                        : darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Frist: {format(new Date(course.dueDate), 'dd.MM.yyyy', { locale: de })}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Keine aktiven Kurse
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => navigate('/training')}
        >
          Weiterbildungsportal öffnen
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TrainingCard;
