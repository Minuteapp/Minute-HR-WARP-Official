import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RotateCcw } from 'lucide-react';

interface ResetToDefaultButtonProps {
  containerName: string;
  onReset: () => void;
  disabled?: boolean;
  variant?: 'button' | 'icon';
}

export function ResetToDefaultButton({
  containerName,
  onReset,
  disabled = false,
  variant = 'icon'
}: ResetToDefaultButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onReset();
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {variant === 'icon' ? (
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled={disabled}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Auf Standard zurücksetzen?</AlertDialogTitle>
          <AlertDialogDescription>
            Alle Einstellungen im Bereich "{containerName}" werden auf die 
            Standardwerte zurückgesetzt. Diese Aktion kann nicht rückgängig 
            gemacht werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset}>
            Zurücksetzen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
