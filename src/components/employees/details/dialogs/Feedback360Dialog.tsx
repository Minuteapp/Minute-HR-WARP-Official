import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Feedback360DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  feedback?: any;
  mode: 'create' | 'edit';
}

export const Feedback360Dialog = ({ open, onOpenChange, onSubmit, feedback, mode }: Feedback360DialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    feedback_type: 'peer',
    reviewer_name: '',
    reviewer_email: '',
    due_date: '',
    message: '',
  });

  useEffect(() => {
    if (feedback && mode === 'edit') {
      setFormData({
        feedback_type: feedback.feedback_type || 'peer',
        reviewer_name: feedback.reviewer_name || '',
        reviewer_email: feedback.reviewer_email || '',
        due_date: feedback.due_date?.split('T')[0] || '',
        message: feedback.message || '',
      });
    } else {
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 14);
      setFormData({
        feedback_type: 'peer',
        reviewer_name: '',
        reviewer_email: '',
        due_date: defaultDueDate.toISOString().split('T')[0],
        message: '',
      });
    }
  }, [feedback, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting feedback request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? '360° Feedback anfordern' : 'Feedback-Anfrage bearbeiten'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="feedback_type">Feedback-Typ</Label>
            <Select 
              value={formData.feedback_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, feedback_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="peer">Peer (Kollege)</SelectItem>
                <SelectItem value="manager">Manager (Vorgesetzter)</SelectItem>
                <SelectItem value="direct_report">Direct Report (Mitarbeiter)</SelectItem>
                <SelectItem value="self">Selbsteinschätzung</SelectItem>
                <SelectItem value="external">Extern (Kunde/Partner)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reviewer_name">Name des Feedbackgebers *</Label>
            <Input 
              id="reviewer_name" 
              value={formData.reviewer_name}
              onChange={(e) => setFormData(prev => ({ ...prev, reviewer_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="reviewer_email">E-Mail des Feedbackgebers *</Label>
            <Input 
              id="reviewer_email" 
              type="email"
              value={formData.reviewer_email}
              onChange={(e) => setFormData(prev => ({ ...prev, reviewer_email: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="due_date">Fällig bis *</Label>
            <Input 
              id="due_date" 
              type="date" 
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Persönliche Nachricht</Label>
            <Textarea 
              id="message" 
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={3}
              placeholder="Optionale Nachricht an den Feedbackgeber..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Wird gesendet...' : mode === 'create' ? 'Anfrage senden' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
