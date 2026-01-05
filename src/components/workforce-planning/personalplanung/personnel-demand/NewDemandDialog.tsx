import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewDemandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: NewDemandForm) => void;
}

interface NewDemandForm {
  role: string;
  team: string;
  location: string;
  fte: number;
  timeframe: string;
  source: string;
  requiredSkills: string;
  justification: string;
}

export const NewDemandDialog = ({ open, onOpenChange, onSubmit }: NewDemandDialogProps) => {
  const [formData, setFormData] = useState<NewDemandForm>({
    role: '',
    team: '',
    location: '',
    fte: 1,
    timeframe: '',
    source: '',
    requiredSkills: '',
    justification: ''
  });

  const handleSubmit = () => {
    onSubmit?.(formData);
    onOpenChange(false);
    setFormData({
      role: '',
      team: '',
      location: '',
      fte: 1,
      timeframe: '',
      source: '',
      requiredSkills: '',
      justification: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neuen Bedarf anlegen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rolle</Label>
            <Input 
              id="role" 
              placeholder="z.B. Cloud Architect"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team">Team</Label>
              <Select 
                value={formData.team} 
                onValueChange={(value) => setFormData({ ...formData, team: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Team wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">IT</SelectItem>
                  <SelectItem value="vertrieb">Vertrieb</SelectItem>
                  <SelectItem value="produktion">Produktion</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Standort</Label>
              <Select 
                value={formData.location} 
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Standort wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muenchen">München</SelectItem>
                  <SelectItem value="berlin">Berlin</SelectItem>
                  <SelectItem value="hamburg">Hamburg</SelectItem>
                  <SelectItem value="frankfurt">Frankfurt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fte">FTE</Label>
              <Input 
                id="fte" 
                type="number"
                min="0.5"
                step="0.5"
                value={formData.fte}
                onChange={(e) => setFormData({ ...formData, fte: parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe">Zeitraum</Label>
              <Input 
                id="timeframe" 
                placeholder="z.B. Q2 2025"
                value={formData.timeframe}
                onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Bedarfsquelle</Label>
            <Select 
              value={formData.source} 
              onValueChange={(value) => setFormData({ ...formData, source: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Quelle wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="projekte">Projekte & Roadmap</SelectItem>
                <SelectItem value="strategie">Strategie & OKRs</SelectItem>
                <SelectItem value="schichtplanung">Schichtplanung</SelectItem>
                <SelectItem value="esg">ESG & Compliance</SelectItem>
                <SelectItem value="fluktuation">Fluktuation (Ersatz)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Erforderliche Skills</Label>
            <Input 
              id="skills" 
              placeholder="z.B. AWS, Azure, Kubernetes (komma-getrennt)"
              value={formData.requiredSkills}
              onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="justification">Begründung</Label>
            <Textarea 
              id="justification" 
              placeholder="Warum wird diese Position benötigt?"
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
            Bedarf anlegen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
