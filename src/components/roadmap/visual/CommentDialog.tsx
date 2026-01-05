import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elementId: string;
  elementType: string;
}

export const CommentDialog: React.FC<CommentDialogProps> = ({
  open,
  onOpenChange,
  elementId,
  elementType,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kommentar hinzufügen</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Kommentar für {elementType} {elementId}</p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Schließen</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};