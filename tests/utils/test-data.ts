import { SupabaseClient } from '@supabase/supabase-js';

interface TestDataIds {
  employees: string[];
  departments: string[];
  teams: string[];
  absence_requests: string[];
  time_entries: string[];
  documents: string[];
  [key: string]: string[];
}

/**
 * Creates test data in a tenant for isolation testing
 */
export const createTestDataInTenant = async (
  client: SupabaseClient,
  companyId: string,
  userId: string
): Promise<TestDataIds> => {
  const testDataIds: TestDataIds = {
    employees: [],
    departments: [],
    teams: [],
    absence_requests: [],
    time_entries: [],
    documents: [],
  };

  // Create department
  const { data: dept, error: deptError } = await client
    .from('departments')
    .insert({
      company_id: companyId,
      name: `Test Department ${Date.now()}`,
    })
    .select()
    .single();

  if (!deptError && dept) {
    testDataIds.departments.push(dept.id);
  }

  // Create team
  const { data: team, error: teamError } = await client
    .from('teams')
    .insert({
      company_id: companyId,
      name: `Test Team ${Date.now()}`,
      department_id: dept?.id,
    })
    .select()
    .single();

  if (!teamError && team) {
    testDataIds.teams.push(team.id);
  }

  // Create absence request
  const { data: absence, error: absenceError } = await client
    .from('absence_requests')
    .insert({
      user_id: userId,
      company_id: companyId,
      type: 'vacation',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      status: 'pending',
    })
    .select()
    .single();

  if (!absenceError && absence) {
    testDataIds.absence_requests.push(absence.id);
  }

  // Create time entry
  const { data: timeEntry, error: timeError } = await client
    .from('time_entries')
    .insert({
      user_id: userId,
      company_id: companyId,
      date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '17:00',
      type: 'regular',
    })
    .select()
    .single();

  if (!timeError && timeEntry) {
    testDataIds.time_entries.push(timeEntry.id);
  }

  return testDataIds;
};

/**
 * Cleans up test data created by createTestDataInTenant
 */
export const cleanupTestData = async (
  client: SupabaseClient,
  testDataIds: TestDataIds
): Promise<void> => {
  // Delete in reverse order of creation (dependencies first)
  for (const [table, ids] of Object.entries(testDataIds)) {
    if (ids.length > 0) {
      await client.from(table).delete().in('id', ids);
    }
  }
};
