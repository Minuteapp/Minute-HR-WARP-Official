import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CareerEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  entry?: any;
  mode: 'create' | 'edit';
}

export const CareerEntryDialog = ({ open, onOpenChange, onSubmit, entry, mode }: CareerEntryDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    position_title: '',
    department: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  useEffect(() => {
    if (entry && mode === 'edit') {
      setFormData({
        position_title: entry.position_title || '',
        department: entry.department || '',
        start_date: entry.start_date?.split('T')[0] || '',
        end_date: entry.end_date?.split('T')[0] || '',
        description: entry.description || '',
      });
    } else {
      setFormData({
        position_title: '',
        department: '',
        start_date: '',
        end_date: '',
        description: '',
      });
    }
  }, [entry, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting career entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Neue Karrierestation hinzufügen' : 'Karrierestation bearbeiten'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="position_title">Position *</Label>
            <Input 
              id="position_title" 
              value={formData.position_title}
              onChange={(e) => setFormData(prev => ({ ...prev, position_title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="department">Abteilung</Label>
            <Input 
              id="department" 
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Startdatum *</Label>
              <Input 
                id="start_date" 
                type="date" 
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">Enddatum</Label>
              <Input 
                id="end_date" 
                type="date" 
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea 
              id="description" 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Wird gespeichert...' : mode === 'create' ? 'Hinzufügen' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
