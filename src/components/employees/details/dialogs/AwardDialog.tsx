import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AwardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  award?: any;
  mode: 'create' | 'edit';
}

export const AwardDialog = ({ open, onOpenChange, onSubmit, award, mode }: AwardDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    award_name: '',
    award_category: 'Leistung',
    description: '',
    awarded_date: new Date().toISOString().split('T')[0],
    awarded_by: '',
  });

  useEffect(() => {
    if (award && mode === 'edit') {
      setFormData({
        award_name: award.award_name || '',
        award_category: award.award_category || 'Leistung',
        description: award.description || '',
        awarded_date: award.awarded_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        awarded_by: award.awarded_by || '',
      });
    } else {
      setFormData({
        award_name: '',
        award_category: 'Leistung',
        description: '',
        awarded_date: new Date().toISOString().split('T')[0],
        awarded_by: '',
      });
    }
  }, [award, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting award:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Neue Auszeichnung vergeben' : 'Auszeichnung bearbeiten'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="award_name">Auszeichnungsname *</Label>
            <Input 
              id="award_name" 
              value={formData.award_name}
              onChange={(e) => setFormData(prev => ({ ...prev, award_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="award_category">Kategorie</Label>
            <Select 
              value={formData.award_category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, award_category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Leistung">Leistung</SelectItem>
                <SelectItem value="Innovation">Innovation</SelectItem>
                <SelectItem value="Teamarbeit">Teamarbeit</SelectItem>
                <SelectItem value="Kundenservice">Kundenservice</SelectItem>
                <SelectItem value="Führung">Führung</SelectItem>
                <SelectItem value="Jubiläum">Jubiläum</SelectItem>
                <SelectItem value="Sonstiges">Sonstiges</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="awarded_date">Datum *</Label>
              <Input 
                id="awarded_date" 
                type="date" 
                value={formData.awarded_date}
                onChange={(e) => setFormData(prev => ({ ...prev, awarded_date: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="awarded_by">Vergeben von</Label>
              <Input 
                id="awarded_by" 
                value={formData.awarded_by}
                onChange={(e) => setFormData(prev => ({ ...prev, awarded_by: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Wird gespeichert...' : mode === 'create' ? 'Vergeben' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
