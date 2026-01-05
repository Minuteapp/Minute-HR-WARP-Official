import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SickLeaveRecord {
  id: string;
  employee_id: string;
  start_date: string;
  end_date?: string;
  is_partial_day: boolean;
  start_time?: string;
  end_time?: string;
  days_count?: number;
  reason?: string;
  sick_note_url?: string;
  diagnosis_category?: 'common_cold' | 'flu' | 'injury' | 'surgery' | 'mental_health' | 'chronic' | 'other';
  is_work_related: boolean;
  is_child_sick_leave: boolean;
  child_name?: string;
  has_contacted_doctor: boolean;
  doctor_contact_date?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  submitted_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useSickLeaveRecords = (employeeId: string) => {
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['sick-leave-records', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sick_leave_records')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data as SickLeaveRecord[];
    },
    enabled: !!employeeId,
  });

  const createRecord = useMutation({
    mutationFn: async ({ 
      record, 
      sickNoteFile 
    }: { 
      record: Omit<SickLeaveRecord, 'id' | 'created_at' | 'updated_at' | 'submitted_at'>; 
      sickNoteFile?: File;
    }) => {
      let sick_note_url = record.sick_note_url;

      // Upload sick note if provided
      if (sickNoteFile) {
        const fileExt = sickNoteFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${employeeId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('employee-documents')
          .upload(filePath, sickNoteFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('employee-documents')
          .getPublicUrl(filePath);

        sick_note_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('sick_leave_records')
        .insert({
          ...record,
          sick_note_url,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sick-leave-records', employeeId] });
      toast.success('Krankmeldung erstellt');
    },
    onError: (error) => {
      console.error('Error creating sick leave:', error);
      toast.error('Fehler beim Erstellen der Krankmeldung');
    },
  });

  const updateRecord = useMutation({
    mutationFn: async ({ 
      recordId, 
      updates,
      sickNoteFile 
    }: { 
      recordId: string; 
      updates: Partial<SickLeaveRecord>;
      sickNoteFile?: File;
    }) => {
      let sick_note_url = updates.sick_note_url;

      // Upload new sick note if provided
      if (sickNoteFile) {
        const fileExt = sickNoteFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${employeeId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('employee-documents')
          .upload(filePath, sickNoteFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('employee-documents')
          .getPublicUrl(filePath);

        sick_note_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('sick_leave_records')
        .update({
          ...updates,
          sick_note_url,
        })
        .eq('id', recordId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sick-leave-records', employeeId] });
      toast.success('Krankmeldung aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating sick leave:', error);
      toast.error('Fehler beim Aktualisieren');
    },
  });

  const approveRecord = useMutation({
    mutationFn: async (recordId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('sick_leave_records')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', recordId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sick-leave-records', employeeId] });
      toast.success('Krankmeldung genehmigt');
    },
    onError: (error) => {
      console.error('Error approving sick leave:', error);
      toast.error('Fehler beim Genehmigen');
    },
  });

  const rejectRecord = useMutation({
    mutationFn: async ({ recordId, reason }: { recordId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('sick_leave_records')
        .update({
          status: 'rejected',
          rejection_reason: reason,
        })
        .eq('id', recordId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sick-leave-records', employeeId] });
      toast.success('Krankmeldung abgelehnt');
    },
    onError: (error) => {
      console.error('Error rejecting sick leave:', error);
      toast.error('Fehler beim Ablehnen');
    },
  });

  const deleteRecord = useMutation({
    mutationFn: async (recordId: string) => {
      const { error } = await supabase
        .from('sick_leave_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sick-leave-records', employeeId] });
      toast.success('Krankmeldung gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting sick leave:', error);
      toast.error('Fehler beim Löschen');
    },
  });

  const statistics = {
    total: records.length,
    pending: records.filter(r => r.status === 'pending').length,
    approved: records.filter(r => r.status === 'approved').length,
    totalDays: records.reduce((sum, r) => sum + (r.days_count || 0), 0),
    avgDuration: records.length > 0 
      ? Math.round(records.reduce((sum, r) => sum + (r.days_count || 0), 0) / records.length)
      : 0,
    totalCases: records.length,
    sickDayRate: 0,
  };

  return {
    records,
    sickLeaveRecords: records,
    isLoading,
    statistics,
    createRecord: createRecord.mutateAsync,
    createSickLeave: createRecord.mutateAsync,
    updateRecord: updateRecord.mutateAsync,
    approveRecord: approveRecord.mutateAsync,
    rejectRecord: rejectRecord.mutateAsync,
    deleteRecord: deleteRecord.mutateAsync,
  };
};
