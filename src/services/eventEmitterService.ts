/**
 * Event Emitter Service
 * 
 * Zentraler Service für das Emittieren von System-Events.
 * Jede Aktion in jedem Modul erzeugt ein standardisiertes Event.
 */

import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface EventPayload {
  actionName: string;
  entityType: string;
  entityId: string;
  module: string;
  payload: Record<string, any>;
  context?: Record<string, any>;
  correlationId?: string;
}

export interface EmitResult {
  success: boolean;
  eventId?: string;
  error?: string;
}

class EventEmitterService {
  private pendingEvents: Map<string, EventPayload> = new Map();

  /**
   * Emit a system event
   */
  async emit(event: EventPayload): Promise<EmitResult> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('[EventEmitter] No authenticated user, skipping event emission');
        return { success: false, error: 'Not authenticated' };
      }

      // Get company_id from JWT claims or employee record
      const companyId = await this.getCompanyId(user.id);
      if (!companyId) {
        console.warn('[EventEmitter] No company_id found, skipping event emission');
        return { success: false, error: 'No company context' };
      }

      // Generate idempotency key
      const idempotencyKey = this.generateIdempotencyKey(event);

      // Create system event
      const systemEvent = {
        event_name: event.actionName,
        tenant_id: companyId,
        actor_user_id: user.id,
        actor_role: await this.getUserRole(user.id),
        entity_type: event.entityType,
        entity_id: event.entityId,
        module: event.module,
        payload: event.payload,
        context: {
          ...event.context,
          route: typeof window !== 'undefined' ? window.location.pathname : null,
          timestamp: new Date().toISOString(),
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        },
        correlation_id: event.correlationId || null,
        idempotency_key: idempotencyKey,
        occurred_at: new Date().toISOString(),
      };

      console.log(`[EventEmitter] Emitting event: ${event.actionName}`, systemEvent);

      // Insert into system_events
      const { data: insertedEvent, error: insertError } = await supabase
        .from('system_events')
        .insert(systemEvent)
        .select('id')
        .single();

      if (insertError) {
        // Check if it's a duplicate (idempotency)
        if (insertError.code === '23505') {
          console.log(`[EventEmitter] Event already exists (idempotent): ${idempotencyKey}`);
          return { success: true, eventId: 'duplicate' };
        }
        console.error('[EventEmitter] Error inserting event:', insertError);
        return { success: false, error: insertError.message };
      }

      // Event outbox entry is created automatically via trigger
      console.log(`[EventEmitter] Event emitted successfully: ${insertedEvent.id}`);

      // Optionally trigger immediate processing for sync effects
      // This runs in background and doesn't block
      this.triggerProcessing(insertedEvent.id);

      return { success: true, eventId: insertedEvent.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[EventEmitter] Error emitting event:', error);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Emit multiple events at once (batch)
   */
  async emitBatch(events: EventPayload[]): Promise<EmitResult[]> {
    const results: EmitResult[] = [];
    for (const event of events) {
      const result = await this.emit(event);
      results.push(result);
    }
    return results;
  }

  /**
   * Get company_id for user
   */
  private async getCompanyId(userId: string): Promise<string | null> {
    try {
      // First try to get from JWT claims
      const { data: { session } } = await supabase.auth.getSession();
      const jwtCompanyId = session?.access_token ? 
        this.parseJwtClaim(session.access_token, 'company_id') : null;
      
      if (jwtCompanyId) {
        return jwtCompanyId;
      }

      // Fallback: Query from employees table
      const { data: employee } = await supabase
        .from('employees')
        .select('company_id')
        .eq('user_id', userId)
        .single();

      return employee?.company_id || null;
    } catch (error) {
      console.error('[EventEmitter] Error getting company_id:', error);
      return null;
    }
  }

  /**
   * Get user role
   */
  private async getUserRole(userId: string): Promise<string> {
    try {
      // First try JWT claims
      const { data: { session } } = await supabase.auth.getSession();
      const jwtRole = session?.access_token ? 
        this.parseJwtClaim(session.access_token, 'user_role') : null;
      
      if (jwtRole) {
        return jwtRole;
      }

      // Fallback: Query from employees table
      const { data: employee } = await supabase
        .from('employees')
        .select('role')
        .eq('user_id', userId)
        .single();

      return employee?.role || 'employee';
    } catch (error) {
      return 'employee';
    }
  }

  /**
   * Parse JWT claim
   */
  private parseJwtClaim(token: string, claim: string): string | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload[claim] || null;
    } catch {
      return null;
    }
  }

  /**
   * Generate idempotency key
   */
  private generateIdempotencyKey(event: EventPayload): string {
    // Use combination of action, entity, and timestamp (rounded to minute)
    const timestamp = Math.floor(Date.now() / 60000); // Round to minute
    return `${event.actionName}-${event.entityId}-${timestamp}`;
  }

  /**
   * Trigger event processing (non-blocking)
   */
  private async triggerProcessing(eventId: string): Promise<void> {
    try {
      // Call event-processor edge function in background
      supabase.functions.invoke('event-processor', {
        body: { action: 'process_single', event_id: eventId }
      }).catch(err => {
        console.warn('[EventEmitter] Background processing failed:', err);
      });
    } catch (error) {
      console.warn('[EventEmitter] Could not trigger processing:', error);
    }
  }
}

// Singleton instance
export const eventEmitter = new EventEmitterService();

// Convenience function for quick event emission
export async function emitEvent(
  actionName: string,
  entityType: string,
  entityId: string,
  module: string,
  payload: Record<string, any>,
  context?: Record<string, any>
): Promise<EmitResult> {
  return eventEmitter.emit({
    actionName,
    entityType,
    entityId,
    module,
    payload,
    context,
  });
}
