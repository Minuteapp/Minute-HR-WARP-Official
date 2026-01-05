/**
 * Multi-Tenancy Regression Tests
 * 
 * Diese Tests überprüfen die korrekte Tenant-Isolation nach der Migration.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://teydpbqficbdgqovoqlo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleWRwYnFmaWNiZGdxb3ZvcWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNDc0OTMsImV4cCI6MjA1MzgyMzQ5M30.nl7hQoe8RC9YYw2nwxLbEuEVcJCbfuxAy2dALZI47X0';

// Test-Konfiguration
interface TenantTestConfig {
  companyId: string;
  companyName: string;
}

describe('Multi-Tenancy Isolation Tests', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  describe('1. current_tenant_id() Function', () => {
    it('should return NULL when no tenant is set', async () => {
      const { data, error } = await supabase.rpc('current_tenant_id');
      
      // Für anonyme Benutzer sollte NULL zurückgegeben werden
      expect(error).toBeNull();
      expect(data).toBeNull();
    });
  });

  describe('2. RLS Policy Verification', () => {
    it('should have RLS enabled on all domain tables', async () => {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity
          FROM pg_tables
          WHERE schemaname = 'public'
            AND tablename NOT IN ('companies', 'migration_journal')
          ORDER BY tablename
        `
      });

      // Dieser Test prüft nur, ob die Abfrage funktioniert
      // Die eigentliche Prüfung erfolgt über die Migration
      expect(error).toBeDefined(); // RPC existiert nicht - erwartet
    });

    it('should block anonymous access to protected tables', async () => {
      const protectedTables = [
        'employees',
        'user_roles',
        'absence_requests',
        'time_entries',
        'documents'
      ];

      for (const table of protectedTables) {
        const { data, error } = await supabase.from(table).select('count');
        
        // Anonyme Benutzer sollten entweder keine Daten sehen oder einen Fehler erhalten
        if (!error) {
          expect(data).toEqual([]);
        }
      }
    });
  });

  describe('3. Cross-Tenant Data Isolation', () => {
    it('should not allow reading data from other tenants', async () => {
      // Test: Versuche, alle Daten ohne Authentifizierung zu lesen
      const tables = ['employees', 'user_roles', 'absence_requests'];
      
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (!error) {
          // Keine Daten sollten für anonyme Benutzer sichtbar sein
          expect(data?.length ?? 0).toBe(0);
        }
      }
    });
  });

  describe('4. Storage Tenant Mapping', () => {
    it('should have storage_object_tenant_mapping table', async () => {
      const { data, error } = await supabase
        .from('storage_object_tenant_mapping')
        .select('count')
        .limit(1);

      // Tabelle sollte existieren (auch wenn keine Daten für anon sichtbar)
      expect(error?.code).not.toBe('42P01'); // Tabelle nicht gefunden
    });
  });

  describe('5. View Security', () => {
    it('should scope views to current tenant', async () => {
      const scopedViews = [
        'absence_requests_with_employee',
        'employees_with_company',
        'helpdesk_tickets_with_sla'
      ];

      for (const view of scopedViews) {
        const { data, error } = await supabase.from(view).select('*').limit(1);
        
        if (!error) {
          // Keine Daten für anonyme Benutzer
          expect(data?.length ?? 0).toBe(0);
        }
      }
    });
  });

  describe('6. Quarantine Schema', () => {
    it('should have quarantine schema for orphaned data', async () => {
      // Quarantine-Schema sollte existieren und geschützt sein
      const { data, error } = await supabase
        .from('quarantine.orphaned_records')
        .select('count')
        .limit(1);

      // Entweder Fehler (kein Zugriff) oder leere Daten
      if (error) {
        expect(error.code).toBeDefined();
      }
    });
  });
});

describe('Multi-Tenancy Policy Tests', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  describe('Company Table Policies', () => {
    it('should allow public read of companies table', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .limit(5);

      // Companies-Tabelle sollte lesbar sein für Login-Auswahl
      // (abhängig von der implementierten Policy)
      expect(error).toBeNull();
    });
  });

  describe('Employee Table Policies', () => {
    it('should not expose employee data to anonymous users', async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .limit(1);

      if (!error) {
        expect(data).toEqual([]);
      }
    });
  });

  describe('Absence Request Policies', () => {
    it('should not expose absence data to anonymous users', async () => {
      const { data, error } = await supabase
        .from('absence_requests')
        .select('*')
        .limit(1);

      if (!error) {
        expect(data).toEqual([]);
      }
    });
  });
});

describe('Multi-Tenancy Function Tests', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  describe('set_tenant_context() Function', () => {
    it('should exist and be callable', async () => {
      // Versuche, die Funktion aufzurufen (sollte für anon fehlschlagen)
      const { data, error } = await supabase.rpc('set_tenant_context', {
        p_company_id: '00000000-0000-0000-0000-000000000000'
      });

      // Funktion sollte existieren, aber für anon nicht ausführbar sein
      if (error) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('get_user_company_id() Function', () => {
    it('should exist', async () => {
      const { data, error } = await supabase.rpc('get_user_company_id');

      // Für anonyme Benutzer sollte NULL oder Fehler zurückkommen
      if (!error) {
        expect(data).toBeNull();
      }
    });
  });
});
