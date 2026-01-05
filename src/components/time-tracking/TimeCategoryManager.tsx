import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Clock, DollarSign, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TimeCategory, BreakType } from '@/types/location-tracking.types';

interface TimeCategoryManagerProps {
  categories: TimeCategory[];
  breakTypes: BreakType[];
  onCategoryCreate: (category: Omit<TimeCategory, 'id' | 'created_at' | 'updated_at'>) => void;
  onCategoryUpdate: (id: string, category: Partial<TimeCategory>) => void;
  onCategoryDelete: (id: string) => void;
  onBreakTypeCreate: (breakType: Omit<BreakType, 'id' | 'created_at' | 'updated_at'>) => void;
  onBreakTypeUpdate: (id: string, breakType: Partial<BreakType>) => void;
  onBreakTypeDelete: (id: string) => void;
}

export const TimeCategoryManager: React.FC<TimeCategoryManagerProps> = ({
  categories,
  breakTypes,
  onCategoryCreate,
  onCategoryUpdate,
  onCategoryDelete,
  onBreakTypeCreate,
  onBreakTypeUpdate,
  onBreakTypeDelete
}) => {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showBreakForm, setShowBreakForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TimeCategory | null>(null);
  const [editingBreak, setEditingBreak] = useState<BreakType | null>(null);
  
  const { toast } = useToast();

  // Form States
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    code: '',
    color: '#3B82F6',
    icon: '',
    is_billable: true,
    is_overtime: false,
    overtime_multiplier: 1.5,
    compensation_type: 'payment' as 'time_off' | 'payment' | 'both',
    hourly_rate: 0,
    time_off_ratio: 1.0,
    requires_approval: false,
    description: '',
    is_active: true
  });

  const [breakForm, setBreakForm] = useState({
    name: '',
    type: 'fixed' as 'fixed' | 'semi_flexible' | 'flexible',
    duration_minutes: 30,
    min_duration_minutes: 15,
    max_duration_minutes: 60,
    is_paid: true,
    is_mandatory: false,
    after_work_hours: 6,
    auto_deduct: true,
    description: '',
    is_active: true
  });

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      code: '',
      color: '#3B82F6',
      icon: '',
      is_billable: true,
      is_overtime: false,
      overtime_multiplier: 1.5,
      compensation_type: 'payment',
      hourly_rate: 0,
      time_off_ratio: 1.0,
      requires_approval: false,
      description: '',
      is_active: true
    });
    setEditingCategory(null);
  };

  const resetBreakForm = () => {
    setBreakForm({
      name: '',
      type: 'fixed',
      duration_minutes: 30,
      min_duration_minutes: 15,
      max_duration_minutes: 60,
      is_paid: true,
      is_mandatory: false,
      after_work_hours: 6,
      auto_deduct: true,
      description: '',
      is_active: true
    });
    setEditingBreak(null);
  };

  const handleCategorySubmit = () => {
    if (!categoryForm.name.trim() || !categoryForm.code.trim()) {
      toast({
        title: "Fehlende Eingaben",
        description: "Name und Code sind erforderlich.",
        variant: "destructive"
      });
      return;
    }

    if (editingCategory) {
      onCategoryUpdate(editingCategory.id, categoryForm);
      toast({
        title: "Kategorie aktualisiert",
        description: `${categoryForm.name} wurde erfolgreich aktualisiert.`
      });
    } else {
      onCategoryCreate(categoryForm);
      toast({
        title: "Kategorie erstellt",
        description: `${categoryForm.name} wurde erfolgreich erstellt.`
      });
    }

    resetCategoryForm();
    setShowCategoryForm(false);
  };

  const handleBreakSubmit = () => {
    if (!breakForm.name.trim()) {
      toast({
        title: "Fehlende Eingaben",
        description: "Name ist erforderlich.",
        variant: "destructive"
      });
      return;
    }

    if (editingBreak) {
      onBreakTypeUpdate(editingBreak.id, breakForm);
      toast({
        title: "Pausentyp aktualisiert",
        description: `${breakForm.name} wurde erfolgreich aktualisiert.`
      });
    } else {
      onBreakTypeCreate(breakForm);
      toast({
        title: "Pausentyp erstellt",
        description: `${breakForm.name} wurde erfolgreich erstellt.`
      });
    }

    resetBreakForm();
    setShowBreakForm(false);
  };

  const editCategory = (category: TimeCategory) => {
    setCategoryForm({
      name: category.name,
      code: category.code,
      color: category.color,
      icon: category.icon || '',
      is_billable: category.is_billable,
      is_overtime: category.is_overtime,
      overtime_multiplier: category.overtime_multiplier || 1.5,
      compensation_type: category.compensation_type,
      hourly_rate: category.hourly_rate || 0,
      time_off_ratio: category.time_off_ratio || 1.0,
      requires_approval: category.requires_approval,
      description: category.description || '',
      is_active: category.is_active
    });
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const editBreakType = (breakType: BreakType) => {
    setBreakForm({
      name: breakType.name,
      type: breakType.type,
      duration_minutes: breakType.duration_minutes,
      min_duration_minutes: breakType.min_duration_minutes || 15,
      max_duration_minutes: breakType.max_duration_minutes || 60,
      is_paid: breakType.is_paid,
      is_mandatory: breakType.is_mandatory,
      after_work_hours: breakType.after_work_hours,
      auto_deduct: breakType.auto_deduct,
      description: breakType.description || '',
      is_active: breakType.is_active
    });
    setEditingBreak(breakType);
    setShowBreakForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Zeitkategorien */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Zeitkategorien
          </CardTitle>
          <Button 
            onClick={() => setShowCategoryForm(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Neue Kategorie
          </Button>
        </CardHeader>
        <CardContent>
          {showCategoryForm && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-4">
                {editingCategory ? 'Kategorie bearbeiten' : 'Neue Zeitkategorie'}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cat-name">Name</Label>
                  <Input
                    id="cat-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="z.B. Normalarbeitszeit"
                  />
                </div>
                <div>
                  <Label htmlFor="cat-code">Code</Label>
                  <Input
                    id="cat-code"
                    value={categoryForm.code}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="z.B. NORM"
                    maxLength={10}
                  />
                </div>
                <div>
                  <Label htmlFor="cat-color">Farbe</Label>
                  <Input
                    id="cat-color"
                    type="color"
                    value={categoryForm.color}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, color: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cat-compensation">Vergütungsart</Label>
                  <Select
                    value={categoryForm.compensation_type}
                    onValueChange={(value: 'time_off' | 'payment' | 'both') => 
                      setCategoryForm(prev => ({ ...prev, compensation_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">Bezahlung</SelectItem>
                      <SelectItem value="time_off">Freizeit</SelectItem>
                      <SelectItem value="both">Beide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cat-hourly-rate">Stundensatz (€)</Label>
                  <Input
                    id="cat-hourly-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={categoryForm.hourly_rate}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cat-timeoff-ratio">Freizeitsatz</Label>
                  <Input
                    id="cat-timeoff-ratio"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={categoryForm.time_off_ratio}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, time_off_ratio: parseFloat(e.target.value) || 1.0 }))}
                    placeholder="1.0 = 1:1, 1.5 = 1,5:1"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="cat-description">Beschreibung</Label>
                  <Textarea
                    id="cat-description"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optionale Beschreibung..."
                  />
                </div>
                <div className="col-span-2 flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={categoryForm.is_billable}
                      onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, is_billable: checked }))}
                    />
                    <Label>Abrechenbar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={categoryForm.is_overtime}
                      onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, is_overtime: checked }))}
                    />
                    <Label>Überstunden</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={categoryForm.requires_approval}
                      onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, requires_approval: checked }))}
                    />
                    <Label>Genehmigung erforderlich</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={categoryForm.is_active}
                      onCheckedChange={(checked) => setCategoryForm(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>Aktiv</Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCategorySubmit}>
                  {editingCategory ? 'Aktualisieren' : 'Erstellen'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCategoryForm(false);
                    resetCategoryForm();
                  }}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      <Badge variant="outline">{category.code}</Badge>
                      {category.is_overtime && <Badge variant="secondary">Überstunden</Badge>}
                      {!category.is_active && <Badge variant="destructive">Inaktiv</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.compensation_type === 'payment' && `€${category.hourly_rate}/h`}
                      {category.compensation_type === 'time_off' && `${category.time_off_ratio}:1 Freizeit`}
                      {category.compensation_type === 'both' && `€${category.hourly_rate}/h oder ${category.time_off_ratio}:1 Freizeit`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editCategory(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCategoryDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Noch keine Zeitkategorien definiert. Erstellen Sie Ihre erste Kategorie.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pausentypen */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5" />
            Pausentypen
          </CardTitle>
          <Button 
            onClick={() => setShowBreakForm(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Neuer Pausentyp
          </Button>
        </CardHeader>
        <CardContent>
          {showBreakForm && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-4">
                {editingBreak ? 'Pausentyp bearbeiten' : 'Neuer Pausentyp'}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="break-name">Name</Label>
                  <Input
                    id="break-name"
                    value={breakForm.name}
                    onChange={(e) => setBreakForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="z.B. Mittagspause"
                  />
                </div>
                <div>
                  <Label htmlFor="break-type">Typ</Label>
                  <Select
                    value={breakForm.type}
                    onValueChange={(value: 'fixed' | 'semi_flexible' | 'flexible') => 
                      setBreakForm(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fest</SelectItem>
                      <SelectItem value="semi_flexible">Halbflexibel</SelectItem>
                      <SelectItem value="flexible">Flexibel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="break-duration">Dauer (Minuten)</Label>
                  <Input
                    id="break-duration"
                    type="number"
                    min="5"
                    max="480"
                    value={breakForm.duration_minutes}
                    onChange={(e) => setBreakForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 30 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="break-after-hours">Nach Arbeitsstunden</Label>
                  <Input
                    id="break-after-hours"
                    type="number"
                    min="1"
                    max="12"
                    value={breakForm.after_work_hours}
                    onChange={(e) => setBreakForm(prev => ({ ...prev, after_work_hours: parseInt(e.target.value) || 6 }))}
                  />
                </div>
                {breakForm.type !== 'fixed' && (
                  <>
                    <div>
                      <Label htmlFor="break-min">Min. Dauer (Minuten)</Label>
                      <Input
                        id="break-min"
                        type="number"
                        min="5"
                        value={breakForm.min_duration_minutes}
                        onChange={(e) => setBreakForm(prev => ({ ...prev, min_duration_minutes: parseInt(e.target.value) || 15 }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="break-max">Max. Dauer (Minuten)</Label>
                      <Input
                        id="break-max"
                        type="number"
                        min="5"
                        value={breakForm.max_duration_minutes}
                        onChange={(e) => setBreakForm(prev => ({ ...prev, max_duration_minutes: parseInt(e.target.value) || 60 }))}
                      />
                    </div>
                  </>
                )}
                <div className="col-span-2">
                  <Label htmlFor="break-description">Beschreibung</Label>
                  <Textarea
                    id="break-description"
                    value={breakForm.description}
                    onChange={(e) => setBreakForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optionale Beschreibung..."
                  />
                </div>
                <div className="col-span-2 flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={breakForm.is_paid}
                      onCheckedChange={(checked) => setBreakForm(prev => ({ ...prev, is_paid: checked }))}
                    />
                    <Label>Bezahlt</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={breakForm.is_mandatory}
                      onCheckedChange={(checked) => setBreakForm(prev => ({ ...prev, is_mandatory: checked }))}
                    />
                    <Label>Pflichtpause</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={breakForm.auto_deduct}
                      onCheckedChange={(checked) => setBreakForm(prev => ({ ...prev, auto_deduct: checked }))}
                    />
                    <Label>Automatisch abziehen</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={breakForm.is_active}
                      onCheckedChange={(checked) => setBreakForm(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>Aktiv</Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleBreakSubmit}>
                  {editingBreak ? 'Aktualisieren' : 'Erstellen'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowBreakForm(false);
                    resetBreakForm();
                  }}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {breakTypes.map((breakType) => (
              <div key={breakType.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Coffee className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{breakType.name}</span>
                      <Badge variant="outline">
                        {breakType.type === 'fixed' ? 'Fest' : 
                         breakType.type === 'semi_flexible' ? 'Halbflexibel' : 'Flexibel'}
                      </Badge>
                      {breakType.is_paid && <Badge variant="secondary">Bezahlt</Badge>}
                      {breakType.is_mandatory && <Badge variant="destructive">Pflicht</Badge>}
                      {!breakType.is_active && <Badge variant="outline">Inaktiv</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {breakType.duration_minutes} Min. nach {breakType.after_work_hours}h Arbeit
                      {breakType.type !== 'fixed' && ` (${breakType.min_duration_minutes}-${breakType.max_duration_minutes} Min.)`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editBreakType(breakType)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBreakTypeDelete(breakType.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {breakTypes.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Noch keine Pausentypen definiert. Erstellen Sie Ihren ersten Pausentyp.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};