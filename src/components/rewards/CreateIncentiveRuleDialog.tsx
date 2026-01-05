import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useIncentiveRules } from '@/hooks/useIncentiveRules';
import { useRewardCatalog } from '@/hooks/useRewardCatalog';
import { categoryLabels, frequencyLabels } from '@/types/incentive-rules';

interface CreateIncentiveRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateIncentiveRuleDialog = ({ open, onOpenChange }: CreateIncentiveRuleDialogProps) => {
  const { createRule } = useIncentiveRules();
  const { data: rewards } = useRewardCatalog();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '' as any,
    trigger_description: '',
    conditions_count: 0,
    action_description: '',
    action_frequency: '' as any,
    reward_id: '',
    is_automatic: true,
    is_active: true,
    budget: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createRule.mutateAsync({
      name: formData.name,
      category: formData.category,
      trigger_description: formData.trigger_description,
      conditions_count: formData.conditions_count,
      action_description: formData.action_description,
      action_frequency: formData.action_frequency || undefined,
      reward_id: formData.reward_id || undefined,
      is_automatic: formData.is_automatic,
      is_active: formData.is_active,
      budget: formData.budget ? parseFloat(formData.budget) : undefined
    });

    setFormData({
      name: '',
      category: '',
      trigger_description: '',
      conditions_count: 0,
      action_description: '',
      action_frequency: '',
      reward_id: '',
      is_automatic: true,
      is_active: true,
      budget: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Neue Incentive-Regel erstellen</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name der Regel *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="z.B. Performance Excellence Bonus"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategorie *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger">Auslöser *</Label>
            <Textarea
              id="trigger"
              value={formData.trigger_description}
              onChange={(e) => setFormData({ ...formData, trigger_description: e.target.value })}
              placeholder="z.B. Performance-Bewertung >95% über 3 Monate"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditions">Anzahl Bedingungen</Label>
            <Input
              id="conditions"
              type="number"
              min="0"
              value={formData.conditions_count}
              onChange={(e) => setFormData({ ...formData, conditions_count: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="action">Aktion / Belohnungsbeschreibung *</Label>
            <Textarea
              id="action"
              value={formData.action_description}
              onChange={(e) => setFormData({ ...formData, action_description: e.target.value })}
              placeholder="z.B. €500 Bonus + 1 Extra-Urlaubstag"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Häufigkeit</Label>
              <Select
                value={formData.action_frequency}
                onValueChange={(value) => setFormData({ ...formData, action_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (€)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="z.B. 5000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reward">Verknüpfte Belohnung (optional)</Label>
            <Select
              value={formData.reward_id}
              onValueChange={(value) => setFormData({ ...formData, reward_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Belohnung wählen..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Keine</SelectItem>
                {rewards.filter(r => r.is_active).map((reward) => (
                  <SelectItem key={reward.id} value={reward.id}>{reward.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="automatic"
                checked={formData.is_automatic}
                onCheckedChange={(checked) => setFormData({ ...formData, is_automatic: !!checked })}
              />
              <Label htmlFor="automatic" className="text-sm">Automatisch ausführen</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
              />
              <Label htmlFor="active" className="text-sm">Regel sofort aktivieren</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createRule.isPending}>
              {createRule.isPending ? 'Erstelle...' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
