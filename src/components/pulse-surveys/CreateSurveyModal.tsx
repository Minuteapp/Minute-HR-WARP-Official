import { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { SURVEY_TEMPLATES } from '@/lib/surveyTemplates';
import { SurveyTemplateCard } from './SurveyTemplateCard';
import { usePulseSurveys } from '@/hooks/usePulseSurveys';

interface CreateSurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateSurveyModal = ({
  open,
  onOpenChange,
}: CreateSurveyModalProps) => {
  const { createSurvey } = usePulseSurveys();
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    SURVEY_TEMPLATES[0].id
  );
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetGroup: '',
    language: 'de',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  const selectedTemplate = SURVEY_TEMPLATES.find(
    (t) => t.id === selectedTemplateId
  );

  const handleSubmit = () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      return;
    }

    createSurvey({
      title: formData.title,
      description: formData.description,
      survey_type: selectedTemplate?.type,
      start_date: formData.startDate.toISOString(),
      end_date: formData.endDate.toISOString(),
      status: 'draft',
    });

    onOpenChange(false);
    // Reset form
    setFormData({
      title: '',
      description: '',
      targetGroup: '',
      language: 'de',
      startDate: undefined,
      endDate: undefined,
    });
    setSelectedTemplateId(SURVEY_TEMPLATES[0].id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Umfrage erstellen</DialogTitle>
          <DialogDescription>
            Wählen Sie eine Vorlage und passen Sie die Details an
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Selection */}
          <div className="space-y-3">
            <Label>Umfrage-Vorlage auswählen</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SURVEY_TEMPLATES.map((template) => (
                <SurveyTemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplateId === template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                />
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titel der Umfrage *</Label>
              <Input
                id="title"
                placeholder="z.B. Q4 Engagement Pulse"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                placeholder="Kurze Beschreibung der Umfrage..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetGroup">Zielgruppe *</Label>
                <Select
                  value={formData.targetGroup}
                  onValueChange={(value) =>
                    setFormData({ ...formData, targetGroup: value })
                  }
                >
                  <SelectTrigger id="targetGroup">
                    <SelectValue placeholder="Wählen Sie..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                    <SelectItem value="dach">DACH Standorte</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="sales">Vertrieb</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="new_hires">Neue Mitarbeiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Sprache</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    setFormData({ ...formData, language: value })
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="en">Englisch</SelectItem>
                    <SelectItem value="fr">Französisch</SelectItem>
                    <SelectItem value="es">Spanisch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Startdatum *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? (
                        format(formData.startDate, 'PPP', { locale: de })
                      ) : (
                        <span>Datum wählen</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) =>
                        setFormData({ ...formData, startDate: date })
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Enddatum *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? (
                        format(formData.endDate, 'PPP', { locale: de })
                      ) : (
                        <span>Datum wählen</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) =>
                        setFormData({ ...formData, endDate: date })
                      }
                      disabled={(date) =>
                        formData.startDate ? date < formData.startDate : false
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !formData.title ||
              !formData.startDate ||
              !formData.endDate ||
              !formData.targetGroup
            }
          >
            Umfrage erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
