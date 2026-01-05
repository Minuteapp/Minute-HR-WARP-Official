
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ProjectFormData } from '@/hooks/projects/useProjectForm';

interface TasksTabProps {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: any) => void;
  onBack: () => void;
  onNext: () => void;
  active: boolean;
  forceMount?: boolean;
  mode: 'create' | 'edit';
}

export const TasksTab = ({ 
  formData, 
  onChange, 
  onBack, 
  onNext, 
  active, 
  forceMount = false,
  mode 
}: TasksTabProps) => {
  return (
    <TabsContent value="tasks" className={active ? 'block' : 'hidden'} forceMount={forceMount || undefined}>
      <div className="space-y-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-700">Aufgaben</h3>
          <p className="text-gray-500 mt-2">Die Aufgaben-Funktionen werden in einem zukünftigen Update implementiert.</p>
        </div>

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
