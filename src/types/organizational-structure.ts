export type OrganizationalUnitType = 'area' | 'department' | 'team' | 'location' | 'subsidiary';

export type OrganizationalRoleType = 'manager' | 'member' | 'deputy' | 'assistant' | 'viewer';

export type VisibilityLevel = 'public' | 'company' | 'internal' | 'restricted';

export interface OrganizationalUnit {
  id: string;
  name: string;
  type: OrganizationalUnitType;
  code?: string;
  parent_id?: string;
  level: number;
  path: string[];
  description?: string;
  metadata: Record<string, any>;
  
  // Kontaktinformationen
  manager_id?: string;
  contact_email?: string;
  phone?: string;
  
  // Physische Standortdaten
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  timezone: string;
  
  // Organisatorische Daten
  cost_center?: string;
  budget_code?: string;
  legal_entity?: string;
  
  // Status und Gültigkeit
  is_active: boolean;
  valid_from: string;
  valid_until?: string;
  
  // Berechtigungen und Sichtbarkeit
  visibility: VisibilityLevel;
  
  // Audit-Felder
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  
  // Beziehungen
  children?: OrganizationalUnit[];
  parent?: OrganizationalUnit;
  roles?: OrganizationalRole[];
}

export interface OrganizationalRole {
  id: string;
  user_id: string;
  organizational_unit_id: string;
  role_type: OrganizationalRoleType;
  
  // Zusätzliche Rollendaten
  responsibilities: string[];
  permissions: Record<string, any>;
  
  // Gültigkeit
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  
  // Audit-Felder
  created_at: string;
  updated_at: string;
  assigned_by?: string;
  
  // Beziehungen
  organizational_unit?: OrganizationalUnit;
  user_name?: string;
  user_email?: string;
}

export interface OrganizationalConfig {
  id: string;
  config_key: string;
  config_value: Record<string, any>;
  description?: string;
  is_system: boolean;
  
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateOrganizationalUnitData {
  name: string;
  type: OrganizationalUnitType;
  code?: string;
  parent_id?: string;
  description?: string;
  manager_id?: string;
  contact_email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  timezone?: string;
  cost_center?: string;
  budget_code?: string;
  legal_entity?: string;
  visibility?: VisibilityLevel;
}

export interface UpdateOrganizationalUnitData extends Partial<CreateOrganizationalUnitData> {
  id: string;
}

export interface CreateOrganizationalRoleData {
  user_id: string;
  organizational_unit_id: string;
  role_type: OrganizationalRoleType;
  responsibilities?: string[];
  permissions?: Record<string, any>;
  valid_from?: string;
  valid_until?: string;
}

export interface UpdateOrganizationalRoleData extends Partial<CreateOrganizationalRoleData> {
  id: string;
}

export interface OrganizationalHierarchy {
  unit: OrganizationalUnit;
  children: OrganizationalHierarchy[];
  depth: number;
  hasChildren: boolean;
  isExpanded?: boolean;
}