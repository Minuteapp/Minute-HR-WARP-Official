// Asset-Einstellungen Typen

export type AssetCategory = 'it_hardware' | 'accessory' | 'vehicle' | 'access_media' | 'work_tool' | 'software_license' | 'furniture' | 'other';
export type DepreciationMethod = 'linear' | 'declining' | 'none';
export type AssetCondition = 'new' | 'excellent' | 'good' | 'fair' | 'poor' | 'damaged' | 'defective';
export type AssetStatus = 'available' | 'assigned' | 'in_repair' | 'reserved' | 'in_transit' | 'disposed' | 'lost' | 'stolen';
export type AssignmentTarget = 'employee' | 'role' | 'team' | 'location' | 'department' | 'pool';
export type AssignmentType = 'permanent' | 'temporary' | 'project' | 'replacement';

export interface AssetType {
  id: string;
  company_id?: string;
  name: string;
  code?: string;
  description?: string;
  category: AssetCategory;
  icon?: string;
  color?: string;
  require_serial_number: boolean;
  require_inventory_number: boolean;
  track_value: boolean;
  track_warranty: boolean;
  depreciation_method: DepreciationMethod;
  depreciation_years: number;
  maintenance_interval_days?: number;
  maintenance_reminder_days: number;
  custom_attributes: CustomAttribute[];
  required_attributes: string[];
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface CustomAttribute {
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  options?: string[];
}

export interface AssetSettings {
  id: string;
  company_id?: string;
  
  // Inventarnummer-Generierung
  auto_generate_inventory_number: boolean;
  inventory_number_prefix: string;
  inventory_number_format: string;
  inventory_number_sequence: number;
  
  // Barcode/QR
  enable_barcode: boolean;
  barcode_format: string;
  enable_qr_code: boolean;
  qr_code_content: string;
  
  // Zuweisungsregeln
  assignment_targets: AssignmentTarget[];
  max_assets_per_user?: number;
  max_assets_per_type_per_user?: number;
  allow_multiple_assignment: boolean;
  require_assignment_confirmation: boolean;
  assignment_confirmation_days: number;
  
  // Lifecycle-Automatisierungen
  auto_assign_onboarding: boolean;
  auto_check_role_change: boolean;
  force_return_offboarding: boolean;
  auto_reassign_location_change: boolean;
  notify_before_warranty_end: boolean;
  warranty_notification_days: number;
  
  // Rückgabe-Einstellungen
  require_return_checklist: boolean;
  require_condition_report: boolean;
  require_damage_report: boolean;
  require_digital_confirmation: boolean;
  allow_self_return: boolean;
  escalation_enabled: boolean;
  escalation_days_overdue: number;
  escalation_recipients: string[];
  
  // KI-Funktionen
  ai_suggestions_enabled: boolean;
  ai_unused_detection_enabled: boolean;
  ai_unused_threshold_days: number;
  ai_maintenance_prediction_enabled: boolean;
  ai_cost_optimization_enabled: boolean;
  
  // Compliance & Audit
  enable_full_audit_trail: boolean;
  retention_years: number;
  enable_periodic_inventory: boolean;
  inventory_frequency_months: number;
  
  created_at?: string;
  updated_at?: string;
}

export interface Asset {
  id: string;
  company_id?: string;
  asset_type_id?: string;
  inventory_number?: string;
  barcode?: string;
  qr_code?: string;
  name: string;
  description?: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price?: number;
  current_value?: number;
  currency: string;
  supplier?: string;
  invoice_number?: string;
  warranty_start?: string;
  warranty_end?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  maintenance_notes?: string;
  location_id?: string;
  cost_center?: string;
  department?: string;
  condition: AssetCondition;
  status: AssetStatus;
  owner_company_id?: string;
  custom_attributes: Record<string, any>;
  tags: string[];
  notes?: string;
  documents: string[];
  images: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AssetAssignment {
  id: string;
  asset_id: string;
  company_id?: string;
  assigned_to_type: AssignmentTarget;
  assigned_to_id: string;
  assigned_to_name?: string;
  assigned_date: string;
  expected_return_date?: string;
  actual_return_date?: string;
  assignment_reason?: string;
  assignment_type: AssignmentType;
  project_id?: string;
  confirmed_by_assignee: boolean;
  confirmed_at?: string;
  confirmation_notes?: string;
  return_condition?: AssetCondition;
  return_notes?: string;
  damage_notes?: string;
  damage_cost?: number;
  returned_confirmed: boolean;
  returned_confirmed_at?: string;
  returned_confirmed_by?: string;
  return_checklist: ChecklistItem[];
  checklist_completed: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  notes?: string;
}

export interface AssetRoleRequirement {
  id: string;
  company_id?: string;
  role_name: string;
  role_id?: string;
  department?: string;
  asset_type_id: string;
  is_mandatory: boolean;
  quantity: number;
  allow_alternatives: boolean;
  alternative_asset_types: string[];
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AssetReturnChecklist {
  id: string;
  company_id?: string;
  asset_type_id: string;
  name: string;
  description?: string;
  items: ChecklistItem[];
  is_active: boolean;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export const categoryLabels: Record<AssetCategory, string> = {
  it_hardware: 'IT-Hardware',
  accessory: 'Zubehör',
  vehicle: 'Fahrzeuge',
  access_media: 'Zutrittsmedien',
  work_tool: 'Arbeitsmittel',
  software_license: 'Software-Lizenzen',
  furniture: 'Möbel',
  other: 'Sonstige'
};

export const conditionLabels: Record<AssetCondition, string> = {
  new: 'Neu',
  excellent: 'Ausgezeichnet',
  good: 'Gut',
  fair: 'Akzeptabel',
  poor: 'Schlecht',
  damaged: 'Beschädigt',
  defective: 'Defekt'
};

export const statusLabels: Record<AssetStatus, string> = {
  available: 'Verfügbar',
  assigned: 'Zugewiesen',
  in_repair: 'In Reparatur',
  reserved: 'Reserviert',
  in_transit: 'Im Transport',
  disposed: 'Ausgesondert',
  lost: 'Verloren',
  stolen: 'Gestohlen'
};

export const assignmentTargetLabels: Record<AssignmentTarget, string> = {
  employee: 'Mitarbeiter',
  role: 'Rolle',
  team: 'Team',
  location: 'Standort',
  department: 'Abteilung',
  pool: 'Pool'
};

export const defaultAssetSettings: Partial<AssetSettings> = {
  auto_generate_inventory_number: true,
  inventory_number_prefix: 'INV',
  inventory_number_format: '{prefix}-{year}-{sequence}',
  inventory_number_sequence: 1,
  enable_barcode: true,
  barcode_format: 'CODE128',
  enable_qr_code: true,
  qr_code_content: 'inventory_number',
  assignment_targets: ['employee', 'role', 'team', 'location', 'pool'],
  allow_multiple_assignment: false,
  require_assignment_confirmation: true,
  assignment_confirmation_days: 3,
  auto_assign_onboarding: true,
  auto_check_role_change: true,
  force_return_offboarding: true,
  auto_reassign_location_change: false,
  notify_before_warranty_end: true,
  warranty_notification_days: 30,
  require_return_checklist: true,
  require_condition_report: true,
  require_damage_report: false,
  require_digital_confirmation: true,
  allow_self_return: false,
  escalation_enabled: true,
  escalation_days_overdue: 7,
  escalation_recipients: ['hr', 'manager'],
  ai_suggestions_enabled: false,
  ai_unused_detection_enabled: false,
  ai_unused_threshold_days: 90,
  ai_maintenance_prediction_enabled: false,
  ai_cost_optimization_enabled: false,
  enable_full_audit_trail: true,
  retention_years: 10,
  enable_periodic_inventory: false,
  inventory_frequency_months: 12
};
