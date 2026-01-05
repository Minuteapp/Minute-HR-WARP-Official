import { createAdminClient } from './supabase-client';
import { v4 as uuidv4 } from 'uuid';

interface TestTenant {
  id: string;
  name: string;
  adminEmail: string;
  adminPassword: string;
}

/**
 * Creates a new test tenant with an admin user
 */
export const createTestTenant = async (tenantName?: string): Promise<TestTenant> => {
  const adminClient = createAdminClient();
  const tenantId = uuidv4();
  const name = tenantName || `TestTenant_${Date.now()}`;
  const adminEmail = `admin_${tenantId.substring(0, 8)}@test.local`;
  const adminPassword = `TestPassword123!${uuidv4().substring(0, 8)}`;

  // Create the company
  const { data: company, error: companyError } = await adminClient
    .from('companies')
    .insert({
      id: tenantId,
      name: name,
      status: 'active',
    })
    .select()
    .single();

  if (companyError) {
    throw new Error(`Failed to create test company: ${companyError.message}`);
  }

  // Create admin user via Auth API
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: {
      company_id: tenantId,
      role: 'admin',
    },
  });

  if (authError) {
    // Cleanup company if user creation failed
    await adminClient.from('companies').delete().eq('id', tenantId);
    throw new Error(`Failed to create test admin user: ${authError.message}`);
  }

  // Create employee record for the admin
  const { error: employeeError } = await adminClient
    .from('employees')
    .insert({
      id: authData.user.id,
      company_id: tenantId,
      email: adminEmail,
      first_name: 'Test',
      last_name: 'Admin',
      status: 'active',
    });

  if (employeeError) {
    console.warn(`Failed to create employee record: ${employeeError.message}`);
  }

  return {
    id: tenantId,
    name,
    adminEmail,
    adminPassword,
  };
};

/**
 * Deletes a test tenant and all associated data
 */
export const deleteTestTenant = async (tenantId: string): Promise<void> => {
  const adminClient = createAdminClient();

  // Get all users for this tenant
  const { data: employees } = await adminClient
    .from('employees')
    .select('id')
    .eq('company_id', tenantId);

  // Delete auth users
  for (const employee of employees || []) {
    await adminClient.auth.admin.deleteUser(employee.id);
  }

  // Delete company (cascade should handle related data)
  const { error } = await adminClient
    .from('companies')
    .delete()
    .eq('id', tenantId);

  if (error) {
    console.warn(`Failed to delete test tenant: ${error.message}`);
  }
};

/**
 * Sets up a test tenant with authenticated client
 */
export const setupTestTenant = async (tenantName?: string) => {
  const { getAuthenticatedClient } = await import('./supabase-client');
  
  const tenant = await createTestTenant(tenantName);
  const client = await getAuthenticatedClient(tenant.adminEmail, tenant.adminPassword);
  
  return {
    ...tenant,
    client,
  };
};
