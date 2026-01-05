import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();

    // Finde überfällige Anträge (älter als 3 Tage, noch pending)
    const { data: overdueRequests, error: fetchError } = await supabase
      .from('absence_requests')
      .select(`
        id,
        employee_name,
        type,
        start_date,
        end_date,
        created_at,
        company_id,
        department
      `)
      .eq('status', 'pending')
      .lt('created_at', threeDaysAgo);

    if (fetchError) {
      console.error('Fehler beim Laden überfälliger Anträge:', fetchError);
      throw fetchError;
    }

    console.log(`Gefundene überfällige Anträge: ${overdueRequests?.length || 0}`);

    if (!overdueRequests || overdueRequests.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Keine überfälligen Anträge gefunden', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gruppiere nach Company und Department für Manager-Benachrichtigungen
    const groupedByCompany: Record<string, typeof overdueRequests> = {};
    
    overdueRequests.forEach(request => {
      const key = request.company_id;
      if (!groupedByCompany[key]) {
        groupedByCompany[key] = [];
      }
      groupedByCompany[key].push(request);
    });

    let notificationsSent = 0;

    // Erstelle Benachrichtigungen für Manager jeder Company
    for (const [companyId, requests] of Object.entries(groupedByCompany)) {
      // Hole Manager/Admins für die Company
      const { data: managers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('company_id', companyId)
        .in('role', ['admin', 'manager', 'hr']);

      if (!managers || managers.length === 0) continue;

      // Erstelle Auto-Notification
      for (const manager of managers) {
        const { error: notifyError } = await supabase
          .from('absence_auto_notifications')
          .insert({
            company_id: companyId,
            recipient_user_id: manager.user_id,
            recipient_email: '', // Wird später durch lookup gefüllt
            notification_type: 'reminder_overdue',
            subject: `Erinnerung: ${requests.length} überfällige Abwesenheitsanträge`,
            message: `Folgende Anträge warten seit mehr als 3 Tagen auf Genehmigung:\n\n${requests.map(r => 
              `- ${r.employee_name}: ${r.type} (${new Date(r.start_date).toLocaleDateString('de-DE')} - ${new Date(r.end_date).toLocaleDateString('de-DE')})`
            ).join('\n')}`,
            status: 'pending',
            metadata: {
              overdue_request_ids: requests.map(r => r.id),
              request_count: requests.length
            }
          });

        if (!notifyError) {
          notificationsSent++;
        }
      }

      // Erstelle auch Standard-Notification
      for (const manager of managers) {
        await supabase
          .from('absence_notifications')
          .insert({
            company_id: companyId,
            user_id: manager.user_id,
            notification_type: 'reminder',
            message: `${requests.length} Abwesenheitsantrag/anträge warten seit mehr als 3 Tagen auf Ihre Genehmigung.`,
            read: false
          });
      }
    }

    console.log(`Gesendete Benachrichtigungen: ${notificationsSent}`);

    return new Response(
      JSON.stringify({ 
        message: 'Erinnerungen erfolgreich versendet',
        overdueRequests: overdueRequests.length,
        notificationsSent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in absence-reminder:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
