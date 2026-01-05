
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface NewScheduledReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    reportType: string;
    frequency: string;
    recipient: string;
  }) => void;
}

const NewScheduledReportDialog = ({ open, onOpenChange, onSubmit }: NewScheduledReportDialogProps) => {
  const [name, setName] = useState('');
  const [reportType, setReportType] = useState('');
  const [frequency, setFrequency] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleSubmit = () => {
    if (name && reportType && frequency && recipient) {
      onSubmit({ name, reportType, frequency, recipient });
      setName('');
      setReportType('');
      setFrequency('');
      setRecipient('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Neuen Report planen</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Erstellen Sie einen automatisch generierten Report.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="report-name" className="text-foreground">Report-Name</Label>
            <Input
              id="report-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Monatlicher Ausgabenbericht"
              className="bg-background border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Report-Typ</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="category">Ausgaben nach Kategorie</SelectItem>
                  <SelectItem value="project">Ausgaben nach Projekt</SelectItem>
                  <SelectItem value="budget">Budgetabweichungen</SelectItem>
                  <SelectItem value="vat">MwSt.-Übersicht</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Frequenz</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                  <SelectItem value="monthly">Monatlich</SelectItem>
                  <SelectItem value="quarterly">Quartalsweise</SelectItem>
                  <SelectItem value="yearly">Jährlich</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-foreground">Empfänger</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="z.B. Finance Team"
              className="bg-background border-border"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-border">
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Report erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewScheduledReportDialog;
