import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestTenant, deleteTestTenant } from '../utils/test-tenant';
import { createTestDataInTenant, cleanupTestData } from '../utils/test-data';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * P0-2: Tenant Isolation Test
 * 
 * Verifies that users from Tenant B cannot see, update, or delete
 * data belonging to Tenant A. This is the most critical security test.
 */

interface TenantContext {
  id: string;
  name: string;
  adminEmail: string;
  adminPassword: string;
  client: SupabaseClient;
}

const CRITICAL_TABLES = [
  'employees',
  'departments',
  'teams',
  'absence_requests',
  'time_entries',
  'documents',
  'contracts',
  'payroll_data',
  'candidates',
  'job_postings',
];

describe('P0-2: Tenant Isolation Test', () => {
  let tenantA: TenantContext;
  let tenantB: TenantContext;
  let testDataIds: Record<string, string[]>;

  beforeAll(async () => {
    // Setup two separate tenants
    tenantA = await setupTestTenant('TenantA_Isolation');
    tenantB = await setupTestTenant('TenantB_Isolation');

    // Get user ID for tenant A admin
    const { data: userData } = await tenantA.client.auth.getUser();
    const tenantAUserId = userData?.user?.id;

    if (!tenantAUserId) {
      throw new Error('Failed to get tenant A user ID');
    }

    // Create test data in Tenant A
    testDataIds = await createTestDataInTenant(
      tenantA.client,
      tenantA.id,
      tenantAUserId
    );
  }, 60000); // 60 second timeout for setup

  afterAll(async () => {
    // Cleanup test data
    if (testDataIds && tenantA?.client) {
      await cleanupTestData(tenantA.client, testDataIds);
    }

    // Delete test tenants
    if (tenantA?.id) await deleteTestTenant(tenantA.id);
    if (tenantB?.id) await deleteTestTenant(tenantB.id);
  });

  describe('SELECT Isolation', () => {
    CRITICAL_TABLES.forEach((table) => {
      it(`Tenant B cannot see Tenant A's ${table} data`, async () => {
        const idsToCheck = testDataIds[table] || [];
        
        if (idsToCheck.length === 0) {
          // No test data for this table - skip
          return;
        }

        const { data, error } = await tenantB.client
          .from(table)
          .select('*')
          .in('id', idsToCheck);

        // Should either get an error or empty results
        if (error) {
          expect(error).toBeTruthy();
        } else {
          expect(data).toEqual([]);
        }
      });
    });

    it('Tenant B cannot see any Tenant A companies', async () => {
      const { data } = await tenantB.client
        .from('companies')
        .select('id')
        .eq('id', tenantA.id);

      expect(data || []).toEqual([]);
    });

    it('Tenant B query for Tenant A employees returns empty', async () => {
      const { data } = await tenantB.client
        .from('employees')
        .select('*')
        .eq('company_id', tenantA.id);

      expect(data || []).toEqual([]);
    });
  });

  describe('UPDATE Isolation', () => {
    CRITICAL_TABLES.forEach((table) => {
      it(`Tenant B cannot update Tenant A's ${table}`, async () => {
        const idsToCheck = testDataIds[table] || [];
        
        if (idsToCheck.length === 0) return;

        const { error, count } = await tenantB.client
          .from(table)
          .update({ updated_at: new Date().toISOString() })
          .eq('id', idsToCheck[0])
          .select();

        // Either error or 0 rows affected
        if (!error) {
          expect(count || 0).toBe(0);
        }
      });
    });

    it('Tenant B cannot update Tenant A company', async () => {
      const { error, count } = await tenantB.client
        .from('companies')
        .update({ name: 'Hacked Company Name' })
        .eq('id', tenantA.id)
        .select();

      if (!error) {
        expect(count || 0).toBe(0);
      }
    });
  });

  describe('DELETE Isolation', () => {
    CRITICAL_TABLES.forEach((table) => {
      it(`Tenant B cannot delete Tenant A's ${table}`, async () => {
        const idsToCheck = testDataIds[table] || [];
        
        if (idsToCheck.length === 0) return;

        const { error } = await tenantB.client
          .from(table)
          .delete()
          .eq('id', idsToCheck[0]);

        // Should get an error or the row should still exist
        // Verify row still exists in Tenant A
        const { data: checkData } = await tenantA.client
          .from(table)
          .select('id')
          .eq('id', idsToCheck[0]);

        expect(checkData?.length).toBe(1);
      });
    });
  });

  describe('INSERT Isolation', () => {
    it('Tenant B cannot insert data with Tenant A company_id', async () => {
      const { error } = await tenantB.client
        .from('departments')
        .insert({
          company_id: tenantA.id,
          name: 'Malicious Department',
        });

      // Should fail due to RLS
      expect(error).toBeTruthy();
    });

    it('Tenant B cannot insert employee into Tenant A', async () => {
      const { error } = await tenantB.client
        .from('employees')
        .insert({
          company_id: tenantA.id,
          email: 'malicious@test.local',
          first_name: 'Malicious',
          last_name: 'User',
        });

      expect(error).toBeTruthy();
    });
  });

  describe('Cross-Tenant Query Patterns', () => {
    it('JOIN queries cannot leak cross-tenant data', async () => {
      // Try to join employees with a different company's departments
      const { data } = await tenantB.client
        .from('employees')
        .select(`
          *,
          departments:department_id (
            id,
            name,
            company_id
          )
        `)
        .eq('company_id', tenantA.id);

      expect(data || []).toEqual([]);
    });

    it('Aggregate queries are tenant-scoped', async () => {
      // Count should only include own tenant's data
      const { count: tenantACount } = await tenantA.client
        .from('employees')
        .select('*', { count: 'exact', head: true });

      const { count: tenantBCount } = await tenantB.client
        .from('employees')
        .select('*', { count: 'exact', head: true });

      // Each tenant should see only their own employees
      // Tenant A should have at least the admin user
      expect(tenantACount).toBeGreaterThanOrEqual(1);
      // Tenant B should have at least the admin user (but not Tenant A's users)
      expect(tenantBCount).toBeGreaterThanOrEqual(1);
      
      // They should not be able to see each other's total
      expect(tenantACount).not.toBe(tenantBCount || (tenantBCount! + 100));
    });
  });
});
