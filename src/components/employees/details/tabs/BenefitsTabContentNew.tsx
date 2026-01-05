import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { Gift, Plus, Check, Clock, Euro } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BenefitsTabContentNewProps {
  employeeId: string;
}

export const BenefitsTabContentNew: React.FC<BenefitsTabContentNewProps> = ({ employeeId }) => {
  const { canCreate, canEdit, canDelete } = useEnterprisePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    value: '',
    startDate: '',
    status: 'active'
  });

  const handleCreate = () => {
    setBenefits([...benefits, { id: Date.now(), ...formData }]);
    setDialogOpen(false);
    setFormData({ name: '', category: '', value: '', startDate: '', status: 'active' });
  };

  const categories = [
    { value: 'health', label: 'Gesundheit' },
    { value: 'mobility', label: 'Mobilität' },
    { value: 'pension', label: 'Altersvorsorge' },
    { value: 'education', label: 'Weiterbildung' },
    { value: 'other', label: 'Sonstiges' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Benefits
        </h2>
        {canCreate('employee_benefits') && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Benefit zuweisen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{benefits.length}</p>
              <p className="text-xs text-muted-foreground">Aktive Benefits</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {benefits.reduce((sum, b) => sum + (parseFloat(b.value) || 0), 0).toFixed(0)}€
              </p>
              <p className="text-xs text-muted-foreground">Gesamtwert / Monat</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{new Set(benefits.map(b => b.category)).size}</p>
              <p className="text-xs text-muted-foreground">Kategorien</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Zugewiesene Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {benefits.length > 0 ? (
            <div className="space-y-3">
              {benefits.map((benefit) => (
                <div key={benefit.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{benefit.name}</span>
                      <Badge variant="outline">
                        {categories.find(c => c.value === benefit.category)?.label || benefit.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Seit: {benefit.startDate || 'Nicht angegeben'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Euro className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{benefit.value || 0}</span>
                  </div>
                  <Badge variant={benefit.status === 'active' ? 'default' : 'secondary'}>
                    {benefit.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Benefits zugewiesen</p>
              {canCreate('employee_benefits') && (
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erstes Benefit zuweisen
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Benefit zuweisen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Benefit-Name</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="z.B. JobRad, BahnCard"
              />
            </div>
            <div>
              <Label>Kategorie</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Wert (€ / Monat)</Label>
              <Input 
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Startdatum</Label>
              <Input 
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleCreate}>Zuweisen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
