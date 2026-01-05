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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useCreateWorkationRequest } from '@/integrations/supabase/hooks/useEmployeeRemoteWork';
import { differenceInDays } from 'date-fns';
import { Plane, Calendar } from 'lucide-react';

const schema = z.object({
  country: z.string().min(1, 'Bitte Land auswählen'),
  city: z.string().min(2, 'Stadt muss mindestens 2 Zeichen lang sein'),
  start_date: z.string().min(1, 'Bitte Startdatum auswählen'),
  end_date: z.string().min(1, 'Bitte Enddatum auswählen'),
  reason: z.string().min(20, 'Begründung muss mindestens 20 Zeichen lang sein'),
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: 'Enddatum muss nach oder am Startdatum liegen',
  path: ['end_date'],
});

type FormData = z.infer<typeof schema>;

interface CreateWorkationRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  summary: {
    available_days: number;
    used_days: number;
    remaining_days: number;
    allowed_countries: string[];
  };
}

const COUNTRY_FLAGS: Record<string, string> = {
  'Spanien': '🇪🇸',
  'Portugal': '🇵🇹',
  'Italien': '🇮🇹',
  'Frankreich': '🇫🇷',
  'Griechenland': '🇬🇷',
  'Kroatien': '🇭🇷',
  'Österreich': '🇦🇹',
  'Schweiz': '🇨🇭',
  'Niederlande': '🇳🇱',
  'Belgien': '🇧🇪',
  'Polen': '🇵🇱',
  'Tschechien': '🇨🇿',
};

export const CreateWorkationRequestDialog = ({
  open,
  onOpenChange,
  employeeId,
  summary,
}: CreateWorkationRequestDialogProps) => {
  const { toast } = useToast();
  const createMutation = useCreateWorkationRequest();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      country: '',
      city: '',
      start_date: '',
      end_date: '',
      reason: '',
    },
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
    return Math.max(0, days);
  };

  const requestedDays = calculateDays();
  const exceedsLimit = requestedDays > summary.remaining_days;

  const onSubmit = async (data: FormData) => {
    if (exceedsLimit) {
      toast({
        variant: 'destructive',
        title: 'Tage-Limit überschritten',
        description: `Ihre Anfrage (${requestedDays} Tage) überschreitet die verfügbaren Tage (${summary.remaining_days})`,
      });
      return;
    }

    if (requestedDays > 30) {
      toast({
        variant: 'destructive',
        title: 'Maximale Dauer überschritten',
        description: 'Eine Workation darf maximal 30 Tage dauern',
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        employee_id: employeeId,
        country: data.country,
        city: data.city,
        start_date: data.start_date,
        end_date: data.end_date,
        days_count: requestedDays,
        status: 'ausstehend',
        notes: data.reason,
      });

      toast({
        title: 'Workation-Antrag eingereicht',
        description: `Ihr Antrag für ${requestedDays} Tage wurde erfolgreich eingereicht.`,
      });

      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message || 'Fehler beim Einreichen des Antrags',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Neue Workation beantragen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Verfügbare Tage Anzeige */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div>
              <p className="text-sm text-purple-700">Verfügbar 2025</p>
              <p className="text-lg font-bold text-purple-900">
                {summary.available_days} Tage
              </p>
            </div>
            <div>
              <p className="text-sm text-purple-700">Bereits genutzt</p>
              <p className="text-lg font-bold">{summary.used_days} Tage</p>
            </div>
            <div>
              <p className="text-sm text-purple-700">Verbleibend</p>
              <p className="text-lg font-bold text-green-600">
                {summary.remaining_days} Tage
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="country">Land *</Label>
              <Select onValueChange={(value) => setValue('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Land auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COUNTRY_FLAGS).map(([country, flag]) => (
                    <SelectItem key={country} value={country}>
                      <span className="flex items-center gap-2">
                        <span>{flag}</span>
                        <span>{country}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="city">Stadt *</Label>
              <Input
                id="city"
                placeholder="z.B. Barcelona, Lissabon, Rom..."
                {...register('city')}
              />
              {errors.city && (
                <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Startdatum *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="start_date"
                    type="date"
                    className="pl-10"
                    {...register('start_date')}
                  />
                </div>
                {errors.start_date && (
                  <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="end_date">Enddatum *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="end_date"
                    type="date"
                    className="pl-10"
                    {...register('end_date')}
                  />
                </div>
                {errors.end_date && (
                  <p className="text-sm text-destructive mt-1">{errors.end_date.message}</p>
                )}
              </div>
            </div>

            {/* Tage-Berechnung */}
            {startDate && endDate && (
              <div className={`p-4 rounded-lg border-2 ${
                exceedsLimit ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Beantragte Dauer</p>
                    <p className="text-2xl font-bold">{requestedDays} Tage</p>
                  </div>
                  {exceedsLimit && (
                    <div className="text-red-600">
                      <p className="text-sm font-medium">⚠️ Limit überschritten</p>
                      <p className="text-xs">Nur {summary.remaining_days} Tage verfügbar</p>
                    </div>
                  )}
                  {!exceedsLimit && requestedDays > 0 && (
                    <div className="text-green-600">
                      <p className="text-sm font-medium">✓ Innerhalb des Limits</p>
                      <p className="text-xs">
                        {summary.remaining_days - requestedDays} Tage verbleiben
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="reason">Begründung * (min. 20 Zeichen)</Label>
              <Textarea
                id="reason"
                placeholder="Bitte beschreiben Sie den Grund für Ihre Workation..."
                className="min-h-[100px]"
                {...register('reason')}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {watch('reason')?.length || 0} / 20 Zeichen
              </p>
              {errors.reason && (
                <p className="text-sm text-destructive mt-1">{errors.reason.message}</p>
              )}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Hinweis:</strong> Ihr Antrag wird an Ihren Vorgesetzten zur Genehmigung weitergeleitet. 
                Sie erhalten eine Benachrichtigung, sobald dieser bearbeitet wurde.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createMutation.isPending || exceedsLimit}>
              {createMutation.isPending ? 'Wird eingereicht...' : 'Antrag einreichen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
