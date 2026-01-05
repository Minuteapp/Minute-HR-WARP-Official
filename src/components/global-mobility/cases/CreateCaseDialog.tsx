
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateGlobalMobilityRequest } from '@/hooks/useGlobalMobility';
import { toast } from "sonner";

interface CreateCaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCaseDialog = ({ open, onOpenChange }: CreateCaseDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    employee_id: '',
    request_type: 'assignment' as const,
    current_location: '',
    destination_location: '',
    start_date: '',
    end_date: '',
    priority: 'medium' as const,
    estimated_cost: '',
    business_justification: ''
  });

  const { mutate: createRequest, isPending } = useCreateGlobalMobilityRequest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.employee_id) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    createRequest({
      title: formData.title,
      description: formData.description,
      employee_id: formData.employee_id,
      request_type: formData.request_type,
      current_location: formData.current_location,
      destination_location: formData.destination_location,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      priority: formData.priority,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : undefined,
      business_justification: formData.business_justification,
      status: 'draft'
    }, {
      onSuccess: () => {
        toast.success('Entsendung erfolgreich erstellt');
        onOpenChange(false);
        setFormData({
          title: '',
          description: '',
          employee_id: '',
          request_type: 'assignment',
          current_location: '',
          destination_location: '',
          start_date: '',
          end_date: '',
          priority: 'medium',
          estimated_cost: '',
          business_justification: ''
        });
      },
      onError: () => {
        toast.error('Fehler beim Erstellen der Entsendung');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Entsendung erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="z.B. Entsendung Frankfurt → London"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee_id">Mitarbeiter-ID *</Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                placeholder="z.B. EMP-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="request_type">Entsendungstyp</Label>
              <Select
                value={formData.request_type}
                onValueChange={(value: any) => setFormData({ ...formData, request_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment">Langfristige Entsendung</SelectItem>
                  <SelectItem value="transfer">Kurzfristige Entsendung</SelectItem>
                  <SelectItem value="relocation">Relocation</SelectItem>
                  <SelectItem value="visa_support">Projekt-Entsendung</SelectItem>
                  <SelectItem value="remote_work">Expat</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_location">Aktueller Standort</Label>
              <Input
                id="current_location"
                value={formData.current_location}
                onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                placeholder="z.B. Frankfurt, Germany"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination_location">Zielstandort</Label>
              <Input
                id="destination_location"
                value={formData.destination_location}
                onChange={(e) => setFormData({ ...formData, destination_location: e.target.value })}
                placeholder="z.B. London, UK"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Startdatum</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Enddatum</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimated_cost">Geschätzte Kosten (EUR)</Label>
            <Input
              id="estimated_cost"
              type="number"
              value={formData.estimated_cost}
              onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
              placeholder="z.B. 150000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Kurze Beschreibung der Entsendung..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_justification">Geschäftliche Begründung</Label>
            <Textarea
              id="business_justification"
              value={formData.business_justification}
              onChange={(e) => setFormData({ ...formData, business_justification: e.target.value })}
              placeholder="Warum ist diese Entsendung notwendig?"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Erstelle...' : 'Entsendung erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
