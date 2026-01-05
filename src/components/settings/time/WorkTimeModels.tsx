
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Plus, Settings, Calendar, Users, Target } from "lucide-react";
import { toast } from "sonner";

interface WorkTimeModel {
  id: string;
  name: string;
  type: 'fixed' | 'flexible' | 'shift' | 'custom';
  weeklyHours: number;
  dailyHours: number;
  flexibleStart: string;
  flexibleEnd: string;
  coreHours: {
    start: string;
    end: string;
  };
  breakTime: number;
  isActive: boolean;
  applicableFor: string[];
}

const WorkTimeModels = () => {
  const [models, setModels] = useState<WorkTimeModel[]>([
    {
      id: '1',
      name: 'Vollzeit Standard',
      type: 'fixed',
      weeklyHours: 40,
      dailyHours: 8,
      flexibleStart: '08:00',
      flexibleEnd: '17:00',
      coreHours: { start: '09:00', end: '16:00' },
      breakTime: 60,
      isActive: true,
      applicableFor: ['Vollzeit']
    },
    {
      id: '2',
      name: 'Teilzeit 30h',
      type: 'flexible',
      weeklyHours: 30,
      dailyHours: 6,
      flexibleStart: '07:00',
      flexibleEnd: '18:00',
      coreHours: { start: '10:00', end: '15:00' },
      breakTime: 45,
      isActive: true,
      applicableFor: ['Teilzeit']
    }
  ]);

  const [showNewModelForm, setShowNewModelForm] = useState(false);
  const [newModel, setNewModel] = useState<Partial<WorkTimeModel>>({
    name: '',
    type: 'fixed',
    weeklyHours: 40,
    dailyHours: 8,
    flexibleStart: '08:00',
    flexibleEnd: '17:00',
    coreHours: { start: '09:00', end: '16:00' },
    breakTime: 60,
    isActive: true,
    applicableFor: []
  });

  const handleSaveModel = () => {
    if (!newModel.name) {
      toast.error("Name des Arbeitszeitmodells ist erforderlich");
      return;
    }

    const modelToSave: WorkTimeModel = {
      id: Date.now().toString(),
      name: newModel.name,
      type: newModel.type || 'fixed',
      weeklyHours: newModel.weeklyHours || 40,
      dailyHours: newModel.dailyHours || 8,
      flexibleStart: newModel.flexibleStart || '08:00',
      flexibleEnd: newModel.flexibleEnd || '17:00',
      coreHours: newModel.coreHours || { start: '09:00', end: '16:00' },
      breakTime: newModel.breakTime || 60,
      isActive: newModel.isActive || true,
      applicableFor: newModel.applicableFor || []
    };

    setModels(prev => [...prev, modelToSave]);
    toast.success("Arbeitszeitmodell gespeichert");
    setShowNewModelForm(false);
    setNewModel({
      name: '',
      type: 'fixed',
      weeklyHours: 40,
      dailyHours: 8,
      flexibleStart: '08:00',
      flexibleEnd: '17:00',
      coreHours: { start: '09:00', end: '16:00' },
      breakTime: 60,
      isActive: true,
      applicableFor: []
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'fixed': return 'Feste Zeiten';
      case 'flexible': return 'Gleitzeit';
      case 'shift': return 'Schichtarbeit';
      case 'custom': return 'Individuell';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'fixed': return 'bg-blue-100 text-blue-800';
      case 'flexible': return 'bg-green-100 text-green-800';
      case 'shift': return 'bg-orange-100 text-orange-800';
      case 'custom': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Arbeitszeitmodelle</h2>
          <p className="text-sm text-gray-600 mt-1">
            Verwalten Sie verschiedene Arbeitszeitmodelle für Ihre Mitarbeiter
          </p>
        </div>
        <Button 
          onClick={() => setShowNewModelForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Neues Modell
        </Button>
      </div>

      {showNewModelForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Neues Arbeitszeitmodell erstellen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="model-name">Name des Modells</Label>
                <Input
                  id="model-name"
                  value={newModel.name || ''}
                  onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                  placeholder="z.B. Vollzeit Standard"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model-type">Typ</Label>
                <Select 
                  value={newModel.type} 
                  onValueChange={(value: 'fixed' | 'flexible' | 'shift' | 'custom') => 
                    setNewModel({ ...newModel, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Feste Zeiten</SelectItem>
                    <SelectItem value="flexible">Gleitzeit</SelectItem>
                    <SelectItem value="shift">Schichtarbeit</SelectItem>
                    <SelectItem value="custom">Individuell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weekly-hours">Wochenstunden</Label>
                <Input
                  id="weekly-hours"
                  type="number"
                  value={newModel.weeklyHours || 40}
                  onChange={(e) => setNewModel({ ...newModel, weeklyHours: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daily-hours">Tagesstunden</Label>
                <Input
                  id="daily-hours"
                  type="number"
                  value={newModel.dailyHours || 8}
                  onChange={(e) => setNewModel({ ...newModel, dailyHours: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="break-time">Pausenzeit (min)</Label>
                <Input
                  id="break-time"
                  type="number"
                  value={newModel.breakTime || 60}
                  onChange={(e) => setNewModel({ ...newModel, breakTime: Number(e.target.value) })}
                />
              </div>
            </div>

            {newModel.type === 'flexible' && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Gleitzeit-Einstellungen</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flexible-start">Frühester Beginn</Label>
                      <Input
                        id="flexible-start"
                        type="time"
                        value={newModel.flexibleStart || '08:00'}
                        onChange={(e) => setNewModel({ ...newModel, flexibleStart: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="flexible-end">Spätestes Ende</Label>
                      <Input
                        id="flexible-end"
                        type="time"
                        value={newModel.flexibleEnd || '17:00'}
                        onChange={(e) => setNewModel({ ...newModel, flexibleEnd: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="core-start">Kernzeit Beginn</Label>
                      <Input
                        id="core-start"
                        type="time"
                        value={newModel.coreHours?.start || '09:00'}
                        onChange={(e) => setNewModel({ 
                          ...newModel, 
                          coreHours: { ...newModel.coreHours, start: e.target.value } as any
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="core-end">Kernzeit Ende</Label>
                      <Input
                        id="core-end"
                        type="time"
                        value={newModel.coreHours?.end || '16:00'}
                        onChange={(e) => setNewModel({ 
                          ...newModel, 
                          coreHours: { ...newModel.coreHours, end: e.target.value } as any
                        })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="is-active"
                checked={newModel.isActive || false}
                onCheckedChange={(checked) => setNewModel({ ...newModel, isActive: checked })}
              />
              <Label htmlFor="is-active">Modell aktiv</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveModel}>
                Modell speichern
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNewModelForm(false)}
              >
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {models.map((model) => (
          <Card key={model.id} className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">{model.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTypeColor(model.type)}>
                        {getTypeLabel(model.type)}
                      </Badge>
                      <Badge variant={model.isActive ? "default" : "secondary"}>
                        {model.isActive ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Bearbeiten
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-gray-500">Wochenstunden:</span>
                    <p className="font-medium">{model.weeklyHours}h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-gray-500">Tagesstunden:</span>
                    <p className="font-medium">{model.dailyHours}h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-gray-500">Pausenzeit:</span>
                    <p className="font-medium">{model.breakTime} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-gray-500">Anwendbar für:</span>
                    <p className="font-medium">
                      {model.applicableFor.length > 0 ? model.applicableFor.join(', ') : 'Alle'}
                    </p>
                  </div>
                </div>
              </div>

              {model.type === 'flexible' && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Arbeitszeit:</span>
                      <p className="font-medium">{model.flexibleStart} - {model.flexibleEnd}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Kernzeit:</span>
                      <p className="font-medium">{model.coreHours.start} - {model.coreHours.end}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {models.length === 0 && !showNewModelForm && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Arbeitszeitmodelle</h3>
            <p className="text-gray-500 mb-4">
              Erstellen Sie Ihr erstes Arbeitszeitmodell, um zu beginnen.
            </p>
            <Button onClick={() => setShowNewModelForm(true)}>
              Erstes Modell erstellen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkTimeModels;
