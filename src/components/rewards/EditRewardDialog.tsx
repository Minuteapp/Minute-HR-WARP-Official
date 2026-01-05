import { useState, useEffect } from 'react';
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
import { useUpdateRewardCatalogItem } from '@/hooks/useRewardCatalog';
import { 
  RewardCatalogItem,
  RewardCategory, 
  RewardFrequency, 
  CATEGORY_LABELS, 
  FREQUENCY_LABELS 
} from '@/types/reward-catalog';

interface EditRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: RewardCatalogItem | null;
}

export const EditRewardDialog = ({ open, onOpenChange, reward }: EditRewardDialogProps) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RewardCategory>('financial');
  const [valueDisplay, setValueDisplay] = useState('');
  const [description, setDescription] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [frequency, setFrequency] = useState<RewardFrequency>('once');
  const [budget, setBudget] = useState('');
  const [isActive, setIsActive] = useState(true);

  const updateMutation = useUpdateRewardCatalogItem();

  useEffect(() => {
    if (reward) {
      setName(reward.name);
      setCategory(reward.category);
      setValueDisplay(reward.value_display);
      setDescription(reward.description || '');
      setEligibility(reward.eligibility || '');
      setFrequency(reward.frequency || 'once');
      setBudget(reward.budget?.toString() || '');
      setIsActive(reward.is_active);
    }
  }, [reward]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reward) return;

    await updateMutation.mutateAsync({
      id: reward.id,
      name,
      category,
      value_display: valueDisplay,
      description,
      eligibility,
      frequency,
      budget: budget ? parseFloat(budget) : undefined,
      is_active: isActive,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Belohnung bearbeiten</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name der Belohnung *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Leistungsbonus Q4"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Kategorie *</Label>
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
            <Label htmlFor="edit-value">Wert *</Label>
            <Input
              id="edit-value"
              value={valueDisplay}
              onChange={(e) => setValueDisplay(e.target.value)}
              placeholder="z.B. €100 - €500 oder 1 Tag"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Beschreibung *</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreiben Sie die Belohnung..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-eligibility">Berechtigung *</Label>
            <Input
              id="edit-eligibility"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="z.B. Performance >90% über 3 Monate"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-frequency">Häufigkeit *</Label>
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
            <Label htmlFor="edit-budget">Budget</Label>
            <Input
              id="edit-budget"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="z.B. 5000"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="edit-isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked === true)}
            />
            <Label htmlFor="edit-isActive" className="text-sm font-normal">
              Belohnung aktiv
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Wird gespeichert...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
