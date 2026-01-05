import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, BookOpen, Target, Calendar, Award, DollarSign, User, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

interface DevelopmentPlan {
  id: string;
  employee_name: string;
  plan_name: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'on_hold' | 'archived';
  progress_percentage: number;
  start_date: string;
  target_completion_date: string;
  budget_allocated: number;
  budget_spent: number;
  manager_name: string;
  competency_gaps: string[];
  development_goals: { title: string; completed: boolean }[];
  learning_activities: { title: string; type: string; completed: boolean }[];
}

export const DevelopmentPlansView = () => {
  const { tenantCompany } = useTenant();
  const currentCompanyId = tenantCompany?.id;
  
  // ECHTE DATEN: Laden aus Supabase mit company_id Filter
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['development-plans', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      const { data, error } = await supabase
        .from('development_plans')
        .select(`
          id,
          plan_name,
          description,
          status,
          progress_percentage,
          start_date,
          target_completion_date,
          budget_allocated,
          budget_spent,
          competency_gaps,
          development_goals,
          learning_activities,
          employees!development_plans_employee_id_fkey(first_name, last_name),
          manager:employees!development_plans_manager_id_fkey(first_name, last_name)
        `)
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching development plans:', error);
        return [];
      }

      return (data || []).map((plan: any): DevelopmentPlan => ({
        id: plan.id,
        employee_name: plan.employees 
          ? `${plan.employees.first_name || ''} ${plan.employees.last_name || ''}`.trim() || 'Unbekannt'
          : 'Unbekannt',
        plan_name: plan.plan_name || 'Unbenannter Plan',
        description: plan.description || '',
        status: plan.status || 'draft',
        progress_percentage: plan.progress_percentage || 0,
        start_date: plan.start_date,
        target_completion_date: plan.target_completion_date,
        budget_allocated: plan.budget_allocated || 0,
        budget_spent: plan.budget_spent || 0,
        manager_name: plan.manager 
          ? `${plan.manager.first_name || ''} ${plan.manager.last_name || ''}`.trim() || 'Unbekannt'
          : 'Unbekannt',
        competency_gaps: plan.competency_gaps || [],
        development_goals: plan.development_goals || [],
        learning_activities: plan.learning_activities || []
      }));
    },
    enabled: !!currentCompanyId
  });

  const getStatusColor = (status: DevelopmentPlan['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusName = (status: DevelopmentPlan['status']) => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'active': return 'Aktiv';
      case 'completed': return 'Abgeschlossen';
      case 'on_hold': return 'Pausiert';
      case 'archived': return 'Archiviert';
    }
  };

  const getBudgetUtilization = (allocated: number, spent: number) => {
    return allocated > 0 ? (spent / allocated) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Entwicklungspläne (IDPs)</h2>
          <p className="text-sm text-gray-500">Individuelle Entwicklungspläne mit Lernzielen und Mentoring</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neuer Entwicklungsplan
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Entwicklungspläne</h3>
              <p className="text-muted-foreground mb-4">
                Es wurden noch keine Entwicklungspläne erstellt.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ersten Plan erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Development Plans Grid */}
          <div className="space-y-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <CardTitle>{plan.plan_name}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(plan.status)} border-0`}
                        >
                          {getStatusName(plan.status)}
                        </Badge>
                      </div>
                      <CardDescription>{plan.description}</CardDescription>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {plan.employee_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Manager: {plan.manager_name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{plan.progress_percentage}%</div>
                      <div className="text-xs text-gray-500">Fortschritt</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Gesamtfortschritt</span>
                      <span>{plan.progress_percentage}%</span>
                    </div>
                    <Progress value={plan.progress_percentage} className="h-2" />
                  </div>

                  {/* Timeline and Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Zeitplan
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start:</span>
                          <span>{plan.start_date ? new Date(plan.start_date).toLocaleDateString('de-DE') : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ziel:</span>
                          <span>{plan.target_completion_date ? new Date(plan.target_completion_date).toLocaleDateString('de-DE') : '-'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        Budget
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Geplant:</span>
                          <span>{plan.budget_allocated.toLocaleString('de-DE')} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Verwendet:</span>
                          <span className={getBudgetUtilization(plan.budget_allocated, plan.budget_spent) > 90 ? 'text-red-600' : 'text-green-600'}>
                            {plan.budget_spent.toLocaleString('de-DE')} €
                          </span>
                        </div>
                        <Progress value={getBudgetUtilization(plan.budget_allocated, plan.budget_spent)} className="h-1" />
                      </div>
                    </div>
                  </div>

                  {/* Competency Gaps */}
                  {plan.competency_gaps.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Kompetenzlücken</h4>
                      <div className="flex flex-wrap gap-2">
                        {plan.competency_gaps.map((gap, index) => (
                          <Badge key={index} variant="outline" className="bg-red-50 text-red-700">
                            {gap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Development Goals */}
                  {plan.development_goals.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Entwicklungsziele ({plan.development_goals.filter(g => g.completed).length}/{plan.development_goals.length})
                      </h4>
                      <div className="space-y-2">
                        {plan.development_goals.map((goal, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${goal.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                              {goal.completed && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                            <span className={goal.completed ? 'line-through text-gray-500' : ''}>{goal.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Learning Activities */}
                  {plan.learning_activities.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        Lernaktivitäten ({plan.learning_activities.filter(a => a.completed).length}/{plan.learning_activities.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {plan.learning_activities.map((activity, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm p-2 rounded border">
                            <div className={`w-3 h-3 rounded border ${activity.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}></div>
                            <div className="flex-1">
                              <div className={activity.completed ? 'line-through text-gray-500' : ''}>{activity.title}</div>
                              <Badge variant="outline" className="text-xs mt-1">{activity.type}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Letzte Aktualisierung: vor 2 Tagen
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Bearbeiten
                      </Button>
                      <Button size="sm">
                        Details anzeigen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {plans.filter(p => p.status === 'active').length}
                </div>
                <p className="text-sm text-gray-600">Aktive Pläne</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {plans.length > 0 ? Math.round(plans.reduce((sum, p) => sum + p.progress_percentage, 0) / plans.length) : 0}%
                </div>
                <p className="text-sm text-gray-600">Ø Fortschritt</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {plans.reduce((sum, p) => sum + p.budget_allocated, 0).toLocaleString('de-DE')} €
                </div>
                <p className="text-sm text-gray-600">Gesamtbudget</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {plans.filter(p => p.status === 'completed').length}
                </div>
                <p className="text-sm text-gray-600">Abgeschlossen</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Create IDP Template */}
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">KI-unterstützte IDP Erstellung</h3>
              <p className="text-sm text-gray-600 mt-1">
                Lassen Sie unsere KI basierend auf Performance Reviews und Kompetenzlücken 
                personalisierte Entwicklungspläne vorschlagen
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="outline">Vorlage verwenden</Button>
              <Button>KI-Empfehlung generieren</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
