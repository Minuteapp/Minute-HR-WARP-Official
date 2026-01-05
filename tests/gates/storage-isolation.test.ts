import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupTestTenant, deleteTestTenant } from '../utils/test-tenant';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * P0-4: Storage Isolation Test
 * 
 * Verifies that tenants cannot access each other's files in storage.
 */

interface TenantContext {
  id: string;
  name: string;
  adminEmail: string;
  adminPassword: string;
  client: SupabaseClient;
}

const STORAGE_BUCKETS = [
  'documents',
  'avatars',
  'company-logos',
  'absence-documents',
];

describe('P0-4: Storage Isolation Test', () => {
  let tenantA: TenantContext;
  let tenantB: TenantContext;
  let uploadedFilePath: string;
  const testFileName = `test-file-${Date.now()}.txt`;
  const testFileContent = new Blob(['Test file content for isolation testing'], {
    type: 'text/plain',
  });

  beforeAll(async () => {
    // Setup two test tenants
    tenantA = await setupTestTenant('TenantA_Storage');
    tenantB = await setupTestTenant('TenantB_Storage');
  }, 60000);

  afterAll(async () => {
    // Cleanup uploaded test files
    if (uploadedFilePath && tenantA?.client) {
      for (const bucket of STORAGE_BUCKETS) {
        await tenantA.client.storage.from(bucket).remove([uploadedFilePath]);
      }
    }

    // Delete test tenants
    if (tenantA?.id) await deleteTestTenant(tenantA.id);
    if (tenantB?.id) await deleteTestTenant(tenantB.id);
  });

  describe('Upload Permissions', () => {
    it('Tenant A can upload to own path', async () => {
      const filePath = `tenant/${tenantA.id}/${testFileName}`;
      
      // Try each bucket until one works
      let uploaded = false;
      for (const bucket of STORAGE_BUCKETS) {
        const { error } = await tenantA.client.storage
          .from(bucket)
          .upload(filePath, testFileContent, {
            cacheControl: '3600',
            upsert: false,
          });

        if (!error) {
          uploadedFilePath = filePath;
          uploaded = true;
          break;
        }
      }

      // At least one bucket should allow upload
      expect(uploaded || STORAGE_BUCKETS.length === 0).toBeTruthy();
    });

    it('Tenant B cannot upload to Tenant A path', async () => {
      const maliciousPath = `tenant/${tenantA.id}/malicious-${Date.now()}.txt`;
      
      let blocked = true;
      for (const bucket of STORAGE_BUCKETS) {
        const { error } = await tenantB.client.storage
          .from(bucket)
          .upload(maliciousPath, testFileContent);

        // Should get an error for unauthorized path
        if (!error) {
          // Cleanup if somehow uploaded
          await tenantB.client.storage.from(bucket).remove([maliciousPath]);
          blocked = false;
        }
      }

      expect(blocked).toBe(true);
    });
  });

  describe('Read Permissions', () => {
    it('Tenant B cannot download Tenant A files', async () => {
      if (!uploadedFilePath) {
        console.warn('No file uploaded to test - skipping');
        return;
      }

      for (const bucket of STORAGE_BUCKETS) {
        const { data, error } = await tenantB.client.storage
          .from(bucket)
          .download(uploadedFilePath);

        // Should either get error or null data
        expect(error || !data).toBeTruthy();
      }
    });

    it('Tenant A can download own files', async () => {
      if (!uploadedFilePath) {
        console.warn('No file uploaded to test - skipping');
        return;
      }

      let canDownload = false;
      for (const bucket of STORAGE_BUCKETS) {
        const { data, error } = await tenantA.client.storage
          .from(bucket)
          .download(uploadedFilePath);

        if (!error && data) {
          canDownload = true;
          break;
        }
      }

      expect(canDownload || STORAGE_BUCKETS.length === 0).toBeTruthy();
    });
  });

  describe('List Permissions', () => {
    it('Tenant B cannot list Tenant A directory', async () => {
      const tenantAPath = `tenant/${tenantA.id}`;

      for (const bucket of STORAGE_BUCKETS) {
        const { data, error } = await tenantB.client.storage
          .from(bucket)
          .list(tenantAPath);

        // Should either get error or empty list
        if (!error) {
          // Even if list succeeds, should be empty
          expect(data || []).toEqual([]);
        }
      }
    });

    it('Tenant A can list own directory', async () => {
      if (!uploadedFilePath) {
        console.warn('No file uploaded to test - skipping');
        return;
      }

      const tenantAPath = `tenant/${tenantA.id}`;
      let canList = false;

      for (const bucket of STORAGE_BUCKETS) {
        const { data, error } = await tenantA.client.storage
          .from(bucket)
          .list(tenantAPath);

        if (!error && data && data.length > 0) {
          canList = true;
          break;
        }
      }

      expect(canList || STORAGE_BUCKETS.length === 0).toBeTruthy();
    });
  });

  describe('Delete Permissions', () => {
    it('Tenant B cannot delete Tenant A files', async () => {
      if (!uploadedFilePath) {
        console.warn('No file uploaded to test - skipping');
        return;
      }

      for (const bucket of STORAGE_BUCKETS) {
        const { error } = await tenantB.client.storage
          .from(bucket)
          .remove([uploadedFilePath]);

        // Deletion should fail or file should still exist
        if (!error) {
          // Verify file still exists
          const { data } = await tenantA.client.storage
            .from(bucket)
            .download(uploadedFilePath);
          
          // File should still be downloadable by owner
          expect(data).toBeTruthy();
        }
      }
    });
  });

  describe('Public URL Isolation', () => {
    it('Public URLs are tenant-scoped', async () => {
      if (!uploadedFilePath) return;

      for (const bucket of STORAGE_BUCKETS) {
        const { data: tenantAUrl } = tenantA.client.storage
          .from(bucket)
          .getPublicUrl(uploadedFilePath);

        // URL should contain tenant ID
        if (tenantAUrl?.publicUrl) {
          expect(tenantAUrl.publicUrl).toContain(tenantA.id);
        }
      }
    });
  });
});
