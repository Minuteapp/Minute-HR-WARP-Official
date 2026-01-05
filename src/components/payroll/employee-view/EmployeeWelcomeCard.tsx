import { Card, CardContent } from "@/components/ui/card";
import { User, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const EmployeeWelcomeCard = () => {
  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: employee } = await supabase
        .from('employees')
        .select('first_name, last_name, position, department, employee_number, hire_date')
        .eq('auth_uid', user.id)
        .maybeSingle();

      return employee;
    }
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-full bg-white/20" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 bg-white/20" />
                <Skeleton className="h-4 w-64 bg-white/20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentUser) {
    return (
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Willkommen</h2>
              <p className="text-primary-foreground/80 mt-1">
                Bitte vervollständigen Sie Ihr Mitarbeiterprofil
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fullName = `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || 'Mitarbeiter';
  const hireDate = currentUser.hire_date 
    ? format(new Date(currentUser.hire_date), 'dd.MM.yyyy', { locale: de })
    : null;

  return (
    <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Willkommen, {fullName}</h2>
              <p className="text-primary-foreground/80 mt-1">
                {currentUser.position || 'Mitarbeiter'} · {currentUser.department || 'Keine Abteilung'} 
                {currentUser.employee_number && ` · MA-ID: ${currentUser.employee_number}`}
              </p>
            </div>
          </div>
          {hireDate && (
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Seit {hireDate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeWelcomeCard;
