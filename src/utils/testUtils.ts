// ============= Umfassende Test-Utilities für alle Module =============

import { supabase } from '@/integrations/supabase/client';
import { timeTrackingService } from '@/services/timeTrackingService';
import { toast } from 'sonner';

interface TestResult {
  module: string;
  test: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  data?: any;
  duration: number;
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime = 0;

  private async runTest(
    module: string, 
    testName: string, 
    testFn: () => Promise<{ status: 'pass' | 'fail' | 'warning', details: string, data?: any }>
  ): Promise<TestResult> {
    this.startTime = Date.now();
    console.log(`🧪 ${module} - ${testName}: Startet...`);
    
    try {
      const result = await testFn();
      const duration = Date.now() - this.startTime;
      
      const testResult: TestResult = {
        module,
        test: testName,
        status: result.status,
        details: result.details,
        data: result.data,
        duration
      };
      
      this.results.push(testResult);
      
      const statusIcon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
      console.log(`${statusIcon} ${module} - ${testName}: ${result.status.toUpperCase()} (${duration}ms)`);
      console.log(`   Details: ${result.details}`);
      
      return testResult;
    } catch (error) {
      const duration = Date.now() - this.startTime;
      const testResult: TestResult = {
        module,
        test: testName,
        status: 'fail',
        details: `Unerwarteter Fehler: ${error.message}`,
        duration
      };
      
      this.results.push(testResult);
      console.error(`❌ ${module} - ${testName}: FEHLER (${duration}ms)`, error);
      
      return testResult;
    }
  }

  // ============= TIME TRACKING TESTS =============
  
  async testTimeTrackingDatabase(): Promise<TestResult> {
    return this.runTest('Time Tracking', 'Database Connection', async () => {
      const { data, error } = await supabase.from('time_entries').select('id').limit(1);
      
      if (error) {
        return { status: 'fail', details: `Datenbankfehler: ${error.message}` };
      }
      
      return { 
        status: 'pass', 
        details: 'Datenbankverbindung erfolgreich',
        data: { entriesAccessible: true }
      };
    });
  }

  async testTimeTrackingService(): Promise<TestResult> {
    return this.runTest('Time Tracking', 'Service Functions', async () => {
      // Use a proper UUID for testing
      const testUserId = crypto.randomUUID();
      
      // Test getActiveTimeEntryForUser
      const activeEntry = await timeTrackingService.getActiveTimeEntryForUser(testUserId);
      
      // Test getTimeEntries
      const entries = await timeTrackingService.getTimeEntries();
      
      // Test getTodayTimeEntries
      const todayEntries = await timeTrackingService.getTodayTimeEntries();
      
      return {
        status: 'pass',
        details: `Service-Funktionen verfügbar. ${entries.length} Gesamteinträge, ${todayEntries.length} heute`,
        data: {
          totalEntries: entries.length,
          todayEntries: todayEntries.length,
          hasActiveEntry: !!activeEntry
        }
      };
    });
  }

  async testTimeTrackingStartStop(): Promise<TestResult> {
    return this.runTest('Time Tracking', 'Start/Stop Functionality', async () => {
      const userId = crypto.randomUUID();
      
      try {
        // Test 1: Start time tracking
        const startData = {
          user_id: userId,
          project: 'test-project',
          location: 'office',
          note: 'Test entry'
        };
        
        const entry = await timeTrackingService.startTimeTracking(startData);
        
        if (!entry.id) {
          return { status: 'fail', details: 'Zeiterfassung konnte nicht gestartet werden' };
        }
        
        // Test 2: Check if entry is active
        const activeEntry = await timeTrackingService.getActiveTimeEntryForUser(userId);
        
        if (!activeEntry || activeEntry.id !== entry.id) {
          return { status: 'fail', details: 'Aktive Zeiterfassung nicht gefunden' };
        }
        
        // Test 3: Stop time tracking
        const stoppedEntry = await timeTrackingService.endTimeTracking(entry.id);
        
        if (!stoppedEntry.end_time) {
          return { status: 'fail', details: 'Zeiterfassung konnte nicht gestoppt werden' };
        }
        
        // Test 4: Cleanup
        await timeTrackingService.deleteTimeEntry(entry.id);
        
        return {
          status: 'pass',
          details: 'Start/Stop-Funktionalität vollständig funktionsfähig',
          data: {
            entryId: entry.id,
            startTime: entry.start_time,
            endTime: stoppedEntry.end_time
          }
        };
        
      } catch (error) {
        return { status: 'fail', details: `Start/Stop-Test fehlgeschlagen: ${error.message}` };
      }
    });
  }

  async testTimeTrackingManualEntry(): Promise<TestResult> {
    return this.runTest('Time Tracking', 'Manual Entry Creation', async () => {
      const userId = crypto.randomUUID();
      const now = new Date();
      const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 Stunden zurück
      
      try {
        const manualData = {
          user_id: userId,
          start_time: startTime.toISOString(),
          end_time: now.toISOString(),
          project: 'manual-test',
          location: 'home',
          note: 'Manuell erstellter Testeintrag'
        };
        
        const entry = await timeTrackingService.createManualTimeEntry(manualData);
        
        if (!entry.id || !entry.end_time) {
          return { status: 'fail', details: 'Manueller Eintrag konnte nicht erstellt werden' };
        }
        
        // Test duration calculation
        const duration = (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / 1000 / 60 / 60;
        
        // Cleanup
        await timeTrackingService.deleteTimeEntry(entry.id);
        
        return {
          status: 'pass',
          details: `Manueller Eintrag erfolgreich. Dauer: ${duration.toFixed(2)} Stunden`,
          data: {
            entryId: entry.id,
            duration: duration,
            status: entry.status
          }
        };
        
      } catch (error) {
        return { status: 'fail', details: `Manueller Eintrag-Test fehlgeschlagen: ${error.message}` };
      }
    });
  }

  // ============= BUSINESS TRAVEL TESTS =============
  
  async testBusinessTravelDatabase(): Promise<TestResult> {
    return this.runTest('Business Travel', 'Database Connection', async () => {
      const { data, error } = await supabase.from('travel_requests').select('id').limit(1);
      
      if (error) {
        return { status: 'fail', details: `Datenbankfehler: ${error.message}` };
      }
      
      return { 
        status: 'pass', 
        details: 'Business Travel Datenbank erreichbar',
        data: { travelRequestsAccessible: true }
      };
    });
  }

  async testBusinessTravelCreation(): Promise<TestResult> {
    return this.runTest('Business Travel', 'Travel Request Creation', async () => {
      const testUserId = crypto.randomUUID();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      
      try {
        const { data, error } = await supabase
          .from('travel_requests')
          .insert({
            user_id: testUserId,
            destination: 'Berlin, Deutschland',
            purpose: 'Testgeschäftsreise',
            start_date: new Date().toISOString().split('T')[0],
            end_date: futureDate.toISOString().split('T')[0],
            status: 'pending',
            estimated_cost: 1000,
            currency: 'EUR'
          })
          .select()
          .maybeSingle();
        
        if (error) {
          return { status: 'fail', details: `Reiseantrag-Erstellung fehlgeschlagen: ${error.message}` };
        }
        
        if (!data) {
          return { status: 'fail', details: 'Reiseantrag wurde nicht erstellt' };
        }
        
        // Cleanup
        await supabase.from('travel_requests').delete().eq('id', data.id);
        
        return {
          status: 'pass',
          details: 'Reiseantrag erfolgreich erstellt und gelöscht',
          data: {
            requestId: data.id,
            destination: data.destination,
            status: data.status
          }
        };
        
      } catch (error) {
        return { status: 'fail', details: `Business Travel-Test fehlgeschlagen: ${error.message}` };
      }
    });
  }

  // ============= TASKS TESTS =============
  
  async testTasksDatabase(): Promise<TestResult> {
    return this.runTest('Tasks', 'Database Connection', async () => {
      const { data, error } = await supabase.from('tasks').select('id').limit(1);
      
      if (error) {
        return { status: 'fail', details: `Datenbankfehler: ${error.message}` };
      }
      
      return { 
        status: 'pass', 
        details: 'Tasks Datenbank erreichbar',
        data: { tasksAccessible: true }
      };
    });
  }

  async testTaskCreation(): Promise<TestResult> {
    return this.runTest('Tasks', 'Task Creation and Management', async () => {
      const testUserId = crypto.randomUUID();
      
      try {
        const { data: task, error } = await supabase
          .from('tasks')
          .insert({
            title: 'Test Task',
            description: 'Eine Test-Aufgabe',
            status: 'todo',
            priority: 'medium',
            assigned_to: [testUserId], // Array of UUIDs
            created_by: testUserId
          })
          .select()
          .maybeSingle();
        
        if (error) {
          return { status: 'fail', details: `Task-Erstellung fehlgeschlagen: ${error.message}` };
        }
        
        if (!task) {
          return { status: 'fail', details: 'Task wurde nicht erstellt' };
        }
        
        // Test status update
        const { data: updatedTask, error: updateError } = await supabase
          .from('tasks')
          .update({ status: 'in_progress' })
          .eq('id', task.id)
          .select()
          .maybeSingle();
        
        if (updateError) {
          return { status: 'fail', details: `Task-Update fehlgeschlagen: ${updateError.message}` };
        }
        
        // Cleanup
        await supabase.from('tasks').delete().eq('id', task.id);
        
        return {
          status: 'pass',
          details: 'Task erfolgreich erstellt, aktualisiert und gelöscht',
          data: {
            taskId: task.id,
            originalStatus: task.status,
            updatedStatus: updatedTask?.status
          }
        };
        
      } catch (error) {
        return { status: 'fail', details: `Task-Test fehlgeschlagen: ${error.message}` };
      }
    });
  }

  // ============= MAIN TEST RUNNER =============
  
  async runAllTests(): Promise<void> {
    this.results = [];
    
    console.log('🚀 UMFASSENDE SYSTEM-TESTS GESTARTET');
    console.log('=====================================');
    
    // Time Tracking Tests
    console.log('\n📋 TIME TRACKING TESTS');
    console.log('----------------------');
    await this.testTimeTrackingDatabase();
    await this.testTimeTrackingService();
    await this.testTimeTrackingStartStop();
    await this.testTimeTrackingManualEntry();
    
    // Business Travel Tests
    console.log('\n✈️ BUSINESS TRAVEL TESTS');
    console.log('-------------------------');
    await this.testBusinessTravelDatabase();
    await this.testBusinessTravelCreation();
    
    // Tasks Tests
    console.log('\n📝 TASKS TESTS');
    console.log('---------------');
    await this.testTasksDatabase();
    await this.testTaskCreation();
    
    // Summary
    this.printSummary();
  }

  private printSummary(): void {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const total = this.results.length;
    
    console.log('\n📊 TEST-ZUSAMMENFASSUNG');
    console.log('========================');
    console.log(`✅ Erfolgreich: ${passed}/${total}`);
    console.log(`❌ Fehlgeschlagen: ${failed}/${total}`);
    console.log(`⚠️ Warnungen: ${warnings}/${total}`);
    
    if (failed > 0) {
      console.log('\n🔍 FEHLGESCHLAGENE TESTS:');
      this.results
        .filter(r => r.status === 'fail')
        .forEach(r => {
          console.log(`❌ ${r.module} - ${r.test}: ${r.details}`);
        });
    }
    
    const overallStatus = failed === 0 ? 'ALLE TESTS ERFOLGREICH' : `${failed} TESTS FEHLGESCHLAGEN`;
    const statusIcon = failed === 0 ? '🎉' : '⚠️';
    
    console.log(`\n${statusIcon} ${overallStatus}`);
    
    // Show toast with summary
    const message = failed === 0 
      ? `Alle ${total} Tests erfolgreich!`
      : `${passed}/${total} Tests erfolgreich, ${failed} fehlgeschlagen`;
      
    toast(message, {
      description: `Dauer: ${Math.max(...this.results.map(r => r.duration))}ms max`,
      duration: 5000
    });
  }

  getResults(): TestResult[] {
    return this.results;
  }
}

export const testRunner = new TestRunner();
export type { TestResult };