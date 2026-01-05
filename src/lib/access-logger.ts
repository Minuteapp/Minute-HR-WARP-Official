import { supabase } from '@/integrations/supabase/client';

interface LogAccessParams {
  employeeId: string;
  action: string;
  module: string;
  category: 'create' | 'edit' | 'view' | 'approve' | 'delete';
  details?: any;
}

/**
 * Protokolliert einen Zugriff in der employee_access_logs Tabelle
 */
export const logAccess = async ({
  employeeId,
  action,
  module,
  category,
  details,
}: LogAccessParams): Promise<void> => {
  try {
    // Get IP Address (client-side, nicht 100% zuverlässig aber besser als nichts)
    let ipAddress = 'unknown';
    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(2000), // Timeout nach 2 Sekunden
      });
      const data = await response.json();
      ipAddress = data.ip;
    } catch (ipError) {
      console.warn('Could not fetch IP address:', ipError);
    }

    // Log to database
    await supabase
      .from('employee_access_logs')
      .insert({
        employee_id: employeeId,
        action,
        module,
        category,
        details: details ? JSON.stringify(details) : null,
        ip_address: ipAddress,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
  } catch (error) {
    // Fehler nicht weiterwerfen, damit die eigentliche Aktion nicht blockiert wird
    console.error('Failed to log access:', error);
  }
};

/**
 * Wrapper-Funktion für kritische Aktionen mit automatischem Logging
 */
export const withAccessLog = async <T>(
  params: LogAccessParams,
  action: () => Promise<T>
): Promise<T> => {
  const result = await action();
  
  // Log nach erfolgreicher Aktion (fire and forget)
  logAccess(params).catch(console.error);
  
  return result;
};
