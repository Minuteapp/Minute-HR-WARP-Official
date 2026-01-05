import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AbsenceRequest {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  status: string;
  reason?: string;
  half_day: boolean;
  start_time?: string;
  end_time?: string;
  substitute_id?: string;
  user_id: string;
  approved_by?: string;
  approved_at?: string;
  employee_name?: string;
  department?: string;
}

export interface SickLeave {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  status: string;
  description?: string;
  notes?: string;
  employee_name?: string;
  department?: string;
  created_at?: string;
  is_partial_day?: boolean;
}

class AbsenceService {
  
  private async notifySupervisorAboutRequest(absenceRequest: any, authUserId: string) {
    try {
      // Hole Mitarbeiterdaten inkl. Vorgesetzten (suche nach user_id, nicht id!)
      const { data: employee } = await supabase
        .from('employees')
        .select('id, name, department, manager_id, company_id')
        .eq('user_id', authUserId)
        .single();

      if (!employee) {
        console.log('Mitarbeiter nicht gefunden für Benachrichtigung');
        toast.warning('Kein Mitarbeiterprofil gefunden');
        return;
      }

      if (!employee.manager_id) {
        console.log('Kein Vorgesetzter zugewiesen, keine Benachrichtigung gesendet');
        toast.info('Hinweis: Kein Vorgesetzter zugewiesen - Antrag wartet auf manuelle Genehmigung');
        return;
      }

      if (!employee.company_id) {
        console.log('Keine Firma gefunden');
        return;
      }

      // Hole Vorgesetzten-Daten
      const { data: supervisor } = await supabase
        .from('employees')
        .select('id, name, email')
        .eq('id', employee.manager_id)
        .single();

      if (!supervisor) {
        console.log('Vorgesetzter nicht gefunden');
        return;
      }

      // 1. Benachrichtigung in absence_notifications erstellen
      await supabase.from('absence_notifications').insert({
        absence_request_id: absenceRequest.id,
        user_id: employee.manager_id,
        notification_type: 'approval_request',
        message: `Neuer Abwesenheitsantrag von ${employee.name || 'Mitarbeiter'} (${absenceRequest.type})`,
        company_id: employee.company_id
      });

      // 2. Allgemeine Benachrichtigung erstellen
      await supabase.from('notifications').insert({
        user_id: employee.manager_id,
        title: 'Neuer Genehmigungsantrag',
        message: `${employee.name || 'Ein Mitarbeiter'} hat einen ${absenceRequest.type}-Antrag vom ${absenceRequest.start_date} bis ${absenceRequest.end_date} eingereicht.`,
        type: 'approval_request',
        link: '/absence?tab=approvals',
        company_id: employee.company_id
      });

      console.log('Vorgesetzten-Benachrichtigung erfolgreich erstellt für:', supervisor.name);
    } catch (error) {
      console.error('Fehler beim Erstellen der Vorgesetzten-Benachrichtigung:', error);
      // Fehler nicht werfen, da die Hauptfunktion trotzdem funktionieren soll
    }
  }

  async getRequests() {
    try {
      console.log('Lade Abwesenheitsanträge...');
      const { data, error } = await supabase
        .from('absence_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fehler beim Laden der Abwesenheitsanträge:', error);
        toast.error('Fehler beim Laden der Abwesenheitsanträge');
        return [];
      }

      console.log('Abwesenheitsanträge geladen:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Unerwarteter Fehler beim Laden der Anträge:', error);
      toast.error('Fehler beim Laden der Abwesenheitsanträge');
      return [];
    }
  }

  async getEmployees() {
    try {
      console.log('Lade Mitarbeiter aus employee_company_view...');
      const { data, error } = await supabase
        .from('employee_company_view')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) {
        console.error('Fehler beim Laden der Mitarbeiter:', error);
        toast.error('Fehler beim Laden der Mitarbeiter');
        return [];
      }

      console.log('Mitarbeiter geladen:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Unerwarteter Fehler beim Laden der Mitarbeiter:', error);
      toast.error('Fehler beim Laden der Mitarbeiter');
      return [];
    }
  }

  async createRequest(request: Partial<AbsenceRequest> & { type: string; start_date: string; end_date: string; }) {
    try {
      console.log('Erstelle Abwesenheitsantrag mit Daten:', request);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Sie müssen angemeldet sein, um Anträge zu stellen');
        return null;
      }
      
      if (!request.start_date || !request.end_date) {
        toast.error('Start- und Enddatum sind erforderlich');
        return null;
      }

      // Hole die effektive company_id für Tenant-Modus
      const { data: companyId } = await supabase.rpc('get_effective_company_id');
      console.log('Effective company_id für Abwesenheitsantrag:', companyId);

      // Verwende die übergebene user_id oder fallback zum aktuellen Benutzer
      const requestData = {
        user_id: request.user_id || user.id,
        company_id: companyId, // Wichtig für RLS
        type: request.type,
        start_date: request.start_date,
        end_date: request.end_date,
        status: 'pending',
        half_day: request.half_day || false,
        reason: request.reason || '',
        start_time: request.start_time || null,
        end_time: request.end_time || null,
        substitute_id: request.substitute_id || null
      };
      
      console.log('Bereinigte Antragsdaten:', requestData);
      
      const { data, error } = await supabase
        .from('absence_requests')
        .insert(requestData)
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Erstellen des Antrags:', error);
        toast.error(`Fehler beim Erstellen des Antrags: ${error.message}`);
        return null;
      }

      console.log('Abwesenheitsantrag erfolgreich erstellt:', data);
      
      // Benachrichtigung für Vorgesetzten erstellen
      await this.notifySupervisorAboutRequest(data, user.id);
      
      toast.success('Antrag erfolgreich erstellt');
      return data;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Erstellen des Antrags:', error);
      toast.error('Fehler beim Erstellen des Antrags');
      return null;
    }
  }

  async approveRequest(id: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Sie müssen angemeldet sein, um Anträge zu genehmigen');
        return null;
      }

      const { data, error } = await supabase
        .from('absence_requests')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Genehmigen des Antrags:', error);
        toast.error('Fehler beim Genehmigen des Antrags');
        return null;
      }

      toast.success('Antrag erfolgreich genehmigt');
      return data;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Genehmigen des Antrags:', error);
      toast.error('Fehler beim Genehmigen des Antrags');
      return null;
    }
  }

  async rejectRequest(id: string, reason?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Sie müssen angemeldet sein, um Anträge abzulehnen');
        return null;
      }

      const { data, error } = await supabase
        .from('absence_requests')
        .update({
          status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Ablehnen des Antrags:', error);
        toast.error('Fehler beim Ablehnen des Antrags');
        return null;
      }

      toast.success('Antrag erfolgreich abgelehnt');
      return data;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Ablehnen des Antrags:', error);
      toast.error('Fehler beim Ablehnen des Antrags');
      return null;
    }
  }

  async sendQueryToEmployee(requestId: string, question: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Sie müssen angemeldet sein');
        return null;
      }

      // Hole Benutzername und company_id
      const { data: employee } = await supabase
        .from('employees')
        .select('name, company_id')
        .eq('id', user.id)
        .single();

      if (!employee?.company_id) {
        toast.error('Mitarbeiter-Zuordnung nicht gefunden');
        return null;
      }

      // Speichere Rückfrage in der Datenbank
      const { data, error } = await supabase
        .from('absence_queries')
        .insert({
          absence_request_id: requestId,
          question: question,
          asked_by: user.id,
          asked_by_name: employee?.name || 'Unbekannt',
          company_id: employee.company_id
        })
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Senden der Rückfrage:', error);
        toast.error('Fehler beim Senden der Rückfrage');
        return null;
      }

      toast.success('Rückfrage wurde gesendet');
      return data;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Senden der Rückfrage:', error);
      toast.error('Fehler beim Senden der Rückfrage');
      return null;
    }
  }

  async getApprovalStatistics() {
    try {
      // Offene Anträge
      const { count: pendingCount } = await supabase
        .from('absence_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Durchschnittliche Bearbeitungszeit (aus PostgreSQL Funktion)
      const { data: avgTimeData } = await supabase.rpc('calculate_avg_processing_time');

      // Überfällige Anträge (älter als 3 Tage)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { count: overdueCount } = await supabase
        .from('absence_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('created_at', threeDaysAgo.toISOString());

      // Heute genehmigt
      const today = new Date().toISOString().split('T')[0];
      const { count: approvedTodayCount } = await supabase
        .from('absence_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('approved_at', today);

      return {
        pending: pendingCount || 0,
        avgProcessingDays: avgTimeData || 0,
        overdue: overdueCount || 0,
        approvedToday: approvedTodayCount || 0
      };
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
      return {
        pending: 0,
        avgProcessingDays: 0,
        overdue: 0,
        approvedToday: 0
      };
    }
  }

  async createSickLeave(sickLeave: {
    user_id?: string;
    start_date: string;
    end_date: string;
    is_partial_day?: boolean;
    description?: string;
    notes?: string;
  }) {
    try {
      console.log('Erstelle Krankmeldung mit Daten:', sickLeave);
      
      const { data: authData } = await supabase.auth.getUser();
      if (!authData || !authData.user) {
        toast.error('Sie müssen angemeldet sein, um Krankmeldungen zu erstellen');
        return null;
      }
      
      // Hole Mitarbeiterdaten für den Benutzer
      const { data: employeeData } = await supabase
        .from('employees')
        .select('name, department')
        .eq('id', sickLeave.user_id || authData.user.id)
        .single();

      // Erstelle immer einen Eintrag in absence_requests für das Abwesenheits-Modul
      const absenceData = {
        user_id: sickLeave.user_id || authData.user.id,
        type: 'sick_leave',
        absence_type: 'sick_leave', // Für Kompatibilität
        start_date: sickLeave.start_date,
        end_date: sickLeave.end_date,
        half_day: sickLeave.is_partial_day || false,
        reason: sickLeave.description || 'Krankheit',
        status: 'pending', // Krankmeldung benötigt Genehmigung
        employee_name: employeeData?.name || null,
        department: employeeData?.department || null
      };

      console.log('Erstelle Abwesenheitsantrag für Krankmeldung:', absenceData);
      
      const absenceResult = await this.createRequest(absenceData);
      
      if (!absenceResult) {
        throw new Error('Fehler beim Erstellen des Abwesenheitsantrags');
      }

      // Versuche auch in sick_leaves Tabelle zu schreiben (falls vorhanden)
      try {
        const sickLeaveData = {
          user_id: sickLeave.user_id || authData.user.id,
          start_date: sickLeave.start_date,
          end_date: sickLeave.end_date,
          is_partial_day: sickLeave.is_partial_day || false,
          reason: sickLeave.description || 'Krankheit',
          notes: sickLeave.notes || '',
          status: 'pending',
          has_contacted_doctor: false,
          is_child_sick_leave: false
        };

        await supabase
          .from('sick_leaves')
          .insert(sickLeaveData);
        
        console.log('Krankmeldung auch in sick_leaves Tabelle gespeichert');
      } catch (sickError) {
        console.log('sick_leaves Tabelle nicht verfügbar oder Fehler:', sickError);
        // Ignorieren, da der Haupteintrag in absence_requests erstellt wurde
      }

      console.log('Krankmeldung erfolgreich erstellt:', absenceResult);
      toast.success('Krankmeldung wurde zur Genehmigung eingereicht');
      return absenceResult;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Erstellen der Krankmeldung:', error);
      toast.error('Fehler beim Speichern der Krankmeldung');
      return null;
    }
  }

  async getSickLeaves(userId?: string) {
    try {
      if (!userId) {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData || !authData.user) {
          console.log('Kein Benutzer angemeldet');
          return [];
        }
        userId = authData.user.id;
      }
      
      const { data: sickData, error: sickError } = await supabase
        .from('sick_leaves')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (sickError) {
        console.log('sick_leaves Tabelle nicht verfügbar, lade aus absence_requests');
        
        const { data: absenceData, error: absenceError } = await supabase
          .from('absence_requests')
          .select('*')
          .eq('user_id', userId)
          .eq('type', 'sick')
          .order('created_at', { ascending: false });

        if (absenceError) {
          console.error('Fehler beim Laden der Krankmeldungen:', absenceError);
          return [];
        }

        return absenceData || [];
      }

      return sickData || [];
    } catch (error) {
      console.error('Unerwarteter Fehler beim Laden der Krankmeldungen:', error);
      return [];
    }
  }

  async updateRequest(id: string, updates: Partial<AbsenceRequest>) {
    try {
      const { data, error } = await supabase
        .from('absence_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Aktualisieren des Antrags:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Aktualisieren:', error);
      throw error;
    }
  }

  async deleteRequest(id: string) {
    try {
      const { error } = await supabase
        .from('absence_requests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Fehler beim Löschen des Antrags:', error);
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Unerwarteter Fehler beim Löschen:', error);
      throw error;
    }
  }
}

export const absenceService = new AbsenceService();
