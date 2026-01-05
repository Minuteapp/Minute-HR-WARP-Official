
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { useCreateComplianceCase } from '@/hooks/useCompliance';
import type { ComplianceCase } from '@/types/compliance';

interface CreateComplianceCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormData = Omit<ComplianceCase, 'id' | 'case_number' | 'created_at' | 'updated_at'>;

export const CreateComplianceCaseDialog = ({ open, onOpenChange }: CreateComplianceCaseDialogProps) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>();
  const createCase = useCreateComplianceCase();
  const [dueDate, setDueDate] = React.useState<Date>();

  const onSubmit = (data: FormData) => {
    const caseData = {
      ...data,
      due_date: dueDate?.toISOString(),
      metadata: {}
    };

    createCase.mutate(caseData, {
      onSuccess: () => {
        reset();
        setDueDate(undefined);
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuen Compliance-Fall erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Compliance-Fall zur Bearbeitung und Nachverfolgung.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Titel ist erforderlich' })}
                placeholder="Titel des Falls"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="case_type">Falltyp *</Label>
              <Select onValueChange={(value) => setValue('case_type', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Falltyp auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gdpr_request">DSGVO-Anfrage</SelectItem>
                  <SelectItem value="policy_violation">Richtlinienverletzung</SelectItem>
                  <SelectItem value="audit">Audit</SelectItem>
                  <SelectItem value="incident">Vorfall</SelectItem>
                  <SelectItem value="risk_assessment">Risikobeurteilung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detaillierte Beschreibung des Falls"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priorität *</Label>
              <Select onValueChange={(value) => setValue('priority', value as any)} defaultValue="medium">
                <SelectTrigger>
                  <SelectValue placeholder="Priorität wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Kritisch</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select onValueChange={(value) => setValue('status', value as any)} defaultValue="open">
                <SelectTrigger>
                  <SelectValue placeholder="Status wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Offen</SelectItem>
                  <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                  <SelectItem value="escalated">Eskaliert</SelectItem>
                  <SelectItem value="closed">Geschlossen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fälligkeitsdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Abteilung</Label>
              <Input
                id="department"
                {...register('department')}
                placeholder="Betroffene Abteilung"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Standort</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Betroffener Standort"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="risk_score">Risiko-Score (0-100)</Label>
            <Input
              id="risk_score"
              type="number"
              min="0"
              max="100"
              {...register('risk_score', { 
                valueAsNumber: true,
                min: { value: 0, message: 'Mindestens 0' },
                max: { value: 100, message: 'Maximal 100' }
              })}
              placeholder="Risiko-Bewertung"
            />
            {errors.risk_score && (
              <p className="text-sm text-red-500">{errors.risk_score.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createCase.isPending}>
              {createCase.isPending ? 'Wird erstellt...' : 'Fall erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
