import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { Leaf, Plus, Bike, Train, Car, Zap, TreePine, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';

interface SustainabilityTabContentNewProps {
  employeeId: string;
}

export const SustainabilityTabContentNew: React.FC<SustainabilityTabContentNewProps> = ({ employeeId }) => {
  const { canCreate } = useEnterprisePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    co2Saved: '',
    date: ''
  });

  const handleCreate = () => {
    setActivities([...activities, { 
      id: Date.now(), 
      ...formData, 
      createdAt: new Date().toISOString() 
    }]);
    setDialogOpen(false);
    setFormData({ type: '', description: '', co2Saved: '', date: '' });
  };

  const activityTypes = [
    { value: 'bike_commute', label: 'Fahrrad zur Arbeit', icon: Bike, co2PerUnit: 2.5 },
    { value: 'public_transport', label: 'Öffentliche Verkehrsmittel', icon: Train, co2PerUnit: 1.5 },
    { value: 'carpool', label: 'Fahrgemeinschaft', icon: Car, co2PerUnit: 1.0 },
    { value: 'remote_work', label: 'Homeoffice', icon: Zap, co2PerUnit: 3.0 },
    { value: 'tree_planting', label: 'Baumpflanzaktion', icon: TreePine, co2PerUnit: 20.0 }
  ];

  const getTypeIcon = (type: string) => {
    const config = activityTypes.find(t => t.value === type);
    if (config) {
      const Icon = config.icon;
      return <Icon className="h-5 w-5 text-green-500" />;
    }
    return <Leaf className="h-5 w-5 text-green-500" />;
  };

  const totalCO2Saved = activities.reduce((sum, a) => sum + (parseFloat(a.co2Saved) || 0), 0);
  const yearlyGoal = 500; // kg CO2

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Leaf className="h-5 w-5 text-green-500" />
          Nachhaltigkeit
        </h2>
        {canCreate('employee_sustainability') && (
          <Button onClick={() => setDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Aktivität erfassen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="text-center">
              <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">{totalCO2Saved.toFixed(1)} kg</p>
              <p className="text-xs text-green-600">CO₂ eingespart</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{activities.length}</p>
              <p className="text-xs text-muted-foreground">Aktivitäten</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {activities.filter(a => a.type === 'bike_commute').length}
              </p>
              <p className="text-xs text-muted-foreground">Fahrrad-Tage</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {activities.filter(a => a.type === 'remote_work').length}
              </p>
              <p className="text-xs text-muted-foreground">Homeoffice-Tage</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-green-500" />
            Jahresziel CO₂-Einsparung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{totalCO2Saved.toFixed(1)} kg von {yearlyGoal} kg</span>
              <span className="font-medium">{Math.min(100, (totalCO2Saved / yearlyGoal * 100)).toFixed(0)}%</span>
            </div>
            <Progress value={Math.min(100, (totalCO2Saved / yearlyGoal * 100))} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            Nachhaltigkeitsaktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg border-green-100">
                  {getTypeIcon(activity.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {activityTypes.find(t => t.value === activity.type)?.label || activity.type}
                      </span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        -{activity.co2Saved} kg CO₂
                      </Badge>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {activity.date ? new Date(activity.date).toLocaleDateString('de-DE') : new Date(activity.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Nachhaltigkeitsaktivitäten erfasst</p>
              {canCreate('employee_sustainability') && (
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Aktivität erfassen
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nachhaltigkeitsaktivität erfassen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Art der Aktivität</Label>
              <Select value={formData.type} onValueChange={(v) => {
                const config = activityTypes.find(t => t.value === v);
                setFormData({...formData, type: v, co2Saved: config?.co2PerUnit.toString() || ''});
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Aktivität wählen" />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Datum</Label>
              <Input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <Label>CO₂-Einsparung (kg)</Label>
              <Input 
                type="number"
                step="0.1"
                value={formData.co2Saved}
                onChange={(e) => setFormData({...formData, co2Saved: e.target.value})}
                placeholder="2.5"
              />
            </div>
            <div>
              <Label>Beschreibung (optional)</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="z.B. 15 km mit dem Fahrrad zur Arbeit"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
