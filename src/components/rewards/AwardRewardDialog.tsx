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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useActiveRewardCatalog } from '@/hooks/useRewardCatalog';
import { useCreateEmployeeReward } from '@/hooks/useEmployeeRewards';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORY_LABELS, RewardCategory } from '@/types/reward-catalog';

interface AwardRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AwardRewardDialog = ({ open, onOpenChange }: AwardRewardDialogProps) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedRewardId, setSelectedRewardId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: rewards } = useActiveRewardCatalog();
  const createMutation = useCreateEmployeeReward();

  // Fetch employees/profiles
  const { data: employees } = useQuery({
    queryKey: ['employees-for-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const selectedReward = rewards?.find(r => r.id === selectedRewardId);
  const selectedEmployee = employees?.find(e => e.id === selectedEmployeeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReward || !selectedEmployee) return;

    await createMutation.mutateAsync({
      employee_id: selectedEmployeeId,
      employee_name: selectedEmployee.full_name || selectedEmployee.email || 'Unbekannt',
      reward_id: selectedRewardId,
      reward_name: selectedReward.name,
      value: selectedReward.value_display,
      category: selectedReward.category,
      notes,
    });

    // Reset form
    setSelectedEmployeeId('');
    setSelectedRewardId('');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Belohnung vergeben</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Mitarbeiter *</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Mitarbeiter auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.full_name || employee.email || 'Unbekannt'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reward">Belohnung *</Label>
            <Select value={selectedRewardId} onValueChange={setSelectedRewardId}>
              <SelectTrigger>
                <SelectValue placeholder="Belohnung auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {rewards?.map((reward) => (
                  <SelectItem key={reward.id} value={reward.id}>
                    <div className="flex items-center gap-2">
                      <span>{reward.name}</span>
                      <span className="text-muted-foreground text-xs">
                        ({CATEGORY_LABELS[reward.category as RewardCategory]})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedReward && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-1 text-sm">
              <div><strong>Wert:</strong> {selectedReward.value_display}</div>
              <div><strong>Kategorie:</strong> {CATEGORY_LABELS[selectedReward.category]}</div>
              {selectedReward.description && (
                <div><strong>Beschreibung:</strong> {selectedReward.description}</div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Begründung / Notiz</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optionale Begründung für die Vergabe..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || !selectedEmployeeId || !selectedRewardId}
            >
              {createMutation.isPending ? 'Wird vergeben...' : 'Belohnung vergeben'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
