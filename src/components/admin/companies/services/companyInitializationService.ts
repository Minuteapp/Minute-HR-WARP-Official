import { supabase } from "@/integrations/supabase/client";

/**
 * ZERO-DATA-START: Keine Default-Abwesenheitstypen mehr!
 * Abwesenheitstypen müssen über Einstellungen → Abwesenheit angelegt werden.
 * 
 * Diese Funktion wurde gemäß Data-Governance-Richtlinie entfernt.
 * @deprecated Nicht mehr verwenden - verletzt ZERO-DATA-START Prinzip
 */

/**
 * Erstellt Standard-Modul-Zuweisungen für eine neue Firma
 * ✅ ERLAUBT: Aktiviert nur Module, erstellt keine Fachdaten
 */
export const createDefaultModuleAssignments = async (companyId: string): Promise<void> => {
  // Hole alle verfügbaren Module
  const { data: modules, error: modulesError } = await supabase
    .from('system_modules')
    .select('id')
    .eq('is_active', true);

  if (modulesError || !modules?.length) {
    console.warn('Could not fetch system modules:', modulesError);
    return;
  }

  const moduleAssignments = modules.map(module => ({
    company_id: companyId,
    module_id: module.id,
    is_enabled: true,
    enabled_by: null,
    enabled_at: new Date().toISOString()
  }));

  const { error } = await supabase
    .from('company_module_assignments')
    .insert(moduleAssignments);

  if (error) {
    console.warn('Could not create module assignments:', error);
  } else {
    console.log('✅ Module assignments created for company:', companyId);
  }
};

/**
 * Verknüpft den aktuellen Benutzer als Admin der neuen Firma
 * ✅ ZERO-DATA-START konform: Keine Department-Zuweisung mehr
 */
export const linkAdminToCompany = async (companyId: string, adminEmail?: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.warn('No authenticated user found for admin linking');
    return;
  }

  // Erstelle user_role für die neue Firma
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user_id: user.id,
      role: 'admin',
      company_id: companyId
    });

  if (roleError && !roleError.message?.includes('duplicate')) {
    console.warn('Could not create user role:', roleError);
  }

  // Erstelle employee Eintrag für den Admin
  // ZERO-DATA-START: KEINE department-Zuweisung - muss über Einstellungen erfolgen
  const { error: employeeError } = await supabase
    .from('employees')
    .insert({
      user_id: user.id,
      company_id: companyId,
      email: adminEmail || user.email,
      first_name: user.user_metadata?.first_name || 'Admin',
      last_name: user.user_metadata?.last_name || 'User',
      position: 'Administrator',
      // department: ENTFERNT - muss über Einstellungen angelegt und zugewiesen werden
      status: 'active',
      start_date: new Date().toISOString().split('T')[0]
    });

  if (employeeError && !employeeError.message?.includes('duplicate')) {
    console.warn('Could not create employee record:', employeeError);
  } else {
    console.log('✅ Admin linked to company:', companyId);
  }
};

/**
 * Erstellt Standard-Einstellungen für eine neue Firma
 * ✅ ERLAUBT: Nur technische Konfiguration, keine Fachdaten
 */
export const createDefaultCompanySettings = async (companyId: string): Promise<void> => {
  // Accessibility settings - rein technische Config
  const { error: accessError } = await supabase
    .from('accessibility_settings')
    .insert({
      company_id: companyId,
      high_contrast_mode: false,
      large_text_mode: false,
      screen_reader_support: true,
      keyboard_navigation: true
    });

  if (accessError && !accessError.message?.includes('duplicate')) {
    console.warn('Could not create accessibility settings:', accessError);
  }

  // AI Gateway config - standardmäßig deaktiviert
  const { error: aiError } = await supabase
    .from('ai_gateway_config')
    .insert({
      company_id: companyId,
      ai_mode: 'disabled',
      monthly_budget_cents: 0,
      enabled_modules: []
    });

  if (aiError && !aiError.message?.includes('duplicate')) {
    console.warn('Could not create AI gateway config:', aiError);
  }

  console.log('✅ Default company settings created for:', companyId);
};

/**
 * Initialisiert 80/20 Settings für eine neue Firma via RPC
 * ✅ ERLAUBT: Setzt nur Konfigurationswerte, keine Fachdaten
 */
export const initializeTenantSettings = async (companyId: string): Promise<void> => {
  const { data, error } = await supabase.rpc('initialize_tenant_settings', {
    p_tenant_id: companyId
  });

  if (error) {
    console.warn('Could not initialize tenant settings:', error);
  } else {
    console.log('✅ Tenant settings initialized:', data?.settings_created, 'settings for', companyId);
  }
};

/**
 * Initialisiert eine neue Firma
 * 
 * ZERO-DATA-START Prinzip:
 * - ✅ Module aktivieren (keine Fachdaten)
 * - ✅ Technische Settings (accessibility, AI-Mode disabled)
 * - ✅ 80/20 Settings via SDA-RPC (Konfiguration, keine Daten)
 * - ✅ Admin verknüpfen (ohne Department)
 * - ❌ KEINE Abwesenheitstypen (muss in Einstellungen angelegt werden)
 * - ❌ KEINE Abteilungen/Teams/Standorte (muss in Einstellungen angelegt werden)
 */
export const initializeNewCompany = async (companyId: string, adminEmail?: string): Promise<void> => {
  console.log('🏗️ Initializing new company (ZERO-DATA-START):', companyId);
  
  try {
    // Nur erlaubte Initialisierungen - keine Fachdaten!
    await Promise.all([
      createDefaultModuleAssignments(companyId),  // ✅ OK - nur Module aktivieren
      createDefaultCompanySettings(companyId),    // ✅ OK - nur technische Config
      initializeTenantSettings(companyId),        // ✅ OK - 80/20 SDA Settings
      linkAdminToCompany(companyId, adminEmail)   // ✅ OK - ohne department
    ]);

    console.log('✅ Company initialization complete (ZERO-DATA-START + SDA compliant):', companyId);
  } catch (error) {
    console.error('❌ Error during company initialization:', error);
  }
};
