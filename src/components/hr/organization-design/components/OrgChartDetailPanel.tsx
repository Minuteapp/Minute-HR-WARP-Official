import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, ChevronUp, Users, Target, DollarSign, AlertCircle, 
  MapPin, X, Mail, Calendar, TrendingUp, Building2 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { organizationChartService } from "@/services/organizationChartService";

interface OrgChartDetailPanelProps {
  unit: {
    id: string;
    name: string;
    type?: string;
    manager: string | null;
    location?: string;
    metrics: {
      employees: number;
      teams: number;
      goalAchievement: number;
      budget: number;
      vacancies: number;
    };
    roles?: any[];
  } | null;
  expanded: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

export const OrgChartDetailPanel = ({ unit, expanded, onToggle, onClose }: OrgChartDetailPanelProps) => {
  // Mitarbeiter der Einheit laden
  const { data: employees } = useQuery({
    queryKey: ['unit-employees', unit?.id],
    queryFn: () => unit?.id ? organizationChartService.getUnitEmployees(unit.id) : Promise.resolve([]),
    enabled: !!unit?.id && expanded
  });

  if (!unit) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-80 bg-background border-t-2 border-blue-500 shadow-2xl z-50 transition-all">
      <div className="w-full p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">{unit.name}</h2>
            </div>
            {unit.manager && (
              <p className="text-sm text-muted-foreground mt-1">
                Leiter: <span className="font-medium text-foreground">{unit.manager}</span>
              </p>
            )}
            {unit.location && (
              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{unit.location}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onToggle}>
              {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
        
        {expanded && (
          <div className="space-y-6">
            {/* KPI Grid */}
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900">{unit.metrics.employees}</p>
                  <p className="text-xs text-blue-700">Mitarbeiter</p>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 flex items-center gap-3">
                <Building2 className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-900">{unit.metrics.teams}</p>
                  <p className="text-xs text-purple-700">Teams</p>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900">{unit.metrics.goalAchievement}%</p>
                  <p className="text-xs text-green-700">Zielerreichung</p>
                </div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-900">€{unit.metrics.budget}M</p>
                  <p className="text-xs text-orange-700">Budget</p>
                </div>
              </div>
              
              <div className={`rounded-lg p-4 flex items-center gap-3 ${unit.metrics.vacancies > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
                <AlertCircle className={`h-8 w-8 ${unit.metrics.vacancies > 0 ? 'text-red-600' : 'text-slate-400'}`} />
                <div>
                  <p className={`text-2xl font-bold ${unit.metrics.vacancies > 0 ? 'text-red-900' : 'text-slate-700'}`}>
                    {unit.metrics.vacancies}
                  </p>
                  <p className={`text-xs ${unit.metrics.vacancies > 0 ? 'text-red-700' : 'text-slate-500'}`}>
                    Vakante Stellen
                  </p>
                </div>
              </div>
            </div>

            {/* Mitarbeiter-Liste */}
            {employees && employees.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Teammitglieder</h3>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-auto">
                  {employees.map((employee: any) => (
                    <div 
                      key={employee.id} 
                      className="bg-slate-50 rounded-lg p-3 flex items-start justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{employee.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{employee.role}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{employee.contact}</span>
                        </div>
                        {employee.startDate && (
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Seit {new Date(employee.startDate).getFullYear()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 ml-2">
                        <Badge 
                          variant={employee.status === 'active' ? 'default' : 'secondary'}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {employee.status === 'active' ? 'Aktiv' : employee.status === 'remote' ? 'Remote' : employee.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="font-medium text-green-600">{employee.performance}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
