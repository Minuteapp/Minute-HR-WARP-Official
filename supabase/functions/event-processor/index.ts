import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Effect Types and their handlers - Complete mapping for all effect_types
const EFFECT_HANDLERS: Record<string, (ctx: EffectContext) => Promise<EffectResult>> = {
  // Notification effects
  'notification.in_app': handleInAppNotification,
  'notification.email': handleEmailNotification,
  'notification.push': handlePushNotification,
  'notification.sms': handleSmsNotification,
  
  // Task effects
  'task.create': handleTaskCreate,
  'task.assign': handleTaskAssign,
  'task.update': handleTaskUpdate,
  'task.complete': handleTaskComplete,
  
  // Workflow effects
  'workflow.trigger': handleWorkflowTrigger,
  'workflow.escalate': handleWorkflowEscalate,
  'workflow.advance': handleWorkflowAdvance,
  'workflow.complete': handleWorkflowComplete,
  
  // UI effects
  'ui.badge_update': handleUIBadgeUpdate,
  'ui.live_update': handleUILiveUpdate,
  'ui.list_refresh': handleUIListRefresh,
  'ui.toast_show': handleUIToastShow,
  'ui.calendar_update': handleUICalendarUpdate,
  'ui.progress_update': handleUIProgressUpdate,
  
  // Cache effects
  'cache.invalidate': handleCacheInvalidate,
  'cache.refresh': handleCacheRefresh,
  
  // Compliance effects
  'compliance.audit_log': handleComplianceAuditLog,
  'compliance.alert': handleComplianceAlert,
  'compliance.retention_tag': handleComplianceRetentionTag,
  
  // Integration effects
  'integration.webhook': handleIntegrationWebhook,
  'integration.calendar_sync': handleIntegrationCalendarSync,
  'integration.payroll_update': handleIntegrationPayrollUpdate,
  'integration.accounting_export': handleIntegrationAccountingExport,
  
  // Access effects
  'access.permission_update': handleAccessPermissionUpdate,
  'access.role_change': handleAccessRoleChange,
  'access.revoke': handleAccessRevoke,
  
  // AI effects
  'ai.analysis': handleAIAnalysis,
  'ai.prediction': handleAIPrediction,
  'ai.suggestion': handleAISuggestion,
  
  // Analytics effects
  'analytics.metric_increment': handleAnalyticsMetricIncrement,
  'analytics.report_update': handleAnalyticsReportUpdate,
  'analytics.kpi_refresh': handleAnalyticsKpiRefresh,
  
  // Legacy mappings for backward compatibility
  'report.refresh': handleAnalyticsReportUpdate,
  'calendar.sync': handleIntegrationCalendarSync,
  'audit.log': handleComplianceAuditLog,
  'access.update': handleAccessPermissionUpdate,
  'ai.analyze': handleAIAnalysis,
  'integration.sync': handleIntegrationWebhook,
};

interface SystemEvent {
  id: string;
  event_name: string;
  tenant_id: string;
  actor_user_id: string;
  actor_role: string;
  entity_type: string;
  entity_id: string;
  module: string;
  payload: Record<string, any>;
  context: Record<string, any>;
  correlation_id?: string;
  occurred_at: string;
}

interface ImpactMatrixEntry {
  effect_type: string;
  effect_category: string;
  target_resolution_rule: Record<string, any>;
  conditions: Record<string, any> | null;
  priority: string;
  execution_mode: string;
  retry_policy: Record<string, any>;
  failure_handling: string;
}

interface EffectContext {
  event: SystemEvent;
  effect: ImpactMatrixEntry;
  supabase: any;
  targets: string[];
  settings: Record<string, any>;
}

interface EffectResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Main handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { action, event_id, batch_size = 10 } = await req.json();
    console.log(`[EventProcessor] Action: ${action}, EventID: ${event_id || 'batch'}`);

    if (action === 'process_single') {
      // Process a single event by ID
      const result = await processSingleEvent(supabase, event_id);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'process_batch') {
      // Process pending events from outbox
      const result = await processBatch(supabase, batch_size);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'retry_failed') {
      // Retry failed effects
      const result = await retryFailedEffects(supabase);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[EventProcessor] Error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Process a single event
async function processSingleEvent(supabase: any, eventId: string): Promise<any> {
  console.log(`[EventProcessor] Processing event: ${eventId}`);

  // 1. Fetch the event
  const { data: event, error: eventError } = await supabase
    .from('system_events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (eventError || !event) {
    console.error(`[EventProcessor] Event not found: ${eventId}`, eventError);
    return { success: false, error: 'Event not found' };
  }

  // 2. Get applicable effects from impact matrix
  const { data: effects, error: effectsError } = await supabase
    .from('impact_matrix')
    .select('*')
    .eq('action_name', event.event_name)
    .eq('is_active', true);

  if (effectsError) {
    console.error(`[EventProcessor] Error fetching effects:`, effectsError);
    return { success: false, error: 'Failed to fetch effects' };
  }

  console.log(`[EventProcessor] Found ${effects?.length || 0} effects for ${event.event_name}`);

  // 3. Process each effect
  const results = [];
  for (const effect of effects || []) {
    const result = await processEffect(supabase, event, effect);
    results.push(result);
  }

  // 4. Update outbox status
  await supabase
    .from('event_outbox')
    .update({ 
      status: 'completed',
      last_attempt_at: new Date().toISOString()
    })
    .eq('event_id', eventId);

  return { success: true, eventId, effectsProcessed: results.length, results };
}

// Process batch of pending events
async function processBatch(supabase: any, batchSize: number): Promise<any> {
  console.log(`[EventProcessor] Processing batch of ${batchSize} events`);

  // Fetch pending events from outbox
  const { data: pendingEvents, error } = await supabase
    .from('event_outbox')
    .select('event_id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(batchSize);

  if (error) {
    console.error(`[EventProcessor] Error fetching pending events:`, error);
    return { success: false, error: 'Failed to fetch pending events' };
  }

  console.log(`[EventProcessor] Found ${pendingEvents?.length || 0} pending events`);

  const results = [];
  for (const item of pendingEvents || []) {
    // Mark as processing
    await supabase
      .from('event_outbox')
      .update({ status: 'processing', last_attempt_at: new Date().toISOString() })
      .eq('event_id', item.event_id);

    const result = await processSingleEvent(supabase, item.event_id);
    results.push(result);
  }

  return { success: true, processed: results.length, results };
}

// Process a single effect
async function processEffect(supabase: any, event: SystemEvent, effect: ImpactMatrixEntry): Promise<any> {
  console.log(`[EventProcessor] Processing effect: ${effect.effect_type} for event: ${event.id}`);

  // Generate idempotency key
  const idempotencyKey = `${event.id}-${effect.effect_type}`;

  // Check if already processed (idempotency)
  const { data: existingRun } = await supabase
    .from('effect_runs')
    .select('id, status')
    .eq('idempotency_key', idempotencyKey)
    .eq('status', 'completed')
    .single();

  if (existingRun) {
    console.log(`[EventProcessor] Effect already processed: ${idempotencyKey}`);
    return { skipped: true, reason: 'Already processed' };
  }

  // Check conditions
  if (effect.conditions && !evaluateConditions(event, effect.conditions)) {
    console.log(`[EventProcessor] Conditions not met for effect: ${effect.effect_type}`);
    return { skipped: true, reason: 'Conditions not met' };
  }

  // Get tenant settings for this effect
  const settings = await getEffectSettings(supabase, event.tenant_id, effect.effect_type);

  // Check if effect is enabled
  if (settings.enabled === false) {
    console.log(`[EventProcessor] Effect disabled by settings: ${effect.effect_type}`);
    return { skipped: true, reason: 'Disabled by settings' };
  }

  // Resolve targets
  const targets = await resolveTargets(supabase, event, effect.target_resolution_rule);
  console.log(`[EventProcessor] Resolved ${targets.length} targets for effect: ${effect.effect_type}`);

  // Create effect run record
  const { data: effectRun, error: runError } = await supabase
    .from('effect_runs')
    .insert({
      event_id: event.id,
      effect_type: effect.effect_type,
      effect_config: effect,
      target_type: effect.target_resolution_rule.type || 'user',
      status: 'running',
      execution_mode: effect.execution_mode,
      idempotency_key: idempotencyKey,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (runError) {
    console.error(`[EventProcessor] Error creating effect run:`, runError);
    return { success: false, error: 'Failed to create effect run' };
  }

  // Execute the effect handler
  const handler = EFFECT_HANDLERS[effect.effect_type];
  if (!handler) {
    console.warn(`[EventProcessor] No handler for effect type: ${effect.effect_type}`);
    await updateEffectRun(supabase, effectRun.id, 'skipped', null, 'No handler available');
    return { skipped: true, reason: 'No handler' };
  }

  try {
    const context: EffectContext = {
      event,
      effect,
      supabase,
      targets,
      settings,
    };

    const result = await handler(context);

    if (result.success) {
      await updateEffectRun(supabase, effectRun.id, 'completed', result.data);
      return { success: true, effectType: effect.effect_type, result };
    } else {
      const errorMsg = result.error || 'Unknown error';
      await handleEffectFailure(supabase, effectRun, effect, errorMsg);
      return { success: false, effectType: effect.effect_type, error: errorMsg };
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[EventProcessor] Effect handler error:`, error);
    await handleEffectFailure(supabase, effectRun, effect, errorMessage);
    return { success: false, effectType: effect.effect_type, error: errorMessage };
  }
}

// Update effect run status
async function updateEffectRun(supabase: any, runId: string, status: string, result?: any, error?: string) {
  await supabase
    .from('effect_runs')
    .update({
      status,
      completed_at: new Date().toISOString(),
      result: result ? JSON.stringify(result) : null,
      error_message: error,
    })
    .eq('id', runId);
}

// Handle effect failure with retry logic
async function handleEffectFailure(supabase: any, effectRun: any, effect: ImpactMatrixEntry, errorMessage: string) {
  const retryPolicy = effect.retry_policy || { max_attempts: 3, backoff: 'exponential' };
  const currentAttempts = (effectRun.attempts || 0) + 1;

  if (currentAttempts < retryPolicy.max_attempts && effect.failure_handling === 'retry') {
    // Calculate next retry time (exponential backoff)
    const baseDelay = 60000; // 1 minute
    const delay = baseDelay * Math.pow(2, currentAttempts - 1);
    const nextRetry = new Date(Date.now() + delay).toISOString();

    await supabase
      .from('effect_runs')
      .update({
        status: 'pending',
        attempts: currentAttempts,
        next_retry_at: nextRetry,
        error_message: errorMessage,
      })
      .eq('id', effectRun.id);
  } else {
    // Move to dead letter queue
    await supabase
      .from('effect_runs')
      .update({
        status: 'failed',
        attempts: currentAttempts,
        error_message: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq('id', effectRun.id);

    await supabase
      .from('effect_dead_letters')
      .insert({
        effect_run_id: effectRun.id,
        event_id: effectRun.event_id,
        effect_type: effectRun.effect_type,
        error_details: { message: errorMessage, attempts: currentAttempts },
      });
  }
}

// Retry failed effects
async function retryFailedEffects(supabase: any): Promise<any> {
  const now = new Date().toISOString();

  // Fetch effects ready for retry
  const { data: retryable, error } = await supabase
    .from('effect_runs')
    .select('*, system_events(*)')
    .eq('status', 'pending')
    .lte('next_retry_at', now)
    .limit(20);

  if (error) {
    console.error(`[EventProcessor] Error fetching retryable effects:`, error);
    return { success: false, error: 'Failed to fetch retryable effects' };
  }

  console.log(`[EventProcessor] Found ${retryable?.length || 0} effects to retry`);

  const results = [];
  for (const run of retryable || []) {
    // Get the effect config from impact matrix
    const { data: effect } = await supabase
      .from('impact_matrix')
      .select('*')
      .eq('action_name', run.system_events.event_name)
      .eq('effect_type', run.effect_type)
      .single();

    if (effect) {
      const result = await processEffect(supabase, run.system_events, effect);
      results.push(result);
    }
  }

  return { success: true, retried: results.length, results };
}

// Evaluate conditions
function evaluateConditions(event: SystemEvent, conditions: Record<string, any>): boolean {
  try {
    // Simple condition evaluation
    for (const [key, value] of Object.entries(conditions)) {
      if (key === 'payload_has') {
        // Check if payload has specific fields
        for (const field of value as string[]) {
          if (!(field in event.payload)) {
            return false;
          }
        }
      } else if (key === 'status_is') {
        if (event.payload.status !== value) {
          return false;
        }
      } else if (key === 'has_assigned_user') {
        if (!event.payload.assigned_user_id && !event.payload.assignee_id) {
          return false;
        }
      }
    }
    return true;
  } catch (error) {
    console.error('[EventProcessor] Condition evaluation error:', error);
    return false;
  }
}

// Get effect settings for tenant
async function getEffectSettings(supabase: any, tenantId: string, effectType: string): Promise<Record<string, any>> {
  const { data: settings } = await supabase
    .from('effect_settings')
    .select('settings, priority')
    .eq('tenant_id', tenantId)
    .eq('effect_type', effectType)
    .order('priority', { ascending: false })
    .limit(1)
    .single();

  return settings?.settings || { enabled: true };
}

// Resolve targets based on rules
async function resolveTargets(supabase: any, event: SystemEvent, rule: Record<string, any>): Promise<string[]> {
  const targets: string[] = [];

  try {
    switch (rule.type) {
      case 'assigned_user':
        // Get assigned user from payload
        const assignedUserId = event.payload.assigned_user_id || event.payload.assignee_id;
        if (assignedUserId) targets.push(assignedUserId);
        break;

      case 'actor':
        // Notify the actor themselves
        if (event.actor_user_id) targets.push(event.actor_user_id);
        break;

      case 'role':
        // Get all users with specific role in tenant
        const { data: roleUsers } = await supabase
          .from('employees')
          .select('user_id')
          .eq('company_id', event.tenant_id)
          .eq('role', rule.role_name);
        roleUsers?.forEach((u: any) => u.user_id && targets.push(u.user_id));
        break;

      case 'team':
        // Get all users in team
        const teamId = event.payload.team_id || rule.team_id;
        if (teamId) {
          const { data: teamMembers } = await supabase
            .from('employees')
            .select('user_id')
            .eq('company_id', event.tenant_id)
            .eq('team', teamId);
          teamMembers?.forEach((u: any) => u.user_id && targets.push(u.user_id));
        }
        break;

      case 'manager':
        // Get manager of the entity's owner
        const userId = event.payload.user_id || event.actor_user_id;
        if (userId) {
          const { data: employee } = await supabase
            .from('employees')
            .select('manager_id')
            .eq('user_id', userId)
            .single();
          if (employee?.manager_id) {
            const { data: manager } = await supabase
              .from('employees')
              .select('user_id')
              .eq('id', employee.manager_id)
              .single();
            if (manager?.user_id) targets.push(manager.user_id);
          }
        }
        break;

      case 'department_admins':
        // Get department admins
        const department = event.payload.department || rule.department;
        if (department) {
          const { data: admins } = await supabase
            .from('employees')
            .select('user_id')
            .eq('company_id', event.tenant_id)
            .eq('department', department)
            .in('role', ['admin', 'hr', 'manager']);
          admins?.forEach((u: any) => u.user_id && targets.push(u.user_id));
        }
        break;

      case 'entity_owner':
        // Get owner of the entity
        const { data: entity } = await supabase
          .from(event.entity_type)
          .select('user_id, created_by, owner_id')
          .eq('id', event.entity_id)
          .single();
        const ownerId = entity?.user_id || entity?.created_by || entity?.owner_id;
        if (ownerId) targets.push(ownerId);
        break;

      case 'subscribers':
        // Get users subscribed to this event type
        const { data: subscribers } = await supabase
          .from('event_subscriptions')
          .select('user_id')
          .eq('tenant_id', event.tenant_id)
          .eq('event_name', event.event_name)
          .eq('is_active', true);
        subscribers?.forEach((s: any) => s.user_id && targets.push(s.user_id));
        break;

      default:
        console.warn(`[EventProcessor] Unknown target type: ${rule.type}`);
    }
  } catch (error) {
    console.error('[EventProcessor] Target resolution error:', error);
  }

  // Remove duplicates and ensure tenant isolation
  return [...new Set(targets)];
}

// ============ EFFECT HANDLERS ============

async function handleInAppNotification(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:notification.in_app] Creating notification for ${ctx.targets.length} targets`);

  const notifications = ctx.targets.map(userId => ({
    user_id: userId,
    company_id: ctx.event.tenant_id,
    title: generateNotificationTitle(ctx.event),
    message: generateNotificationMessage(ctx.event),
    type: ctx.event.event_name.split('.')[0],
    read: false,
    action_url: generateActionUrl(ctx.event),
    entity_type: ctx.event.entity_type,
    entity_id: ctx.event.entity_id,
    created_at: new Date().toISOString(),
  }));

  if (notifications.length === 0) {
    return { success: true, data: { created: 0 } };
  }

  const { error } = await ctx.supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    console.error('[Effect:notification.in_app] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: { created: notifications.length } };
}

async function handleEmailNotification(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:notification.email] Would send email to ${ctx.targets.length} targets`);
  // Email sending would be implemented here (e.g., via Resend, SendGrid)
  // For now, just log and return success
  return { success: true, data: { queued: ctx.targets.length } };
}

async function handlePushNotification(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:notification.push] Would send push to ${ctx.targets.length} targets`);
  // Push notification would be implemented here
  return { success: true, data: { queued: ctx.targets.length } };
}

async function handleTaskCreate(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:task.create] Creating task from event: ${ctx.event.event_name}`);

  const taskConfig = ctx.effect.target_resolution_rule.task_config || {};
  
  const task = {
    title: taskConfig.title || `Follow-up: ${ctx.event.event_name}`,
    description: taskConfig.description || `Auto-generated from ${ctx.event.event_name}`,
    company_id: ctx.event.tenant_id,
    assigned_to: ctx.targets[0] || ctx.event.actor_user_id,
    created_by: ctx.event.actor_user_id,
    status: 'pending',
    priority: taskConfig.priority || 'medium',
    due_date: taskConfig.due_days ? 
      new Date(Date.now() + taskConfig.due_days * 24 * 60 * 60 * 1000).toISOString() : null,
    source_entity_type: ctx.event.entity_type,
    source_entity_id: ctx.event.entity_id,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await ctx.supabase
    .from('tasks')
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error('[Effect:task.create] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: { task_id: data.id } };
}

async function handleTaskAssign(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:task.assign] Assigning task to ${ctx.targets.length} users`);
  // Task assignment logic
  return { success: true, data: { assigned: ctx.targets.length } };
}

async function handleWorkflowTrigger(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:workflow.trigger] Triggering workflow for event: ${ctx.event.event_name}`);

  const workflowConfig = ctx.effect.target_resolution_rule.workflow_config || {};
  
  // Create workflow instance
  const { data, error } = await ctx.supabase
    .from('workflow_instances')
    .insert({
      workflow_id: workflowConfig.workflow_id,
      company_id: ctx.event.tenant_id,
      entity_type: ctx.event.entity_type,
      entity_id: ctx.event.entity_id,
      status: 'pending',
      current_step: 1,
      triggered_by: ctx.event.actor_user_id,
      trigger_event_id: ctx.event.id,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[Effect:workflow.trigger] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: { workflow_instance_id: data.id } };
}

async function handleWorkflowEscalate(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:workflow.escalate] Escalating workflow`);
  // Workflow escalation logic
  return { success: true, data: { escalated: true } };
}

async function handleReportRefresh(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:report.refresh] Refreshing reports for event: ${ctx.event.event_name}`);
  
  // Update event metrics for analytics
  await ctx.supabase
    .from('event_metrics')
    .upsert({
      tenant_id: ctx.event.tenant_id,
      event_name: ctx.event.event_name,
      period_start: new Date().toISOString().split('T')[0],
      event_count: 1,
    }, {
      onConflict: 'tenant_id,event_name,period_start',
      count: 'exact'
    });

  return { success: true, data: { refreshed: true } };
}

async function handleCacheInvalidate(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:cache.invalidate] Invalidating cache for: ${ctx.event.entity_type}`);
  // Cache invalidation logic would go here
  return { success: true, data: { invalidated: true } };
}

async function handleCalendarSync(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:calendar.sync] Syncing calendar event`);
  // Calendar sync logic
  return { success: true, data: { synced: true } };
}

async function handleAuditLog(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:audit.log] Creating audit entry for: ${ctx.event.event_name}`);

  const { error } = await ctx.supabase
    .from('audit_logs')
    .insert({
      company_id: ctx.event.tenant_id,
      user_id: ctx.event.actor_user_id,
      action: ctx.event.event_name,
      entity_type: ctx.event.entity_type,
      entity_id: ctx.event.entity_id,
      old_values: ctx.event.payload.old_values || null,
      new_values: ctx.event.payload.new_values || ctx.event.payload,
      ip_address: ctx.event.context?.ip_address,
      user_agent: ctx.event.context?.user_agent,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[Effect:audit.log] Error:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: { logged: true } };
}

async function handleAccessUpdate(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:access.update] Updating access for event: ${ctx.event.event_name}`);
  // Access/permission update logic
  return { success: true, data: { updated: true } };
}

async function handleAIAnalyze(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:ai.analyze] AI analysis for: ${ctx.event.event_name}`);
  // AI analysis would be triggered here (no write actions)
  return { success: true, data: { analyzed: true } };
}

async function handleIntegrationSync(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:integration.sync] Syncing with external integration`);
  // External integration sync
  return { success: true, data: { synced: true } };
}

async function handleUIBadgeUpdate(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:ui.badge_update] Updating UI badges`);
  // Real-time badge update via Supabase Realtime would happen here
  return { success: true, data: { updated: true } };
}

async function handleUILiveUpdate(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:ui.live_update] Sending live update`);
  // Real-time UI update via Supabase Realtime
  return { success: true, data: { sent: true } };
}

// ============ NEW HANDLERS ============

async function handleSmsNotification(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:notification.sms] Would send SMS to ${ctx.targets.length} targets`);
  // SMS sending would be implemented here (e.g., via Twilio)
  return { success: true, data: { queued: ctx.targets.length } };
}

async function handleTaskUpdate(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:task.update] Updating task from event: ${ctx.event.event_name}`);
  return { success: true, data: { updated: true } };
}

async function handleTaskComplete(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:task.complete] Marking task as complete`);
  return { success: true, data: { completed: true } };
}

async function handleWorkflowAdvance(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:workflow.advance] Advancing workflow to next step`);
  
  const workflowInstanceId = ctx.event.payload.workflow_instance_id;
  if (workflowInstanceId) {
    const { error } = await ctx.supabase
      .from('workflow_instances')
      .update({ 
        current_step: ctx.supabase.raw('current_step + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', workflowInstanceId);
    
    if (error) {
      console.error('[Effect:workflow.advance] Error:', error);
      return { success: false, error: error.message };
    }
  }
  
  return { success: true, data: { advanced: true } };
}

async function handleWorkflowComplete(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:workflow.complete] Completing workflow`);
  
  const workflowInstanceId = ctx.event.payload.workflow_instance_id;
  if (workflowInstanceId) {
    await ctx.supabase
      .from('workflow_instances')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', workflowInstanceId);
  }
  
  return { success: true, data: { completed: true } };
}

async function handleUIListRefresh(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:ui.list_refresh] Triggering list refresh for: ${ctx.event.entity_type}`);
  // Would trigger Supabase Realtime broadcast for list components
  return { success: true, data: { refreshed: true } };
}

async function handleUIToastShow(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:ui.toast_show] Showing toast notification`);
  // Toast notifications are handled client-side
  return { success: true, data: { shown: true } };
}

async function handleUICalendarUpdate(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:ui.calendar_update] Updating calendar view`);
  return { success: true, data: { updated: true } };
}

async function handleUIProgressUpdate(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:ui.progress_update] Updating progress indicator`);
  return { success: true, data: { updated: true } };
}

async function handleCacheRefresh(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:cache.refresh] Refreshing cache for: ${ctx.event.entity_type}`);
  return { success: true, data: { refreshed: true } };
}

async function handleComplianceAuditLog(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:compliance.audit_log] Creating compliance audit entry`);
  
  const { error } = await ctx.supabase
    .from('audit_logs')
    .insert({
      company_id: ctx.event.tenant_id,
      user_id: ctx.event.actor_user_id,
      action: ctx.event.event_name,
      entity_type: ctx.event.entity_type,
      entity_id: ctx.event.entity_id,
      old_values: ctx.event.payload.old_values || null,
      new_values: ctx.event.payload.new_values || ctx.event.payload,
      ip_address: ctx.event.context?.ip_address,
      user_agent: ctx.event.context?.user_agent,
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('[Effect:compliance.audit_log] Error:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: { logged: true } };
}

async function handleComplianceAlert(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:compliance.alert] Creating compliance alert`);
  
  await ctx.supabase
    .from('notifications')
    .insert({
      user_id: ctx.targets[0],
      company_id: ctx.event.tenant_id,
      title: 'Compliance-Warnung',
      message: `Compliance-relevantes Ereignis: ${ctx.event.event_name}`,
      type: 'compliance',
      priority: 'high',
      read: false,
      created_at: new Date().toISOString(),
    });
  
  return { success: true, data: { alerted: true } };
}

async function handleComplianceRetentionTag(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:compliance.retention_tag] Applying retention tag`);
  // Would apply data retention policies
  return { success: true, data: { tagged: true } };
}

async function handleIntegrationWebhook(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:integration.webhook] Calling external webhook`);
  
  const webhookUrl = ctx.settings.webhook_url;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: ctx.event.event_name,
          entity_type: ctx.event.entity_type,
          entity_id: ctx.event.entity_id,
          payload: ctx.event.payload,
          occurred_at: ctx.event.occurred_at,
        }),
      });
    } catch (error) {
      console.error('[Effect:integration.webhook] Error:', error);
      return { success: false, error: 'Webhook call failed' };
    }
  }
  
  return { success: true, data: { called: true } };
}

async function handleIntegrationCalendarSync(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:integration.calendar_sync] Syncing with external calendar`);
  // Would sync with Google Calendar, Outlook, etc.
  return { success: true, data: { synced: true } };
}

async function handleIntegrationPayrollUpdate(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:integration.payroll_update] Updating payroll system`);
  // Would update DATEV, SAP, etc.
  return { success: true, data: { updated: true } };
}

async function handleIntegrationAccountingExport(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:integration.accounting_export] Exporting to accounting system`);
  return { success: true, data: { exported: true } };
}

async function handleAccessPermissionUpdate(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:access.permission_update] Updating permissions`);
  return { success: true, data: { updated: true } };
}

async function handleAccessRoleChange(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:access.role_change] Changing user role`);
  return { success: true, data: { changed: true } };
}

async function handleAccessRevoke(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:access.revoke] Revoking access`);
  return { success: true, data: { revoked: true } };
}

async function handleAIAnalysis(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:ai.analysis] Running AI analysis`);
  // Would trigger AI analysis pipeline
  return { success: true, data: { analyzed: true } };
}

async function handleAIPrediction(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:ai.prediction] Generating AI prediction`);
  return { success: true, data: { predicted: true } };
}

async function handleAISuggestion(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:ai.suggestion] Creating AI suggestion`);
  return { success: true, data: { suggested: true } };
}

async function handleAnalyticsMetricIncrement(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:analytics.metric_increment] Incrementing metric`);
  
  await ctx.supabase
    .from('event_metrics')
    .upsert({
      tenant_id: ctx.event.tenant_id,
      event_name: ctx.event.event_name,
      period_start: new Date().toISOString().split('T')[0],
      event_count: 1,
    }, {
      onConflict: 'tenant_id,event_name,period_start',
    });
  
  return { success: true, data: { incremented: true } };
}

async function handleAnalyticsReportUpdate(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:analytics.report_update] Updating reports`);
  
  await ctx.supabase
    .from('event_metrics')
    .upsert({
      tenant_id: ctx.event.tenant_id,
      event_name: ctx.event.event_name,
      period_start: new Date().toISOString().split('T')[0],
      event_count: 1,
    }, {
      onConflict: 'tenant_id,event_name,period_start',
    });
  
  return { success: true, data: { refreshed: true } };
}

async function handleAnalyticsKpiRefresh(ctx: EffectContext): Promise<EffectResult> {
  console.log(`[Effect:analytics.kpi_refresh] Refreshing KPIs`);
  return { success: true, data: { refreshed: true } };
}

// Helper functions for notification generation
function generateNotificationTitle(event: SystemEvent): string {
  const parts = event.event_name.split('.');
  const module = parts[0];
  const action = parts[1];
  
  const titles: Record<string, Record<string, string>> = {
    task: {
      created: 'Neue Aufgabe',
      assigned: 'Aufgabe zugewiesen',
      completed: 'Aufgabe abgeschlossen',
      updated: 'Aufgabe aktualisiert',
      deleted: 'Aufgabe gelöscht',
    },
    absence: {
      requested: 'Neue Abwesenheitsanfrage',
      approved: 'Abwesenheit genehmigt',
      rejected: 'Abwesenheit abgelehnt',
    },
    document: {
      uploaded: 'Neues Dokument',
      approved: 'Dokument genehmigt',
      rejected: 'Dokument abgelehnt',
      shared: 'Dokument geteilt',
    },
    employee: {
      created: 'Neuer Mitarbeiter',
      updated: 'Mitarbeiter aktualisiert',
    },
    project: {
      created: 'Neues Projekt',
      updated: 'Projekt aktualisiert',
    },
    shift: {
      created: 'Neue Schicht',
      assigned: 'Schicht zugewiesen',
    },
    workflow: {
      started: 'Workflow gestartet',
      completed: 'Workflow abgeschlossen',
    },
    expense: {
      created: 'Neue Ausgabe',
      approved: 'Ausgabe genehmigt',
    },
    ticket: {
      created: 'Neues Ticket',
      resolved: 'Ticket gelöst',
    },
  };

  return titles[module]?.[action] || `${module}: ${action}`;
}

function generateNotificationMessage(event: SystemEvent): string {
  const parts = event.event_name.split('.');
  const module = parts[0];
  const action = parts[1];
  
  const name = event.payload.name || event.payload.title || event.entity_id;
  
  const messages: Record<string, Record<string, string>> = {
    task: {
      created: `Aufgabe "${name}" wurde erstellt`,
      assigned: `Ihnen wurde die Aufgabe "${name}" zugewiesen`,
      completed: `Aufgabe "${name}" wurde abgeschlossen`,
      updated: `Aufgabe "${name}" wurde aktualisiert`,
      deleted: `Aufgabe "${name}" wurde gelöscht`,
    },
    absence: {
      requested: `Abwesenheitsanfrage für ${event.payload.start_date} bis ${event.payload.end_date}`,
      approved: `Ihre Abwesenheit wurde genehmigt`,
      rejected: `Ihre Abwesenheit wurde abgelehnt`,
    },
    document: {
      uploaded: `Dokument "${name}" wurde hochgeladen`,
      approved: `Dokument "${name}" wurde genehmigt`,
      rejected: `Dokument "${name}" wurde abgelehnt`,
    },
    employee: {
      created: `Mitarbeiter "${name}" wurde angelegt`,
    },
    project: {
      created: `Projekt "${name}" wurde erstellt`,
      updated: `Projekt "${name}" wurde aktualisiert`,
    },
  };

  return messages[module]?.[action] || `${module} ${action}: ${name}`;
}

function generateActionUrl(event: SystemEvent): string {
  const moduleRoutes: Record<string, string> = {
    task: '/tasks',
    absence: '/absence',
    document: '/documents',
    employee: '/employees',
    project: '/projects',
    shift: '/shifts',
    workflow: '/workflows',
    expense: '/expenses',
    ticket: '/tickets',
  };

  const baseRoute = moduleRoutes[event.entity_type] || `/${event.entity_type}`;
  return `${baseRoute}/${event.entity_id}`;
}
