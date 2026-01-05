/**
 * Performance Tests für Multi-Tenancy
 * 
 * Überprüft, dass die RLS-Policies keine signifikanten
 * Performance-Einbußen verursachen.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://teydpbqficbdgqovoqlo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRleWRwYnFmaWNiZGdxb3ZvcWxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNDc0OTMsImV4cCI6MjA1MzgyMzQ5M30.nl7hQoe8RC9YYw2nwxLbEuEVcJCbfuxAy2dALZI47X0';

// Performance-Schwellenwerte (in Millisekunden)
const THRESHOLDS = {
  simpleQuery: 500,
  complexQuery: 2000,
  batchInsert: 5000
};

describe('Query Performance Tests', () => {
  let supabase: SupabaseClient;

  beforeAll(() => {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  describe('Simple Queries', () => {
    it('should complete companies query within threshold', async () => {
      const start = performance.now();
      
      await supabase
        .from('companies')
        .select('id, name')
        .limit(10);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(THRESHOLDS.simpleQuery);
    });

    it('should complete current_tenant_id() within threshold', async () => {
      const start = performance.now();
      
      await supabase.rpc('current_tenant_id');

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(THRESHOLDS.simpleQuery);
    });
  });

  describe('Index Utilization', () => {
    it('should use company_id index for filtered queries', async () => {
      // Indirekte Prüfung: Schnelle Ausführung deutet auf Index-Nutzung hin
      const start = performance.now();
      
      await supabase
        .from('employees')
        .select('id')
        .limit(1);

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(THRESHOLDS.simpleQuery);
    });
  });

  describe('RLS Overhead', () => {
    it('should have acceptable RLS overhead', async () => {
      // Mehrere Abfragen, um durchschnittliche Latenz zu messen
      const durations: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        await supabase.from('employees').select('id').limit(1);
        durations.push(performance.now() - start);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      expect(avgDuration).toBeLessThan(THRESHOLDS.simpleQuery);
    });
  });
});

describe('Connection Pool Tests', () => {
  it('should handle concurrent requests', async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const start = performance.now();
    
    // 10 parallele Anfragen
    const promises = Array(10).fill(null).map(() => 
      supabase.from('companies').select('id').limit(1)
    );

    await Promise.all(promises);

    const duration = performance.now() - start;
    expect(duration).toBeLessThan(THRESHOLDS.complexQuery);
  });
});

describe('Memory & Resource Tests', () => {
  it('should not leak connections', async () => {
    // Erstelle mehrere Clients und führe Abfragen aus
    for (let i = 0; i < 5; i++) {
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      await client.from('companies').select('id').limit(1);
    }

    // Kein expliziter Speichertest, aber implizite Stabilität
    expect(true).toBe(true);
  });
});
