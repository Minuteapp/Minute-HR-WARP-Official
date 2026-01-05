import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateRewardCampaign } from '@/hooks/useRewards';
import type { CreateRewardCampaignRequest, RewardTriggerType, GoodieType } from '@/types/rewards';

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCampaignDialog = ({ open, onOpenChange }: CreateCampaignDialogProps) => {
  const [formData, setFormData] = useState<CreateRewardCampaignRequest>({
    name: '',
    description: '',
    trigger_type: 'project_completion',
    trigger_conditions: {},
    goodie_type: 'amazon_voucher',
    goodie_value: 50,
    goodie_description: '',
    max_budget: 1000,
    max_participants: undefined,
    start_date: '',
    end_date: '',
    auto_approval: false,
    metadata: {}
  });

  const createCampaign = useCreateRewardCampaign();

  const triggerTypeOptions = [
    { value: 'project_completion', label: 'Projektabschluss' },
    { value: 'goal_achievement', label: 'Zielerreichung' },
    { value: 'performance_score', label: 'Performance Score' },
    { value: 'anniversary', label: 'Firmenjubiläum' },
    { value: 'birthday', label: 'Geburtstag' },
    { value: 'innovation_idea', label: 'Innovationsidee' },
    { value: 'peer_nomination', label: 'Peer-Nominierung' },
    { value: 'custom_event', label: 'Benutzerdefiniert' }
  ];

  const goodieTypeOptions = [
    { value: 'amazon_voucher', label: 'Amazon Gutschein' },
    { value: 'zalando_voucher', label: 'Zalando Gutschein' },
    { value: 'extra_vacation_day', label: 'Extra Urlaubstag' },
    { value: 'half_day_off', label: 'Halber freier Tag' },
    { value: 'meal_voucher', label: 'Essensgutschein' },
    { value: 'cash_bonus', label: 'Geldbonus' },
    { value: 'donation_option', label: 'Spendenaktion' },
    { value: 'physical_goodie', label: 'Physisches Goodie' },
    { value: 'custom', label: 'Individuell' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createCampaign.mutate(formData, {
      onSuccess: () => {
        onOpenChange(false);
        // Reset form
        setFormData({
          name: '',
          description: '',
          trigger_type: 'project_completion',
          trigger_conditions: {},
          goodie_type: 'amazon_voucher',
          goodie_value: 50,
          goodie_description: '',
          max_budget: 1000,
          max_participants: undefined,
          start_date: '',
          end_date: '',
          auto_approval: false,
          metadata: {}
        });
      }
    });
  };

  const updateFormData = (key: keyof CreateRewardCampaignRequest, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neue Belohnungskampagne erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grundlegende Informationen */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Kampagnenname *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="z.B. Projekt-Meilenstein Bonus Q4"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Beschreiben Sie die Kampagne..."
                rows={3}
              />
            </div>
          </div>

          {/* Trigger-Konfiguration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Auslöser-Konfiguration</h3>
            
            <div>
              <Label htmlFor="trigger_type">Trigger-Typ *</Label>
              <Select
                value={formData.trigger_type}
                onValueChange={(value) => updateFormData('trigger_type', value as RewardTriggerType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trigger-spezifische Bedingungen */}
            {formData.trigger_type === 'project_completion' && (
              <div>
                <Label htmlFor="min_project_value">Mindest-Projektwert (€)</Label>
                <Input
                  id="min_project_value"
                  type="number"
                  value={formData.trigger_conditions.min_project_value || ''}
                  onChange={(e) => updateFormData('trigger_conditions', {
                    ...formData.trigger_conditions,
                    min_project_value: Number(e.target.value)
                  })}
                  placeholder="100000"
                />
              </div>
            )}

            {formData.trigger_type === 'goal_achievement' && (
              <div>
                <Label htmlFor="achievement_percentage">Erforderliche Zielerreichung (%)</Label>
                <Input
                  id="achievement_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.trigger_conditions.achievement_percentage || ''}
                  onChange={(e) => updateFormData('trigger_conditions', {
                    ...formData.trigger_conditions,
                    achievement_percentage: Number(e.target.value)
                  })}
                  placeholder="90"
                />
              </div>
            )}

            {formData.trigger_type === 'performance_score' && (
              <div>
                <Label htmlFor="min_score">Mindest-Performance Score</Label>
                <Input
                  id="min_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.trigger_conditions.min_score || ''}
                  onChange={(e) => updateFormData('trigger_conditions', {
                    ...formData.trigger_conditions,
                    min_score: Number(e.target.value)
                  })}
                  placeholder="85"
                />
              </div>
            )}
          </div>

          {/* Belohnungs-Konfiguration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Belohnungs-Konfiguration</h3>
            
            <div>
              <Label htmlFor="goodie_type">Belohnungstyp *</Label>
              <Select
                value={formData.goodie_type}
                onValueChange={(value) => updateFormData('goodie_type', value as GoodieType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goodieTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="goodie_value">Belohnungswert (€) *</Label>
              <Input
                id="goodie_value"
                type="number"
                min="0"
                step="0.01"
                value={formData.goodie_value}
                onChange={(e) => updateFormData('goodie_value', Number(e.target.value))}
                required
              />
            </div>

            <div>
              <Label htmlFor="goodie_description">Belohnungsbeschreibung</Label>
              <Input
                id="goodie_description"
                value={formData.goodie_description}
                onChange={(e) => updateFormData('goodie_description', e.target.value)}
                placeholder="z.B. Amazon Gutschein für Online-Shopping"
              />
            </div>
          </div>

          {/* Budget und Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Budget & Limits</h3>
            
            <div>
              <Label htmlFor="max_budget">Maximales Budget (€)</Label>
              <Input
                id="max_budget"
                type="number"
                min="0"
                value={formData.max_budget || ''}
                onChange={(e) => updateFormData('max_budget', Number(e.target.value))}
                placeholder="1000"
              />
            </div>

            <div>
              <Label htmlFor="max_participants">Maximale Teilnehmer</Label>
              <Input
                id="max_participants"
                type="number"
                min="1"
                value={formData.max_participants || ''}
                onChange={(e) => updateFormData('max_participants', Number(e.target.value))}
                placeholder="Leer lassen für unbegrenzt"
              />
            </div>
          </div>

          {/* Zeitraum */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Laufzeit</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Startdatum</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateFormData('start_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end_date">Enddatum</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateFormData('end_date', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Einstellungen */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Einstellungen</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto_approval">Automatische Genehmigung</Label>
                <p className="text-sm text-muted-foreground">
                  Belohnungen werden automatisch genehmigt, ohne manuelle Überprüfung
                </p>
              </div>
              <Switch
                id="auto_approval"
                checked={formData.auto_approval}
                onCheckedChange={(checked) => updateFormData('auto_approval', checked)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createCampaign.isPending}>
              {createCampaign.isPending ? 'Wird erstellt...' : 'Kampagne erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};