import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen } from 'lucide-react';
import { useEnterpriseRoadmap } from '@/hooks/roadmap/useEnterpriseRoadmap';
import type { Program } from '@/types/enterprise-roadmap.types';

interface CreateProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateProgramDialog = ({ open, onOpenChange, onSuccess }: CreateProgramDialogProps) => {
  const { createProgram, strategicThemes } = useEnterpriseRoadmap('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    strategic_theme_id: '',
    status: 'draft' as const,
    priority: 'medium' as const,
    budget_allocated: 0,
    currency: 'EUR',
    start_date: '',
    end_date: '',
    risk_level: 'medium' as const,
    region: '',
    business_unit: ''
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createProgram.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        strategic_theme_id: formData.strategic_theme_id || undefined,
        status: formData.status,
        priority: formData.priority,
        budget_allocated: formData.budget_allocated,
        budget_spent: 0,
        currency: formData.currency,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        completion_percentage: 0,
        risk_level: formData.risk_level,
        region: formData.region || undefined,
        business_unit: formData.business_unit || undefined,
        esg_impact: {},
        kpis: [],
        stakeholders: [],
        dependencies: []
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        strategic_theme_id: '',
        status: 'draft',
        priority: 'medium',
        budget_allocated: 0,
        currency: 'EUR',
        start_date: '',
        end_date: '',
        risk_level: 'medium',
        region: '',
        business_unit: ''
      });
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Fehler beim Erstellen des Programms:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Programm erstellen</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Erstellen Sie ein neues strategisches Programm
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Grunddaten */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Programmname *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Digitalisierungsinitiative 2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Beschreibung des Programms"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Strategisches Thema</Label>
              <Select
                value={formData.strategic_theme_id}
                onValueChange={(value) => setFormData({ ...formData, strategic_theme_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Thema auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Kein Thema</SelectItem>
                  {strategicThemes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Entwurf</SelectItem>
                    <SelectItem value="planning">Planung</SelectItem>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                    <SelectItem value="archived">Archiviert</SelectItem>
                    <SelectItem value="on_hold">Pausiert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priorität</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Niedrig</SelectItem>
                    <SelectItem value="medium">Mittel</SelectItem>
                    <SelectItem value="high">Hoch</SelectItem>
                    <SelectItem value="critical">Kritisch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget_allocated}
                  onChange={(e) => setFormData({ ...formData, budget_allocated: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Währung</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CHF">CHF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Startdatum</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Enddatum</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Risiko-Level</Label>
              <Select
                value={formData.risk_level}
                onValueChange={(value: any) => setFormData({ ...formData, risk_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="critical">Kritisch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  placeholder="z.B. DACH, EU, Global"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_unit">Business Unit</Label>
                <Input
                  id="business_unit"
                  value={formData.business_unit}
                  onChange={(e) => setFormData({ ...formData, business_unit: e.target.value })}
                  placeholder="z.B. IT, Marketing, HR"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()}>
            {isSubmitting ? 'Erstelle...' : 'Programm erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};