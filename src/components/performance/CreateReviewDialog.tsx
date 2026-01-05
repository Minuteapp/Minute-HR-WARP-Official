
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useCreatePerformanceReview, usePerformanceTemplates } from '@/hooks/usePerformance';
import type { CreatePerformanceReviewRequest } from '@/types/performance';

interface CreateReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateReviewDialog = ({ open, onOpenChange }: CreateReviewDialogProps) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    reviewer_id: '',
    template_id: '',
    review_period_start: undefined as Date | undefined,
    review_period_end: undefined as Date | undefined,
    due_date: undefined as Date | undefined,
    team_id: '',
  });

  const createReview = useCreatePerformanceReview();
  const { data: templates = [] } = usePerformanceTemplates();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employee_id || !formData.review_period_start || !formData.review_period_end) {
      return;
    }

    const reviewData: CreatePerformanceReviewRequest = {
      employee_id: formData.employee_id,
      reviewer_id: formData.reviewer_id || undefined,
      template_id: formData.template_id || undefined,
      review_period_start: formData.review_period_start.toISOString().split('T')[0],
      review_period_end: formData.review_period_end.toISOString().split('T')[0],
      due_date: formData.due_date?.toISOString().split('T')[0],
      team_id: formData.team_id || undefined,
      metadata: {}
    };

    try {
      await createReview.mutateAsync(reviewData);
      
      // Reset form
      setFormData({
        employee_id: '',
        reviewer_id: '',
        template_id: '',
        review_period_start: undefined,
        review_period_end: undefined,
        due_date: undefined,
        team_id: '',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Fehler beim Erstellen des Reviews:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Neues Performance Review erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee_id">Mitarbeiter-ID *</Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                placeholder="Mitarbeiter-ID eingeben..."
                required
              />
            </div>

            <div>
              <Label htmlFor="reviewer_id">Reviewer-ID</Label>
              <Input
                id="reviewer_id"
                value={formData.reviewer_id}
                onChange={(e) => setFormData(prev => ({ ...prev, reviewer_id: e.target.value }))}
                placeholder="Optional - Reviewer-ID"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="template_id">Template</Label>
            <Select
              value={formData.template_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, template_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Template auswählen (optional)" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Bewertungszeitraum Start *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.review_period_start ? 
                      format(formData.review_period_start, 'dd.MM.yyyy', { locale: de }) : 
                      'Startdatum wählen'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.review_period_start}
                    onSelect={(date) => setFormData(prev => ({ ...prev, review_period_start: date }))}
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Bewertungszeitraum Ende *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.review_period_end ? 
                      format(formData.review_period_end, 'dd.MM.yyyy', { locale: de }) : 
                      'Enddatum wählen'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.review_period_end}
                    onSelect={(date) => setFormData(prev => ({ ...prev, review_period_end: date }))}
                    locale={de}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label>Fälligkeitsdatum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? 
                    format(formData.due_date, 'dd.MM.yyyy', { locale: de }) : 
                    'Fälligkeitsdatum wählen (optional)'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="team_id">Team-ID</Label>
            <Input
              id="team_id"
              value={formData.team_id}
              onChange={(e) => setFormData(prev => ({ ...prev, team_id: e.target.value }))}
              placeholder="Optional - Team-ID"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createReview.isPending}>
              {createReview.isPending ? 'Erstelle...' : 'Review erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
