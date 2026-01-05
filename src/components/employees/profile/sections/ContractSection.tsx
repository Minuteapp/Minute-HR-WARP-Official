import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmployeeEditData } from "@/types/employee-profile.types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { renderFieldIfExists, renderEmptyState } from "@/utils/fieldRenderer";

interface ContractSectionProps {
  employee: Employee | null;
  isEditing: boolean;
  editData?: EmployeeEditData | null;
  onFieldChange?: (section: keyof EmployeeEditData, field: string, value: string) => void;
}

export const ContractSection = ({ employee, isEditing, editData, onFieldChange }: ContractSectionProps) => {
  // Fetch all employees for manager selection
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-for-manager-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, position')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: isEditing
  });


  const renderEditableField = (label: string, field: string, value: string, type: string = "text", placeholder?: string) => (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onFieldChange?.('employmentInfo', field, e.target.value)}
        placeholder={placeholder}
        className="h-9"
      />
    </div>
  );

  const getContractStatus = () => {
    if (employee?.status === 'active') return 'Aktiv';
    return 'Inaktiv';
  };

  const getManagerName = (managerId: string | undefined) => {
    if (!managerId) return 'Nicht zugewiesen';
    const manager = employees.find(emp => emp.id === managerId);
    return manager ? `${manager.name} (${manager.position})` : 'Nicht zugewiesen';
  };

  if (isEditing && editData) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Vertragsdaten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderEditableField('Eintrittsdatum', 'startDate', editData.employmentInfo.startDate, 'date')}
          {renderEditableField('Vertragsende (optional)', 'contractEndDate', editData.employmentInfo.contractEndDate || '', 'date', 'Nur für befristete Verträge')}
          {renderEditableField('Kostenstelle', 'costCenter', editData.employmentInfo.costCenter || '', 'text', 'z.B. 4200')}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Vorgesetzter</Label>
            <Select
              value={editData.employmentInfo.managerId || ''}
              onValueChange={(value) => onFieldChange?.('employmentInfo', 'managerId', value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Vorgesetzten auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nicht zugewiesen</SelectItem>
                {employees
                  .filter(emp => emp.id !== employee?.id)
                  .map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.position})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Vertragsdaten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {renderFieldIfExists('Eintrittsdatum', employee?.start_date ? new Date(employee.start_date).toLocaleDateString('de-DE') : null)}
        
        {employee?.status && (
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-muted-foreground">Vertragsart</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {employee?.contract_end_date ? 'Befristet' : 'Unbefristet'}
              </span>
              <Badge variant={employee?.contract_end_date ? 'outline' : 'default'} className="text-xs">
                {getContractStatus()}
              </Badge>
            </div>
          </div>
        )}
        
        {employee?.contract_end_date && renderFieldIfExists('Vertragsende', new Date(employee.contract_end_date).toLocaleDateString('de-DE'))}
        {renderFieldIfExists('Probezeit endet', employee?.start_date 
          ? new Date(new Date(employee.start_date).setMonth(new Date(employee.start_date).getMonth() + 6)).toLocaleDateString('de-DE') 
          : null)}
        {renderFieldIfExists('Vorgesetzter', employee?.manager_id ? getManagerName(employee.manager_id) : null)}
        {renderFieldIfExists('Kostenstelle', employee?.cost_center)}
        
        {!employee?.start_date && !employee?.status && !employee?.manager_id && !employee?.cost_center && (
          renderEmptyState("Keine Vertragsdaten vorhanden.")
        )}
      </CardContent>
    </Card>
  );
};
