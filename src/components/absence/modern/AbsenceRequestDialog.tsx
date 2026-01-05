import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, FileUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { absenceManagementService } from '@/services/absenceManagementService';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { useImpersonationContext } from '@/contexts/ImpersonationContext';
import { supabase } from '@/integrations/supabase/client';

interface AbsenceRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AbsenceRequestDialog: React.FC<AbsenceRequestDialogProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { tenantCompany, isSuperAdmin } = useTenant();
  const { session: impersonationSession } = useImpersonationContext();
  const [absenceType, setAbsenceType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [substitute, setSubstitute] = useState('');
  const [comment, setComment] = useState('');
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    absenceType: false,
    startDate: false,
    endDate: false
  });

  // Fallback: company_id aus Profil holen für Nicht-SuperAdmins
  useEffect(() => {
    const fetchUserCompany = async () => {
      if (user?.id && !tenantCompany?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .maybeSingle();
        setUserCompanyId(data?.company_id || null);
      }
    };
    fetchUserCompany();
  }, [user?.id, tenantCompany?.id]);

  const absenceTypes = [
    { value: 'vacation', label: 'Urlaub' },
    { value: 'sick_leave', label: 'Krankheit' },
    { value: 'business_trip', label: 'Homeoffice' },
    { value: 'other', label: 'Sonderurlaub' },
    { value: 'parental', label: 'Elternzeit' },
    { value: 'educational', label: 'Bildungsurlaub' }
  ];

  // company_id ermitteln für Multi-Tenant
  const effectiveCompanyId = impersonationSession?.target_tenant_id || tenantCompany?.id || userCompanyId || null;

  // Verfügbare Vertretungen aus DB laden (nur wenn Zeitraum angegeben)
  // WICHTIG: companyId übergeben für Multi-Tenant-Filter!
  const { data: availableSubstitutes = [], isLoading: isLoadingSubstitutes } = useQuery({
    queryKey: ['available-substitutes', startDate, endDate, effectiveCompanyId],
    queryFn: () => absenceManagementService.getAvailableSubstitutes(startDate, endDate, effectiveCompanyId || undefined),
    enabled: !!(startDate && endDate && startDate <= endDate)
  });

  const calculateWorkdays = () => {
    if (!startDate || !endDate) return 0;
    // Echte Arbeitstage-Berechnung (ohne Wochenenden)
    return absenceManagementService.calculateWorkingDays(startDate, endDate);
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => absenceManagementService.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-absences'] });
      queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['vacation-stats'] });
      toast({
        title: 'Antrag eingereicht',
        description: 'Ihr Abwesenheitsantrag wurde erfolgreich eingereicht und wartet auf Genehmigung.',
      });
      
      // Reset form
      setAbsenceType('');
      setStartDate('');
      setEndDate('');
      setSubstitute('');
      setComment('');
      
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message || 'Der Antrag konnte nicht eingereicht werden.',
      });
    }
  });

  const handleSubmit = () => {
    // Validierung mit spezifischen Fehlermeldungen
    const newErrors = {
      absenceType: !absenceType,
      startDate: !startDate,
      endDate: !endDate
    };
    setErrors(newErrors);

    if (!absenceType) {
      toast({
        variant: 'destructive',
        title: 'Fehlende Angabe',
        description: 'Bitte wählen Sie eine Abwesenheitsart aus.',
      });
      return;
    }

    if (!startDate) {
      toast({
        variant: 'destructive',
        title: 'Fehlende Angabe',
        description: 'Bitte geben Sie das Start-Datum (Von) ein.',
      });
      return;
    }

    if (!endDate) {
      toast({
        variant: 'destructive',
        title: 'Fehlende Angabe',
        description: 'Bitte geben Sie das End-Datum (Bis) ein.',
      });
      return;
    }

    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Benutzer nicht authentifiziert.',
      });
      return;
    }

    // effectiveCompanyId bereits oben berechnet (für Vertretungsauswahl)
    console.log('🔐 AbsenceRequest effectiveCompanyId:', {
      impersonation: impersonationSession?.target_tenant_id,
      tenant: tenantCompany?.id,
      profile: userCompanyId,
      effective: effectiveCompanyId
    });
    
    if (!effectiveCompanyId && !isSuperAdmin) {
      toast({
        variant: 'destructive',
        title: 'Firma nicht gefunden',
        description: 'Bitte wählen Sie eine Firma aus (Tenant-Modus) oder stellen Sie sicher, dass Ihr Profil einer Firma zugeordnet ist.',
      });
      return;
    }

    createMutation.mutate({
      user_id: user.id,
      type: absenceType,
      start_date: startDate,
      end_date: endDate,
      substitute_id: substitute || null,
      reason: comment || null,
      status: 'pending',
      half_day: false,
      valid_for_time_tracking: true,
      created_by: user.id,
      company_id: effectiveCompanyId
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Neuen Abwesenheitsantrag stellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Abwesenheitsart & Vertretung */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Abwesenheitsart <span className="text-destructive">*</span></Label>
              <Select value={absenceType} onValueChange={(val) => {
                setAbsenceType(val);
                setErrors(prev => ({ ...prev, absenceType: false }));
              }}>
                <SelectTrigger className={errors.absenceType ? 'border-destructive ring-destructive' : ''}>
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {absenceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Vertretung (optional)</Label>
              <Select value={substitute} onValueChange={setSubstitute} disabled={!startDate || !endDate || isLoadingSubstitutes}>
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoadingSubstitutes 
                      ? 'Lädt...' 
                      : !startDate || !endDate 
                      ? 'Bitte Zeitraum angeben' 
                      : 'Auswählen...'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableSubstitutes.map((sub: any) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.first_name} {sub.last_name} - {sub.department}
                    </SelectItem>
                  ))}
                  {availableSubstitutes.length === 0 && startDate && endDate && (
                    <SelectItem value="none" disabled>
                      Keine Vertretung verfügbar
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Zeitraum */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Von <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setErrors(prev => ({ ...prev, startDate: false }));
                  // Reset Vertretung wenn Datum sich ändert
                  setSubstitute('');
                }}
                placeholder="30.10.2025"
                className={errors.startDate ? 'border-destructive ring-destructive' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label>Bis <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setErrors(prev => ({ ...prev, endDate: false }));
                  // Reset Vertretung wenn Datum sich ändert
                  setSubstitute('');
                }}
                placeholder="30.10.2025"
                min={startDate}
                className={errors.endDate ? 'border-destructive ring-destructive' : ''}
              />
            </div>
          </div>

          {/* Automatische Berechnung */}
          {startDate && endDate && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium">Automatische Berechnung: {calculateWorkdays()} Arbeitstage</p>
              <p className="text-xs text-muted-foreground mt-1">
                Wochenenden und Feiertage werden automatisch ausgeschlossen
              </p>
            </div>
          )}

          {/* Kommentar */}
          <div className="space-y-2">
            <Label>Kommentar (optional)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Zusätzliche Informationen..."
              rows={3}
            />
          </div>

          {/* Belege hochladen */}
          <div className="space-y-2">
            <Label>Belege hochladen (optional)</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <FileUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Klicken Sie hier oder ziehen Sie Dateien hierher
              </p>
            </div>
          </div>

          {/* Aktionen */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1" size="lg" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Wird eingereicht...' : 'Antrag einreichen'}
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1" size="lg">
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
