
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, Save, X, Briefcase, Building, Calendar, Clock, Users, FileText, User } from 'lucide-react';
import { Employee } from "@/types/employee.types";
import { Input } from "@/components/ui/input";
import { formatDateGerman } from "@/lib/dateUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmploymentTabProps {
  employeeId: string;
  employee: Employee | null;
  isEditing?: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const EmploymentTab = ({
  employeeId,
  employee,
  isEditing = false,
  onEdit,
  onSave,
  onCancel
}: EmploymentTabProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [employmentData, setEmploymentData] = useState({
    position: employee?.position || "",
    department: employee?.department || "",
    team: employee?.team || "",
    employmentType: employee?.employment_type || "full_time",
    startDate: employee?.start_date || "",
    contractEndDate: employee?.contract_end_date || "",
    workingHours: employee?.working_hours?.toString() || "",
    vacationDays: employee?.vacation_days?.toString() || "30",
    workStartTime: employee?.work_start_time || "",
    workEndTime: employee?.work_end_time || "",
    lunchBreakStart: employee?.lunch_break_start || "",
    lunchBreakEnd: employee?.lunch_break_end || "",
    costCenter: employee?.cost_center || "",
    employeeNumber: employee?.employee_number || "",
    managerId: employee?.manager_id || ""
  });

  const { data: manager } = useMutation({
    mutationFn: async (managerId: string) => {
      if (!managerId) return null;
      const { data, error } = await supabase
        .from('employees')
        .select('id, name')
        .eq('id', managerId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  const updateEmployment = useMutation({
    mutationFn: async (data: typeof employmentData) => {
      const { error } = await supabase
        .from('employees')
        .update({
          position: data.position,
          department: data.department,
          team: data.team,
          employment_type: data.employmentType,
          start_date: data.startDate,
          contract_end_date: data.contractEndDate || null,
          working_hours: data.workingHours ? parseInt(data.workingHours) : null,
          vacation_days: data.vacationDays ? parseInt(data.vacationDays) : null,
          work_start_time: data.workStartTime || null,
          work_end_time: data.workEndTime || null,
          lunch_break_start: data.lunchBreakStart || null,
          lunch_break_end: data.lunchBreakEnd || null,
          cost_center: data.costCenter,
          employee_number: data.employeeNumber,
          manager_id: data.managerId || null
        })
        .eq('id', employeeId);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Erfolgreich gespeichert",
        description: "Die Beschäftigungsdaten wurden aktualisiert."
      });
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      onSave();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: error.message
      });
    }
  });

  const handleSaveEmployment = () => {
    updateEmployment.mutate(employmentData);
  };

  const handleFieldChange = (field: keyof typeof employmentData, value: string) => {
    setEmploymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderField = (label: string, value: string, field: keyof typeof employmentData, icon: React.ReactNode) => {
    return (
      <div className="flex justify-between items-center py-2 border-b border-gray-100">
        <dt className="font-medium flex items-center gap-2 text-gray-700">
          {icon}
          {label}:
        </dt>
        {isEditing ? (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="max-w-[250px]"
          />
        ) : (
          <dd className="text-gray-800">{value || "-"}</dd>
        )}
      </div>
    );
  };

  const getEmploymentTypeLabel = (type: string | undefined) => {
    switch (type) {
      case 'full_time': return 'Vollzeit';
      case 'part_time': return 'Teilzeit';
      case 'freelance': return 'Freiberufler';
      case 'intern': return 'Praktikant';
      case 'temporary': return 'Befristet';
      default: return type || '-';
    }
  };

  // Berechne Betriebszugehörigkeit
  const calculateTenure = () => {
    if (!employee?.start_date) return "-";
    
    const startDate = new Date(employee.start_date);
    const today = new Date();
    
    const years = today.getFullYear() - startDate.getFullYear();
    const months = today.getMonth() - startDate.getMonth();
    
    if (months < 0) {
      return `${years - 1} Jahre, ${months + 12} Monate`;
    }
    return `${years} Jahre, ${months} Monate`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            Beschäftigungsdaten
          </h2>
          <p className="text-muted-foreground">
            Vertragsdetails und Anstellungsinformationen
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex items-center gap-2"
                disabled={updateEmployment.isPending}
              >
                <X className="w-4 h-4" />
                Abbrechen
              </Button>
              <Button
                onClick={handleSaveEmployment}
                className="flex items-center gap-2"
                disabled={updateEmployment.isPending}
              >
                <Save className="w-4 h-4" />
                {updateEmployment.isPending ? "Wird gespeichert..." : "Speichern"}
              </Button>
            </>
          ) : (
            <Button
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Bearbeiten
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Vertragsdetails</TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
          <TabsTrigger value="org">Organisation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Grunddaten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  {renderField("Position", employmentData.position, "position", <Briefcase className="h-4 w-4 text-gray-500" />)}
                  {renderField("Abteilung", employmentData.department, "department", <Building className="h-4 w-4 text-gray-500" />)}
                  {renderField("Team", employmentData.team, "team", <Users className="h-4 w-4 text-gray-500" />)}
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="font-medium flex items-center gap-2 text-gray-700">
                      <FileText className="h-4 w-4 text-gray-500" />
                      Beschäftigungsart:
                    </dt>
                    {isEditing ? (
                      <select
                        value={employmentData.employmentType}
                        onChange={(e) => handleFieldChange("employmentType", e.target.value)}
                        className="px-3 py-1.5 border rounded-md max-w-[250px]"
                      >
                        <option value="full_time">Vollzeit</option>
                        <option value="part_time">Teilzeit</option>
                        <option value="freelance">Freiberufler</option>
                        <option value="intern">Praktikant</option>
                        <option value="temporary">Befristet</option>
                      </select>
                    ) : (
                      <dd className="text-gray-800">
                        {getEmploymentTypeLabel(employee?.employment_type)}
                      </dd>
                    )}
                  </div>
                  
                  {renderField("Eintrittsdatum", employmentData.startDate, "startDate", <Calendar className="h-4 w-4 text-gray-500" />)}
                  
                  {(employee?.employment_type === 'temporary' || employmentData.employmentType === 'temporary') && (
                    renderField("Vertragsende", employmentData.contractEndDate, "contractEndDate", <Calendar className="h-4 w-4 text-gray-500" />)
                  )}
                  
                  {renderField("Wochenstunden", employmentData.workingHours, "workingHours", <Clock className="h-4 w-4 text-gray-500" />)}
                  {renderField("Urlaubstage/Jahr", employmentData.vacationDays, "vacationDays", <Calendar className="h-4 w-4 text-gray-500" />)}
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Arbeitszeiten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  {renderField("Arbeitsbeginn", employmentData.workStartTime, "workStartTime", <Clock className="h-4 w-4 text-gray-500" />)}
                  {renderField("Arbeitsende", employmentData.workEndTime, "workEndTime", <Clock className="h-4 w-4 text-gray-500" />)}
                  {renderField("Mittagspause von", employmentData.lunchBreakStart, "lunchBreakStart", <Clock className="h-4 w-4 text-gray-500" />)}
                  {renderField("Mittagspause bis", employmentData.lunchBreakEnd, "lunchBreakEnd", <Clock className="h-4 w-4 text-gray-500" />)}
                </dl>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Administrative Daten
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  {renderField("Mitarbeiternummer", employmentData.employeeNumber, "employeeNumber", <FileText className="h-4 w-4 text-gray-500" />)}
                  {renderField("Kostenstelle", employmentData.costCenter, "costCenter", <FileText className="h-4 w-4 text-gray-500" />)}
                  {renderField("Vorgesetzter (ID)", employmentData.managerId, "managerId", <Users className="h-4 w-4 text-gray-500" />)}
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="font-medium flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      Betriebszugehörigkeit:
                    </dt>
                    <dd className="text-gray-800">
                      {calculateTenure()}
                    </dd>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <dt className="font-medium flex items-center gap-2 text-gray-700">
                      <FileText className="h-4 w-4 text-gray-500" />
                      Status:
                    </dt>
                    <dd className="text-gray-800">
                      <Badge className={
                        employee?.status === 'active' ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                      }>
                        {employee?.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hinweise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>💡 <strong>Zeiterfassung:</strong> Diese Arbeitszeiten werden bei der automatischen Zeiterfassung als Referenz verwendet.</p>
                  <p>📅 <strong>Urlaubstage:</strong> Jährliche Urlaubstage werden für die Abwesenheitsplanung berücksichtigt.</p>
                  <p>⏰ <strong>Arbeitszeiten:</strong> Format HH:MM (z.B. 09:00 für 9:00 Uhr)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Beschäftigungsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-primary/20 pl-6 ml-6 space-y-8 py-2">
                <div className="relative">
                  <div className="absolute -left-[33px] bg-white p-1">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Briefcase className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex flex-col md:flex-row md:justify-between mb-2">
                      <h3 className="font-medium">{employee?.position}</h3>
                      <span className="text-sm text-gray-500">
                        {employee?.start_date ? formatDateGerman(employee.start_date) : '-'} 
                        {employee?.contract_end_date ? ` - ${formatDateGerman(employee.contract_end_date)}` : ' - heute'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Abteilung: {employee?.department || '-'}, Team: {employee?.team || '-'}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline">{getEmploymentTypeLabel(employee?.employment_type)}</Badge>
                      <Badge variant="outline">{employee?.working_hours} Std./Woche</Badge>
                    </div>
                  </div>
                </div>
                
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="org">
          <Card>
            <CardHeader>
              <CardTitle>Organisationsstruktur</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                {employee?.manager_id ? (
                  <div className="mb-8">
                    <h3 className="text-sm text-center mb-2 text-gray-500">Vorgesetzter</h3>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-1">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <span className="font-medium">{manager?.name || 'Wird geladen...'}</span>
                      <span className="text-xs text-gray-500">ID: {employee.manager_id}</span>
                    </div>
                  </div>
                ) : null}
                
                <div className="mb-8 border-t-2 border-primary pt-4">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-1">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <span className="font-medium">{employee?.name}</span>
                    <span className="text-sm text-gray-600">{employee?.position}</span>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{employee?.department}</Badge>
                      <Badge variant="outline">{employee?.team}</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm text-center mb-2 text-gray-500">Unterstellte (0)</h3>
                  <div className="text-center text-gray-500 italic">
                    Keine direkten Mitarbeiter
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
