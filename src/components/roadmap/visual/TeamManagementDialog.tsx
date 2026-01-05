import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TeamManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roadmapId: string;
}

export const TeamManagementDialog: React.FC<TeamManagementDialogProps> = ({
  open,
  onOpenChange,
  roadmapId,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team Management</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Team management functionality for roadmap {roadmapId}</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};