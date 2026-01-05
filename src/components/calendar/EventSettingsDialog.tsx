
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface EventSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedTypes: Record<string, boolean>;
  setSelectedTypes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const EventSettingsDialog = ({
  open,
  onClose,
  selectedTypes,
  setSelectedTypes
}: EventSettingsDialogProps) => {
  const handleSwitchChange = (type: string, checked: boolean) => {
    setSelectedTypes(prev => ({
      ...prev,
      [type]: checked
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Kalender-Einstellungen</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <h3 className="text-sm font-medium mb-3">Sichtbare Ereignistypen</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="meeting" className="flex-1">Besprechungen</Label>
              <Switch
                id="meeting"
                checked={selectedTypes.meeting !== false}
                onCheckedChange={(checked) => handleSwitchChange('meeting', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="appointment" className="flex-1">Termine</Label>
              <Switch
                id="appointment"
                checked={selectedTypes.appointment !== false}
                onCheckedChange={(checked) => handleSwitchChange('appointment', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="task" className="flex-1">Aufgaben</Label>
              <Switch
                id="task"
                checked={selectedTypes.task !== false}
                onCheckedChange={(checked) => handleSwitchChange('task', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="holiday" className="flex-1">Urlaub</Label>
              <Switch
                id="holiday"
                checked={selectedTypes.holiday !== false}
                onCheckedChange={(checked) => handleSwitchChange('holiday', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="deadline" className="flex-1">Deadlines</Label>
              <Switch
                id="deadline"
                checked={selectedTypes.deadline !== false}
                onCheckedChange={(checked) => handleSwitchChange('deadline', checked)}
              />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <h3 className="text-sm font-medium mb-3">Ansichtsoptionen</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showWeekends" className="flex-1">Wochenenden anzeigen</Label>
              <Switch id="showWeekends" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showCompletedTasks" className="flex-1">Erledigte Aufgaben anzeigen</Label>
              <Switch id="showCompletedTasks" defaultChecked />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Schließen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventSettingsDialog;
