// Gemeinsame Props für alle editierbaren Employee-Tabs
export interface EmployeeTabEditProps {
  employeeId: string;
  isEditing?: boolean;
  onFieldChange?: (tab: string, field: string, value: any) => void;
  pendingChanges?: Record<string, any>;
}
