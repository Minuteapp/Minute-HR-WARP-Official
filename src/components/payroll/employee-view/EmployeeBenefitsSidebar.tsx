import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, ChevronRight, Inbox } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EmployeeBenefitsSidebar = () => {
  const { data: benefits = [], isLoading } = useQuery({
    queryKey: ["employee-benefits-sidebar"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data: employee } = await supabase
        .from("employees")
        .select("id")
        .eq("auth_uid", user.id)
        .single();
      
      if (!employee) return [];

      const { data, error } = await supabase
        .from("salary_benefits")
        .select("*")
        .eq("employee_id", employee.id);
      
      if (error) throw error;
      return data || [];
    }
  });

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Aktiv
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground">
        Verfügbar
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg">Zusatzleistungen</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Lade Benefits...
          </div>
        ) : benefits.length === 0 ? (
          <div className="text-center py-6">
            <Inbox className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">Keine Zusatzleistungen zugewiesen</p>
          </div>
        ) : (
          benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <Gift className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm truncate">{benefit.name}</p>
                    {getStatusBadge(benefit.is_active)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {benefit.value || "—"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        <Button variant="outline" className="w-full mt-2">
          Weitere Benefits
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmployeeBenefitsSidebar;