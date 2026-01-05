import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lightbulb, Sparkles, Globe, Users, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewIdeaSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: 'process', label: 'Prozess' },
  { value: 'product', label: 'Produkt' },
  { value: 'service', label: 'Service' },
  { value: 'technology', label: 'Technologie' },
  { value: 'organization', label: 'Organisation' },
  { value: 'sustainability', label: 'Nachhaltigkeit' },
  { value: 'cost', label: 'Kosten / Effizienz' },
];

const affectedAreas = [
  'IT & Entwicklung',
  'Produktion',
  'Vertrieb',
  'HR',
  'Marketing',
  'Finance',
  'Logistik',
  'Kundensupport',
];

const NewIdeaSubmissionDialog = ({ open, onOpenChange }: NewIdeaSubmissionDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [costSavings, setCostSavings] = useState('');
  const [revenue, setRevenue] = useState('');
  const [quality, setQuality] = useState('');
  const [sustainability, setSustainability] = useState('');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'team' | 'anonymous'>('public');

  const toggleArea = (area: string) => {
    setSelectedAreas(prev => 
      prev.includes(area) 
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  const handleSubmit = () => {
    // TODO: Implement submission logic
    console.log({ title, description, category, selectedAreas, visibility });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Neue Idee einreichen</DialogTitle>
              <p className="text-sm text-gray-500 mt-0.5">Ihre Innovation zählt!</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Titel */}
          <div className="space-y-2">
            <Label htmlFor="title">Titel der Idee *</Label>
            <Input
              id="title"
              placeholder="z.B. Digitale Schichtübergabe per Tablet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Beschreibung */}
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung *</Label>
            <Textarea
              id="description"
              placeholder="Beschreiben Sie Ihre Idee ausführlich..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-gray-400 text-right">{description.length} Zeichen</p>
          </div>

          {/* Kategorie */}
          <div className="space-y-2">
            <Label>Kategorie *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie wählen..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Betroffene Bereiche */}
          <div className="space-y-2">
            <Label>Betroffene Bereiche</Label>
            <div className="flex flex-wrap gap-2">
              {affectedAreas.map(area => (
                <Button
                  key={area}
                  type="button"
                  variant={selectedAreas.includes(area) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleArea(area)}
                  className={cn(
                    selectedAreas.includes(area) && 'bg-primary hover:bg-primary/90'
                  )}
                >
                  {area}
                </Button>
              ))}
            </div>
          </div>

          {/* Erwarteter Nutzen */}
          <div className="space-y-2">
            <Label>Erwarteter Nutzen (optional)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  placeholder="Kosteneinsparung (€ pro Jahr)"
                  value={costSavings}
                  onChange={(e) => setCostSavings(e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Umsatzpotenzial (€ pro Jahr)"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Qualitätsverbesserung"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Nachhaltigkeitsimpact"
                  value={sustainability}
                  onChange={(e) => setSustainability(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <Textarea
              id="tags"
              placeholder="Tags mit Komma getrennt eingeben, z.B. Automatisierung, KI, HR"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              rows={2}
            />
          </div>

          {/* Sichtbarkeit */}
          <div className="space-y-2">
            <Label>Sichtbarkeit</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant={visibility === 'public' ? 'default' : 'outline'}
                className={cn(
                  'flex flex-col h-auto py-4',
                  visibility === 'public' && 'bg-primary hover:bg-primary/90'
                )}
                onClick={() => setVisibility('public')}
              >
                <Globe className="h-5 w-5 mb-1" />
                <span className="font-medium">Öffentlich</span>
                <span className="text-xs opacity-80">Alle Mitarbeiter</span>
              </Button>
              <Button
                type="button"
                variant={visibility === 'team' ? 'default' : 'outline'}
                className={cn(
                  'flex flex-col h-auto py-4',
                  visibility === 'team' && 'bg-primary hover:bg-primary/90'
                )}
                onClick={() => setVisibility('team')}
              >
                <Users className="h-5 w-5 mb-1" />
                <span className="font-medium">Team</span>
                <span className="text-xs opacity-80">Nur mein Team</span>
              </Button>
              <Button
                type="button"
                variant={visibility === 'anonymous' ? 'default' : 'outline'}
                className={cn(
                  'flex flex-col h-auto py-4',
                  visibility === 'anonymous' && 'bg-primary hover:bg-primary/90'
                )}
                onClick={() => setVisibility('anonymous')}
              >
                <UserX className="h-5 w-5 mb-1" />
                <span className="font-medium">Anonym</span>
                <span className="text-xs opacity-80">Ohne Name</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button variant="outline" className="text-gray-600">
            Direkt einreichen
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmit}>
            <Sparkles className="h-4 w-4 mr-2" />
            KI-Prüfung & Einreichen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewIdeaSubmissionDialog;
