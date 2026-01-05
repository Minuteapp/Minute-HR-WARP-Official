
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useInnovation } from '@/hooks/useInnovation';

interface NewPilotProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewPilotProjectDialog = ({ open, onOpenChange }: NewPilotProjectDialogProps) => {
  const { createPilotProject, isCreatingPilotProject } = useInnovation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'preparing',
    start_date: '',
    end_date: '',
    budget: '',
    responsible_person: '',
    team_members: [] as string[],
    success_metrics: [] as string[],
    risk_assessment: '',
  });

  const [newTeamMember, setNewTeamMember] = useState('');
  const [newSuccessMetric, setNewSuccessMetric] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const projectData = {
        title: formData.title,
        description: formData.description,
        status: formData.status as 'preparing' | 'pilot_phase' | 'scaling' | 'completed' | 'cancelled',
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        responsible_person: formData.responsible_person,
        team_members: formData.team_members,
        success_metrics: formData.success_metrics,
        risk_assessment: formData.risk_assessment || undefined,
        progress: 0,
        attachments: []
      };

      await createPilotProject(projectData);
      
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'preparing',
        start_date: '',
        end_date: '',
        budget: '',
        responsible_person: '',
        team_members: [],
        success_metrics: [],
        risk_assessment: '',
      });
    } catch (error) {
      console.error('Error creating pilot project:', error);
      toast.error('Fehler beim Erstellen des Pilotprojekts');
    }
  };

  const addTeamMember = () => {
    if (newTeamMember.trim() && !formData.team_members.includes(newTeamMember.trim())) {
      setFormData(prev => ({
        ...prev,
        team_members: [...prev.team_members, newTeamMember.trim()]
      }));
      setNewTeamMember('');
    }
  };

  const removeTeamMember = (member: string) => {
    setFormData(prev => ({
      ...prev,
      team_members: prev.team_members.filter(m => m !== member)
    }));
  };

  const addSuccessMetric = () => {
    if (newSuccessMetric.trim() && !formData.success_metrics.includes(newSuccessMetric.trim())) {
      setFormData(prev => ({
        ...prev,
        success_metrics: [...prev.success_metrics, newSuccessMetric.trim()]
      }));
      setNewSuccessMetric('');
    }
  };

  const removeSuccessMetric = (metric: string) => {
    setFormData(prev => ({
      ...prev,
      success_metrics: prev.success_metrics.filter(m => m !== metric)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neues Pilotprojekt erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Titel des Pilotprojekts"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Beschreibung *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detaillierte Beschreibung des Pilotprojekts"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preparing">Vorbereitung</SelectItem>
                  <SelectItem value="pilot_phase">Pilotphase</SelectItem>
                  <SelectItem value="scaling">Skalierung</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="cancelled">Abgebrochen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="responsible_person">Verantwortliche Person *</Label>
              <Input
                id="responsible_person"
                value={formData.responsible_person}
                onChange={(e) => setFormData(prev => ({ ...prev, responsible_person: e.target.value }))}
                placeholder="Name der verantwortlichen Person"
                required
              />
            </div>
          </div>

          {/* Dates and Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div>
              <Label htmlFor="budget">Budget (€)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Team Members */}
          <div>
            <Label>Teammitglieder</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newTeamMember}
                onChange={(e) => setNewTeamMember(e.target.value)}
                placeholder="Teammitglied hinzufügen"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTeamMember())}
              />
              <Button type="button" onClick={addTeamMember} variant="outline">
                Hinzufügen
              </Button>
            </div>
            {formData.team_members.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.team_members.map((member) => (
                  <Badge key={member} variant="secondary" className="flex items-center gap-1">
                    {member}
                    <button
                      type="button"
                      onClick={() => removeTeamMember(member)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Success Metrics */}
          <div>
            <Label>Erfolgskriterien</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newSuccessMetric}
                onChange={(e) => setNewSuccessMetric(e.target.value)}
                placeholder="Erfolgskriterium hinzufügen"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSuccessMetric())}
              />
              <Button type="button" onClick={addSuccessMetric} variant="outline">
                Hinzufügen
              </Button>
            </div>
            {formData.success_metrics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.success_metrics.map((metric) => (
                  <Badge key={metric} variant="secondary" className="flex items-center gap-1">
                    {metric}
                    <button
                      type="button"
                      onClick={() => removeSuccessMetric(metric)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Risk Assessment */}
          <div>
            <Label htmlFor="risk_assessment">Risikobewertung</Label>
            <Textarea
              id="risk_assessment"
              value={formData.risk_assessment}
              onChange={(e) => setFormData(prev => ({ ...prev, risk_assessment: e.target.value }))}
              placeholder="Potentielle Risiken und Gegenmaßnahmen"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreatingPilotProject}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isCreatingPilotProject}>
              {isCreatingPilotProject ? 'Wird erstellt...' : 'Pilotprojekt erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
