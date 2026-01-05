import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PolicySyncEvent {
  event_type: 'policy_created' | 'policy_updated' | 'policy_deleted';
  policy_id: string;
  affected_modules: string[];
  affected_users: string[];
  change_payload: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { event_type, policy_id, affected_modules, change_payload } = await req.json() as PolicySyncEvent;

    console.log(`Processing policy sync event: ${event_type} for policy ${policy_id}`);

    // Get all users who might be affected by this policy change
    const { data: affectedUsers, error: usersError } = await supabase
      .from('user_roles')
      .select('user_id, role, company_id')
      .in('role', change_payload?.required_roles || []);

    if (usersError) {
      console.error('Error fetching affected users:', usersError);
    }

    // Create real-time notifications for affected users
    const notifications = [];
    
    if (affectedUsers) {
      for (const user of affectedUsers) {
        // Check if this policy change affects this user
        const shouldNotify = await shouldNotifyUser(supabase, user.user_id, policy_id, affected_modules);
        
        if (shouldNotify) {
          notifications.push({
            user_id: user.user_id,
            notification_type: 'policy_change',
            title: getPolicyChangeTitle(event_type, change_payload),
            message: getPolicyChangeMessage(event_type, change_payload),
            metadata: {
              policy_id,
              event_type,
              affected_modules,
              timestamp: new Date().toISOString()
            }
          });
        }
      }
    }

    // Send notifications if any
    if (notifications.length > 0) {
      const { error: notificationError } = await supabase
        .from('system_notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating notifications:', notificationError);
      } else {
        console.log(`Created ${notifications.length} policy change notifications`);
      }
    }

    // Update sync event status
    const { error: syncError } = await supabase
      .from('policy_sync_events')
      .update({ 
        propagation_status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('policy_id', policy_id)
      .eq('event_type', event_type);

    if (syncError) {
      console.error('Error updating sync status:', syncError);
    }

    // Broadcast real-time event to all connected clients (ignore errors)
    try {
      await supabase
        .channel('policy-updates')
        .send({
          type: 'broadcast',
          event: 'policy_change',
          payload: {
            event_type,
            policy_id,
            affected_modules,
            change_payload,
            timestamp: new Date().toISOString()
          }
        });
    } catch (broadcastError) {
      console.error('Error broadcasting policy change:', broadcastError);
    }

    console.log(`Policy sync completed for ${policy_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Policy sync completed',
        notifications_sent: notifications.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Policy sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function shouldNotifyUser(
  supabase: any, 
  userId: string, 
  policyId: string, 
  affectedModules: string[]
): Promise<boolean> {
  try {
    // Check if user has access to any of the affected modules
    const { data: userPermissions } = await supabase.rpc('get_user_effective_permissions', {
      p_user_id: userId
    });

    if (!userPermissions) return false;

    // Check if user's modules overlap with affected modules
    const userModules = userPermissions.map((p: any) => p.module_name);
    const hasOverlap = affectedModules.some(module => 
      userModules.includes(module) || affectedModules.length === 0
    );

    return hasOverlap;
  } catch (error) {
    console.error('Error checking user notification eligibility:', error);
    return false;
  }
}

function getPolicyChangeTitle(eventType: string, payload: any): string {
  const policyName = payload?.new?.policy_name || payload?.policy_name || 'Unbekannte Policy';
  
  switch (eventType) {
    case 'policy_created':
      return `Neue Sicherheitsrichtlinie: ${policyName}`;
    case 'policy_updated':
      return `Sicherheitsrichtlinie geändert: ${policyName}`;
    case 'policy_deleted':
      return `Sicherheitsrichtlinie entfernt: ${policyName}`;
    default:
      return 'Sicherheitsrichtlinie geändert';
  }
}

function getPolicyChangeMessage(eventType: string, payload: any): string {
  const policyName = payload?.new?.policy_name || payload?.policy_name || 'eine Sicherheitsrichtlinie';
  const isActive = payload?.new?.is_active ?? payload?.is_active;
  
  switch (eventType) {
    case 'policy_created':
      return `Eine neue Sicherheitsrichtlinie "${policyName}" wurde aktiviert und wirkt sich auf Ihre Arbeit aus.`;
    case 'policy_updated':
      if (isActive === false) {
        return `Die Sicherheitsrichtlinie "${policyName}" wurde deaktiviert.`;
      }
      return `Die Sicherheitsrichtlinie "${policyName}" wurde aktualisiert. Bitte beachten Sie die neuen Regeln.`;
    case 'policy_deleted':
      return `Die Sicherheitsrichtlinie "${policyName}" wurde entfernt und ist nicht mehr aktiv.`;
    default:
      return 'Eine Sicherheitsrichtlinie wurde geändert.';
  }
}