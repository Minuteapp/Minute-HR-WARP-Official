import { supabase } from '@/integrations/supabase/client';
import { AbsenceRequest, AbsenceFilter, AbsenceStatistic, AbsenceSettings, AbsenceType, AbsenceSubType } from '@/types/absence.types';
import { toast } from 'sonner';
import { emitEvent } from '@/services/eventEmitterService';

export const absenceManagementService = {
  // Alle Abwesenheitsanträge abrufen
  getRequests: async (filter: AbsenceFilter): Promise<AbsenceRequest[]> => {
    let query = supabase
      .from('absence_requests')
      .select('*')
      .order('start_date', { ascending: false });

    if (filter.start_date) {
      query = query.gte('start_date', filter.start_date.toISOString());
    }
    if (filter.end_date) {
      query = query.lte('end_date', filter.end_date.toISOString());
    }
    if (filter.status && filter.status.length > 0) {
      query = query.in('status', filter.status);
    }
    if (filter.types && filter.types.length > 0) {
      query = query.in('type', filter.types);
    }
    if (filter.subtypes && filter.subtypes.length > 0) {
      query = query.in('subtype', filter.subtypes);
    }
    if (filter.departments && filter.departments.length > 0) {
      query = query.in('department', filter.departments);
    }
    if (filter.employee_id) {
      query = query.eq('user_id', filter.employee_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fehler beim Laden der Abwesenheitsanträge:', error);
      throw error;
    }

    return data || [];
  },

  // Einen neuen Abwesenheitsantrag erstellen
  createRequest: async (request: Partial<AbsenceRequest>): Promise<AbsenceRequest> => {
    const authUser = (await supabase.auth.getUser()).data.user;
    
    if (!authUser) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    // company_id aus Request nutzen (wird vom Dialog übergeben)
    const companyId = request.company_id;
    
    // Hole die Employee ID basierend auf der Email des Auth Users UND company_id
    let employeeQuery = supabase
      .from('employees')
      .select('id, name, first_name, last_name, department, company_id, manager_id')
      .eq('email', authUser.email);
    
    // Wenn company_id vorhanden, danach filtern (Multi-Tenant)
    if (companyId) {
      employeeQuery = employeeQuery.eq('company_id', companyId);
    }
    
    const { data: employee, error: employeeError } = await employeeQuery.maybeSingle();

    if (employeeError) {
      console.error('Fehler beim Abrufen der Mitarbeiterdaten:', employeeError);
      throw employeeError;
    }

    // Wenn kein Employee gefunden, aber company_id vorhanden (SuperAdmin im Tunnel-Modus)
    if (!employee && companyId) {
      console.log('SuperAdmin im Tunnel-Modus - erstelle Antrag ohne Employee-Verknüpfung');
      
      const { data, error } = await supabase
        .from('absence_requests')
        .insert([
          {
            ...request,
            user_id: authUser.id, // Auth-User ID als Fallback
            created_by: authUser.id,
            employee_name: 'SuperAdmin (Tunnel-Modus)',
            department: null,
            company_id: companyId,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Erstellen des Abwesenheitsantrags:', error);
        throw error;
      }

      toast.success('Antrag erfolgreich erstellt');
      return data;
    }

    if (!employee) {
      throw new Error('Kein Mitarbeiterprofil gefunden. Bitte wenden Sie sich an den Administrator.');
    }

    const employeeData = employee;

    const { data, error } = await supabase
      .from('absence_requests')
      .insert([
        {
          ...request,
          user_id: employeeData.id,
          created_by: authUser.id,
          employee_name: employeeData.name,
          department: employeeData.department,
          company_id: employeeData.company_id || companyId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Fehler beim Erstellen des Abwesenheitsantrags:', error);
      throw error;
    }

    // Event emittieren
    await emitEvent(
      'absence.requested',
      'absence_request',
      data.id,
      'absence',
      {
        type: request.type,
        start_date: request.start_date,
        end_date: request.end_date,
        employee_id: employeeData.id,
        employee_name: employeeData.name
      }
    );

    // Benachrichtigung an Vorgesetzten senden
    await absenceManagementService.notifyManagerAboutNewRequest(data, employeeData);

    toast.success('Antrag erfolgreich erstellt');
    return data;
  },

  // Genehmige einen Abwesenheitsantrag
  approveRequest: async (id: string): Promise<void> => {
    // Erst den Antrag abrufen für typspezifische Verarbeitung
    const { data: request, error: fetchError } = await supabase
      .from('absence_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !request) {
      console.error('Fehler beim Abrufen des Antrags:', fetchError);
      throw fetchError;
    }

    const { error } = await supabase
      .from('absence_requests')
      .update({ 
        status: 'approved',
        approved_by: (await supabase.auth.getUser()).data.user?.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Fehler beim Genehmigen des Antrags:', error);
      throw error;
    }

    // Event emittieren
    await emitEvent(
      'absence.approved',
      'absence_request',
      id,
      'absence',
      {
        type: request.type,
        start_date: request.start_date,
        end_date: request.end_date,
        approved_by: (await supabase.auth.getUser()).data.user?.id
      }
    );

    // Typspezifische Verarbeitung nach Genehmigung
    await absenceManagementService.processAbsenceApproval(request);

    // Erfolgsmeldung - Trigger wird automatisch die Synchronisation durchführen
    toast.success('Antrag genehmigt - Automatische Synchronisation mit Kalender und Schichtplanung erfolgt');
  },

  // Typspezifische Verarbeitung bei Genehmigung
  // WICHTIG: Nur bei vacation/special_vacation werden Urlaubstage abgezogen!
  // Krankheit, Homeoffice, Bildungsurlaub, Dienstreise etc. ziehen KEINE Tage ab.
  processAbsenceApproval: async (request: any): Promise<void> => {
    const workingDays = absenceManagementService.calculateWorkingDays(request.start_date, request.end_date);
    
    switch (request.type) {
      case 'vacation':
      case 'special_vacation':
        // NUR bei echtem Urlaub: Urlaubstage vom Kontingent abziehen
        await absenceManagementService.deductVacationDays(request.user_id, workingDays);
        toast.info(`${workingDays} Urlaubstag(e) wurden vom Kontingent abgezogen`);
        break;
        
      case 'sick_leave':
        // Krankheitstag zur Statistik hinzufügen - KEIN Abzug von Urlaubstagen!
        await absenceManagementService.incrementSickDays(request.user_id, workingDays);
        toast.info(`${workingDays} Krankheitstag(e) wurden erfasst (keine Urlaubstage abgezogen)`);
        break;
        
      case 'homeoffice':
      case 'business_trip':
        // Homeoffice/Dienstreise: KEIN Abzug von Urlaubstagen!
        await absenceManagementService.notifySupervisor(request.user_id, request);
        toast.info('Vorgesetzter wurde informiert (keine Urlaubstage abgezogen)');
        break;
        
      case 'parental':
      case 'educational':
      case 'other':
        // Elternzeit, Bildungsurlaub, Sonstiges: KEIN Abzug von Urlaubstagen!
        toast.info(`Abwesenheit genehmigt (keine Urlaubstage abgezogen)`);
        break;
    }
  },

  // Urlaubstage vom Kontingent abziehen
  deductVacationDays: async (userId: string, days: number): Promise<void> => {
    // Aktuelle Urlaubstage abrufen
    const { data: employee, error: fetchError } = await supabase
      .from('employees')
      .select('vacation_days')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Fehler beim Abrufen der Urlaubstage:', fetchError);
      return;
    }

    if (!employee) {
      console.log('Kein Mitarbeiterdatensatz gefunden (möglicherweise SuperAdmin)');
      return;
    }

    const currentDays = employee.vacation_days || 30;
    const newDays = Math.max(0, currentDays - days);

    // Urlaubstage aktualisieren
    const { error } = await supabase
      .from('employees')
      .update({ vacation_days: newDays })
      .eq('id', userId);

    if (error) {
      console.error('Fehler beim Aktualisieren der Urlaubstage:', error);
    }

    // Optional: Auch in absence_quotas aktualisieren
    const currentYear = new Date().getFullYear();
    const { data: quota } = await supabase
      .from('absence_quotas')
      .select('id, used_days')
      .eq('user_id', userId)
      .eq('absence_type', 'vacation')
      .eq('quota_year', currentYear)
      .maybeSingle();

    if (quota) {
      await supabase
        .from('absence_quotas')
        .update({ used_days: (quota.used_days || 0) + days })
        .eq('id', quota.id);
    }
  },

  // Krankheitstage zur Statistik hinzufügen
  incrementSickDays: async (userId: string, days: number): Promise<void> => {
    const currentYear = new Date().getFullYear();
    
    // Prüfen ob bereits ein Quota-Eintrag für Krankheit existiert
    const { data: quota } = await supabase
      .from('absence_quotas')
      .select('id, used_days')
      .eq('user_id', userId)
      .eq('absence_type', 'sick_leave')
      .eq('quota_year', currentYear)
      .maybeSingle();

    if (quota) {
      // Existierenden Eintrag aktualisieren
      await supabase
        .from('absence_quotas')
        .update({ used_days: (quota.used_days || 0) + days })
        .eq('id', quota.id);
    } else {
      // Neuen Eintrag erstellen
      const { data: employee } = await supabase
        .from('employees')
        .select('company_id')
        .eq('id', userId)
        .maybeSingle();

      if (employee?.company_id) {
        await supabase
          .from('absence_quotas')
          .insert({
            user_id: userId,
            company_id: employee.company_id,
            absence_type: 'sick_leave',
            quota_year: currentYear,
            total_days: 0, // Keine Begrenzung für Krankheitstage
            used_days: days
          });
      }
    }
  },

  // Vorgesetzten über neuen Abwesenheitsantrag benachrichtigen
  notifyManagerAboutNewRequest: async (absenceRequest: any, employeeData: any): Promise<void> => {
    try {
      if (!employeeData?.manager_id) {
        console.log('Kein Vorgesetzter zugewiesen, keine Benachrichtigung gesendet');
        return;
      }

      if (!employeeData?.company_id) {
        console.log('Keine Firma gefunden');
        return;
      }

      const employeeName = employeeData.name || `${employeeData.first_name || ''} ${employeeData.last_name || ''}`.trim() || 'Mitarbeiter';
      const startDate = new Date(absenceRequest.start_date).toLocaleDateString('de-DE');
      const endDate = new Date(absenceRequest.end_date).toLocaleDateString('de-DE');
      
      // Abwesenheitstyp-Label
      const typeLabels: Record<string, string> = {
        vacation: 'Urlaub',
        sick_leave: 'Krankheit',
        business_trip: 'Homeoffice',
        homeoffice: 'Homeoffice',
        other: 'Sonderurlaub',
        parental: 'Elternzeit',
        educational: 'Bildungsurlaub'
      };
      const typeLabel = typeLabels[absenceRequest.type] || absenceRequest.type;

      // 1. Benachrichtigung in absence_notifications erstellen
      await supabase.from('absence_notifications').insert({
        absence_request_id: absenceRequest.id,
        user_id: employeeData.manager_id,
        notification_type: 'approval_request',
        message: `Neuer Abwesenheitsantrag von ${employeeName}: ${typeLabel} vom ${startDate} bis ${endDate}`,
        company_id: employeeData.company_id
      });

      // 2. Allgemeine Benachrichtigung erstellen
      await supabase.from('notifications').insert({
        user_id: employeeData.manager_id,
        title: 'Neuer Genehmigungsantrag',
        message: `${employeeName} hat einen ${typeLabel}-Antrag vom ${startDate} bis ${endDate} eingereicht.`,
        type: 'approval_request',
        category: 'absence',
        priority: 'high',
        action_url: '/absence?tab=approvals',
        metadata: {
          absence_request_id: absenceRequest.id,
          employee_id: employeeData.id,
          employee_name: employeeName,
          department: employeeData.department
        }
      });

      console.log('Vorgesetzten-Benachrichtigung erfolgreich erstellt für Manager:', employeeData.manager_id);
    } catch (error) {
      console.error('Fehler beim Erstellen der Vorgesetzten-Benachrichtigung:', error);
      // Fehler nicht werfen, da die Hauptfunktion trotzdem funktionieren soll
    }
  },

  // Vorgesetzten über Homeoffice benachrichtigen
  notifySupervisor: async (userId: string, request: any): Promise<void> => {
    // Mitarbeiter und Vorgesetzten abrufen (suche nach user_id, nicht id!)
    const { data: employee } = await supabase
      .from('employees')
      .select('id, name, first_name, last_name, manager_id, department, company_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!employee || !employee.manager_id) {
      console.log('Kein Vorgesetzter gefunden für Benachrichtigung');
      return;
    }

    const employeeName = employee.name || `${employee.first_name} ${employee.last_name}`;
    const startDate = new Date(request.start_date).toLocaleDateString('de-DE');
    const endDate = new Date(request.end_date).toLocaleDateString('de-DE');

    // Benachrichtigung für Vorgesetzten erstellen
    await supabase
      .from('notifications')
      .insert({
        user_id: employee.manager_id,
        title: 'Homeoffice-Meldung',
        message: `${employeeName} arbeitet vom ${startDate} bis ${endDate} im Homeoffice.`,
        type: 'info',
        category: 'absence',
        priority: 'normal',
        action_url: `/absence?request=${request.id}`,
        metadata: {
          absence_request_id: request.id,
          employee_id: userId,
          employee_name: employeeName,
          department: employee.department
        }
      });
  },

  // Lehne einen Abwesenheitsantrag ab
  rejectRequest: async (id: string, reason?: string): Promise<void> => {
    const { error } = await supabase
      .from('absence_requests')
      .update({ 
        status: 'rejected',
        rejected_by: (await supabase.auth.getUser()).data.user?.id,
        rejected_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', id);

    if (error) {
      console.error('Fehler beim Ablehnen des Antrags:', error);
      throw error;
    }

    // Event emittieren
    await emitEvent(
      'absence.rejected',
      'absence_request',
      id,
      'absence',
      { rejection_reason: reason }
    );

    toast.success('Antrag abgelehnt');
  },

  // Abwesenheitsantrag stornieren
  cancelRequest: async (id: string, reason?: string): Promise<void> => {
    const { data: request, error: fetchError } = await supabase
      .from('absence_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !request) {
      console.error('Fehler beim Abrufen des Antrags:', fetchError);
      throw fetchError;
    }

    const { error } = await supabase
      .from('absence_requests')
      .update({ 
        status: 'cancelled',
        cancellation_date: new Date().toISOString(),
        cancellation_reason: reason
      })
      .eq('id', id);

    if (error) {
      console.error('Fehler beim Stornieren des Antrags:', error);
      throw error;
    }

    await emitEvent(
      'absence.cancelled',
      'absence_request',
      id,
      'absence',
      {
        type: request.type,
        start_date: request.start_date,
        end_date: request.end_date,
        cancellation_reason: reason
      }
    );

    toast.success('Antrag storniert');
  },

  // Vertretung zuweisen
  assignSubstitute: async (requestId: string, substituteId: string): Promise<void> => {
    const { data: request, error: fetchError } = await supabase
      .from('absence_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      console.error('Fehler beim Abrufen des Antrags:', fetchError);
      throw fetchError;
    }

    const { data: substitute, error: subError } = await supabase
      .from('employees')
      .select('id, first_name, last_name, name')
      .eq('id', substituteId)
      .single();

    if (subError || !substitute) {
      console.error('Fehler beim Abrufen der Vertretung:', subError);
      throw subError;
    }

    const substituteName = substitute.name || `${substitute.first_name} ${substitute.last_name}`;

    const { error } = await supabase
      .from('absence_requests')
      .update({ 
        substitute_user_id: substituteId,
        substitute_confirmed: false
      })
      .eq('id', requestId);

    if (error) {
      console.error('Fehler beim Zuweisen der Vertretung:', error);
      throw error;
    }

    await emitEvent(
      'absence.substitute_assigned',
      'absence_request',
      requestId,
      'absence',
      {
        substitute_id: substituteId,
        substitute_name: substituteName,
        absence_type: request.type,
        start_date: request.start_date,
        end_date: request.end_date
      }
    );

    toast.success(`Vertretung ${substituteName} zugewiesen`);
  },

  // Prüfe auf Schichtkonflikte vor der Genehmigung
  checkShiftConflicts: async (request: AbsenceRequest): Promise<{
    hasConflicts: boolean;
    conflicts: any[];
  }> => {
    const { data: shifts, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('employee_id', request.user_id)
      .gte('date', request.start_date)
      .lte('date', request.end_date)
      .neq('status', 'cancelled');

    if (error) {
      console.error('Fehler beim Prüfen auf Schichtkonflikte:', error);
      return { hasConflicts: false, conflicts: [] };
    }

    return {
      hasConflicts: (shifts || []).length > 0,
      conflicts: shifts || []
    };
  },

  // Abwesenheitsstatistiken abrufen
  getStatistics: async (userId?: string): Promise<AbsenceStatistic> => {
    let query = supabase
      .from('absence_requests')
      .select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fehler beim Abrufen der Abwesenheitsstatistiken:', error);
      throw error;
    }

    const total_days = data?.reduce((acc, req) => {
      const start = new Date(req.start_date);
      const end = new Date(req.end_date);
      const diff = end.getTime() - start.getTime();
      const days = Math.ceil(diff / (1000 * 3600 * 24)) + 1;
      return acc + days;
    }, 0) || 0;

    const by_type = data?.reduce((acc: Record<AbsenceType, number>, req) => {
      acc[req.type] = (acc[req.type] || 0) + 1;
      return acc;
    }, {} as Record<AbsenceType, number>) || {} as Record<AbsenceType, number>;

    const by_month = data?.reduce((acc: { month: string; count: number }[], req) => {
      const month = new Date(req.start_date).toLocaleString('default', { month: 'long' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ month, count: 1 });
      }
      return acc;
    }, []) || [];

    const pending_requests = data?.filter(req => req.status === 'pending').length || 0;
    const approved_requests = data?.filter(req => req.status === 'approved').length || 0;
    const rejected_requests = data?.filter(req => req.status === 'rejected').length || 0;

    // Urlaubstage-Statistiken aus absence_quotas holen
    let vacation_stats = {
      total_vacation_days: 30,
      used_vacation_days: 0,
      remaining_vacation_days: 30
    };

    if (userId) {
      const currentYear = new Date().getFullYear();
      const { data: quotaData } = await supabase
        .from('absence_quotas')
        .select('*')
        .eq('user_id', userId)
        .eq('absence_type', 'vacation')
        .eq('quota_year', currentYear)
        .maybeSingle();

      if (quotaData) {
        vacation_stats = {
          total_vacation_days: quotaData.total_days || 30,
          used_vacation_days: quotaData.used_days || 0,
          remaining_vacation_days: (quotaData.total_days || 30) - (quotaData.used_days || 0) - (quotaData.planned_days || 0)
        };
      }
    }

    return {
      total_days,
      by_type,
      by_month,
      pending_requests,
      approved_requests,
      rejected_requests,
      ...vacation_stats
    };
  },

  // Abwesenheitseinstellungen abrufen
  getSettings: async (): Promise<AbsenceSettings> => {
    const { data, error } = await supabase
      .from('absence_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Fehler beim Abrufen der Abwesenheitseinstellungen:', error);
      throw error;
    }

    return data || {
      require_approval: true,
      allow_self_approval: false,
      max_consecutive_days: 30,
      notice_period_days: 14,
      absence_colors: {
        vacation: '#4338ca',
        sick_leave: '#e11d48',
        parental: '#06b7ea',
        other: '#64748b',
        business_trip: '#1e40af'
      },
      auto_block_time_tracking: true,
      show_in_calendar: true,
      require_certificate_after_days: 3,
      notification_recipients: []
    };
  },

  // Abwesenheitseinstellungen aktualisieren
  updateSettings: async (settings: Partial<AbsenceSettings>): Promise<void> => {
    const { error } = await supabase
      .from('absence_settings')
      .update(settings)
      .eq('id', 1);

    if (error) {
      console.error('Fehler beim Aktualisieren der Abwesenheitseinstellungen:', error);
      throw error;
    }

    toast.success('Einstellungen erfolgreich gespeichert');
  },

  // Neue Methode: Hole Cross-Module-Events für Abwesenheit
  getCrossModuleEvents: async (absenceRequestId: string) => {
    const { data, error } = await supabase
      .from('cross_module_events')
      .select('*')
      .eq('source_module', 'absence')
      .eq('source_id', absenceRequestId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden der Cross-Module-Events:', error);
      throw error;
    }

    return data || [];
  },

  // Mitarbeiter abrufen
  getEmployees: async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name, first_name, last_name, email, department, position')
      .eq('status', 'active')
      .order('name');

    if (error) {
      console.error('Fehler beim Laden der Mitarbeiter:', error);
      throw error;
    }

    return data || [];
  },

  // Übersetzungsmethoden für UI
  getAbsenceTypeLabel: (type: AbsenceType): string => {
    const labels: Record<AbsenceType, string> = {
      vacation: 'Urlaub',
      special_vacation: 'Sonderurlaub',
      sick_leave: 'Krankschreibung',
      homeoffice: 'Homeoffice',
      parental: 'Elternzeit',
      other: 'Sonstiges',
      business_trip: 'Dienstreise'
    };
    return labels[type] || type;
  },

  getAbsenceSubTypeLabel: (subtype: AbsenceSubType): string => {
    const labels: Record<AbsenceSubType, string> = {
      regular_vacation: 'Regulärer Urlaub',
      special_vacation: 'Sonderurlaub',
      unpaid_vacation: 'Unbezahlter Urlaub',
      sick_with_certificate: 'Krankschreibung mit Attest',
      sick_without_certificate: 'Krankschreibung ohne Attest',
      long_term_sick: 'Langzeitkrankschreibung',
      maternity_protection: 'Mutterschutz',
      parental_leave: 'Elternzeit',
      caregiver_leave: 'Pflegezeit',
      educational_leave: 'Bildungsurlaub',
      sabbatical: 'Sabbatical',
      quarantine: 'Quarantäne',
      suspension: 'Suspendierung',
      business_trip: 'Dienstreise'
    };
    return labels[subtype] || subtype;
  },

  getAbsenceStatusLabel: (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Ausstehend',
      approved: 'Genehmigt',
      rejected: 'Abgelehnt',
      archived: 'Archiviert'
    };
    return labels[status] || status;
  },

  getAbsenceTypeColor: (type: AbsenceType): string => {
    const colors: Record<AbsenceType, string> = {
      vacation: '#10B981',
      special_vacation: '#059669',
      sick_leave: '#F59E0B',
      homeoffice: '#06B6D4',
      parental: '#8B5CF6',
      other: '#6B7280',
      business_trip: '#3B82F6'
    };
    return colors[type] || '#6B7280';
  },

  // Abwesenheiten mit Employee-Daten aus View
  async getAbsencesWithEmployeeData(filter?: AbsenceFilter) {
    let query = supabase
      .from('absence_requests_with_employee')
      .select('*')
      .order('start_date', { ascending: false });

    if (filter?.start_date) {
      query = query.gte('start_date', filter.start_date.toISOString());
    }
    if (filter?.end_date) {
      query = query.lte('end_date', filter.end_date.toISOString());
    }
    if (filter?.status && filter.status.length > 0) {
      query = query.in('status', filter.status);
    }
    if (filter?.types && filter.types.length > 0) {
      query = query.in('type', filter.types);
    }
    if (filter?.employee_id) {
      query = query.eq('user_id', filter.employee_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fehler beim Laden der Abwesenheiten:', error);
      throw error;
    }

    return data || [];
  },

  // Approval-Workflow-History abrufen
  async getApprovalHistory(absenceRequestId: string) {
    const { data, error } = await supabase
      .from('approval_workflow_history')
      .select('*')
      .eq('absence_request_id', absenceRequestId)
      .order('level', { ascending: true });

    if (error) {
      console.error('Fehler beim Laden der Approval-History:', error);
      throw error;
    }

    return data || [];
  },

  // Verfügbare Vertretungen abrufen (Mitarbeiter ohne Abwesenheit im Zeitraum)
  // WICHTIG: Multi-Tenant-Filter - nur Mitarbeiter der gleichen Firma anzeigen!
  async getAvailableSubstitutes(startDate: string, endDate: string, companyId?: string) {
    let employeesQuery = supabase
      .from('employees')
      .select('id, first_name, last_name, department, city, company_id')
      .eq('status', 'active');
    
    // KRITISCH: Nach company_id filtern für Multi-Tenant!
    if (companyId) {
      employeesQuery = employeesQuery.eq('company_id', companyId);
    }

    const { data: allEmployees, error: employeesError } = await employeesQuery;

    if (employeesError) {
      console.error('Fehler beim Laden der Mitarbeiter:', employeesError);
      throw employeesError;
    }

    // Hole alle Abwesenheiten im Zeitraum (auch nach company_id filtern)
    let absencesQuery = supabase
      .from('absence_requests')
      .select('user_id')
      .eq('status', 'approved')
      .lte('start_date', endDate)
      .gte('end_date', startDate);
    
    if (companyId) {
      absencesQuery = absencesQuery.eq('company_id', companyId);
    }

    const { data: absences, error: absencesError } = await absencesQuery;

    if (absencesError) {
      console.error('Fehler beim Laden der Abwesenheiten:', absencesError);
      throw absencesError;
    }

    const unavailableIds = new Set(absences?.map(a => a.user_id) || []);
    
    return (allEmployees || []).filter(emp => !unavailableIds.has(emp.id));
  },

  // Urlaubsstatistiken für einen Mitarbeiter berechnen
  async getVacationStatsForEmployee(employeeId: string) {
    // 1. Verbleibende Urlaubstage aus employees-Tabelle (wird automatisch reduziert bei Genehmigung)
    // Verwende maybeSingle() statt single() für SuperAdmins ohne Employee-Datensatz
    const { data: employee } = await supabase
      .from('employees')
      .select('vacation_days')
      .eq('id', employeeId)
      .maybeSingle();
    
    // Wenn kein Employee gefunden (z.B. SuperAdmin), Default-Werte zurückgeben
    if (!employee) {
      return {
        entitlement: 30,
        used: 0,
        remaining: 30,
        planned: 0
      };
    }
    
    const remainingFromDB = employee?.vacation_days || 30;
    
    // 2. Verbrauchte Urlaubstage (genehmigt, aktuelles Jahr)
    const currentYear = new Date().getFullYear();
    const { data: approvedVacations } = await supabase
      .from('absence_requests')
      .select('start_date, end_date')
      .eq('user_id', employeeId)
      .eq('type', 'vacation')
      .eq('status', 'approved')
      .gte('start_date', `${currentYear}-01-01`)
      .lte('end_date', `${currentYear}-12-31`);
    
    const usedDays = approvedVacations?.reduce((sum, absence) => {
      return sum + this.calculateWorkingDays(absence.start_date, absence.end_date);
    }, 0) || 0;
    
    // 3. Geplante Urlaubstage (genehmigt, zukünftig)
    const today = new Date().toISOString().split('T')[0];
    const { data: plannedVacations } = await supabase
      .from('absence_requests')
      .select('start_date, end_date')
      .eq('user_id', employeeId)
      .eq('type', 'vacation')
      .eq('status', 'approved')
      .gte('start_date', today);
    
    const plannedDays = plannedVacations?.reduce((sum, absence) => {
      return sum + this.calculateWorkingDays(absence.start_date, absence.end_date);
    }, 0) || 0;
    
    // Da vacation_days bereits die RESTLICHEN Tage sind, berechnen wir den Jahresanspruch zurück
    const totalEntitlement = remainingFromDB + usedDays;
    
    return {
      entitlement: totalEntitlement,
      used: usedDays,
      remaining: remainingFromDB,
      planned: plannedDays
    };
  },

  // Mitarbeiter-Details mit Kontaktdaten abrufen
  async getEmployeeDetails(employeeId: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, email, phone, position, department, city, employee_number')
      .eq('id', employeeId)
      .single();
    
    if (error) {
      console.error('Fehler beim Laden der Mitarbeiterdetails:', error);
      return null;
    }
    
    return data;
  },

  // Hilfsfunktion für Arbeitstage-Berechnung (ohne Wochenenden)
  calculateWorkingDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;
    
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Nicht Samstag (6) oder Sonntag (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return workingDays;
  }
};
