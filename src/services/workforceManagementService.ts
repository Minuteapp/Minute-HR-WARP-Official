import { supabase } from '@/integrations/supabase/client';
import type {
  ResourceType,
  Resource,
  Skill,
  License,
  EmployeeSkill,
  EmployeeLicense,
  ShiftRule,
  SwapRequest,
  MarketplaceShift,
  EmployeePreferences,
  Scenario
} from '@/types/workforce-management';

// ========== RESSOURCENTYPEN ==========

export const getResourceTypes = async (companyId: string) => {
  const { data, error } = await supabase
    .from('wfm_resource_types')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as ResourceType[];
};

export const createResourceType = async (resourceType: Omit<ResourceType, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('wfm_resource_types')
    .insert(resourceType)
    .select()
    .single();

  if (error) throw error;
  return data as ResourceType;
};

// ========== RESSOURCEN/ASSETS ==========

export const getResources = async (companyId: string, filters?: { type?: string; status?: string }) => {
  let query = supabase
    .from('wfm_resources')
    .select('*, resource_type:wfm_resource_types(*)')
    .eq('company_id', companyId);

  if (filters?.type) {
    query = query.eq('resource_type_id', filters.type);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('name');

  if (error) throw error;
  return data;
};

export const createResource = async (resource: Omit<Resource, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('wfm_resources')
    .insert(resource)
    .select()
    .single();

  if (error) throw error;
  return data as Resource;
};

export const updateResource = async (id: string, updates: Partial<Resource>) => {
  const { data, error } = await supabase
    .from('wfm_resources')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Resource;
};

// ========== SKILLS ==========

export const getSkills = async (companyId: string) => {
  const { data, error } = await supabase
    .from('wfm_skills')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as Skill[];
};

export const getEmployeeSkills = async (employeeId: string) => {
  const { data, error } = await supabase
    .from('wfm_employee_skills')
    .select('*, skill:wfm_skills(*)')
    .eq('employee_id', employeeId);

  if (error) throw error;
  return data;
};

export const addEmployeeSkill = async (employeeSkill: Omit<EmployeeSkill, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('wfm_employee_skills')
    .insert(employeeSkill)
    .select()
    .single();

  if (error) throw error;
  return data as EmployeeSkill;
};

// ========== LIZENZEN ==========

export const getLicenses = async (companyId: string) => {
  const { data, error } = await supabase
    .from('wfm_licenses')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as License[];
};

export const getEmployeeLicenses = async (employeeId: string) => {
  const { data, error } = await supabase
    .from('wfm_employee_licenses')
    .select('*, license:wfm_licenses(*)')
    .eq('employee_id', employeeId);

  if (error) throw error;
  return data;
};

export const addEmployeeLicense = async (employeeLicense: Omit<EmployeeLicense, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('wfm_employee_licenses')
    .insert(employeeLicense)
    .select()
    .single();

  if (error) throw error;
  return data as EmployeeLicense;
};

export const getExpiringLicenses = async (companyId: string, daysAhead: number = 30) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('wfm_employee_licenses')
    .select('*, employee:employees!inner(*), license:wfm_licenses(*)')
    .eq('employees.company_id', companyId)
    .eq('status', 'active')
    .lte('expiry_date', futureDate.toISOString().split('T')[0])
    .order('expiry_date');

  if (error) throw error;
  return data;
};

// ========== REGELN ==========

export const getActiveRules = async (companyId: string, filters?: { category?: string; scope?: string }) => {
  let query = supabase
    .from('wfm_rules')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .lte('effective_from', new Date().toISOString().split('T')[0]);

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.scope) {
    query = query.eq('scope', filters.scope);
  }

  const { data, error } = await query.order('priority', { ascending: false });

  if (error) throw error;
  return data as ShiftRule[];
};

export const createRule = async (rule: Omit<ShiftRule, 'id' | 'version' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('wfm_rules')
    .insert(rule)
    .select()
    .single();

  if (error) throw error;
  return data as ShiftRule;
};

export const updateRule = async (id: string, updates: Partial<ShiftRule>) => {
  const { data, error } = await supabase
    .from('wfm_rules')
    .update({
      ...updates,
      version: supabase.rpc('increment_rule_version', { rule_id: id }),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ShiftRule;
};

// ========== SCHICHTTAUSCH ==========

export const getSwapRequests = async (companyId: string, status?: string) => {
  let query = supabase
    .from('wfm_swap_requests')
    .select('*, requesting_employee:employees!requesting_employee_id(*), target_employee:employees!target_employee_id(*)')
    .eq('company_id', companyId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('requested_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createSwapRequest = async (swapRequest: Omit<SwapRequest, 'id' | 'created_at' | 'requested_at'>) => {
  const { data, error } = await supabase
    .from('wfm_swap_requests')
    .insert(swapRequest)
    .select()
    .single();

  if (error) throw error;
  return data as SwapRequest;
};

export const updateSwapRequest = async (id: string, updates: Partial<SwapRequest>) => {
  const { data, error } = await supabase
    .from('wfm_swap_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SwapRequest;
};

// ========== MARKTPLATZ ==========

export const getMarketplaceShifts = async (companyId: string, status?: string) => {
  let query = supabase
    .from('wfm_marketplace')
    .select('*')
    .eq('company_id', companyId);

  if (status) {
    query = query.eq('status', status);
  } else {
    query = query.eq('status', 'open');
  }

  const { data, error } = await query
    .gte('shift_date', new Date().toISOString().split('T')[0])
    .order('shift_date')
    .order('start_time');

  if (error) throw error;
  return data as MarketplaceShift[];
};

export const claimMarketplaceShift = async (id: string, employeeId: string) => {
  const { data, error } = await supabase
    .from('wfm_marketplace')
    .update({
      status: 'claimed',
      claimed_by: employeeId,
      claimed_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('status', 'open')
    .select()
    .single();

  if (error) throw error;
  return data as MarketplaceShift;
};

// ========== PRÄFERENZEN ==========

export const getEmployeePreferences = async (employeeId: string) => {
  const { data, error } = await supabase
    .from('wfm_preferences')
    .select('*')
    .eq('employee_id', employeeId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as EmployeePreferences | null;
};

export const updateEmployeePreferences = async (preferences: Partial<EmployeePreferences> & { employee_id: string }) => {
  const { data, error } = await supabase
    .from('wfm_preferences')
    .upsert(preferences)
    .select()
    .single();

  if (error) throw error;
  return data as EmployeePreferences;
};

// ========== SZENARIEN ==========

export const getScenarios = async (companyId: string, status?: string) => {
  let query = supabase
    .from('wfm_scenarios')
    .select('*')
    .eq('company_id', companyId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as Scenario[];
};

export const createScenario = async (scenario: Omit<Scenario, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('wfm_scenarios')
    .insert(scenario)
    .select()
    .single();

  if (error) throw error;
  return data as Scenario;
};

export const updateScenario = async (id: string, updates: Partial<Scenario>) => {
  const { data, error } = await supabase
    .from('wfm_scenarios')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Scenario;
};
