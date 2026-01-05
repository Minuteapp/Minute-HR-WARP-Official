// Organigramm-Einstellungen Typen

export type OrganizationType = 'single_line' | 'matrix' | 'hybrid';
export type LayoutType = 'tree_top_down' | 'tree_left_right' | 'radial' | 'compact' | 'detailed';
export type DetailLevel = 'minimal' | 'standard' | 'detailed' | 'full';
export type ColorScheme = 'by_department' | 'by_company' | 'by_status' | 'custom';
export type EditSource = 'company_info_only' | 'explicit_approval' | 'direct_edit';
export type RoleType = 'employee' | 'team_lead' | 'department_head' | 'hr' | 'executive' | 'admin' | 'superadmin' | 'external';
export type UnitType = 'company' | 'location' | 'department' | 'team' | 'position' | 'person';

export interface OrgchartSettings {
  id: string;
  company_id?: string;
  
  // Strukturelle Grundlagen
  organization_type: OrganizationType;
  max_hierarchy_depth: number;
  allow_multiple_managers: boolean;
  show_deputies: boolean;
  show_vacant_positions: boolean;
  allow_temporary_structures: boolean;
  
  // Abbildungseinheiten
  enabled_unit_types: UnitType[];
  unit_type_order: Record<UnitType, number>;
  unit_type_weights: Record<string, number>;
  
  // Darstellungsoptionen
  default_layout: LayoutType;
  default_detail_level: DetailLevel;
  show_photos: boolean;
  show_contact_info: boolean;
  show_role_info: boolean;
  show_team_info: boolean;
  show_location_info: boolean;
  color_scheme: ColorScheme;
  custom_colors: Record<string, string>;
  line_style_functional: string;
  line_style_disciplinary: string;
  zoom_levels: {
    min: number;
    max: number;
    default: number;
  };
  enable_collapse_expand: boolean;
  
  // Sichtbarkeit & Datenschutz
  anonymize_sensitive_data: boolean;
  anonymize_for_external: boolean;
  external_visibility_enabled: boolean;
  
  // Pflege & Änderungslogik
  edit_source: EditSource;
  require_approval_for_changes: boolean;
  allowed_change_roles: string[];
  change_effective_date_required: boolean;
  
  // Audit
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface OrgchartVisibilityRule {
  id: string;
  company_id?: string;
  role_type: RoleType;
  
  // Sichtbarkeitsregeln
  can_view_levels_up: number;
  can_view_levels_down: number;
  can_view_siblings: boolean;
  can_view_other_departments: boolean;
  can_view_other_locations: boolean;
  can_view_vacant_positions: boolean;
  
  // Detailstufe
  detail_level: DetailLevel;
  visible_fields: string[];
  hidden_fields: string[];
  
  // Berechtigungen
  can_export: boolean;
  can_print: boolean;
  can_search: boolean;
  can_edit: boolean;
  can_manage_structure: boolean;
  
  // Audit
  created_at?: string;
  updated_at?: string;
}

export const defaultOrgchartSettings: Partial<OrgchartSettings> = {
  organization_type: 'single_line',
  max_hierarchy_depth: 10,
  allow_multiple_managers: false,
  show_deputies: true,
  show_vacant_positions: true,
  allow_temporary_structures: false,
  enabled_unit_types: ['company', 'location', 'department', 'team', 'position', 'person'],
  unit_type_order: {
    company: 1,
    location: 2,
    department: 3,
    team: 4,
    position: 5,
    person: 6
  },
  default_layout: 'tree_top_down',
  default_detail_level: 'standard',
  show_photos: true,
  show_contact_info: false,
  show_role_info: true,
  show_team_info: true,
  show_location_info: false,
  color_scheme: 'by_department',
  line_style_functional: 'dashed',
  line_style_disciplinary: 'solid',
  zoom_levels: { min: 0.25, max: 2, default: 1 },
  enable_collapse_expand: true,
  anonymize_sensitive_data: false,
  anonymize_for_external: true,
  external_visibility_enabled: false,
  edit_source: 'company_info_only',
  require_approval_for_changes: true,
  allowed_change_roles: ['hr', 'admin', 'superadmin'],
  change_effective_date_required: false
};

export const roleTypeLabels: Record<RoleType, string> = {
  employee: 'Mitarbeiter',
  team_lead: 'Teamleiter',
  department_head: 'Abteilungsleiter',
  hr: 'HR',
  executive: 'Führungskraft',
  admin: 'Administrator',
  superadmin: 'Superadmin',
  external: 'Extern'
};

export const unitTypeLabels: Record<UnitType, string> = {
  company: 'Gesellschaften',
  location: 'Standorte',
  department: 'Abteilungen',
  team: 'Teams',
  position: 'Rollen/Positionen',
  person: 'Einzelpersonen'
};

export const layoutTypeLabels: Record<LayoutType, string> = {
  tree_top_down: 'Baumdiagramm (Top-Down)',
  tree_left_right: 'Links-Rechts-Struktur',
  radial: 'Radiales Organigramm',
  compact: 'Kompakte Ansicht',
  detailed: 'Detailansicht'
};

export const colorSchemeLabels: Record<ColorScheme, string> = {
  by_department: 'Nach Abteilung',
  by_company: 'Nach Gesellschaft',
  by_status: 'Nach Status',
  custom: 'Benutzerdefiniert'
};
