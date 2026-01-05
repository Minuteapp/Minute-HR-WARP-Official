
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { EmployeeEditData } from '@/types/employee-profile.types';
import { useEmployeeData } from './useEmployeeData';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from './useUserRole';

export const useEmployeeEdit = (employeeId: string) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<EmployeeEditData | null>(null);
  const { toast } = useToast();
  const { employee, isLoading, updateEmployee, isUpdating } = useEmployeeData(employeeId);
  const { isHRAdmin } = useUserRole();

  const handleEdit = () => {
    if (!employee) return;
    
    setEditData({
      personalInfo: {
        firstName: employee.first_name || '',
        lastName: employee.last_name || '',
        birthDate: employee.birth_date || '',
        nationality: employee.nationality || '',
        secondNationality: (employee as any).second_nationality || '',
        gender: (employee as any).gender || undefined,
        email: employee.email || '',
        phone: employee.phone || '',
        mobilePhone: employee.mobile_phone || '',
        address: {
          street: employee.street || '',
          city: employee.city || '',
          postalCode: employee.postal_code || '',
          country: employee.country || '',
        }
      },
      employmentInfo: {
        position: employee.position || '',
        department: employee.department || '',
        team: employee.team || '',
        startDate: employee.start_date || '',
        workingHours: employee.working_hours?.toString() || '',
        vacationDays: employee.vacation_days?.toString() || '30',
        workStartTime: employee.work_start_time || '',
        workEndTime: employee.work_end_time || '',
        lunchBreakStart: employee.lunch_break_start || '',
        lunchBreakEnd: employee.lunch_break_end || '',
        taxId: employee.tax_id || '',
        socialSecurityNumber: employee.social_security_number || '',
        managerId: employee.manager_id || '',
        contractEndDate: employee.contract_end_date || '',
        costCenter: employee.cost_center || '',
        taxClass: (employee as any).tax_class || '',
        healthInsurance: (employee as any).health_insurance || '',
        iban: (employee as any).iban || '',
        bic: (employee as any).bic || '',
        bankName: (employee as any).bank_name || '',
      },
      emergencyContact: {
        name: employee.emergency_contact_name || '',
        relation: employee.emergency_contact_relation || '',
        phone: employee.emergency_contact_phone || '',
      }
    });
    setIsEditing(true);
  };

  const hasSensitiveChanges = (oldData: any, newData: any) => {
    const sensitiveFields = ['iban', 'bic', 'bank_name', 'salary_amount', 'salary_currency', 'tax_class', 'health_insurance', 'social_security_number'];
    return sensitiveFields.some(field => oldData[field] !== newData[field]);
  };

  const handleSave = async () => {
    try {
      if (!employee || !editData) {
        console.error('handleSave: Missing employee or editData', { employee, editData });
        toast({
          variant: "destructive",
          title: "Fehler",
          description: "Mitarbeiterdaten oder Änderungen fehlen."
        });
        return;
      }
      
      const startDate = editData.employmentInfo.startDate 
        ? new Date(editData.employmentInfo.startDate) 
        : null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const status = startDate && startDate > today ? 'inactive' : employee.status;
      
      const updateData = {
        first_name: editData.personalInfo.firstName || '',
        last_name: editData.personalInfo.lastName || '',
        name: `${editData.personalInfo.firstName || ''} ${editData.personalInfo.lastName || ''}`.trim(),
        email: editData.personalInfo.email || '',
        phone: editData.personalInfo.phone || null,
        mobile_phone: editData.personalInfo.mobilePhone || null,
        nationality: editData.personalInfo.nationality || null,
        second_nationality: editData.personalInfo.secondNationality || null,
        gender: editData.personalInfo.gender || null,
        birth_date: editData.personalInfo.birthDate && editData.personalInfo.birthDate.trim() !== '' ? editData.personalInfo.birthDate : null,
        street: editData.personalInfo.address.street || null,
        city: editData.personalInfo.address.city || null,
        postal_code: editData.personalInfo.address.postalCode || null,
        country: editData.personalInfo.address.country || null,
        department: editData.employmentInfo.department || null,
        team: editData.employmentInfo.team || null,
        position: editData.employmentInfo.position || null,
        start_date: editData.employmentInfo.startDate && editData.employmentInfo.startDate.trim() !== '' ? editData.employmentInfo.startDate : null,
        working_hours: editData.employmentInfo.workingHours ? parseInt(editData.employmentInfo.workingHours) : null,
        vacation_days: editData.employmentInfo.vacationDays ? parseInt(editData.employmentInfo.vacationDays) : 30,
        work_start_time: editData.employmentInfo.workStartTime || null,
        work_end_time: editData.employmentInfo.workEndTime || null,
        lunch_break_start: editData.employmentInfo.lunchBreakStart || null,
        lunch_break_end: editData.employmentInfo.lunchBreakEnd || null,
        tax_id: editData.employmentInfo.taxId || null,
        emergency_contact_name: editData.emergencyContact.name || null,
        emergency_contact_relation: editData.emergencyContact.relation || null,
        emergency_contact_phone: editData.emergencyContact.phone || null,
        manager_id: editData.employmentInfo.managerId || null,
        contract_end_date: editData.employmentInfo.contractEndDate || null,
        cost_center: editData.employmentInfo.costCenter || null,
        status: status
      };

      // Check for sensitive changes
      const sensitiveChanges: any = {};
      let changeType: string | null = null;

      // Bank details changes
      if (
        editData.employmentInfo.iban !== (employee as any).iban ||
        editData.employmentInfo.bic !== (employee as any).bic ||
        editData.employmentInfo.bankName !== (employee as any).bank_name
      ) {
        sensitiveChanges.iban = editData.employmentInfo.iban;
        sensitiveChanges.bic = editData.employmentInfo.bic;
        sensitiveChanges.bankName = editData.employmentInfo.bankName;
        changeType = 'bank_details';
      }

      // Tax info changes
      if (
        editData.employmentInfo.taxClass !== (employee as any).tax_class ||
        editData.employmentInfo.healthInsurance !== (employee as any).health_insurance ||
        editData.employmentInfo.socialSecurityNumber !== employee.social_security_number
      ) {
        if (!changeType) changeType = 'tax_info';
        sensitiveChanges.tax_class = editData.employmentInfo.taxClass;
        sensitiveChanges.health_insurance = editData.employmentInfo.healthInsurance;
        sensitiveChanges.social_security_number = editData.employmentInfo.socialSecurityNumber;
      }

      // If there are sensitive changes, create a pending change request
      if (changeType && Object.keys(sensitiveChanges).length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const { data: pendingChange, error: pendingError } = await supabase
          .from('employee_pending_changes')
          .insert({
            employee_id: employeeId,
            requested_by: user.id,
            requested_by_name: employee.name || user.email || 'Unbekannt',
            change_type: changeType,
            changes: sensitiveChanges,
            expires_at: expiresAt.toISOString(),
            employee_email: editData.personalInfo.email,
            reason: 'Profiländerung durch HR-Admin',
          })
          .select()
          .single();

        if (pendingError) throw pendingError;

        // Send notification email
        const { error: emailError } = await supabase.functions.invoke('send-change-notification', {
          body: {
            type: 'change_request',
            pendingChangeId: pendingChange.id,
          },
        });

        if (emailError) {
          console.error('Error sending notification:', emailError);
        }

        // Update non-sensitive fields immediately
        await updateEmployee(updateData);

        toast({
          title: "Änderung beantragt",
          description: "Sensible Daten wurden zur Bestätigung per E-Mail verschickt. Andere Änderungen wurden gespeichert.",
        });
      } else {
        // No sensitive changes, update everything immediately
        const fullUpdateData = {
          ...updateData,
          social_security_number: editData.employmentInfo.socialSecurityNumber,
          tax_class: editData.employmentInfo.taxClass || null,
          health_insurance: editData.employmentInfo.healthInsurance || null,
          iban: editData.employmentInfo.iban || null,
          bic: editData.employmentInfo.bic || null,
          bank_name: editData.employmentInfo.bankName || null,
        };

        await updateEmployee(fullUpdateData);
        
        toast({
          title: "Erfolgreich gespeichert",
          description: "Ihre Änderungen wurden gespeichert."
        });
      }

      setIsEditing(false);
      setEditData(null);
    } catch (error: any) {
      console.error('Error saving changes:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        stack: error?.stack
      });
      toast({
        variant: "destructive",
        title: "Fehler beim Speichern",
        description: error?.message || "Die Änderungen konnten nicht gespeichert werden."
      });
    }
  };

  const handleCancel = (silent?: boolean) => {
    setIsEditing(false);
    setEditData(null);
    if (!silent) {
      toast({
        title: "Bearbeitung abgebrochen",
        description: "Die Änderungen wurden verworfen."
      });
    }
  };

  const handleFieldChange = (section: keyof EmployeeEditData, field: string, value: string) => {
    setEditData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      };
    });
  };

  const handleAddressChange = (field: string, value: string) => {
    setEditData((prev) => {
      if (!prev) return prev;
      
      if (field.startsWith('address.')) {
        const addressField = field.replace('address.', '');
        return {
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            address: {
              ...prev.personalInfo.address,
              [addressField]: value
            }
          }
        };
      }
      
      return {
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          address: {
            ...prev.personalInfo.address,
            [field]: value
          }
        }
      };
    });
  };

  return {
    isEditing,
    editData,
    isLoading,
    isUpdating,
    employee,
    handleEdit,
    handleSave,
    handleCancel,
    handleFieldChange,
    handleAddressChange
  };
};
