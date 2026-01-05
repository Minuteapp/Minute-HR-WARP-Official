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
import { useRequestEquipment } from '@/integrations/supabase/hooks/useEmployeeRemoteWork';
import { Euro } from 'lucide-react';

const schema = z.object({
  item_name: z.string().min(3, 'Name muss mindestens 3 Zeichen lang sein'),
  item_category: z.string().min(1, 'Bitte Kategorie auswählen'),
  estimated_cost: z.number().min(0, 'Kosten müssen positiv sein'),
  justification: z.string().min(50, 'Begründung muss mindestens 50 Zeichen lang sein'),
});

type FormData = z.infer<typeof schema>;

interface RequestEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  budget: {
    amount: number;
    used: number;
    remaining: number;
    currency: string;
  };
}

export const RequestEquipmentDialog = ({
  open,
  onOpenChange,
  employeeId,
  budget,
}: RequestEquipmentDialogProps) => {
  const { toast } = useToast();
  const requestMutation = useRequestEquipment();

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
      item_name: '',
      item_category: '',
      estimated_cost: 0,
      justification: '',
    },
  });

  const estimatedCost = watch('estimated_cost');
  const exceedsBudget = estimatedCost > budget.remaining;

  const onSubmit = async (data: FormData) => {
    if (exceedsBudget) {
      toast({
        variant: 'destructive',
        title: 'Budget überschritten',
        description: `Die Kosten (${data.estimated_cost}€) überschreiten das verfügbare Budget (${budget.remaining}€)`,
      });
      return;
    }

    try {
      await requestMutation.mutateAsync({
        employee_id: employeeId,
        item_name: data.item_name,
        item_category: data.item_category,
        cost: data.estimated_cost,
        notes: data.justification,
        status: 'requested',
      });

      toast({
        title: 'Anfrage gesendet',
        description: 'Ihre Ausstattungsanfrage wurde erfolgreich eingereicht.',
      });

      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: error.message || 'Fehler beim Einreichen der Anfrage',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Zusätzliche Ausstattung beantragen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Budget-Anzeige */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Verfügbar</p>
              <p className="text-lg font-bold text-primary">
                {budget.amount} {budget.currency}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bereits genutzt</p>
              <p className="text-lg font-bold">{budget.used} {budget.currency}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verbleibend</p>
              <p className="text-lg font-bold text-green-600">
                {budget.remaining} {budget.currency}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="item_name">Ausrüstungsgegenstand *</Label>
              <Input
                id="item_name"
                placeholder="z.B. Dell UltraSharp 27 Monitor"
                {...register('item_name')}
              />
              {errors.item_name && (
                <p className="text-sm text-destructive mt-1">{errors.item_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="item_category">Kategorie *</Label>
              <Select
                onValueChange={(value) => setValue('item_category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monitor">🖥️ Monitor</SelectItem>
                  <SelectItem value="chair">🪑 Ergonomischer Stuhl</SelectItem>
                  <SelectItem value="desk">🪧 Schreibtisch</SelectItem>
                  <SelectItem value="keyboard_mouse">⌨️ Tastatur & Maus</SelectItem>
                  <SelectItem value="headset">🎧 Headset</SelectItem>
                  <SelectItem value="accessories">🔌 Zubehör</SelectItem>
                  <SelectItem value="other">📦 Sonstiges</SelectItem>
                </SelectContent>
              </Select>
              {errors.item_category && (
                <p className="text-sm text-destructive mt-1">{errors.item_category.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="estimated_cost">Geschätzte Kosten ({budget.currency}) *</Label>
              <div className="relative">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="estimated_cost"
                  type="number"
                  step="0.01"
                  className="pl-10"
                  placeholder="0.00"
                  {...register('estimated_cost', { valueAsNumber: true })}
                />
              </div>
              {exceedsBudget && (
                <p className="text-sm text-destructive mt-1">
                  ⚠️ Die Kosten überschreiten das verfügbare Budget
                </p>
              )}
              {errors.estimated_cost && (
                <p className="text-sm text-destructive mt-1">{errors.estimated_cost.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="justification">Begründung * (min. 50 Zeichen)</Label>
              <Textarea
                id="justification"
                placeholder="Bitte begründen Sie, warum Sie diese Ausstattung benötigen..."
                className="min-h-[120px]"
                {...register('justification')}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {watch('justification')?.length || 0} / 50 Zeichen
              </p>
              {errors.justification && (
                <p className="text-sm text-destructive mt-1">{errors.justification.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={requestMutation.isPending || exceedsBudget}>
              {requestMutation.isPending ? 'Wird gesendet...' : 'Anfrage einreichen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
