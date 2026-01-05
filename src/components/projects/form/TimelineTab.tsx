
import { TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ProjectFormData } from '@/hooks/projects/useProjectForm';
import { MilestonesSection } from './MilestonesSection';

interface TimelineTabProps {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: any) => void;
  onBack: () => void;
  onNext: () => void;
  active: boolean;
  forceMount?: boolean;
  mode: 'create' | 'edit';
}

export const TimelineTab = ({ 
  formData, 
  onChange, 
  onBack, 
  onNext, 
  active, 
  forceMount = false,
  mode 
}: TimelineTabProps) => {
  return (
    <TabsContent value="timeline" className={active ? 'block' : 'hidden'} forceMount={forceMount || undefined}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Startdatum</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => onChange('start_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">Enddatum</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => onChange('end_date', e.target.value)}
              min={formData.start_date}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="progress">Fortschritt (%)</Label>
          <Input
            id="progress"
            type="number"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) => onChange('progress', parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Meilensteine-Sektion */}
        <MilestonesSection 
          milestones={formData.milestones || []} 
          onChange={(field, value) => onChange(field as keyof ProjectFormData, value)} 
        />

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Zurück
          </Button>
          <Button onClick={onNext}>
            Weiter
          </Button>
        </div>
      </div>
    </TabsContent>
  );
};
