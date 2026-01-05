import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, X } from 'lucide-react';
import { useEnterpriseRoadmap } from '@/hooks/roadmap/useEnterpriseRoadmap';
import type { StrategicTheme } from '@/types/enterprise-roadmap.types';

interface CreateStrategicThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const CreateStrategicThemeDialog = ({ open, onOpenChange, onSuccess }: CreateStrategicThemeDialogProps) => {
  const { createStrategicTheme } = useEnterpriseRoadmap('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    status: 'draft' as const,
    start_date: '',
    end_date: '',
    strategic_alignment: {} as Record<string, any>,
    esg_metrics: {} as Record<string, any>
  });

  const [alignmentKeys, setAlignmentKeys] = useState<string[]>([]);
  const [esgKeys, setEsgKeys] = useState<string[]>([]);
  const [newAlignmentKey, setNewAlignmentKey] = useState('');
  const [newAlignmentValue, setNewAlignmentValue] = useState('');
  const [newEsgKey, setNewEsgKey] = useState('');
  const [newEsgValue, setNewEsgValue] = useState('');

  const predefinedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  const addAlignment = () => {
    if (newAlignmentKey && newAlignmentValue) {
      setFormData(prev => ({
        ...prev,
        strategic_alignment: {
          ...prev.strategic_alignment,
          [newAlignmentKey]: newAlignmentValue
        }
      }));
      setAlignmentKeys(prev => [...prev, newAlignmentKey]);
      setNewAlignmentKey('');
      setNewAlignmentValue('');
    }
  };

  const removeAlignment = (key: string) => {
    setFormData(prev => {
      const { [key]: removed, ...rest } = prev.strategic_alignment;
      return { ...prev, strategic_alignment: rest };
    });
    setAlignmentKeys(prev => prev.filter(k => k !== key));
  };

  const addEsgMetric = () => {
    if (newEsgKey && newEsgValue) {
      setFormData(prev => ({
        ...prev,
        esg_metrics: {
          ...prev.esg_metrics,
          [newEsgKey]: newEsgValue
        }
      }));
      setEsgKeys(prev => [...prev, newEsgKey]);
      setNewEsgKey('');
      setNewEsgValue('');
    }
  };

  const removeEsgMetric = (key: string) => {
    setFormData(prev => {
      const { [key]: removed, ...rest } = prev.esg_metrics;
      return { ...prev, esg_metrics: rest };
    });
    setEsgKeys(prev => prev.filter(k => k !== key));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createStrategicTheme.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        color: formData.color,
        status: formData.status,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        strategic_alignment: formData.strategic_alignment,
        esg_metrics: formData.esg_metrics
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        status: 'draft',
        start_date: '',
        end_date: '',
        strategic_alignment: {},
        esg_metrics: {}
      });
      setAlignmentKeys([]);
      setEsgKeys([]);
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Fehler beim Erstellen des strategischen Themas:', error);
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
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Strategisches Thema erstellen</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Definieren Sie ein übergeordnetes strategisches Ziel
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Grunddaten */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Digitale Transformation"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Beschreibung des strategischen Themas"
                rows={3}
              />
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
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                    <SelectItem value="archived">Archiviert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Farbe</Label>
                <div className="flex gap-2 flex-wrap">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-900' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
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
          </div>

          {/* Strategische Ausrichtung */}
          <div className="space-y-4">
            <Label>Strategische Ausrichtung</Label>
            <div className="space-y-3">
              {alignmentKeys.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-2">
                    {key}: {formData.strategic_alignment[key]}
                    <button
                      type="button"
                      onClick={() => removeAlignment(key)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Schlüssel"
                  value={newAlignmentKey}
                  onChange={(e) => setNewAlignmentKey(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Wert"
                  value={newAlignmentValue}
                  onChange={(e) => setNewAlignmentValue(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={addAlignment} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* ESG Metriken */}
          <div className="space-y-4">
            <Label>ESG-Metriken</Label>
            <div className="space-y-3">
              {esgKeys.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-2">
                    {key}: {formData.esg_metrics[key]}
                    <button
                      type="button"
                      onClick={() => removeEsgMetric(key)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Metrik"
                  value={newEsgKey}
                  onChange={(e) => setNewEsgKey(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Zielwert"
                  value={newEsgValue}
                  onChange={(e) => setNewEsgValue(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={addEsgMetric} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.name.trim()}>
            {isSubmitting ? 'Erstelle...' : 'Thema erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};