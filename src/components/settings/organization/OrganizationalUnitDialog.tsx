import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type {
  OrganizationalUnit,
  OrganizationalUnitType,
  CreateOrganizationalUnitData,
  UpdateOrganizationalUnitData,
  VisibilityLevel
} from '@/types/organizational-structure';

interface OrganizationalUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: OrganizationalUnit | null;
  units: OrganizationalUnit[];
  onSave: (data: CreateOrganizationalUnitData | UpdateOrganizationalUnitData) => Promise<OrganizationalUnit | boolean | null>;
}

const UNIT_TYPES: { value: OrganizationalUnitType; label: string }[] = [
  { value: 'area', label: 'Bereich' },
  { value: 'department', label: 'Abteilung' },
  { value: 'team', label: 'Team' },
  { value: 'location', label: 'Standort' },
  { value: 'subsidiary', label: 'Tochterunternehmen' }
];

const VISIBILITY_LEVELS: { value: VisibilityLevel; label: string }[] = [
  { value: 'public', label: 'Öffentlich' },
  { value: 'company', label: 'Unternehmen' },
  { value: 'internal', label: 'Intern' },
  { value: 'restricted', label: 'Eingeschränkt' }
];

export const OrganizationalUnitDialog: React.FC<OrganizationalUnitDialogProps> = ({
  open,
  onOpenChange,
  unit,
  units,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateOrganizationalUnitData>({
    name: '',
    type: 'department',
    code: '',
    description: '',
    parent_id: undefined,
    contact_email: '',
    phone: '',
    cost_center: '',
    budget_code: '',
    legal_entity: '',
    timezone: 'Europe/Berlin',
    visibility: 'company'
  });

  // Form mit Unit-Daten befüllen wenn im Edit-Modus
  useEffect(() => {
    if (unit) {
      setFormData({
        name: unit.name,
        type: unit.type,
        code: unit.code || '',
        description: unit.description || '',
        parent_id: unit.parent_id,
        contact_email: unit.contact_email || '',
        phone: unit.phone || '',
        cost_center: unit.cost_center || '',
        budget_code: unit.budget_code || '',
        legal_entity: unit.legal_entity || '',
        timezone: unit.timezone,
        visibility: unit.visibility
      });
    } else {
      // Reset form für neue Unit
      setFormData({
        name: '',
        type: 'department',
        code: '',
        description: '',
        parent_id: undefined,
        contact_email: '',
        phone: '',
        cost_center: '',
        budget_code: '',
        legal_entity: '',
        timezone: 'Europe/Berlin',
        visibility: 'company'
      });
    }
  }, [unit, open]);

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const saveData = unit ? { id: unit.id, ...formData } : formData;
      const result = await onSave(saveData);
      
      if (result) {
        onOpenChange(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // Mögliche Parent-Units (filtert aktuelle Unit und ihre Kinder aus)
  const availableParents = units.filter(u => 
    u.is_active && 
    u.id !== unit?.id && 
    !u.path.includes(unit?.id || '')
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {unit ? 'Organisationseinheit bearbeiten' : 'Neue Organisationseinheit'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Grunddaten */}
          <div className="space-y-4">
            <h3 className="font-medium">Grunddaten</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Name der Organisationseinheit"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Eindeutiger Code"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Typ</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value: OrganizationalUnitType) => 
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Typ auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">Übergeordnete Einheit</Label>
                <Select 
                  value={formData.parent_id || ''} 
                  onValueChange={(value) => 
                    setFormData({ ...formData, parent_id: value || undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Keine übergeordnete Einheit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Keine übergeordnete Einheit</SelectItem>
                    {availableParents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        <div className="flex items-center gap-2">
                          <span>{parent.name}</span>
                          <Badge variant="outline">{parent.type}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Beschreibung der Organisationseinheit"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Kontaktdaten */}
          <div className="space-y-4">
            <h3 className="font-medium">Kontaktdaten</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">E-Mail</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="kontakt@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+49 123 456789"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Organisatorische Daten */}
          <div className="space-y-4">
            <h3 className="font-medium">Organisatorische Daten</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_center">Kostenstelle</Label>
                <Input
                  id="cost_center"
                  value={formData.cost_center}
                  onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
                  placeholder="KST-001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget_code">Budget-Code</Label>
                <Input
                  id="budget_code"
                  value={formData.budget_code}
                  onChange={(e) => setFormData({ ...formData, budget_code: e.target.value })}
                  placeholder="BGT-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="legal_entity">Rechtliche Einheit</Label>
                <Input
                  id="legal_entity"
                  value={formData.legal_entity}
                  onChange={(e) => setFormData({ ...formData, legal_entity: e.target.value })}
                  placeholder="GmbH & Co. KG"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Zeitzone</Label>
                <Select 
                  value={formData.timezone} 
                  onValueChange={(value) => 
                    setFormData({ ...formData, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Berlin">Europe/Berlin (MEZ)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Sichtbarkeit</Label>
                <Select 
                  value={formData.visibility} 
                  onValueChange={(value: VisibilityLevel) => 
                    setFormData({ ...formData, visibility: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIBILITY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Speichern...' : 'Speichern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};