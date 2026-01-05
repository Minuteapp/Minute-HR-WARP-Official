import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useUpdateHomeofficeAgreement } from '@/integrations/supabase/hooks/useEmployeeRemoteWork';

const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];

const schema = z.object({
  model_type: z.enum(['2_days_week', '3_days_week', '4_days_week', 'full_remote', 'hybrid']),
  days_per_week: z.number().min(1).max(5),
  preferred_home_days: z.array(z.string()),
  office_days: z.array(z.string()),
  core_hours_start: z.string(),
  core_hours_end: z.string(),
  valid_since: z.string(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface EditHomeofficeAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreement: any;
  employeeId: string;
}

export const EditHomeofficeAgreementDialog = ({
  open,
  onOpenChange,
  agreement,
  employeeId,
}: EditHomeofficeAgreementDialogProps) => {
  const { toast } = useToast();
  const updateMutation = useUpdateHomeofficeAgreement();
  
  const [selectedHomeDays, setSelectedHomeDays] = useState<string[]>(
    agreement?.preferred_home_days || []
  );
  const [selectedOfficeDays, setSelectedOfficeDays] = useState<string[]>(
    agreement?.office_days || []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      model_type: agreement?.model_type || '3_days_week',
      days_per_week: agreement?.days_per_week || 3,
      preferred_home_days: agreement?.preferred_home_days || [],
      office_days: agreement?.office_days || [],
      core_hours_start: agreement?.core_hours_start || '10:00',
      core_hours_end: agreement?.core_hours_end || '16:00',
      valid_since: agreement?.valid_since || new Date().toISOString().split('T')[0],
      notes: agreement?.notes || '',
    },
  });

  const daysPerWeek = watch('days_per_week');
  const remotePercentage = Math.round((daysPerWeek / 5) * 100);
  const officePercentage = 100 - remotePercentage;

  const toggleHomeDay = (day: string) => {
    const updated = selectedHomeDays.includes(day)
      ? selectedHomeDays.filter((d) => d !== day)
      : [...selectedHomeDays, day];
    setSelectedHomeDays(updated);
    setValue('preferred_home_days', updated);
  };

  const toggleOfficeDay = (day: string) => {
    const updated = selectedOfficeDays.includes(day)
      ? selectedOfficeDays.filter((d) => d !== day)
      : [...selectedOfficeDays, day];
    setSelectedOfficeDays(updated);
    setValue('office_days', updated);
  };

  const onSubmit = async (data: FormData) => {
    try {
      await updateMutation.mutateAsync({
        employee_id: employeeId,
        id: agreement?.id,
        ...data,
        remote_percentage: remotePercentage,
        office_percentage: officePercentage,
      });

      toast({
        title: 'Homeoffice-Vereinbarung aktualisiert',
        description: 'Die Änderungen wurden erfolgreich gespeichert.',
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message || 'Fehler beim Aktualisieren der Vereinbarung',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Homeoffice-Vereinbarung anpassen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Homeoffice-Modell</Label>
              <RadioGroup
                defaultValue={agreement?.model_type || '3_days_week'}
                onValueChange={(value) => {
                  setValue('model_type', value as any);
                  const days = value === '2_days_week' ? 2 : value === '3_days_week' ? 3 : value === '4_days_week' ? 4 : 5;
                  setValue('days_per_week', days);
                }}
                className="grid grid-cols-2 gap-4 mt-2"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="2_days_week" id="2_days" />
                  <Label htmlFor="2_days" className="cursor-pointer">2 Tage / Woche</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="3_days_week" id="3_days" />
                  <Label htmlFor="3_days" className="cursor-pointer">3 Tage / Woche</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="4_days_week" id="4_days" />
                  <Label htmlFor="4_days" className="cursor-pointer">4 Tage / Woche</Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="full_remote" id="full_remote" />
                  <Label htmlFor="full_remote" className="cursor-pointer">Vollständig Remote</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Remote-Anteil</p>
                <p className="text-2xl font-bold text-primary">{remotePercentage}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Büro-Anteil</p>
                <p className="text-2xl font-bold">{officePercentage}%</p>
              </div>
            </div>

            <div>
              <Label>Bevorzugte Homeoffice-Tage</Label>
              <div className="flex gap-2 mt-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className={`flex items-center justify-center w-12 h-12 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedHomeDays.includes(day)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary'
                    }`}
                    onClick={() => toggleHomeDay(day)}
                  >
                    <span className="font-semibold">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Büro-Präsenztage</Label>
              <div className="flex gap-2 mt-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className={`flex items-center justify-center w-12 h-12 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedOfficeDays.includes(day)
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-border hover:border-blue-600'
                    }`}
                    onClick={() => toggleOfficeDay(day)}
                  >
                    <span className="font-semibold">{day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="core_hours_start">Kernarbeitszeit Start</Label>
                <Input
                  id="core_hours_start"
                  type="time"
                  {...register('core_hours_start')}
                />
              </div>
              <div>
                <Label htmlFor="core_hours_end">Kernarbeitszeit Ende</Label>
                <Input
                  id="core_hours_end"
                  type="time"
                  {...register('core_hours_end')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="valid_since">Gültig ab</Label>
              <Input
                id="valid_since"
                type="date"
                {...register('valid_since')}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notizen (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Zusätzliche Anmerkungen zur Vereinbarung..."
                {...register('notes')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
