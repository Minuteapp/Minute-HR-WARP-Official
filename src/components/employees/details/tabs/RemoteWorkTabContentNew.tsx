import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { Wifi, Plus, Home, Building, Calendar, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RemoteWorkTabContentNewProps {
  employeeId: string;
}

export const RemoteWorkTabContentNew: React.FC<RemoteWorkTabContentNewProps> = ({ employeeId }) => {
  const { canCreate } = useEnterprisePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    daysPerWeek: '',
    startDate: '',
    endDate: '',
    location: '',
    notes: ''
  });

  const handleCreate = () => {
    setAgreements([...agreements, { id: Date.now(), ...formData, status: 'active' }]);
    setDialogOpen(false);
    setFormData({ type: '', daysPerWeek: '', startDate: '', endDate: '', location: '', notes: '' });
  };

  const workTypes = [
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'full_remote', label: 'Vollzeit Remote' },
    { value: 'temporary', label: 'Temporär' },
    { value: 'workation', label: 'Workation' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Remote Work
        </h2>
        {canCreate('employee_remote') && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Vereinbarung hinzufügen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Home className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold">{agreements.length}</p>
              <p className="text-xs text-muted-foreground">Aktive Vereinbarungen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {agreements.reduce((sum, a) => sum + (parseInt(a.daysPerWeek) || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Remote-Tage / Woche</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {agreements.filter(a => a.type === 'hybrid').length}
              </p>
              <p className="text-xs text-muted-foreground">Hybrid-Vereinbarungen</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Remote-Vereinbarungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agreements.length > 0 ? (
            <div className="space-y-3">
              {agreements.map((agreement) => (
                <div key={agreement.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Home className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {workTypes.find(t => t.value === agreement.type)?.label || agreement.type}
                      </span>
                      <Badge variant="outline">
                        {agreement.daysPerWeek} Tage/Woche
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {agreement.startDate} - {agreement.endDate || 'unbefristet'}
                      </span>
                      {agreement.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {agreement.location}
                        </span>
                      )}
                    </div>
                    {agreement.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{agreement.notes}</p>
                    )}
                  </div>
                  <Badge variant={agreement.status === 'active' ? 'default' : 'secondary'}>
                    {agreement.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Wifi className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Remote-Vereinbarungen vorhanden</p>
              {canCreate('employee_remote') && (
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Vereinbarung hinzufügen
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remote-Vereinbarung hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Art der Vereinbarung</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Art wählen" />
                </SelectTrigger>
                <SelectContent>
                  {workTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Remote-Tage pro Woche</Label>
              <Input 
                type="number"
                min="1"
                max="5"
                value={formData.daysPerWeek}
                onChange={(e) => setFormData({...formData, daysPerWeek: e.target.value})}
                placeholder="z.B. 2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Startdatum</Label>
                <Input 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label>Enddatum (optional)</Label>
                <Input 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label>Remote-Standort</Label>
              <Input 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="z.B. Homeoffice, Coworking Space"
              />
            </div>
            <div>
              <Label>Notizen</Label>
              <Textarea 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Zusätzliche Informationen..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleCreate}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
