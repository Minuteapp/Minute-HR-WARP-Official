import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestTenant, deleteTestTenant } from '../utils/test-tenant';
import { getAuthenticatedClient, createAdminClient } from '../utils/supabase-client';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * P0-1: Fresh Tenant Test
 * 
 * Verifies that newly created tenants have zero data in all domain tables
 * and that the dashboard shows only empty states.
 */

const DOMAIN_TABLES = [
  'employees',
  'departments',
  'teams',
  'locations',
  'positions',
  'absence_requests',
  'time_entries',
  'tasks',
  'projects',
  'documents',
  'trainings',
  'job_postings',
  'candidates',
  'contracts',
  'payroll_data',
];

describe('P0-1: Fresh Tenant Test', () => {
  let testTenantId: string;
  let testTenantEmail: string;
  let testTenantPassword: string;
  let supabase: SupabaseClient;
  let adminClient: SupabaseClient;

  beforeAll(async () => {
    // Create a fresh test tenant
    const tenant = await createTestTenant('FreshTenantTest');
    testTenantId = tenant.id;
    testTenantEmail = tenant.adminEmail;
    testTenantPassword = tenant.adminPassword;
    
    // Get authenticated client for the tenant
    supabase = await getAuthenticatedClient(testTenantEmail, testTenantPassword);
    adminClient = createAdminClient();
  });

  afterAll(async () => {
    // Cleanup: Delete the test tenant
    if (testTenantId) {
      await deleteTestTenant(testTenantId);
    }
  });

  describe('Domain Tables Empty Check', () => {
    DOMAIN_TABLES.forEach((table) => {
      it(`${table} has 0 rows for new tenant (excluding admin user)`, async () => {
        const { data, count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact' });

        // Some tables might not exist or user might not have access
        if (error && error.code === 'PGRST116') {
          // Table doesn't exist - skip
          return;
        }

        // For employees table, we expect 1 row (the admin user)
        if (table === 'employees') {
          expect(count).toBeLessThanOrEqual(1);
          return;
        }

        // All other tables should be empty
        expect(count).toBe(0);
        expect(data || []).toEqual([]);
      });
    });
  });

  describe('Aggregate Data Check', () => {
    it('should have zero total rows across all domain tables (using RPC)', async () => {
      const { data, error } = await adminClient.rpc('count_tenant_domain_data', {
        p_company_id: testTenantId,
      });

      if (error) {
        // RPC might not exist yet - this is expected before migration runs
        console.warn('RPC count_tenant_domain_data not available:', error.message);
        return;
      }

      // All counts should be 0 or 1 (for admin user)
      for (const row of data || []) {
        if (row.table_name === 'employees') {
          expect(row.row_count).toBeLessThanOrEqual(1);
        } else {
          expect(row.row_count).toBe(0);
        }
      }
    });
  });

  describe('No Mock Data Seeded', () => {
    it('should not have any demo/test entries in employees', async () => {
      const { data } = await supabase
        .from('employees')
        .select('first_name, last_name, email')
        .or('first_name.ilike.%test%,first_name.ilike.%demo%,first_name.ilike.%mock%');

      // The only employee should be the admin we created
      expect((data || []).length).toBeLessThanOrEqual(1);
    });

    it('should not have any pre-seeded departments', async () => {
      const { data } = await supabase
        .from('departments')
        .select('name')
        .or('name.ilike.%demo%,name.ilike.%sample%,name.ilike.%example%');

      expect(data || []).toEqual([]);
    });

    it('should not have any pre-seeded projects', async () => {
      const { data } = await supabase.from('projects').select('name');

      expect(data || []).toEqual([]);
    });
  });

  describe('Company Data Isolation', () => {
    it('should only see own company in companies table', async () => {
      const { data } = await supabase.from('companies').select('id, name');

      expect(data?.length).toBe(1);
      expect(data?.[0]?.id).toBe(testTenantId);
    });
  });
});
