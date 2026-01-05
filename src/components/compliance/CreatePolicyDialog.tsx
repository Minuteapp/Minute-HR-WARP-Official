
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useCreateCompliancePolicy } from '@/hooks/useCompliance';
import type { CompliancePolicy } from '@/types/compliance';

interface CreatePolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormData = Omit<CompliancePolicy, 'id' | 'created_at' | 'updated_at' | 'created_by'>;

export const CreatePolicyDialog = ({ open, onOpenChange }: CreatePolicyDialogProps) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      version: '1.0',
      language: 'de',
      requires_acknowledgment: true,
      is_active: true,
    }
  });
  const createPolicy = useCreateCompliancePolicy();
  const [effectiveDate, setEffectiveDate] = React.useState<Date>(new Date());
  const [expiryDate, setExpiryDate] = React.useState<Date>();

  const requiresAcknowledgment = watch('requires_acknowledgment');
  const isActive = watch('is_active');

  const onSubmit = (data: FormData) => {
    const policyData = {
      ...data,
      effective_date: effectiveDate.toISOString().split('T')[0],
      expiry_date: expiryDate?.toISOString().split('T')[0],
      metadata: {}
    };

    createPolicy.mutate(policyData, {
      onSuccess: () => {
        reset();
        setEffectiveDate(new Date());
        setExpiryDate(undefined);
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Richtlinie erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie eine neue Unternehmensrichtlinie oder ein neues Verfahren.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Titel ist erforderlich' })}
                placeholder="Titel der Richtlinie"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="policy_type">Richtlinientyp *</Label>
              <Select onValueChange={(value) => setValue('policy_type', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Typ auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="code_of_conduct">Verhaltenskodex</SelectItem>
                  <SelectItem value="data_protection">Datenschutz</SelectItem>
                  <SelectItem value="it_security">IT-Sicherheit</SelectItem>
                  <SelectItem value="hr_policy">HR-Richtlinie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Kurze Beschreibung der Richtlinie"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Inhalt *</Label>
            <Textarea
              id="content"
              {...register('content', { required: 'Inhalt ist erforderlich' })}
              placeholder="Vollständiger Inhalt der Richtlinie"
              rows={8}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                {...register('version')}
                placeholder="z.B. 1.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Sprache</Label>
              <Select onValueChange={(value) => setValue('language', value)} defaultValue="de">
                <SelectTrigger>
                  <SelectValue placeholder="Sprache wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file_path">Dateipfad</Label>
              <Input
                id="file_path"
                {...register('file_path')}
                placeholder="Pfad zur Richtliniendatei"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gültig ab *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !effectiveDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {effectiveDate ? format(effectiveDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={effectiveDate}
                    onSelect={setEffectiveDate}
                    initialFocus
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Gültig bis (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expiryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={setExpiryDate}
                    initialFocus
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label>Bestätigung erforderlich</Label>
              <p className="text-sm text-gray-500">
                Mitarbeiter müssen diese Richtlinie explizit bestätigen
              </p>
            </div>
            <Switch
              checked={requiresAcknowledgment}
              onCheckedChange={(checked) => setValue('requires_acknowledgment', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label>Aktiv</Label>
              <p className="text-sm text-gray-500">
                Diese Richtlinie ist aktiv und gültig
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createPolicy.isPending}>
              {createPolicy.isPending ? 'Wird erstellt...' : 'Richtlinie erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
