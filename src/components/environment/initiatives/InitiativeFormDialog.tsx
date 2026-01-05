
import React, { useState, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
  SelectValue
} from '@/components/ui/select';

interface Initiative {
  id?: string;
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate?: string;
  progress: number;
  responsible?: string;
  budget?: number;
  tags?: string[];
}

interface InitiativeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (initiative: Omit<Initiative, 'id'>) => void;
  initiative?: Initiative;
}

export const InitiativeFormDialog: React.FC<InitiativeFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initiative
}) => {
  const isEditing = !!initiative?.id;
  
  const [formData, setFormData] = useState<Omit<Initiative, 'id'>>({
    title: initiative?.title || '',
    description: initiative?.description || '',
    status: initiative?.status || 'planned',
    startDate: initiative?.startDate || new Date().toISOString().slice(0, 10),
    endDate: initiative?.endDate || '',
    progress: initiative?.progress || 0,
    responsible: initiative?.responsible || '',
    budget: initiative?.budget || undefined,
    tags: initiative?.tags || []
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Initiative bearbeiten' : 'Neue Initiative erstellen'}</DialogTitle>
          <DialogDescription>
            Füllen Sie die folgenden Felder aus, um eine Umweltinitiative {isEditing ? 'zu bearbeiten' : 'zu erstellen'}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Titel der Initiative"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Beschreibung der Initiative"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Startdatum</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Enddatum (optional)</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Geplant</SelectItem>
                <SelectItem value="in-progress">In Bearbeitung</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="archived">Archiviert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="progress">Fortschritt (%)</Label>
            <Input
              id="progress"
              name="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={handleNumberChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="responsible">Verantwortliche Person</Label>
            <Input
              id="responsible"
              name="responsible"
              value={formData.responsible}
              onChange={handleChange}
              placeholder="Name der verantwortlichen Person"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget">Budget (€)</Label>
            <Input
              id="budget"
              name="budget"
              type="number"
              step="0.01"
              value={formData.budget !== undefined ? formData.budget : ''}
              onChange={handleNumberChange}
              placeholder="Budget in Euro"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit">
              {isEditing ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
