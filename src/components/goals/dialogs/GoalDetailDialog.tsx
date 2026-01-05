import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EnhancedGoal } from '@/types/goals-enhanced';

interface GoalDetailDialogProps {
  goal: EnhancedGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export const GoalDetailDialog: React.FC<GoalDetailDialogProps> = ({
  goal,
  open,
  onOpenChange,
  onUpdate
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{goal.title}</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <p>Ziel-Details werden implementiert...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};