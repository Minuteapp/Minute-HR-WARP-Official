import { supabase } from '@/integrations/supabase/client';

// Typ für Logging
export interface DBLogEntry {
  timestamp: Date;
  table: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'RPC';
  tenantId: string | null;
  userId: string | null;
  status: 'success' | 'error' | 'empty' | 'rls_blocked';
  rowCount: number;
  error?: string;
  duration: number;
}

// Globaler Log-Buffer (letzte 50 Entries)
const dbLogs: DBLogEntry[] = [];
const MAX_LOGS = 50;

// Gecachte Tenant-ID (wird einmal pro Session geladen)
let cachedEffectiveCompanyId: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 30000; // 30 Sekunden

export function getDBLogs(): DBLogEntry[] {
  return [...dbLogs];
}

export function clearDBLogs(): void {
  dbLogs.length = 0;
}

// Effektive Company-ID mit Caching
export async function getEffectiveCompanyId(): Promise<string | null> {
  const now = Date.now();
  
  // Cache noch gültig?
  if (cachedEffectiveCompanyId && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedEffectiveCompanyId;
  }
  
  try {
    // 1. Versuche RPC-Funktion
    const { data, error } = await supabase.rpc('get_effective_company_id');
    if (!error && data) {
      cachedEffectiveCompanyId = data;
      cacheTimestamp = now;
      return data;
    }
  } catch (e) {
    console.warn('[DB] get_effective_company_id RPC failed, trying fallback');
  }
  
  // 2. Fallback: user_roles
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: role } = await supabase
        .from('user_roles')
        .select('company_id')
        .eq('user_id', user.id)
        .not('company_id', 'is', null)
        .limit(1)
        .maybeSingle();
      
      if (role?.company_id) {
        cachedEffectiveCompanyId = role.company_id;
        cacheTimestamp = now;
        return role.company_id;
      }
    }
  } catch (e) {
    console.warn('[DB] user_roles fallback failed');
  }
  
  return null;
}

// Cache invalidieren (z.B. bei Tenant-Wechsel)
export function invalidateTenantCache(): void {
  cachedEffectiveCompanyId = null;
  cacheTimestamp = 0;
}

// Logging-Funktion
function logDBOperation(entry: Omit<DBLogEntry, 'timestamp'>): void {
  const fullEntry: DBLogEntry = {
    ...entry,
    timestamp: new Date()
  };
  
  dbLogs.unshift(fullEntry);
  if (dbLogs.length > MAX_LOGS) dbLogs.pop();
  
  // Console-Logging für Debugging
  const icons: Record<DBLogEntry['status'], string> = {
    success: '✓',
    error: '✗',
    empty: '○',
    rls_blocked: '🔒'
  };
  
  const icon = icons[entry.status];
  const color = entry.status === 'success' ? 'color: green' : 
                entry.status === 'error' ? 'color: red' :
                entry.status === 'rls_blocked' ? 'color: orange' : 'color: gray';
  
  console.log(
    `%c[DB ${icon}] ${entry.operation} ${entry.table} | tenant=${entry.tenantId?.substring(0, 8) || 'null'} | rows=${entry.rowCount} | ${entry.duration}ms`,
    color
  );
  
  if (entry.error) {
    console.warn(`[DB Error] ${entry.error}`);
  }
}

// Zentraler Wrapper für SELECT Queries
export async function tenantSelect<T = any>(
  tableName: string,
  selectColumns: string = '*',
  options?: {
    skipTenantFilter?: boolean;
    additionalFilters?: (query: any) => any;
  }
): Promise<{ data: T[] | null; error: any }> {
  const startTime = Date.now();
  const effectiveCompanyId = await getEffectiveCompanyId();
  
  // Guard: Kein Tenant = keine Daten (außer skipTenantFilter)
  if (!effectiveCompanyId && !options?.skipTenantFilter) {
    logDBOperation({
      table: tableName,
      operation: 'SELECT',
      tenantId: null,
      userId: null,
      status: 'error',
      rowCount: 0,
      error: 'NO_TENANT_CONTEXT',
      duration: Date.now() - startTime
    });
    return { data: null, error: { message: 'Kein Tenant-Kontext aktiv', code: 'NO_TENANT' } };
  }
  
  let query = supabase.from(tableName).select(selectColumns);
  
  // Tenant-Filter automatisch hinzufügen
  if (effectiveCompanyId && !options?.skipTenantFilter) {
    query = query.eq('company_id', effectiveCompanyId);
  }
  
  // Zusätzliche Filter anwenden
  if (options?.additionalFilters) {
    query = options.additionalFilters(query);
  }
  
  const result = await query;
  
  // Status ermitteln
  let status: DBLogEntry['status'] = 'success';
  if (result.error) {
    status = result.error.code === 'PGRST301' || result.error.message?.includes('RLS') 
      ? 'rls_blocked' 
      : 'error';
  } else if (!result.data || (Array.isArray(result.data) && result.data.length === 0)) {
    status = 'empty';
  }
  
  logDBOperation({
    table: tableName,
    operation: 'SELECT',
    tenantId: effectiveCompanyId,
    userId: null,
    status,
    rowCount: Array.isArray(result.data) ? result.data.length : (result.data ? 1 : 0),
    error: result.error?.message,
    duration: Date.now() - startTime
  });
  
  return result as { data: T[] | null; error: any };
}

// Wrapper für INSERT
export async function tenantInsert<T = any>(
  tableName: string,
  values: Record<string, any> | Record<string, any>[],
  options?: {
    skipTenantInjection?: boolean;
  }
): Promise<{ data: T | null; error: any }> {
  const startTime = Date.now();
  const effectiveCompanyId = await getEffectiveCompanyId();
  
  if (!effectiveCompanyId && !options?.skipTenantInjection) {
    logDBOperation({
      table: tableName,
      operation: 'INSERT',
      tenantId: null,
      userId: null,
      status: 'error',
      rowCount: 0,
      error: 'NO_TENANT_CONTEXT',
      duration: Date.now() - startTime
    });
    return { data: null, error: { message: 'Kein Tenant-Kontext aktiv', code: 'NO_TENANT' } };
  }
  
  // company_id automatisch injizieren
  let valuesToInsert = values;
  if (effectiveCompanyId && !options?.skipTenantInjection) {
    if (Array.isArray(values)) {
      valuesToInsert = values.map(v => ({ ...v, company_id: effectiveCompanyId }));
    } else {
      valuesToInsert = { ...values, company_id: effectiveCompanyId };
    }
  }
  
  const result = await supabase.from(tableName).insert(valuesToInsert).select().single();
  
  let status: DBLogEntry['status'] = result.error ? 'error' : 'success';
  if (result.error?.code === 'PGRST301' || result.error?.message?.includes('RLS')) {
    status = 'rls_blocked';
  }
  
  logDBOperation({
    table: tableName,
    operation: 'INSERT',
    tenantId: effectiveCompanyId,
    userId: null,
    status,
    rowCount: result.data ? 1 : 0,
    error: result.error?.message,
    duration: Date.now() - startTime
  });
  
  return result as { data: T | null; error: any };
}

// Wrapper für UPDATE
export async function tenantUpdate<T = any>(
  tableName: string,
  values: Record<string, any>,
  matchColumn: string,
  matchValue: any
): Promise<{ data: T | null; error: any }> {
  const startTime = Date.now();
  const effectiveCompanyId = await getEffectiveCompanyId();
  
  if (!effectiveCompanyId) {
    logDBOperation({
      table: tableName,
      operation: 'UPDATE',
      tenantId: null,
      userId: null,
      status: 'error',
      rowCount: 0,
      error: 'NO_TENANT_CONTEXT',
      duration: Date.now() - startTime
    });
    return { data: null, error: { message: 'Kein Tenant-Kontext aktiv', code: 'NO_TENANT' } };
  }
  
  const result = await supabase
    .from(tableName)
    .update(values)
    .eq(matchColumn, matchValue)
    .eq('company_id', effectiveCompanyId)
    .select()
    .single();
  
  let status: DBLogEntry['status'] = result.error ? 'error' : 'success';
  if (result.error?.code === 'PGRST301' || result.error?.message?.includes('RLS')) {
    status = 'rls_blocked';
  }
  
  logDBOperation({
    table: tableName,
    operation: 'UPDATE',
    tenantId: effectiveCompanyId,
    userId: null,
    status,
    rowCount: result.data ? 1 : 0,
    error: result.error?.message,
    duration: Date.now() - startTime
  });
  
  return result as { data: T | null; error: any };
}

// Wrapper für DELETE
export async function tenantDelete(
  tableName: string,
  matchColumn: string,
  matchValue: any
): Promise<{ error: any }> {
  const startTime = Date.now();
  const effectiveCompanyId = await getEffectiveCompanyId();
  
  if (!effectiveCompanyId) {
    logDBOperation({
      table: tableName,
      operation: 'DELETE',
      tenantId: null,
      userId: null,
      status: 'error',
      rowCount: 0,
      error: 'NO_TENANT_CONTEXT',
      duration: Date.now() - startTime
    });
    return { error: { message: 'Kein Tenant-Kontext aktiv', code: 'NO_TENANT' } };
  }
  
  const result = await supabase
    .from(tableName)
    .delete()
    .eq(matchColumn, matchValue)
    .eq('company_id', effectiveCompanyId);
  
  let status: DBLogEntry['status'] = result.error ? 'error' : 'success';
  if (result.error?.code === 'PGRST301' || result.error?.message?.includes('RLS')) {
    status = 'rls_blocked';
  }
  
  logDBOperation({
    table: tableName,
    operation: 'DELETE',
    tenantId: effectiveCompanyId,
    userId: null,
    status,
    rowCount: 0,
    error: result.error?.message,
    duration: Date.now() - startTime
  });
  
  return result;
}
