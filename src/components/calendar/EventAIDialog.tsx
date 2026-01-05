
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EventAIDialogProps {
  open: boolean;
  onClose: () => void;
}

const EventAIDialog = ({
  open,
  onClose
}: EventAIDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>KI-Assistent</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Beschreiben Sie, was Sie tun möchten, und der KI-Assistent hilft Ihnen bei der Erstellung oder Verwaltung von Kalenderereignissen.
          </p>
          
          <Textarea 
            placeholder="z.B. 'Erstelle einen wöchentlichen Team-Meeting-Termin jeden Montag um 10 Uhr' oder 'Plane einen Urlaub vom 15. bis 20. August'" 
            className="h-32"
          />
          
          <div className="mt-4 bg-muted p-3 rounded-md">
            <h4 className="text-sm font-medium mb-1">Vorschläge:</h4>
            <ul className="text-sm text-muted-foreground">
              <li>• Erstelle ein Meeting mit dem Marketing-Team</li>
              <li>• Plane ein Mittagessen mit Kunden nächste Woche</li>
              <li>• Verschiebe alle Termine am Freitag</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button>Ausführen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventAIDialog;
