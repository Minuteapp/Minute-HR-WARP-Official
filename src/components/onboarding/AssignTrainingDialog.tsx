import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Plus } from 'lucide-react';

interface AssignTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignTrainingDialog: React.FC<AssignTrainingDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [employee, setEmployee] = useState('');
  const [training, setTraining] = useState('');
  const [type, setType] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    // Handle form submission
    console.log({ employee, training, type, dueDate, notes });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schulung zuweisen</DialogTitle>
          <DialogDescription>
            Weisen Sie einem Mitarbeiter eine neue Schulung zu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Mitarbeiter auswählen *</Label>
            <Select value={employee} onValueChange={setEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="Mitarbeiter wählen" />
              </SelectTrigger>
              <SelectContent>
                {/* ZERO-DATA: Mitarbeiter werden dynamisch aus DB geladen */}
                <SelectItem value="placeholder" disabled>Bitte Mitarbeiter aus Datenbank laden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="training">Schulung auswählen *</Label>
            <Select value={training} onValueChange={setTraining}>
              <SelectTrigger>
                <SelectValue placeholder="Schulung wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="datenschutz">Datenschutz & DSGVO</SelectItem>
                <SelectItem value="arbeitssicherheit">Arbeitssicherheit</SelectItem>
                <SelectItem value="cybersecurity">Cybersecurity Basics</SelectItem>
                <SelectItem value="compliance">Compliance Training</SelectItem>
                <SelectItem value="produkt">Produktschulung A</SelectItem>
                <SelectItem value="agile">Agile Methodologie</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Schulungstyp *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Typ wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pflicht">Pflicht</SelectItem>
                <SelectItem value="Rollenspezifisch">Rollenspezifisch</SelectItem>
                <SelectItem value="Empfohlen">Empfohlen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Fälligkeitsdatum *</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Zusätzliche Informationen zur Schulung..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Plus className="h-4 w-4" />
            Schulung zuweisen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
