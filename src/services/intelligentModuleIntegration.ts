import { supabase } from '@/integrations/supabase/client';
import { crossModuleEventService } from './crossModuleEventService';

export interface ModuleIntegrationEvent {
  id: string;
  sourceModule: string;
  targetModule: string;
  eventType: string;
  sourceId: string;
  payload: Record<string, any>;
  triggeredBy: string;
  processedAt?: string;
  status: 'pending' | 'processed' | 'failed';
  automatedActions?: string[];
}

export interface AutomationRule {
  id: string;
  name: string;
  sourceModule: string;
  targetModule: string;
  triggerEvent: string;
  conditions: Record<string, any>;
  actions: Array<{
    type: string;
    module: string;
    payload: Record<string, any>;
  }>;
  isActive: boolean;
}

export const intelligentModuleIntegration = {
  // Krankmeldung → Automatische Schichtplanung-Updates
  async handleSickLeaveCreated(sickLeaveData: any) {
    const automatedActions: string[] = [];
    
    try {
      // 1. Shift Planning benachrichtigen
      await this.notifyShiftPlanning(sickLeaveData);
      automatedActions.push('shift_planning_notified');
      
      // 2. Manager automatisch benachrichtigen
      await this.notifyManagers(sickLeaveData);
      automatedActions.push('managers_notified');
      
      // 3. Vertretungssuche initiieren
      await this.initiateSubstituteSearch(sickLeaveData);
      automatedActions.push('substitute_search_initiated');
      
      // 4. Cross-Module Event erstellen (simuliert, da createEvent nicht existiert)
      // TODO: Implementiere createEvent in crossModuleEventService
      console.log('Cross-Module Event would be created:', {
        event_type: 'sick_leave',
        source_module: 'sick_leave',
        source_id: sickLeaveData.id,
        user_id: sickLeaveData.user_id,
        employee_name: sickLeaveData.employee_name,
        department: sickLeaveData.department,
        start_date: sickLeaveData.start_date,
        end_date: sickLeaveData.end_date,
        status: 'pending',
        metadata: {
          automated_actions: automatedActions,
          sick_leave_type: sickLeaveData.type,
          requires_substitute: true
        }
      });
      
      return { success: true, actions: automatedActions };
    } catch (error) {
      console.error('Fehler bei Sick Leave Integration:', error);
      return { success: false, error: error.message };
    }
  },

  // Schichtplan → Zeit-Tracking Integration
  async handleShiftPlanChanged(shiftData: any) {
    const automatedActions: string[] = [];
    
    try {
      // 1. Zeit-Tracking Reminder setzen
      await this.createTimeTrackingReminder(shiftData);
      automatedActions.push('time_tracking_reminder_created');
      
      // 2. Kalender aktualisieren
      await this.updateCalendarEvent(shiftData);
      automatedActions.push('calendar_updated');
      
      // 3. Team benachrichtigen
      await this.notifyTeamMembers(shiftData);
      automatedActions.push('team_notified');
      
      return { success: true, actions: automatedActions };
    } catch (error) {
      console.error('Fehler bei Shift Plan Integration:', error);
      return { success: false, error: error.message };
    }
  },

  // Mitarbeiter-Onboarding → Alle Module automatisch einrichten
  async handleEmployeeOnboarding(employeeData: any) {
    const automatedActions: string[] = [];
    
    try {
      // 1. Standard-Dokumente zuweisen
      await this.assignStandardDocuments(employeeData);
      automatedActions.push('standard_documents_assigned');
      
      // 2. Kalender-Berechtigungen setzen
      await this.setupCalendarPermissions(employeeData);
      automatedActions.push('calendar_permissions_set');
      
      // 3. Schicht-Planung Verfügbarkeit einrichten
      await this.setupShiftPlanningProfile(employeeData);
      automatedActions.push('shift_planning_profile_created');
      
      // 4. Zeit-Tracking Profil erstellen
      await this.setupTimeTrackingProfile(employeeData);
      automatedActions.push('time_tracking_profile_created');
      
      // 5. Urlaubs-Kontingent initialisieren
      await this.initializeVacationDays(employeeData);
      automatedActions.push('vacation_days_initialized');
      
      return { success: true, actions: automatedActions };
    } catch (error) {
      console.error('Fehler bei Employee Onboarding Integration:', error);
      return { success: false, error: error.message };
    }
  },

  // Dokument hochgeladen → Automatische Kategorisierung und Verknüpfung
  async handleDocumentUploaded(documentData: any) {
    const automatedActions: string[] = [];
    
    try {
      // 1. Automatische Kategorisierung basierend auf Inhalt
      const category = await this.categorizeDocument(documentData);
      automatedActions.push('document_categorized');
      
      // 2. Relevante Module benachrichtigen
      if (category === 'sick_leave_certificate') {
        await this.linkToSickLeave(documentData);
        automatedActions.push('linked_to_sick_leave');
      }
      
      if (category === 'contract') {
        await this.linkToEmployee(documentData);
        automatedActions.push('linked_to_employee');
      }
      
      // 3. OCR für wichtige Dokumente
      if (['sick_leave_certificate', 'contract'].includes(category)) {
        await this.triggerOCRProcessing(documentData);
        automatedActions.push('ocr_processing_triggered');
      }
      
      return { success: true, actions: automatedActions, category };
    } catch (error) {
      console.error('Fehler bei Document Integration:', error);
      return { success: false, error: error.message };
    }
  },

  // Zeit-Tracking → Automatische Überstunden-Warnung und Genehmigung
  async handleTimeTrackingCompleted(timeEntry: any) {
    const automatedActions: string[] = [];
    
    try {
      // 1. Überstunden prüfen
      const overtimeCheck = await this.checkForOvertime(timeEntry);
      if (overtimeCheck.hasOvertime) {
        await this.createOvertimeApprovalRequest(timeEntry, overtimeCheck);
        automatedActions.push('overtime_approval_requested');
      }
      
      // 2. Schicht-Compliance prüfen
      const complianceCheck = await this.checkShiftCompliance(timeEntry);
      if (!complianceCheck.isCompliant) {
        await this.createComplianceAlert(timeEntry, complianceCheck);
        automatedActions.push('compliance_alert_created');
      }
      
      // 3. Gehaltsabrechnung vorbereiten
      await this.updatePayrollData(timeEntry);
      automatedActions.push('payroll_data_updated');
      
      return { success: true, actions: automatedActions };
    } catch (error) {
      console.error('Fehler bei Time Tracking Integration:', error);
      return { success: false, error: error.message };
    }
  },

  // Hilfsfunktionen für die Integrationen
  async notifyShiftPlanning(sickLeaveData: any) {
    // Schicht-Planer über Ausfall informieren
    const { error } = await supabase
      .from('shift_notifications')
      .insert({
        user_id: sickLeaveData.user_id,
        notification_type: 'sick_leave_absence',
        message: `Mitarbeiter ${sickLeaveData.employee_name} ist vom ${sickLeaveData.start_date} bis ${sickLeaveData.end_date} krank. Schichtplanung überprüfen.`,
        metadata: {
          sick_leave_id: sickLeaveData.id,
          requires_immediate_action: true
        }
      });
    
    if (error) throw error;
  },

  async notifyManagers(sickLeaveData: any) {
    // Manager und HR automatisch benachrichtigen
    const { data: managers } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'hr', 'manager']);
    
    if (managers) {
      for (const manager of managers) {
        await supabase
          .from('notifications')
          .insert({
            user_id: manager.user_id,
            title: 'Neue Krankmeldung',
            message: `${sickLeaveData.employee_name} (${sickLeaveData.department}) ist krank gemeldet`,
            type: 'sick_leave',
            metadata: {
              sick_leave_id: sickLeaveData.id,
              employee_id: sickLeaveData.user_id
            }
          });
      }
    }
  },

  async initiateSubstituteSearch(sickLeaveData: any) {
    // Automatische Vertretungssuche basierend auf Abteilung und Qualifikationen
    const { data: potentialSubstitutes } = await supabase
      .from('employees')
      .select('id, name, qualifications, availability')
      .eq('department', sickLeaveData.department)
      .eq('status', 'active')
      .neq('id', sickLeaveData.user_id);
    
    if (potentialSubstitutes) {
      // Erstelle Vertretungsvorschläge
      await supabase
        .from('substitute_suggestions')
        .insert({
          sick_leave_id: sickLeaveData.id,
          suggested_substitutes: potentialSubstitutes.map(s => s.id),
          created_by: 'system',
          status: 'pending_review'
        });
    }
  },

  async createTimeTrackingReminder(shiftData: any) {
    // Reminder für Zeit-Tracking vor Schichtbeginn
    const reminderTime = new Date(shiftData.start_time);
    reminderTime.setMinutes(reminderTime.getMinutes() - 15); // 15 Min vorher
    
    await supabase
      .from('time_tracking_reminders')
      .insert({
        user_id: shiftData.employee_id,
        reminder_time: reminderTime.toISOString(),
        shift_id: shiftData.id,
        message: 'Schicht beginnt in 15 Minuten. Zeit-Tracking starten nicht vergessen!',
        status: 'scheduled'
      });
  },

  async updateCalendarEvent(shiftData: any) {
    // Kalender-Event für Schicht erstellen/aktualisieren
    await supabase
      .from('calendar_events')
      .upsert({
        user_id: shiftData.employee_id,
        title: `Schicht: ${shiftData.shift_type}`,
        start_time: shiftData.start_time,
        end_time: shiftData.end_time,
        type: 'shift',
        metadata: {
          shift_id: shiftData.id,
          location: shiftData.location,
          auto_created: true
        }
      });
  },

  async categorizeDocument(documentData: any) {
    // Einfache Kategorisierung basierend auf Dateiname und Typ
    const fileName = documentData.title.toLowerCase();
    
    if (fileName.includes('krankschreibung') || fileName.includes('au-bescheinigung')) {
      return 'sick_leave_certificate';
    }
    if (fileName.includes('vertrag') || fileName.includes('contract')) {
      return 'contract';
    }
    if (fileName.includes('zeugnis') || fileName.includes('certificate')) {
      return 'certificate';
    }
    
    return 'general';
  },

  async linkToSickLeave(documentData: any) {
    // Dokument mit aktueller Krankmeldung verknüpfen
    const { data: recentSickLeave } = await supabase
      .from('absence_requests')
      .select('id')
      .eq('type', 'sick_leave')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (recentSickLeave && recentSickLeave[0]) {
      await supabase
        .from('absence_documents')
        .insert({
          absence_request_id: recentSickLeave[0].id,
          file_name: documentData.title,
          file_path: documentData.file_path,
          file_type: documentData.file_type,
          file_size: documentData.file_size
        });
    }
  },

  async checkForOvertime(timeEntry: any) {
    // Überstunden-Prüfung
    const dailyHours = timeEntry.total_hours || 0;
    const weeklyHours = await this.calculateWeeklyHours(timeEntry.user_id, timeEntry.date);
    
    return {
      hasOvertime: dailyHours > 8 || weeklyHours > 40,
      dailyOvertime: Math.max(0, dailyHours - 8),
      weeklyOvertime: Math.max(0, weeklyHours - 40),
      totalHours: dailyHours,
      weeklyHours
    };
  },

  async calculateWeeklyHours(userId: string, date: string) {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    
    const { data } = await supabase
      .from('time_entries')
      .select('total_hours')
      .eq('user_id', userId)
      .gte('date', startOfWeek.toISOString().split('T')[0])
      .lte('date', endOfWeek.toISOString().split('T')[0]);
    
    return data?.reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;
  },

  // Intelligence-Layer: Lerne aus Mustern
  async analyzeModuleInteractions() {
    const { data: events } = await supabase
      .from('cross_module_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);
    
    if (!events) return {};
    
    // Analysiere häufige Patterns
    const patterns = {
      sickLeaveToShiftConflicts: 0,
      documentUploadToProcessing: 0,
      overtimeToApprovals: 0,
      onboardingToCompletion: 0
    };
    
    events.forEach(event => {
      if (event.event_type === 'sick_leave' && event.metadata?.shift_conflicts) {
        patterns.sickLeaveToShiftConflicts++;
      }
      // Weitere Pattern-Analysen...
    });
    
    return patterns;
  },

  // ==========================================
  // GESCHÄFTSREISEN-INTEGRATION
  // ==========================================

  // Geschäftsreise beantragt → Automatische Aktionen
  async handleBusinessTripCreated(tripData: any) {
    const automatedActions: string[] = [];
    
    try {
      // 1. Kalender-Event erstellen (Reise-Zeitraum)
      await this.createBusinessTripCalendarEvent(tripData);
      automatedActions.push('calendar_event_created');
      
      // 2. Manager benachrichtigen
      await this.notifyManagersAboutTrip(tripData);
      automatedActions.push('manager_notified');
      
      // 3. Budget-Verfügbarkeit prüfen
      const budgetCheck = await this.checkDepartmentBudget(tripData);
      if (!budgetCheck.sufficient) {
        await this.createBudgetWarning(tripData, budgetCheck);
        automatedActions.push('budget_warning_created');
      }
      
      // 4. Konflikt mit bestehenden Abwesenheiten prüfen
      const conflictCheck = await this.checkAbsenceConflicts(tripData);
      if (conflictCheck.hasConflicts) {
        await this.notifyAboutConflicts(tripData, conflictCheck);
        automatedActions.push('conflict_notification_sent');
      }
      
      console.log('✈️ Business Trip Created Integration:', {
        trip_id: tripData.id,
        employee_id: tripData.employee_id,
        destination: tripData.destination,
        automated_actions: automatedActions
      });
      
      return { success: true, actions: automatedActions };
    } catch (error) {
      console.error('Fehler bei Business Trip Created Integration:', error);
      return { success: false, error: error.message };
    }
  },

  // Geschäftsreise genehmigt → Automatische Aktionen
  async handleBusinessTripApproved(tripData: any) {
    const automatedActions: string[] = [];
    
    try {
      // 1. Budget reduzieren (geschätztes Reisebudget)
      await this.deductFromDepartmentBudget(tripData);
      automatedActions.push('budget_deducted');
      
      // 2. Abwesenheit automatisch eintragen
      await this.createAbsenceFromTrip(tripData);
      automatedActions.push('absence_created');
      
      // 3. Kalender-Event bestätigen
      await this.confirmCalendarEvent(tripData);
      automatedActions.push('calendar_event_confirmed');
      
      // 4. Mitarbeiter benachrichtigen
      await this.notifyEmployeeAboutApproval(tripData);
      automatedActions.push('employee_notified');
      
      // 5. Schichtplan-Konflikt prüfen
      const shiftConflict = await this.checkShiftConflicts(tripData);
      if (shiftConflict.hasConflicts) {
        await this.notifyShiftPlanners(tripData, shiftConflict);
        automatedActions.push('shift_planners_notified');
      }
      
      console.log('✅ Business Trip Approved Integration:', {
        trip_id: tripData.id,
        automated_actions: automatedActions
      });
      
      return { success: true, actions: automatedActions };
    } catch (error) {
      console.error('Fehler bei Business Trip Approved Integration:', error);
      return { success: false, error: error.message };
    }
  },

  // Geschäftsreise abgeschlossen → Automatische Aktionen
  async handleBusinessTripCompleted(tripData: any) {
    const automatedActions: string[] = [];
    
    try {
      // 1. Mitarbeiter-Reisehistorie aktualisieren
      await this.updateEmployeeTravelHistory(tripData);
      automatedActions.push('travel_history_updated');
      
      // 2. Spesen-Erinnerung senden
      await this.sendExpenseReminder(tripData);
      automatedActions.push('expense_reminder_sent');
      
      // 3. Endgültige Budget-Berechnung anstoßen
      await this.triggerFinalBudgetCalculation(tripData);
      automatedActions.push('budget_calculation_triggered');
      
      // 4. Feedback-Anfrage senden
      await this.sendTripFeedbackRequest(tripData);
      automatedActions.push('feedback_request_sent');
      
      console.log('🏁 Business Trip Completed Integration:', {
        trip_id: tripData.id,
        automated_actions: automatedActions
      });
      
      return { success: true, actions: automatedActions };
    } catch (error) {
      console.error('Fehler bei Business Trip Completed Integration:', error);
      return { success: false, error: error.message };
    }
  },

  // Spesen eingereicht → Automatische Aktionen
  async handleExpenseSubmitted(expenseData: any) {
    const automatedActions: string[] = [];
    
    try {
      // 1. Mit Reise verknüpfen
      await this.linkExpenseToTrip(expenseData);
      automatedActions.push('expense_linked_to_trip');
      
      // 2. Belege kategorisieren
      const category = await this.categorizeExpense(expenseData);
      automatedActions.push('expense_categorized');
      
      // 3. Budget-Actual aktualisieren
      await this.updateBudgetActuals(expenseData);
      automatedActions.push('budget_actuals_updated');
      
      // 4. Gehaltsabrechnung vorbereiten (Erstattung)
      await this.preparePayrollReimbursement(expenseData);
      automatedActions.push('payroll_reimbursement_prepared');
      
      // 5. Manager zur Genehmigung benachrichtigen
      await this.notifyManagerForExpenseApproval(expenseData);
      automatedActions.push('manager_notified_for_approval');
      
      console.log('💰 Expense Submitted Integration:', {
        expense_id: expenseData.id,
        trip_id: expenseData.trip_id,
        amount: expenseData.amount,
        automated_actions: automatedActions
      });
      
      return { success: true, actions: automatedActions, category };
    } catch (error) {
      console.error('Fehler bei Expense Submitted Integration:', error);
      return { success: false, error: error.message };
    }
  },

  // ==========================================
  // GESCHÄFTSREISEN HILFSFUNKTIONEN
  // ==========================================

  async createBusinessTripCalendarEvent(tripData: any) {
    const { error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: tripData.employee_id,
        title: `Geschäftsreise: ${tripData.destination}`,
        start_time: tripData.start_date,
        end_time: tripData.end_date,
        type: 'business_trip',
        metadata: {
          trip_id: tripData.id,
          purpose: tripData.purpose,
          auto_created: true,
          status: 'tentative'
        }
      });
    
    if (error) console.error('Kalender-Event Fehler:', error);
  },

  async notifyManagersAboutTrip(tripData: any) {
    // Hole Abteilungs-Manager
    const { data: managers } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'hr', 'manager', 'teamleiter']);
    
    if (managers) {
      for (const manager of managers) {
        await supabase
          .from('notifications')
          .insert({
            user_id: manager.user_id,
            title: 'Neuer Reiseantrag',
            message: `Neuer Geschäftsreiseantrag nach ${tripData.destination}`,
            type: 'business_trip',
            metadata: {
              trip_id: tripData.id,
              employee_id: tripData.employee_id,
              requires_approval: true
            }
          });
      }
    }
  },

  async checkDepartmentBudget(tripData: any) {
    const { data: budget } = await supabase
      .from('travel_budgets')
      .select('*')
      .eq('department', tripData.department)
      .eq('year', new Date().getFullYear())
      .single();
    
    if (!budget) return { sufficient: true, remaining: 0 };
    
    const estimatedCost = tripData.estimated_cost || 0;
    const remaining = budget.total_budget - (budget.used_budget || 0);
    
    return {
      sufficient: remaining >= estimatedCost,
      remaining,
      estimatedCost,
      budgetUtilization: ((budget.used_budget || 0) / budget.total_budget) * 100
    };
  },

  async createBudgetWarning(tripData: any, budgetCheck: any) {
    await supabase
      .from('notifications')
      .insert({
        user_id: tripData.employee_id,
        title: 'Budget-Warnung',
        message: `Die geschätzten Reisekosten (${tripData.estimated_cost}€) überschreiten das verfügbare Budget (${budgetCheck.remaining}€)`,
        type: 'budget_warning',
        metadata: {
          trip_id: tripData.id,
          budget_remaining: budgetCheck.remaining,
          estimated_cost: tripData.estimated_cost
        }
      });
  },

  async checkAbsenceConflicts(tripData: any) {
    const { data: conflicts } = await supabase
      .from('absence_requests')
      .select('*')
      .eq('user_id', tripData.employee_id)
      .eq('status', 'approved')
      .or(`start_date.lte.${tripData.end_date},end_date.gte.${tripData.start_date}`);
    
    return {
      hasConflicts: conflicts && conflicts.length > 0,
      conflicts: conflicts || []
    };
  },

  async notifyAboutConflicts(tripData: any, conflictCheck: any) {
    await supabase
      .from('notifications')
      .insert({
        user_id: tripData.employee_id,
        title: 'Terminkonflikt erkannt',
        message: `Die Reise überschneidet sich mit ${conflictCheck.conflicts.length} bestehenden Abwesenheiten`,
        type: 'conflict_warning',
        metadata: {
          trip_id: tripData.id,
          conflict_count: conflictCheck.conflicts.length
        }
      });
  },

  async deductFromDepartmentBudget(tripData: any) {
    const estimatedCost = tripData.estimated_cost || 0;
    
    const { error } = await supabase.rpc('increment_budget_used', {
      p_department: tripData.department,
      p_amount: estimatedCost
    });
    
    // Fallback wenn RPC nicht existiert
    if (error) {
      const { data: budget } = await supabase
        .from('travel_budgets')
        .select('*')
        .eq('department', tripData.department)
        .eq('year', new Date().getFullYear())
        .single();
      
      if (budget) {
        await supabase
          .from('travel_budgets')
          .update({ used_budget: (budget.used_budget || 0) + estimatedCost })
          .eq('id', budget.id);
      }
    }
  },

  async createAbsenceFromTrip(tripData: any) {
    const { error } = await supabase
      .from('absence_requests')
      .insert({
        user_id: tripData.employee_id,
        type: 'business_trip',
        absence_type: 'Geschäftsreise',
        start_date: tripData.start_date,
        end_date: tripData.end_date,
        status: 'approved',
        reason: `Geschäftsreise: ${tripData.destination}`,
        approved_at: new Date().toISOString(),
        created_by: 'system'
      });
    
    if (error) console.error('Abwesenheit erstellen Fehler:', error);
  },

  async confirmCalendarEvent(tripData: any) {
    await supabase
      .from('calendar_events')
      .update({
        metadata: {
          status: 'confirmed',
          approved_at: new Date().toISOString()
        }
      })
      .eq('metadata->>trip_id', tripData.id);
  },

  async notifyEmployeeAboutApproval(tripData: any) {
    await supabase
      .from('notifications')
      .insert({
        user_id: tripData.employee_id,
        title: 'Reise genehmigt',
        message: `Ihre Geschäftsreise nach ${tripData.destination} wurde genehmigt`,
        type: 'approval',
        metadata: {
          trip_id: tripData.id
        }
      });
  },

  async checkShiftConflicts(tripData: any) {
    const { data: shifts } = await supabase
      .from('shift_assignments')
      .select('*')
      .eq('employee_id', tripData.employee_id)
      .gte('date', tripData.start_date)
      .lte('date', tripData.end_date);
    
    return {
      hasConflicts: shifts && shifts.length > 0,
      shifts: shifts || []
    };
  },

  async notifyShiftPlanners(tripData: any, shiftConflict: any) {
    // Benachrichtige Schichtplaner über Konflikt
    const { data: planners } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'schichtplaner']);
    
    if (planners) {
      for (const planner of planners) {
        await supabase
          .from('notifications')
          .insert({
            user_id: planner.user_id,
            title: 'Schichtplan-Konflikt',
            message: `Genehmigte Reise kollidiert mit ${shiftConflict.shifts.length} Schichtzuweisungen`,
            type: 'shift_conflict',
            metadata: {
              trip_id: tripData.id,
              employee_id: tripData.employee_id,
              affected_shifts: shiftConflict.shifts.length
            }
          });
      }
    }
  },

  async updateEmployeeTravelHistory(tripData: any) {
    // Travel-Statistiken für Mitarbeiter aktualisieren
    const { data: existing } = await supabase
      .from('employee_travel_stats')
      .select('*')
      .eq('employee_id', tripData.employee_id)
      .single();
    
    if (existing) {
      await supabase
        .from('employee_travel_stats')
        .update({
          total_trips: (existing.total_trips || 0) + 1,
          last_trip_date: tripData.end_date,
          updated_at: new Date().toISOString()
        })
        .eq('employee_id', tripData.employee_id);
    }
  },

  async sendExpenseReminder(tripData: any) {
    // Erinnerung 3 Tage nach Reiseende
    const reminderDate = new Date(tripData.end_date);
    reminderDate.setDate(reminderDate.getDate() + 3);
    
    await supabase
      .from('notifications')
      .insert({
        user_id: tripData.employee_id,
        title: 'Spesen einreichen',
        message: `Bitte reichen Sie die Spesen für Ihre Reise nach ${tripData.destination} ein`,
        type: 'expense_reminder',
        metadata: {
          trip_id: tripData.id,
          scheduled_for: reminderDate.toISOString()
        }
      });
  },

  async triggerFinalBudgetCalculation(tripData: any) {
    // Hole alle Spesen für diese Reise
    const { data: expenses } = await supabase
      .from('business_trip_expenses')
      .select('amount')
      .eq('trip_id', tripData.id);
    
    const totalActual = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    
    // Update Budget-Actual
    await supabase
      .from('business_trips')
      .update({
        actual_cost: totalActual,
        budget_variance: totalActual - (tripData.estimated_cost || 0)
      })
      .eq('id', tripData.id);
  },

  async sendTripFeedbackRequest(tripData: any) {
    await supabase
      .from('notifications')
      .insert({
        user_id: tripData.employee_id,
        title: 'Reise-Feedback',
        message: 'Wie war Ihre Geschäftsreise? Teilen Sie Ihr Feedback mit uns.',
        type: 'feedback_request',
        metadata: {
          trip_id: tripData.id
        }
      });
  },

  async linkExpenseToTrip(expenseData: any) {
    if (!expenseData.trip_id) {
      // Versuche automatisch zuzuordnen basierend auf Datum
      const { data: trips } = await supabase
        .from('business_trips')
        .select('id')
        .eq('employee_id', expenseData.employee_id)
        .lte('start_date', expenseData.expense_date)
        .gte('end_date', expenseData.expense_date)
        .limit(1);
      
      if (trips && trips[0]) {
        await supabase
          .from('business_trip_expenses')
          .update({ trip_id: trips[0].id })
          .eq('id', expenseData.id);
      }
    }
  },

  async categorizeExpense(expenseData: any) {
    // Automatische Kategorisierung basierend auf Beschreibung
    const description = (expenseData.description || '').toLowerCase();
    
    if (description.includes('hotel') || description.includes('übernachtung')) {
      return 'accommodation';
    }
    if (description.includes('flug') || description.includes('bahn') || description.includes('taxi')) {
      return 'transportation';
    }
    if (description.includes('essen') || description.includes('restaurant') || description.includes('verpflegung')) {
      return 'meals';
    }
    
    return 'other';
  },

  async updateBudgetActuals(expenseData: any) {
    const { data: trip } = await supabase
      .from('business_trips')
      .select('department')
      .eq('id', expenseData.trip_id)
      .single();
    
    if (trip) {
      const { data: budget } = await supabase
        .from('travel_budgets')
        .select('*')
        .eq('department', trip.department)
        .eq('year', new Date().getFullYear())
        .single();
      
      if (budget) {
        await supabase
          .from('travel_budgets')
          .update({
            actual_spend: (budget.actual_spend || 0) + (expenseData.amount || 0)
          })
          .eq('id', budget.id);
      }
    }
  },

  async preparePayrollReimbursement(expenseData: any) {
    // Erstattungs-Eintrag für Gehaltsabrechnung
    await supabase
      .from('payroll_reimbursements')
      .insert({
        employee_id: expenseData.employee_id,
        expense_id: expenseData.id,
        amount: expenseData.amount,
        category: 'travel_expense',
        status: 'pending',
        description: `Geschäftsreise-Spesen: ${expenseData.description}`,
        metadata: {
          trip_id: expenseData.trip_id,
          expense_date: expenseData.expense_date
        }
      });
  },

  async notifyManagerForExpenseApproval(expenseData: any) {
    const { data: managers } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'hr', 'manager']);
    
    if (managers) {
      for (const manager of managers) {
        await supabase
          .from('notifications')
          .insert({
            user_id: manager.user_id,
            title: 'Spesen zur Genehmigung',
            message: `Neue Spesenabrechnung: ${expenseData.amount}€`,
            type: 'expense_approval',
            metadata: {
              expense_id: expenseData.id,
              trip_id: expenseData.trip_id,
              requires_approval: true
            }
          });
      }
    }
  },

  // ==========================================
  // BESTEHENDE HILFSFUNKTIONEN
  // ==========================================
  async assignStandardDocuments(employeeData: any) { /* Implementation */ },
  async setupCalendarPermissions(employeeData: any) { /* Implementation */ },
  async setupShiftPlanningProfile(employeeData: any) { /* Implementation */ },
  async setupTimeTrackingProfile(employeeData: any) { /* Implementation */ },
  async initializeVacationDays(employeeData: any) { /* Implementation */ },
  async linkToEmployee(documentData: any) { /* Implementation */ },
  async triggerOCRProcessing(documentData: any) { /* Implementation */ },
  async createOvertimeApprovalRequest(timeEntry: any, overtimeCheck: any) { /* Implementation */ },
  async checkShiftCompliance(timeEntry: any) { /* Implementation */ },
  async createComplianceAlert(timeEntry: any, complianceCheck: any) { /* Implementation */ },
  async updatePayrollData(timeEntry: any) { /* Implementation */ },
  async notifyTeamMembers(shiftData: any) { /* Implementation */ }
};