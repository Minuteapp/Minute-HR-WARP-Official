import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface CreateSurveyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const surveyTypes = [
  'Engagement Survey',
  'Zufriedenheitsumfrage',
  'Pulse Survey',
  'Führungskräftefeedback',
  'Onboarding-Feedback',
  'Offboarding-Feedback',
  'Change-Umfrage',
  'Compliance-Feedback',
  'Innovations-Feedback',
  'ESG & Wellbeing',
];

const targetGroups = [
  'Alle Mitarbeiter',
  'Nach Abteilung',
  'Nach Team',
  'Nach Rolle',
  'Nach Standort',
];

const anonymityOptions = [
  'Voll anonym',
  'Teilanonym (nur Abteilung)',
  'Nicht anonym',
];

const templateOptions = [
  'Leere Umfrage',
  'Engagement Survey Vorlage',
  'Pulse Survey Vorlage',
  'Führungsfeedback Vorlage',
];

export const CreateSurveyDialog = ({ open, onOpenChange }: CreateSurveyDialogProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [targetGroup, setTargetGroup] = useState('');
  const [anonymity, setAnonymity] = useState('');
  const [template, setTemplate] = useState('');

  const handleCreate = () => {
    if (!name || !type || !startDate || !endDate || !targetGroup || !anonymity) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    toast.success('Umfrage wurde erstellt');
    onOpenChange(false);
    
    // Reset form
    setName('');
    setType('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setTargetGroup('');
    setAnonymity('');
    setTemplate('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Neue Umfrage erstellen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name der Umfrage *</Label>
            <Input 
              id="name"
              placeholder="z.B. Q2 Engagement Survey 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Umfragetyp *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                {surveyTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea 
              id="description"
              placeholder="Beschreiben Sie den Zweck der Umfrage..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Startdatum *</Label>
              <Input 
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Enddatum *</Label>
              <Input 
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Zielgruppe *</Label>
            <Select value={targetGroup} onValueChange={setTargetGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Zielgruppe auswählen" />
              </SelectTrigger>
              <SelectContent>
                {targetGroups.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Anonymität *</Label>
            <Select value={anonymity} onValueChange={setAnonymity}>
              <SelectTrigger>
                <SelectValue placeholder="Anonymität auswählen" />
              </SelectTrigger>
              <SelectContent>
                {anonymityOptions.map((a) => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Fragenvorlage verwenden</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Leere Umfrage" />
              </SelectTrigger>
              <SelectContent>
                {templateOptions.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-700">
            Umfrage erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
