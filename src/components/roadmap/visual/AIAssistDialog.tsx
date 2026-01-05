import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AIAssistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: any;
}

export const AIAssistDialog: React.FC<AIAssistDialogProps> = ({
  open,
  onOpenChange,
  context,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>KI-Assistent</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>KI-Unterstützung für die Roadmap-Planung</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};