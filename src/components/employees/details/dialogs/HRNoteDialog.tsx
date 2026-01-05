import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface HRNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  note?: any;
  mode: 'create' | 'edit';
}

export const HRNoteDialog = ({ open, onOpenChange, onSubmit, note, mode }: HRNoteDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Allgemein',
    is_confidential: false,
    follow_up_date: '',
  });

  useEffect(() => {
    if (note && mode === 'edit') {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        category: note.category || 'Allgemein',
        is_confidential: note.is_confidential || false,
        follow_up_date: note.follow_up_date?.split('T')[0] || '',
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'Allgemein',
        is_confidential: false,
        follow_up_date: '',
      });
    }
  }, [note, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Neue HR-Notiz erstellen' : 'HR-Notiz bearbeiten'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titel *</Label>
            <Input 
              id="title" 
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Kategorie</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Allgemein">Allgemein</SelectItem>
                <SelectItem value="Performance">Performance</SelectItem>
                <SelectItem value="Verhalten">Verhalten</SelectItem>
                <SelectItem value="Entwicklung">Entwicklung</SelectItem>
                <SelectItem value="Gespräch">Gespräch</SelectItem>
                <SelectItem value="Abmahnung">Abmahnung</SelectItem>
                <SelectItem value="Lob">Lob</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="content">Inhalt *</Label>
            <Textarea 
              id="content" 
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={5}
              required
            />
          </div>

          <div>
            <Label htmlFor="follow_up_date">Wiedervorlage am</Label>
            <Input 
              id="follow_up_date" 
              type="date" 
              value={formData.follow_up_date}
              onChange={(e) => setFormData(prev => ({ ...prev, follow_up_date: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="is_confidential" 
              checked={formData.is_confidential}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_confidential: !!checked }))}
            />
            <Label htmlFor="is_confidential" className="text-sm font-normal">
              Vertraulich (nur für HR sichtbar)
            </Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Wird gespeichert...' : mode === 'create' ? 'Erstellen' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
