import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateRewardCatalogItem } from '@/hooks/useRewardCatalog';
import { 
  RewardCategory, 
  RewardFrequency, 
  CATEGORY_LABELS, 
  FREQUENCY_LABELS 
} from '@/types/reward-catalog';

interface CreateRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateRewardDialog = ({ open, onOpenChange }: CreateRewardDialogProps) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RewardCategory>('financial');
  const [valueDisplay, setValueDisplay] = useState('');
  const [description, setDescription] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [frequency, setFrequency] = useState<RewardFrequency>('once');
  const [budget, setBudget] = useState('');
  const [isActive, setIsActive] = useState(true);

  const createMutation = useCreateRewardCatalogItem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createMutation.mutateAsync({
      name,
      category,
      value_display: valueDisplay,
      description,
      eligibility,
      frequency,
      budget: budget ? parseFloat(budget) : undefined,
      is_active: isActive,
    });

    // Reset form
    setName('');
    setCategory('financial');
    setValueDisplay('');
    setDescription('');
    setEligibility('');
    setFrequency('once');
    setBudget('');
    setIsActive(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Neue Belohnung erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name der Belohnung *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Leistungsbonus Q4"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategorie *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as RewardCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(CATEGORY_LABELS) as [RewardCategory, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Wert *</Label>
            <Input
              id="value"
              value={valueDisplay}
              onChange={(e) => setValueDisplay(e.target.value)}
              placeholder="z.B. €100 - €500 oder 1 Tag"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreiben Sie die Belohnung..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eligibility">Berechtigung *</Label>
            <Input
              id="eligibility"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="z.B. Performance >90% über 3 Monate"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Häufigkeit *</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as RewardFrequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(FREQUENCY_LABELS) as [RewardFrequency, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget</Label>
            <Input
              id="budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="z.B. 5000"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
            />
            <Label htmlFor="isActive" className="text-sm font-normal">
              Belohnung sofort aktivieren
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Wird erstellt...' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
