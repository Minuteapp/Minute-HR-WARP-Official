
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ProjectFormData } from '@/hooks/projects/useProjectForm';
import { TeamSection } from './TeamSection';

interface TeamTabProps {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: any) => void;
  onBack: () => void;
  onNext: () => void;
  active: boolean;
  forceMount?: boolean;
  mode: 'create' | 'edit';
}

export const TeamTab = ({ 
  formData, 
  onChange, 
  onBack, 
  onNext, 
  active, 
  forceMount = false,
  mode 
}: TeamTabProps) => {
  return (
    <TabsContent value="team" className={active ? 'block' : 'hidden'} forceMount={forceMount || undefined}>
      <div className="space-y-6">
        <TeamSection 
          team={formData.team || []} 
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
