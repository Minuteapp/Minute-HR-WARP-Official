/**
 * useEventEmission Hook
 * 
 * React Hook für das automatische Emittieren von Events bei Modul-Aktionen.
 */

import { useCallback, useRef } from 'react';
import { eventEmitter, EmitResult, EventPayload } from '@/services/eventEmitterService';

interface UseEventEmissionOptions {
  module: string;
  debounceMs?: number;
}

interface EmitActionParams {
  actionType: string;
  entityType: string;
  entityId: string;
  payload: Record<string, any>;
  context?: Record<string, any>;
  correlationId?: string;
}

export function useEventEmission({ module, debounceMs = 0 }: UseEventEmissionOptions) {
  const pendingEmits = useRef<Map<string, NodeJS.Timeout>>(new Map());

  /**
   * Emit an action event
   */
  const emitAction = useCallback(async ({
    actionType,
    entityType,
    entityId,
    payload,
    context,
    correlationId,
  }: EmitActionParams): Promise<EmitResult> => {
    const actionName = `${module}.${actionType}`;
    
    const eventPayload: EventPayload = {
      actionName,
      entityType,
      entityId,
      module,
      payload,
      context,
      correlationId,
    };

    // If debounce is enabled, use it
    if (debounceMs > 0) {
      const key = `${actionName}-${entityId}`;
      
      // Clear any pending emit for this key
      const existingTimeout = pendingEmits.current.get(key);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set up debounced emit
      return new Promise((resolve) => {
        const timeout = setTimeout(async () => {
          pendingEmits.current.delete(key);
          const result = await eventEmitter.emit(eventPayload);
          resolve(result);
        }, debounceMs);
        
        pendingEmits.current.set(key, timeout);
      });
    }

    return eventEmitter.emit(eventPayload);
  }, [module, debounceMs]);

  /**
   * Emit a CRUD action
   */
  const emitCreate = useCallback(async (
    entityType: string,
    entityId: string,
    data: Record<string, any>
  ): Promise<EmitResult> => {
    return emitAction({
      actionType: 'created',
      entityType,
      entityId,
      payload: { new_values: data },
    });
  }, [emitAction]);

  const emitUpdate = useCallback(async (
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>
  ): Promise<EmitResult> => {
    return emitAction({
      actionType: 'updated',
      entityType,
      entityId,
      payload: { old_values: oldValues, new_values: newValues },
    });
  }, [emitAction]);

  const emitDelete = useCallback(async (
    entityType: string,
    entityId: string,
    deletedData?: Record<string, any>
  ): Promise<EmitResult> => {
    return emitAction({
      actionType: 'deleted',
      entityType,
      entityId,
      payload: { deleted_values: deletedData },
    });
  }, [emitAction]);

  /**
   * Emit a status change action
   */
  const emitStatusChange = useCallback(async (
    entityType: string,
    entityId: string,
    oldStatus: string,
    newStatus: string,
    reason?: string
  ): Promise<EmitResult> => {
    return emitAction({
      actionType: 'status_changed',
      entityType,
      entityId,
      payload: { 
        old_status: oldStatus, 
        new_status: newStatus,
        status: newStatus,
        reason,
      },
    });
  }, [emitAction]);

  /**
   * Emit an assignment action
   */
  const emitAssignment = useCallback(async (
    entityType: string,
    entityId: string,
    assigneeId: string,
    previousAssigneeId?: string
  ): Promise<EmitResult> => {
    return emitAction({
      actionType: 'assigned',
      entityType,
      entityId,
      payload: {
        assigned_user_id: assigneeId,
        previous_assignee_id: previousAssigneeId,
      },
    });
  }, [emitAction]);

  /**
   * Emit an approval action
   */
  const emitApproval = useCallback(async (
    entityType: string,
    entityId: string,
    approved: boolean,
    reason?: string
  ): Promise<EmitResult> => {
    return emitAction({
      actionType: approved ? 'approved' : 'rejected',
      entityType,
      entityId,
      payload: { approved, reason },
    });
  }, [emitAction]);

  /**
   * Emit a comment action
   */
  const emitComment = useCallback(async (
    entityType: string,
    entityId: string,
    commentId: string,
    commentText: string
  ): Promise<EmitResult> => {
    return emitAction({
      actionType: 'comment_added',
      entityType,
      entityId,
      payload: { comment_id: commentId, comment_text: commentText },
    });
  }, [emitAction]);

  /**
   * Emit an attachment action
   */
  const emitAttachment = useCallback(async (
    entityType: string,
    entityId: string,
    attachmentId: string,
    fileName: string
  ): Promise<EmitResult> => {
    return emitAction({
      actionType: 'attachment_added',
      entityType,
      entityId,
      payload: { attachment_id: attachmentId, file_name: fileName },
    });
  }, [emitAction]);

  /**
   * Emit an export action
   */
  const emitExport = useCallback(async (
    entityType: string,
    format: string,
    filters?: Record<string, any>
  ): Promise<EmitResult> => {
    return emitAction({
      actionType: 'export_requested',
      entityType,
      entityId: 'bulk',
      payload: { format, filters },
    });
  }, [emitAction]);

  /**
   * Emit a settings change action
   */
  const emitSettingsChange = useCallback(async (
    settingType: string,
    oldSettings: Record<string, any>,
    newSettings: Record<string, any>
  ): Promise<EmitResult> => {
    return emitAction({
      actionType: 'settings_changed',
      entityType: 'settings',
      entityId: settingType,
      payload: { old_values: oldSettings, new_values: newSettings },
    });
  }, [emitAction]);

  return {
    emitAction,
    emitCreate,
    emitUpdate,
    emitDelete,
    emitStatusChange,
    emitAssignment,
    emitApproval,
    emitComment,
    emitAttachment,
    emitExport,
    emitSettingsChange,
  };
}

/**
 * Wrapper hook für spezifische Module
 */
export const useTaskEvents = () => useEventEmission({ module: 'task' });
export const useAbsenceEvents = () => useEventEmission({ module: 'absence' });
export const useDocumentEvents = () => useEventEmission({ module: 'document' });
export const useEmployeeEvents = () => useEventEmission({ module: 'employee' });
export const useProjectEvents = () => useEventEmission({ module: 'project' });
export const useCalendarEvents = () => useEventEmission({ module: 'calendar' });
export const useTimeEvents = () => useEventEmission({ module: 'time' });
export const useChatEvents = () => useEventEmission({ module: 'chat' });
export const useWorkflowEvents = () => useEventEmission({ module: 'workflow' });
export const useRecruitingEvents = () => useEventEmission({ module: 'recruiting' });
export const useOnboardingEvents = () => useEventEmission({ module: 'onboarding' });
export const useOffboardingEvents = () => useEventEmission({ module: 'offboarding' });
export const usePerformanceEvents = () => useEventEmission({ module: 'performance' });
export const useExpenseEvents = () => useEventEmission({ module: 'expense' });
export const useHelpdeskEvents = () => useEventEmission({ module: 'helpdesk' });
export const useComplianceEvents = () => useEventEmission({ module: 'compliance' });
export const useBenefitEvents = () => useEventEmission({ module: 'benefit' });
export const useShiftEvents = () => useEventEmission({ module: 'shift' });
export const useGoalEvents = () => useEventEmission({ module: 'goal' });
export const useSurveyEvents = () => useEventEmission({ module: 'survey' });
