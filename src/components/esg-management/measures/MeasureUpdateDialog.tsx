import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Measure } from './MeasureCard';

interface MeasureUpdateDialogProps {
  measure: Measure | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (measureId: string, progress: number, statusUpdate: string, nextSteps: string) => void;
}

export const MeasureUpdateDialog: React.FC<MeasureUpdateDialogProps> = ({
  measure,
  open,
  onOpenChange,
  onSave,
}) => {
  const [progress, setProgress] = useState(measure?.progress || 0);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [nextSteps, setNextSteps] = useState('');

  React.useEffect(() => {
    if (measure) {
      setProgress(measure.progress);
      setStatusUpdate('');
      setNextSteps('');
    }
  }, [measure]);

  if (!measure) return null;

  const handleSave = () => {
    onSave(measure.id, progress, statusUpdate, nextSteps);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Fortschritt aktualisieren: {measure.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="progress">Aktueller Fortschritt (%)</Label>
            <Input
              id="progress"
              type="number"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="statusUpdate">Status-Update</Label>
            <Textarea
              id="statusUpdate"
              value={statusUpdate}
              onChange={(e) => setStatusUpdate(e.target.value)}
              placeholder="Beschreiben Sie den aktuellen Stand und erreichte Meilensteine..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="nextSteps">Nächste Schritte</Label>
            <Textarea
              id="nextSteps"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="Welche Schritte sind als nächstes geplant?"
              className="mt-1 min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>
            Update speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
