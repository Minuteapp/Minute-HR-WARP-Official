
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, Upload, Clock } from 'lucide-react';
import { useSickLeaveSubmission } from '@/hooks/useSickLeaveSubmission';

const sickLeaveSchema = z.object({
  startDate: z.date({
    required_error: "Bitte wählen Sie ein Startdatum",
  }),
  endDate: z.date({
    required_error: "Bitte wählen Sie ein Enddatum",
  }).optional(),
  isPartialDay: z.boolean().default(false),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  reason: z.string().min(3, "Bitte geben Sie einen Grund an"),
  hasContactedDoctor: z.boolean().default(false),
  isChildSickLeave: z.boolean().default(false),
  childName: z.string().optional(),
  notes: z.string().optional(),
  confirmAccuracy: z.boolean({
    required_error: "Sie müssen die Richtigkeit der Angaben bestätigen",
  }),
});

type SickLeaveFormValues = z.infer<typeof sickLeaveSchema>;

interface SickLeaveFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const SickLeaveForm = ({ onSuccess, onCancel }: SickLeaveFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { submitSickLeave } = useSickLeaveSubmission();
  
  const form = useForm<SickLeaveFormValues>({
    resolver: zodResolver(sickLeaveSchema),
    defaultValues: {
      startDate: new Date(),
      endDate: new Date(),
      isPartialDay: false,
      startTime: undefined,
      endTime: undefined,
      reason: '',
      hasContactedDoctor: false,
      isChildSickLeave: false,
      childName: '',
      notes: '',
      confirmAccuracy: false,
    },
  });
  
  const isPartialDay = form.watch('isPartialDay');
  const isChildSickLeave = form.watch('isChildSickLeave');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => file.size <= 3 * 1024 * 1024); // Max 3MB
      
      if (validFiles.length !== newFiles.length) {
        toast({
          variant: "destructive",
          title: "Dateigröße überschritten",
          description: "Einige Dateien wurden nicht hinzugefügt, da sie größer als 3MB sind.",
        });
      }
      
      setFiles(prev => [...prev, ...validFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const onSubmit = async (data: SickLeaveFormValues) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Sie müssen angemeldet sein, um eine Krankmeldung einzureichen.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await submitSickLeave({
        userData: data,
        files,
        userId: user.id,
      });
      
      toast({
        title: "Krankmeldung eingereicht",
        description: "Ihre Krankmeldung wurde erfolgreich eingereicht.",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: error.message || "Beim Einreichen Ihrer Krankmeldung ist ein Fehler aufgetreten.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Vordefinierte Grund-Optionen
  const reasonOptions = [
    { label: "Grippaler Infekt", value: "grippaler_infekt" },
    { label: "Rückenbeschwerden", value: "rueckenbeschwerden" },
    { label: "Magen-Darm-Erkrankung", value: "magen_darm" },
    { label: "Psychische Belastung", value: "psychische_belastung" },
    { label: "Sonstiges", value: "sonstiges" }
  ];
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Neue Krankmeldung einreichen</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="startDate">Von</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal mt-1"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('startDate') ? (
                    format(form.watch('startDate'), 'PPP', { locale: de })
                  ) : (
                    <span>Datum auswählen</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch('startDate')}
                  onSelect={(date) => form.setValue('startDate', date || new Date())}
                  disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 14))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.startDate && (
              <span className="text-sm text-destructive">{form.formState.errors.startDate.message}</span>
            )}
          </div>
          
          <div>
            <Label htmlFor="endDate">Bis (voraussichtlich)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal mt-1"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('endDate') ? (
                    format(form.watch('endDate'), 'PPP', { locale: de })
                  ) : (
                    <span>Datum auswählen</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch('endDate')}
                  onSelect={(date) => form.setValue('endDate', date || form.watch('startDate'))}
                  disabled={(date) => date < form.watch('startDate')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isPartialDay"
              checked={isPartialDay}
              onCheckedChange={(checked) => form.setValue('isPartialDay', checked)}
            />
            <Label htmlFor="isPartialDay">Teilweiser Ausfall (stundenweise)</Label>
          </div>
          
          {isPartialDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Von Uhrzeit</Label>
                <div className="flex items-center mt-1">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startTime"
                    type="time"
                    {...form.register('startTime')}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="endTime">Bis Uhrzeit</Label>
                <div className="flex items-center mt-1">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endTime"
                    type="time"
                    {...form.register('endTime')}
                  />
                </div>
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="reason">Grund der Krankmeldung</Label>
            <Select 
              onValueChange={(value) => form.setValue('reason', value)}
              defaultValue={form.watch('reason') || undefined}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Grund auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {reasonOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {form.watch('reason') === 'sonstiges' && (
              <Textarea
                placeholder="Bitte spezifizieren Sie den Grund"
                className="mt-2"
                {...form.register('notes')}
              />
            )}
            {form.formState.errors.reason && (
              <span className="text-sm text-destructive">{form.formState.errors.reason.message}</span>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasContactedDoctor"
              checked={form.watch('hasContactedDoctor')}
              onCheckedChange={(checked) => form.setValue('hasContactedDoctor', !!checked)}
            />
            <Label htmlFor="hasContactedDoctor">Arzt kontaktiert</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isChildSickLeave"
              checked={isChildSickLeave}
              onCheckedChange={(checked) => form.setValue('isChildSickLeave', !!checked)}
            />
            <Label htmlFor="isChildSickLeave">Krankmeldung für Kind</Label>
          </div>
          
          {isChildSickLeave && (
            <div>
              <Label htmlFor="childName">Name des Kindes</Label>
              <Input
                id="childName"
                className="mt-1"
                {...form.register('childName')}
              />
            </div>
          )}
          
          <div>
            <Label>Arbeitsunfähigkeitsbescheinigung (max. 3 MB)</Label>
            <div className="mt-1 border-2 border-dashed border-gray-300 rounded-md p-4">
              <label className="flex justify-center cursor-pointer">
                <Input
                  id="fileUpload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="sr-only"
                  multiple
                />
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Klicken Sie, um Dateien hochzuladen</span>
                  <span className="text-xs text-gray-400">PDF, JPG, PNG (max. 3 MB)</span>
                </div>
              </label>
            </div>
            
            {files.length > 0 && (
              <div className="mt-2 space-y-2">
                <Label>Hochgeladene Dateien:</Label>
                <ul className="text-sm">
                  {files.map((file, index) => (
                    <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Entfernen
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Weitere Informationen"
              className="mt-1"
              {...form.register('notes')}
            />
          </div>
          
          <div className="pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirmAccuracy"
                checked={form.watch('confirmAccuracy')}
                onCheckedChange={(checked) => form.setValue('confirmAccuracy', !!checked)}
              />
              <Label htmlFor="confirmAccuracy" className="text-sm">
                Ich bestätige, dass alle Angaben richtig und vollständig sind
              </Label>
            </div>
            {form.formState.errors.confirmAccuracy && (
              <span className="text-sm text-destructive">{form.formState.errors.confirmAccuracy.message}</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Abbrechen
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !form.watch('confirmAccuracy')}
        >
          {isSubmitting ? 'Wird eingereicht...' : 'Krankmeldung einreichen'}
        </Button>
      </div>
    </form>
  );
};

export default SickLeaveForm;
