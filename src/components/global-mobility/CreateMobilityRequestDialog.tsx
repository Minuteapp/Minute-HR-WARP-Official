
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCreateGlobalMobilityRequest } from '@/hooks/useGlobalMobility';
import type { GlobalMobilityRequest } from '@/types/global-mobility';

interface CreateMobilityRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateMobilityRequestDialog: React.FC<CreateMobilityRequestDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [formData, setFormData] = useState({
    title: '',
    request_type: 'relocation' as const,
    description: '',
    current_location: '',
    destination_location: '',
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    priority: 'medium' as const,
    estimated_cost: '',
    business_justification: ''
  });

  const createMutation = useCreateGlobalMobilityRequest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestData: Omit<GlobalMobilityRequest, 'id' | 'created_at' | 'updated_at'> = {
      employee_id: '', // Will be set by the hook
      title: formData.title,
      request_type: formData.request_type,
      status: 'draft',
      description: formData.description,
      current_location: formData.current_location,
      destination_location: formData.destination_location,
      start_date: formData.start_date?.toISOString(),
      end_date: formData.end_date?.toISOString(),
      priority: formData.priority,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : undefined,
      business_justification: formData.business_justification
    };

    try {
      await createMutation.mutateAsync(requestData);
      onOpenChange(false);
      setFormData({
        title: '',
        request_type: 'relocation',
        description: '',
        current_location: '',
        destination_location: '',
        start_date: undefined,
        end_date: undefined,
        priority: 'medium',
        estimated_cost: '',
        business_justification: ''
      });
    } catch (error) {
      console.error('Error creating mobility request:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neuer Global Mobility Antrag</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen internationalen Mitarbeiterentsendungsantrag
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="z.B. Entsendung nach New York"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="request_type">Antragstyp *</Label>
              <Select 
                value={formData.request_type} 
                onValueChange={(value: any) => setFormData({ ...formData, request_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relocation">Umzug</SelectItem>
                  <SelectItem value="assignment">Entsendung</SelectItem>
                  <SelectItem value="transfer">Versetzung</SelectItem>
                  <SelectItem value="visa_support">Visa Support</SelectItem>
                  <SelectItem value="remote_work">Remote Arbeit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_location">Aktueller Standort</Label>
              <Input
                id="current_location"
                value={formData.current_location}
                onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                placeholder="z.B. Berlin, Deutschland"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination_location">Zielstandort *</Label>
              <Input
                id="destination_location"
                value={formData.destination_location}
                onChange={(e) => setFormData({ ...formData, destination_location: e.target.value })}
                placeholder="z.B. New York, USA"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Startdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : <span>Datum wählen</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData({ ...formData, start_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Enddatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP") : <span>Datum wählen</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData({ ...formData, end_date: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priorität</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="urgent">Dringend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_cost">Geschätzte Kosten (€)</Label>
              <Input
                id="estimated_cost"
                type="number"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                placeholder="0"
                min="0"
                step="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detaillierte Beschreibung der Entsendung..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_justification">Geschäftliche Begründung</Label>
            <Textarea
              id="business_justification"
              value={formData.business_justification}
              onChange={(e) => setFormData({ ...formData, business_justification: e.target.value })}
              placeholder="Begründung für die geschäftliche Notwendigkeit..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Antrag erstellen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
