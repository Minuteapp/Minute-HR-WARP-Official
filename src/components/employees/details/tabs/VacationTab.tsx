import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Umbrella, Heart, Calendar, Info, FileText, Plus } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { useEmployeeVacationData } from "@/hooks/useEmployeeVacationData";
import { EditableField } from "@/components/employees/shared/EditableField";
import { EmployeeTabEditProps } from "@/types/employee-tab-props.types";
import { useEnterprisePermissions } from "@/hooks/useEnterprisePermissions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface VacationTabProps extends Omit<EmployeeTabEditProps, 'employeeId'> {
  employee: Employee;
}

export const VacationTab = ({ 
  employee, 
  isEditing = false, 
  onFieldChange, 
  pendingChanges 
}: VacationTabProps) => {
  const { data: vacationData } = useEmployeeVacationData(employee.id);
  const { canCreate } = useEnterprisePermissions();
  
  // Echte Daten für geplante Abwesenheiten aus der Datenbank
  const { data: plannedAbsences = [] } = useQuery({
    queryKey: ['employee-planned-absences', employee.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('absence_requests')
        .select('*')
        .eq('user_id', employee.id)
        .in('status', ['pending', 'approved'])
        .gte('start_date', new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employee.id
  });

  // Echte Daten für Abwesenheits-Historie aus der Datenbank
  const { data: absenceHistory = [] } = useQuery({
    queryKey: ['employee-absence-history', employee.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('absence_requests')
        .select('*')
        .eq('user_id', employee.id)
        .eq('status', 'approved')
        .lt('end_date', new Date().toISOString().split('T')[0])
        .order('end_date', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!employee.id
  });
  
  const getValue = (field: string, defaultValue: any) => {
    return pendingChanges?.vacation?.[field] ?? defaultValue;
  };

  const handleChange = (field: string, value: any) => {
    onFieldChange?.('vacation', field, value);
  };

  const annualEntitlement = getValue('annual_entitlement', vacationData?.annual_entitlement ?? 0);
  const remaining = getValue('remaining', vacationData?.remaining ?? 0);
  const taken = getValue('taken', vacationData?.taken ?? 0);
  const planned = getValue('planned', vacationData?.planned ?? 0);
  const carryover = getValue('carryover', vacationData?.carryover ?? 0);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy', { locale: de });
    } catch {
      return dateStr;
    }
  };

  const calculateDays = (startDate: string, endDate: string, halfDay?: boolean) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return halfDay ? days * 0.5 : days;
  };

  const getTypeIcon = (type: string) => {
    if (type === 'sick' || type === 'Krankheit') {
      return Heart;
    }
    return Umbrella;
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'vacation': return 'Urlaub';
      case 'sick': return 'Krankheit';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Row - Urlaubsanspruch & Krankheitstage */}
      <div className="grid grid-cols-2 gap-6">
        {/* Urlaubsanspruch 2025 */}
        <Card className="p-6 bg-green-50/50 border-green-200">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Umbrella className="w-5 h-5 text-green-600" />
            <span>Urlaubsanspruch {new Date().getFullYear()}</span>
          </h3>
          
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Resturlaub</p>
            {isEditing ? (
              <EditableField
                value={remaining}
                isEditing={isEditing}
                onChange={(val) => handleChange('remaining', val)}
                type="number"
                suffix=" Tage"
                showLabel={false}
                valueClassName="text-5xl font-bold text-green-600 mb-3"
              />
            ) : (
              <p className="text-5xl font-bold text-green-600 mb-3">
                {remaining} Tage
              </p>
            )}
            <Progress 
              value={annualEntitlement > 0 ? (remaining / annualEntitlement) * 100 : 0} 
              className="h-3 mb-2" 
            />
            <p className="text-xs text-muted-foreground">
              von {annualEntitlement} Tagen verfügbar
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-white rounded-lg">
              <EditableField
                label="Jahresanspruch"
                value={annualEntitlement}
                isEditing={isEditing}
                onChange={(val) => handleChange('annual_entitlement', val)}
                type="number"
                suffix=" Tage"
                labelClassName="text-sm text-muted-foreground mb-1"
                valueClassName="text-xl font-bold"
              />
            </div>
            <div className="p-3 bg-white rounded-lg">
              <EditableField
                label="Genommen"
                value={taken}
                isEditing={isEditing}
                onChange={(val) => handleChange('taken', val)}
                type="number"
                suffix=" Tage"
                labelClassName="text-sm text-muted-foreground mb-1"
                valueClassName="text-xl font-bold"
              />
            </div>
            <div className="p-3 bg-white rounded-lg">
              <EditableField
                label="Geplant"
                value={planned}
                isEditing={isEditing}
                onChange={(val) => handleChange('planned', val)}
                type="number"
                suffix=" Tage"
                labelClassName="text-sm text-muted-foreground mb-1"
                valueClassName="text-xl font-bold"
              />
            </div>
            <div className="p-3 bg-white rounded-lg">
              <EditableField
                label={`Übertrag ${new Date().getFullYear() - 1}`}
                value={carryover}
                isEditing={isEditing}
                onChange={(val) => handleChange('carryover', val)}
                type="number"
                suffix=" Tage"
                labelClassName="text-sm text-muted-foreground mb-1"
                valueClassName="text-xl font-bold"
              />
            </div>
          </div>

          <Button className="w-full bg-black hover:bg-black/90 text-white">
            Urlaub beantragen
          </Button>
        </Card>

        {/* Krankheitstage */}
        <Card className="p-6 bg-red-50/50 border-red-200">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            <span>Krankheitstage {new Date().getFullYear()}</span>
          </h3>
          
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Krankheitstage (YTD)</p>
            <EditableField
              value={getValue('sickDays', 0)}
              isEditing={isEditing}
              onChange={(val) => handleChange('sickDays', val)}
              type="number"
              suffix=" Tage"
              showLabel={false}
              valueClassName="text-5xl font-bold mb-3"
            />
            <p className="text-sm text-muted-foreground">Statistik wird aus Datenbank berechnet</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-white rounded-lg">
              <EditableField
                label="Letzter Monat"
                value={getValue('sickDaysLastMonth', 0)}
                isEditing={isEditing}
                onChange={(val) => handleChange('sickDaysLastMonth', val)}
                type="number"
                suffix=" Tage"
                labelClassName="text-sm text-muted-foreground mb-1"
                valueClassName="text-xl font-bold"
              />
            </div>
            <div className="p-3 bg-white rounded-lg">
              <EditableField
                label="Durchschnitt"
                value={getValue('sickDaysAverage', 0)}
                isEditing={isEditing}
                onChange={(val) => handleChange('sickDaysAverage', val)}
                type="number"
                suffix=" Tage"
                labelClassName="text-sm text-muted-foreground mb-1"
                valueClassName="text-xl font-bold"
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Bei Krankheit bitte Krankmeldung hochladen und HR informieren.
            </p>
          </div>

          <Button className="w-full" variant="outline">
            Krankmeldung einreichen
          </Button>
        </Card>
      </div>

      {/* Geplante Abwesenheiten */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span>Geplante Abwesenheiten</span>
          </h3>
          {canCreate('employee_absences') && (
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Abwesenheit hinzufügen
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {plannedAbsences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Keine geplanten Abwesenheiten vorhanden</p>
            </div>
          ) : (
            plannedAbsences.map((absence) => {
              const IconComponent = getTypeIcon(absence.type);
              const days = calculateDays(absence.start_date, absence.end_date, absence.half_day);
              return (
                <div key={absence.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{getTypeLabel(absence.type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(absence.start_date)} - {formatDate(absence.end_date)} ({days} Tage)
                      </p>
                    </div>
                  </div>
                  <Badge className={absence.status === "approved" ? "bg-green-600" : "bg-blue-600"}>
                    {absence.status === "approved" ? "genehmigt" : "beantragt"}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Abwesenheits-Historie */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          <span>Abwesenheits-Historie</span>
        </h3>
        {absenceHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Keine vergangenen Abwesenheiten vorhanden</p>
          </div>
        ) : (
          <div className="overflow-hidden border rounded-lg">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Typ</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Zeitraum</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Dauer</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {absenceHistory.map((item) => {
                  const IconComponent = getTypeIcon(item.type);
                  const days = calculateDays(item.start_date, item.end_date, item.half_day);
                  return (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <IconComponent className={`w-4 h-4 ${item.type === 'sick' ? 'text-red-600' : 'text-blue-600'}`} />
                          <span className="text-sm font-medium">{getTypeLabel(item.type)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {formatDate(item.start_date)} - {formatDate(item.end_date)}
                      </td>
                      <td className="p-3 text-sm font-medium">{days} Tage</td>
                      <td className="p-3">
                        <Badge variant="secondary" className="text-xs">
                          abgeschlossen
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Jahresübersicht */}
      <Card className="p-6 bg-blue-50/50 border-blue-200">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Jahresübersicht {new Date().getFullYear()}</span>
        </h3>
        <div className="grid grid-cols-6 gap-4">
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Urlaubstage</p>
            <p className="text-2xl font-bold">{taken}</p>
            <p className="text-xs text-muted-foreground mt-1">genommen</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Krankheit</p>
            <p className="text-2xl font-bold">{getValue('sickDays', 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Tage</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Geplant</p>
            <p className="text-2xl font-bold">{planned}</p>
            <p className="text-xs text-muted-foreground mt-1">Tage</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Verbleibend</p>
            <p className="text-2xl font-bold text-green-600">{remaining}</p>
            <p className="text-xs text-muted-foreground mt-1">Tage</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Übertrag</p>
            <p className="text-2xl font-bold">{carryover}</p>
            <p className="text-xs text-muted-foreground mt-1">Tage</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Anwesenheit</p>
            <p className="text-2xl font-bold text-green-600">-</p>
            <p className="text-xs text-muted-foreground mt-1">Rate</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
