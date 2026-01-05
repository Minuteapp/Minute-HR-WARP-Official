// ============================================================================
// ENTERPRISE WORKFORCE MANAGEMENT TYPES
// ============================================================================

export type ResourceCategory = 'person' | 'asset' | 'location' | 'equipment';
export type ResourceStatus = 'available' | 'maintenance' | 'reserved' | 'unavailable';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type LicenseStatus = 'active' | 'expired' | 'suspended' | 'revoked';
export type Seniority = 'junior' | 'intermediate' | 'senior' | 'expert';

export type RuleCategory = 'legal' | 'tariff' | 'internal' | 'safety' | 'custom';
export type RuleType = 'hard_constraint' | 'soft_goal' | 'preference';
export type RuleScope = 'global' | 'location' | 'department' | 'team' | 'role';
export type ViolationSeverity = 'info' | 'warning' | 'error' | 'critical';

export type SwapRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type SwapRequestPriority = 'low' | 'normal' | 'high' | 'urgent';
export type MarketplaceStatus = 'open' | 'claimed' | 'filled' | 'cancelled';
export type ScenarioType = 'what_if' | 'crisis' | 'forecast' | 'optimization';
export type ScenarioStatus = 'draft' | 'running' | 'completed' | 'applied';

// ========== RESSOURCEN & ASSETS ==========

export interface ResourceType {
  id: string;
  company_id: string;
  name: string;
  category: ResourceCategory;
  icon?: string;
  color?: string;
  attributes: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  company_id: string;
  resource_type_id: string;
  name: string;
  identifier?: string;
  location_id?: string;
  status: ResourceStatus;
  capacity?: Record<string, any>;
  attributes: Record<string, any>;
  maintenance_schedule?: Record<string, any>;
  required_skills?: string[];
  required_licenses?: string[];
  cost_per_hour?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ========== SKILLS & LIZENZEN ==========

export interface Skill {
  id: string;
  company_id: string;
  name: string;
  category?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface License {
  id: string;
  company_id: string;
  name: string;
  issuing_authority?: string;
  validity_period_months?: number;
  required_for_resources?: string[];
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface EmployeeSkill {
  id: string;
  employee_id: string;
  skill_id: string;
  skill_level?: SkillLevel;
  acquired_date?: string;
  verified_by?: string;
  notes?: string;
  created_at: string;
}

export interface EmployeeLicense {
  id: string;
  employee_id: string;
  license_id: string;
  license_number?: string;
  issue_date: string;
  expiry_date: string;
  verified_by?: string;
  document_url?: string;
  status: LicenseStatus;
  notes?: string;
  created_at: string;
}

// ========== REGELN & CONSTRAINTS ==========

export interface ShiftRule {
  id: string;
  company_id: string;
  name: string;
  category: RuleCategory;
  rule_type: RuleType;
  scope: RuleScope;
  scope_id?: string;
  country_code?: string;
  priority: number;
  condition: Record<string, any>;
  violation_message?: string;
  violation_severity?: ViolationSeverity;
  can_override: boolean;
  override_requires_approval: boolean;
  override_approval_roles?: string[];
  effective_from: string;
  effective_until?: string;
  is_active: boolean;
  version: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceOverride {
  id: string;
  company_id: string;
  shift_id?: string;
  rule_id?: string;
  employee_id?: string;
  override_type: string;
  reason: string;
  justification?: string;
  risk_assessment?: string;
  requested_by: string;
  approved_by?: string;
  requested_at: string;
  approved_at?: string;
  status: 'pending' | 'approved' | 'rejected';
  metadata: Record<string, any>;
  logged_at: string;
}

// ========== ANFORDERUNGEN ==========

export interface ShiftRequirement {
  id: string;
  shift_type_id?: string;
  company_id: string;
  location_id?: string;
  min_employees: number;
  max_employees?: number;
  required_skills?: string[];
  required_licenses?: string[];
  required_seniority?: Seniority;
  required_resources?: string[];
  valid_from?: string;
  valid_until?: string;
  created_at: string;
  updated_at: string;
}

// ========== EMPLOYEE SELF-SERVICE ==========

export interface SwapRequest {
  id: string;
  company_id: string;
  original_shift_id: string;
  requesting_employee_id: string;
  target_employee_id?: string;
  target_shift_id?: string;
  status: SwapRequestStatus;
  priority: SwapRequestPriority;
  compliance_check_passed?: boolean;
  compliance_violations?: Record<string, any>;
  requested_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  message?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface MarketplaceShift {
  id: string;
  company_id: string;
  shift_id: string;
  shift_type_id?: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  location_id?: string;
  department?: string;
  required_skills?: string[];
  required_licenses?: string[];
  min_seniority?: string;
  base_pay?: number;
  incentive_pay?: number;
  status: MarketplaceStatus;
  claimed_by?: string;
  claimed_at?: string;
  visible_to_roles?: string[];
  posted_by: string;
  posted_at: string;
  expires_at?: string;
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface EmployeePreferences {
  id: string;
  employee_id: string;
  preferred_shift_types?: string[];
  preferred_days_of_week?: number[];
  preferred_time_slots?: Record<string, any>;
  blackout_dates?: Record<string, any>;
  max_hours_per_week?: number;
  max_consecutive_days?: number;
  min_rest_hours?: number;
  prefers_fixed_schedule: boolean;
  willing_to_work_weekends: boolean;
  willing_to_work_nights: boolean;
  flexibility_score?: number;
  notes?: string;
  valid_from: string;
  valid_until?: string;
  created_at: string;
}

// ========== SZENARIO-PLANUNG ==========

export interface Scenario {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  scenario_type: ScenarioType;
  base_date_from: string;
  base_date_to: string;
  assumptions: Record<string, any>;
  results?: Record<string, any>;
  cost_impact?: number;
  status: ScenarioStatus;
  created_by: string;
  created_at: string;
}

// ========== OPTIMIERUNG ==========

export interface OptimizationGoal {
  category: 'cost' | 'service_level' | 'fairness' | 'compliance' | 'satisfaction';
  weight: number;
  target_value?: number;
  measurement_unit?: string;
}

export interface OptimizationResult {
  goal: string;
  achieved_value: number;
  target_value: number;
  score: number;
  details?: Record<string, any>;
}

// ========== VIEWS & DASHBOARDS ==========

export interface ResourceWithType extends Resource {
  resource_type?: ResourceType;
}

export interface EmployeeWithSkillsAndLicenses {
  employee_id: string;
  employee_name: string;
  skills: Array<{
    skill: Skill;
    level: SkillLevel;
    acquired_date?: string;
  }>;
  licenses: Array<{
    license: License;
    license_number?: string;
    issue_date: string;
    expiry_date: string;
    status: LicenseStatus;
  }>;
}

export interface ShiftWithRequirements {
  shift_id: string;
  shift_type: string;
  date: string;
  start_time: string;
  end_time: string;
  requirements: ShiftRequirement;
  assigned_employees: string[];
  assigned_resources: string[];
  status: string;
  compliance_status: {
    has_violations: boolean;
    violations: Array<{
      rule: ShiftRule;
      severity: ViolationSeverity;
      message: string;
    }>;
  };
}
