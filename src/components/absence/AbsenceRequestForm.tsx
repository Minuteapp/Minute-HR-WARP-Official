import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarIcon, AlertTriangle, AlertCircle, Info, Upload, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAbsenceConflictCheck, ConflictDetail } from '@/hooks/useAbsenceConflictCheck';
import { useAbsenceQuotaCheck, QuotaStatus } from '@/hooks/useAbsenceQuotaCheck';
import { Input } from '@/components/ui/input';

interface AbsenceRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AbsenceRequestForm = ({ open, onOpenChange }: AbsenceRequestFormProps) => {
  const [formData, setFormData] = useState({
    type: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    isHalfDay: false,
    reason: '',
    substituteId: '',
    documentRequired: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictDetail[]>([]);
  const [quotaStatus, setQuotaStatus] = useState<QuotaStatus | null>(null);
  const [employeeData, setEmployeeData] = useState<{ id: string; name: string; department: string; company_id: string } | null>(null);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { checkConflicts, isChecking: isCheckingConflicts } = useAbsenceConflictCheck();
  const { checkQuota, isChecking: isCheckingQuota } = useAbsenceQuotaCheck();

  const absenceTypes = [
    { value: 'vacation', label: 'Urlaub', color: '#10B981' },
    { value: 'sick', label: 'Krankmeldung', color: '#EF4444' },
    { value: 'personal', label: 'Persönlicher Tag', color: '#F59E0B' },
    { value: 'training', label: 'Fortbildung', color: '#3B82F6' },
    { value: 'parental', label: 'Elternzeit', color: '#8B5CF6' },
    { value: 'sabbatical', label: 'Sabbatical', color: '#06B6D4' }
  ];

  // Lade Mitarbeiterdaten beim Öffnen
  useEffect(() => {
    const loadEmployeeData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: employee } = await supabase
        .from('employees')
        .select('id, name, department, company_id')
        .eq('email', user.email)
        .maybeSingle();

      if (employee) {
        setEmployeeData(employee);
      }
    };

    if (open) {
      loadEmployeeData();
    }
  }, [open]);

  // Automatische Konflikt- und Quota-Prüfung bei Datumsänderung
  useEffect(() => {
    const performChecks = async () => {
      if (!formData.startDate || !employeeData) return;

      const startDateStr = formData.startDate.toISOString().split('T')[0];
      const endDateStr = (formData.endDate || formData.startDate).toISOString().split('T')[0];

      // Konfliktprüfung
      const conflictResult = await checkConflicts(
        startDateStr,
        endDateStr,
        employeeData.department,
        employeeData.company_id,
        formData.substituteId || undefined
      );
      setConflicts(conflictResult.conflicts);

      // Quota-Prüfung (nur für Urlaub)
      if (formData.type && ['vacation', 'personal'].includes(formData.type)) {
        const quota = await checkQuota(
          employeeData.id,
          formData.type,
          startDateStr,
          endDateStr,
          formData.isHalfDay
        );
        setQuotaStatus(quota);
      } else {
        setQuotaStatus(null);
      }
    };

    performChecks();
  }, [formData.startDate, formData.endDate, formData.type, formData.isHalfDay, employeeData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Datei zu groß",
        description: "Maximale Größe: 10MB"
      });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Ungültiger Dateityp",
        description: "Nur JPG, PNG und PDF Dateien erlaubt"
      });
      return;
    }

    setUploadedFile(file);
  };

  const uploadDocument = async (absenceRequestId: string): Promise<boolean> => {
    if (!uploadedFile || !employeeData) return true;

    setUploading(true);
    try {
      const fileExt = uploadedFile.name.split('.').pop();
      const fileName = `${absenceRequestId}_${Date.now()}.${fileExt}`;
      const filePath = `absence-documents/${employeeData.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadedFile);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('absence_documents')
        .insert({
          absence_request_id: absenceRequestId,
          file_name: uploadedFile.name,
          file_path: filePath,
          file_size: uploadedFile.size,
          file_type: uploadedFile.type,
          company_id: employeeData.company_id
        });

      if (dbError) throw dbError;
      return true;
    } catch (error) {
      console.error('Upload-Fehler:', error);
      toast({
        variant: "destructive",
        title: "Fehler beim Hochladen",
        description: "Das Dokument konnte nicht hochgeladen werden."
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type || !formData.startDate || (!formData.endDate && !formData.isHalfDay)) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus."
      });
      return;
    }

    // Prüfe auf kritische Konflikte (Fehler)
    const criticalConflicts = conflicts.filter(c => c.severity === 'error');
    if (criticalConflicts.length > 0) {
      toast({
        variant: "destructive",
        title: "Konflikte vorhanden",
        description: "Bitte beheben Sie die markierten Konflikte bevor Sie fortfahren."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!employeeData) throw new Error('Kein Mitarbeiterprofil gefunden.');

      const { data: insertedRequest, error } = await supabase
        .from('absence_requests')
        .insert({
          user_id: employeeData.id,
          company_id: employeeData.company_id,
          employee_name: employeeData.name || 'Unbekannt',
          department: employeeData.department || 'Unbekannt',
          type: formData.type,
          absence_type: formData.type,
          start_date: formData.startDate!.toISOString().split('T')[0],
          end_date: (formData.endDate || formData.startDate)!.toISOString().split('T')[0],
          half_day: formData.isHalfDay,
          reason: formData.reason,
          status: 'pending',
          document_required: formData.type === 'sick'
        })
        .select('id')
        .single();

      if (error) throw error;

      // Lade Dokument hoch wenn vorhanden
      if (uploadedFile && insertedRequest) {
        await uploadDocument(insertedRequest.id);
      }

      toast({
        title: "Erfolg",
        description: "Abwesenheitsantrag wurde erfolgreich eingereicht."
      });

      queryClient.invalidateQueries({ queryKey: ['absence-requests'] });
      onOpenChange(false);
      
      // Form zurücksetzen
      setFormData({
        type: '',
        startDate: null,
        endDate: null,
        isHalfDay: false,
        reason: '',
        substituteId: '',
        documentRequired: false
      });
      setConflicts([]);
      setQuotaStatus(null);
      setUploadedFile(null);
      setShowDocumentUpload(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Fehler beim Einreichen des Antrags"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityIcon = (severity: 'warning' | 'error') => {
    return severity === 'error' ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />;
  };

  const getSeverityColor = (severity: 'warning' | 'error') => {
    return severity === 'error' ? 'border-destructive text-destructive' : 'border-yellow-500 text-yellow-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Abwesenheit beantragen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Abwesenheitsart */}
          <div className="space-y-2">
            <Label htmlFor="type">Abwesenheitsart *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie eine Abwesenheitsart" />
              </SelectTrigger>
              <SelectContent>
                {absenceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Datum Auswahl */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Startdatum *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "dd.MM.yyyy", { locale: de })
                    ) : (
                      "Datum wählen"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate || undefined}
                    onSelect={(date) => setFormData({ ...formData, startDate: date || null })}
                    initialFocus
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {!formData.isHalfDay && (
              <div className="space-y-2">
                <Label>Enddatum *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(formData.endDate, "dd.MM.yyyy", { locale: de })
                      ) : (
                        "Datum wählen"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate || undefined}
                      onSelect={(date) => setFormData({ ...formData, endDate: date || null })}
                      initialFocus
                      locale={de}
                      disabled={(date) => 
                        formData.startDate ? date < formData.startDate : false
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Halber Tag Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="halfDay"
              checked={formData.isHalfDay}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, isHalfDay: checked as boolean })
              }
            />
            <Label htmlFor="halfDay">Halber Tag</Label>
          </div>

          {/* Konflikt-Warnungen */}
          {conflicts.length > 0 && (
            <div className="space-y-2">
              {conflicts.map((conflict, index) => (
                <Alert key={index} className={cn("border-2", getSeverityColor(conflict.severity))}>
                  {getSeverityIcon(conflict.severity)}
                  <AlertTitle>{conflict.title}</AlertTitle>
                  <AlertDescription>{conflict.description}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Quota-Warnung */}
          {quotaStatus && (
            <Alert className={cn(
              "border-2",
              quotaStatus.willExceed ? "border-destructive text-destructive" : "border-primary/50"
            )}>
              <Info className="h-4 w-4" />
              <AlertTitle>Urlaubskontingent</AlertTitle>
              <AlertDescription>
                <div className="space-y-1 text-sm">
                  <p>Jahresurlaub: {quotaStatus.totalDays} Tage</p>
                  {quotaStatus.carryoverDays > 0 && (
                    <p>Resturlaub Vorjahr: {quotaStatus.carryoverDays} Tage
                      {quotaStatus.carryoverExpiresAt && (
                        <span className="text-muted-foreground"> (gültig bis {new Date(quotaStatus.carryoverExpiresAt).toLocaleDateString('de-DE')})</span>
                      )}
                    </p>
                  )}
                  <p>Bereits genommen: {quotaStatus.usedDays} Tage</p>
                  <p>Geplant: {quotaStatus.plannedDays} Tage</p>
                  <p className="font-medium">Verfügbar: {quotaStatus.remainingDays} Tage</p>
                  <p>Dieser Antrag: {quotaStatus.requestedDays} Tage</p>
                  {quotaStatus.willExceed && (
                    <p className="text-destructive font-medium">
                      ⚠️ Dieser Antrag übersteigt Ihr Kontingent um {quotaStatus.exceededBy} Tage!
                    </p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Grund */}
          <div className="space-y-2">
            <Label htmlFor="reason">Grund/Bemerkungen</Label>
            <Textarea
              id="reason"
              placeholder="Optional: Zusätzliche Informationen..."
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={3}
            />
          </div>

          {/* Dokument-Upload für Krankmeldungen */}
          {formData.type === 'sick' && (
            <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <Label className="font-medium">Arbeitsunfähigkeitsbescheinigung (AU)</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Laden Sie hier Ihre AU-Bescheinigung hoch (optional, kann auch später nachgereicht werden)
              </p>
              <div>
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="sick-doc-upload"
                />
                <label htmlFor="sick-doc-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    asChild
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      {uploadedFile ? uploadedFile.name : 'Dokument auswählen'}
                    </div>
                  </Button>
                </label>
                {uploadedFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => setUploadedFile(null)}
                  >
                    Entfernen
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Erlaubt: JPG, PNG, PDF (max. 10MB)
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          {(isCheckingConflicts || isCheckingQuota) && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              Prüfe Verfügbarkeit...
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || uploading || conflicts.some(c => c.severity === 'error')}
            >
              {isSubmitting || uploading ? 'Wird eingereicht...' : 'Antrag einreichen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
