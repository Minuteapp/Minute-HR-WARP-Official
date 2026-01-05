import { TabsContent } from "@/components/ui/tabs";
import { ProfileTabContent } from "./tabs/ProfileTabContent";
import { useEmployeeEdit } from "@/hooks/useEmployeeEdit";
import { EmployeeTabEditProps } from "@/types/employee-tab-props.types";
import { EmployeeEditData } from "@/types/employee-profile.types";

interface ProfileTabContentWrapperProps extends EmployeeTabEditProps {}

// Funktion um editData aus employee zu erstellen
const createEditDataFromEmployee = (employee: any): EmployeeEditData => ({
  personalInfo: {
    firstName: employee?.first_name || '',
    lastName: employee?.last_name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    mobilePhone: employee?.mobile_phone || '',
    birthDate: employee?.birth_date || '',
    gender: (employee as any)?.gender || undefined,
    nationality: employee?.nationality || '',
    secondNationality: (employee as any)?.second_nationality || '',
    address: {
      street: employee?.street || '',
      postalCode: employee?.postal_code || '',
      city: employee?.city || '',
      country: employee?.country || 'Deutschland'
    }
  },
  employmentInfo: {
    position: employee?.position || '',
    department: employee?.department || '',
    team: employee?.team || '',
    startDate: employee?.start_date || '',
    workingHours: employee?.working_hours || '40',
    vacationDays: employee?.vacation_days || '30',
    workStartTime: employee?.work_start_time || '09:00',
    workEndTime: employee?.work_end_time || '17:00',
    lunchBreakStart: employee?.lunch_break_start || '12:00',
    lunchBreakEnd: employee?.lunch_break_end || '13:00',
    taxId: employee?.tax_id || '',
    socialSecurityNumber: employee?.social_security_number || '',
    managerId: employee?.manager_id || '',
    costCenter: employee?.cost_center || '',
    taxClass: employee?.tax_class || '',
    healthInsurance: employee?.health_insurance || '',
    iban: employee?.iban || '',
    bic: employee?.bic || '',
    bankName: employee?.bank_name || ''
  },
  emergencyContact: {
    name: employee?.emergency_contact_name || '',
    phone: employee?.emergency_contact_phone || '',
    relation: employee?.emergency_contact_relationship || ''
  }
});

export const ProfileTabContentWrapper = ({ 
  employeeId, 
  isEditing: externalIsEditing,
  onFieldChange: externalOnFieldChange,
  pendingChanges
}: ProfileTabContentWrapperProps) => {
  const {
    isEditing: localIsEditing,
    editData: localEditData,
    isLoading,
    isUpdating,
    employee,
    handleEdit,
    handleSave,
    handleCancel,
    handleFieldChange: localHandleFieldChange,
    handleAddressChange
  } = useEmployeeEdit(employeeId);

  // Verwende externen State wenn vorhanden, sonst lokalen
  const isEditing = externalIsEditing ?? localIsEditing;
  
  // KRITISCH: Bei externem isEditing, editData aus employee erstellen
  const editData = externalIsEditing 
    ? createEditDataFromEmployee(employee) 
    : localEditData;

  // Bei externem Edit-Mode, externalOnFieldChange verwenden
  const handleFieldChange = externalIsEditing && externalOnFieldChange
    ? (section: keyof EmployeeEditData, field: string, value: string) => {
        externalOnFieldChange('profile', `${section}.${field}`, value);
      }
    : localHandleFieldChange;

  if (isLoading) {
    return <div className="flex items-center justify-center h-48">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <TabsContent value="profile" className="bg-white p-6 rounded-lg border shadow-sm">
      <ProfileTabContent
        isEditing={isEditing}
        isUpdating={isUpdating}
        editData={editData}
        employee={employee}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onFieldChange={handleFieldChange}
        onAddressChange={handleAddressChange}
        hideLocalButtons={externalIsEditing !== undefined}
      />
    </TabsContent>
  );
};
