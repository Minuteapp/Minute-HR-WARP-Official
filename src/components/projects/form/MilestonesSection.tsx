
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Flag } from "lucide-react";

interface Milestone {
  title: string;
  description?: string;
  dueDate?: string;
  notifyOnDeadline?: boolean;
}

interface MilestonesSectionProps {
  milestones: Milestone[];
  onChange: (field: string, value: any) => void;
}

export const MilestonesSection = ({ milestones, onChange }: MilestonesSectionProps) => {
  const [newMilestone, setNewMilestone] = useState<Milestone>({
    title: '',
    description: '',
    dueDate: '',
    notifyOnDeadline: true
  });

  const handleAddMilestone = () => {
    if (newMilestone.title) {
      const updatedMilestones = [...milestones, newMilestone];
      onChange('milestones', updatedMilestones);
      setNewMilestone({
        title: '',
        description: '',
        dueDate: '',
        notifyOnDeadline: true
      });
    }
  };

  const handleRemoveMilestone = (index: number) => {
    const updatedMilestones = milestones.filter((_, i) => i !== index);
    onChange('milestones', updatedMilestones);
  };

  const handleMilestoneChange = (field: string, value: any) => {
    setNewMilestone(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Meilensteine</h3>
        <p className="text-sm text-gray-500">Definieren Sie wichtige Meilensteine für Ihr Projekt.</p>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-4">
        <div className="col-span-4">
          <Label htmlFor="milestoneTitle">Titel</Label>
          <Input
            id="milestoneTitle"
            value={newMilestone.title}
            onChange={(e) => handleMilestoneChange('title', e.target.value)}
            placeholder="Meilenstein-Titel"
          />
        </div>
        <div className="col-span-4">
          <Label htmlFor="milestoneDueDate">Fälligkeitsdatum</Label>
          <Input
            id="milestoneDueDate"
            type="date"
            value={newMilestone.dueDate}
            onChange={(e) => handleMilestoneChange('dueDate', e.target.value)}
          />
        </div>
        <div className="col-span-3">
          <Label htmlFor="milestoneNotify" className="block mb-2">Benachrichtigung</Label>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="milestoneNotify"
              checked={newMilestone.notifyOnDeadline}
              onCheckedChange={(checked) => handleMilestoneChange('notifyOnDeadline', checked)}
            />
            <label
              htmlFor="milestoneNotify"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Bei Fälligkeit benachrichtigen
            </label>
          </div>
        </div>
        <div className="col-span-1 flex items-end">
          <Button type="button" onClick={handleAddMilestone} className="w-full" disabled={!newMilestone.title}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="milestoneDescription">Beschreibung</Label>
        <Textarea
          id="milestoneDescription"
          value={newMilestone.description}
          onChange={(e) => handleMilestoneChange('description', e.target.value)}
          placeholder="Beschreibung des Meilensteins"
          rows={2}
        />
      </div>

      {milestones.length > 0 ? (
        <div className="space-y-2 mt-4">
          {milestones.map((milestone, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">{milestone.title}</h4>
                  </div>
                  {milestone.description && (
                    <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    {milestone.dueDate && (
                      <p className="text-xs text-gray-500">Fällig am: {milestone.dueDate}</p>
                    )}
                    {milestone.notifyOnDeadline && (
                      <p className="text-xs text-green-600">Benachrichtigung aktiviert</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemoveMilestone(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-md border">
          <Flag className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <h3 className="text-base font-medium">Noch keine Meilensteine</h3>
          <p className="text-sm text-gray-500">Definieren Sie wichtige Meilensteine, um den Fortschritt zu verfolgen.</p>
        </div>
      )}
    </div>
  );
};
