import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useSickLeaveRecords } from '@/hooks/employee-tabs/useSickLeaveRecords';
import { FileText, Download, Calendar, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sickLeaveSchema, type SickLeaveFormData } from '@/lib/validations/priority2Schemas';

interface SickLeaveTabNewProps {
  employeeId: string;
}

export const SickLeaveTabNew = ({ employeeId }: SickLeaveTabNewProps) => {
  const { sickLeaveRecords, statistics, createSickLeave } = useSickLeaveRecords(employeeId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<SickLeaveFormData>({
    resolver: zodResolver(sickLeaveSchema),
    defaultValues: {
      is_partial_day: false,
      is_work_related: false,
      is_child_sick_leave: false,
      has_contacted_doctor: false,
    }
  });

  const isPartialDay = watch('is_partial_day');
  const isChildSickLeave = watch('is_child_sick_leave');
  const hasContactedDoctor = watch('has_contacted_doctor');

  const handleFormSubmit = async (data: SickLeaveFormData) => {
    setIsSubmitting(true);
    try {
      let certificateUrl = null;

      // Upload certificate if provided
      if (certificateFile) {
        const fileExt = certificateFile.name.split('.').pop();
        const fileName = `${employeeId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('sick-leave-documents')
          .upload(fileName, certificateFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('sick-leave-documents')
          .getPublicUrl(fileName);

        certificateUrl = publicUrl;
      }

      await createSickLeave({
        record: {
          start_date: data.start_date!,
          end_date: data.end_date,
          is_partial_day: data.is_partial_day || false,
          start_time: data.start_time,
          end_time: data.end_time,
          reason: data.reason,
          diagnosis_category: data.diagnosis_category,
          is_work_related: data.is_work_related || false,
          is_child_sick_leave: data.is_child_sick_leave || false,
          child_name: data.child_name,
          has_contacted_doctor: data.has_contacted_doctor || false,
          doctor_contact_date: data.doctor_contact_date,
          notes: data.notes,
          employee_id: employeeId,
          sick_note_url: certificateUrl,
          status: 'pending',
        },
      });

      reset();
      setCertificateFile(null);
      toast.success('Krankmeldung erfolgreich eingereicht');
    } catch (error) {
      console.error('Error submitting sick leave:', error);
      toast.error('Fehler beim Einreichen der Krankmeldung');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCertificate = async (url: string) => {
    window.open(url, '_blank');
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Krankheitstage (YTD)</p>
              <p className="text-2xl font-bold">{statistics.totalDays}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ø Dauer</p>
              <p className="text-2xl font-bold">{statistics.avgDuration} Tage</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Anzahl Fälle</p>
              <p className="text-2xl font-bold">{statistics.totalCases}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quote</p>
              <p className="text-2xl font-bold">{statistics.sickDayRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Wichtige Hinweise zur Krankmeldung:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Bitte melden Sie sich umgehend telefonisch bei Ihrem Vorgesetzten</li>
              <li>AU-Bescheinigung ab dem 4. Krankheitstag erforderlich</li>
              <li>Bei längerer Erkrankung bitte wöchentlich Rückmeldung geben</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Sick Leave Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Neue Krankmeldung</h3>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Von *</Label>
              <Input id="start_date" type="date" {...register('start_date')} />
              {errors.start_date && (
                <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_date">Bis (voraussichtlich)</Label>
              <Input id="end_date" type="date" {...register('end_date')} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_partial_day"
              checked={isPartialDay}
              onCheckedChange={(checked) => setValue('is_partial_day', checked as boolean)}
            />
            <Label htmlFor="is_partial_day" className="font-normal">
              Teilzeit-Krankmeldung (nur bestimmte Stunden)
            </Label>
          </div>

          {isPartialDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Von (Uhrzeit)</Label>
                <Input id="start_time" type="time" {...register('start_time')} />
              </div>

              <div>
                <Label htmlFor="end_time">Bis (Uhrzeit)</Label>
                <Input id="end_time" type="time" {...register('end_time')} />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="diagnosis_category">Art der Erkrankung</Label>
            <Select 
              value={watch('diagnosis_category') || ''} 
              onValueChange={(value: any) => setValue('diagnosis_category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Bitte auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common_cold">Erkältung</SelectItem>
                <SelectItem value="flu">Grippe</SelectItem>
                <SelectItem value="injury">Verletzung</SelectItem>
                <SelectItem value="surgery">Operation</SelectItem>
                <SelectItem value="mental_health">Psychische Gesundheit</SelectItem>
                <SelectItem value="chronic">Chronische Erkrankung</SelectItem>
                <SelectItem value="other">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_work_related"
              checked={watch('is_work_related')}
              onCheckedChange={(checked) => setValue('is_work_related', checked as boolean)}
            />
            <Label htmlFor="is_work_related" className="font-normal">
              Arbeitsunfall
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_child_sick_leave"
              checked={isChildSickLeave}
              onCheckedChange={(checked) => setValue('is_child_sick_leave', checked as boolean)}
            />
            <Label htmlFor="is_child_sick_leave" className="font-normal">
              Krankmeldung wegen krankem Kind
            </Label>
          </div>

          {isChildSickLeave && (
            <div>
              <Label htmlFor="child_name">Name des Kindes</Label>
              <Input id="child_name" {...register('child_name')} />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_contacted_doctor"
              checked={hasContactedDoctor}
              onCheckedChange={(checked) => setValue('has_contacted_doctor', checked as boolean)}
            />
            <Label htmlFor="has_contacted_doctor" className="font-normal">
              Arzt kontaktiert
            </Label>
          </div>

          {hasContactedDoctor && (
            <div>
              <Label htmlFor="doctor_contact_date">Datum des Arztbesuchs</Label>
              <Input id="doctor_contact_date" type="date" {...register('doctor_contact_date')} />
            </div>
          )}

          <div>
            <Label htmlFor="certificate">AU-Bescheinigung hochladen</Label>
            <Input 
              id="certificate" 
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Erlaubte Formate: PDF, JPG, PNG (max. 10 MB)
            </p>
          </div>

          <div>
            <Label htmlFor="notes">Notizen</Label>
            <Textarea id="notes" {...register('notes')} rows={3} />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Wird eingereicht...' : 'Krankmeldung absenden'}
          </Button>
        </form>
      </Card>

      {/* History */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Krankmeldungs-Historie</h3>
        <div className="space-y-3">
          {sickLeaveRecords.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Keine Krankmeldungen vorhanden.</p>
            </Card>
          ) : (
            sickLeaveRecords.map((record) => (
              <Card key={record.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">
                        {new Date(record.start_date).toLocaleDateString('de-DE')}
                        {record.end_date && ` - ${new Date(record.end_date).toLocaleDateString('de-DE')}`}
                      </h4>
                      <Badge>
                        {calculateDuration(record.start_date, record.end_date)} Tag(e)
                      </Badge>
                      {record.sick_note_url && (
                        <Badge className="bg-green-100 text-green-800">
                          <FileText className="h-3 w-3 mr-1" />
                          AU vorhanden
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      {record.diagnosis_category && (
                        <p>Kategorie: {record.diagnosis_category}</p>
                      )}
                      {record.is_work_related && (
                        <p className="text-orange-600">⚠️ Arbeitsunfall</p>
                      )}
                      {record.is_child_sick_leave && (
                        <p>👶 Kind krank: {record.child_name}</p>
                      )}
                      {record.notes && (
                        <p className="mt-2">{record.notes}</p>
                      )}
                    </div>
                  </div>

                  {record.sick_note_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadCertificate(record.sick_note_url!)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      AU herunterladen
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
