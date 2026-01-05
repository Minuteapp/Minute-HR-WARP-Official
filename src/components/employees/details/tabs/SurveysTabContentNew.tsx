import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { ClipboardList, Plus, CheckCircle, Clock, AlertCircle, BarChart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SurveysTabContentNewProps {
  employeeId: string;
}

export const SurveysTabContentNew: React.FC<SurveysTabContentNewProps> = ({ employeeId }) => {
  const { canCreate } = useEnterprisePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    dueDate: ''
  });

  const handleCreate = () => {
    setSurveys([...surveys, { id: Date.now(), ...formData, status: 'pending', assignedAt: new Date().toISOString() }]);
    setDialogOpen(false);
    setFormData({ name: '', type: '', dueDate: '' });
  };

  const surveyTypes = [
    { value: 'engagement', label: 'Engagement' },
    { value: 'satisfaction', label: 'Zufriedenheit' },
    { value: 'pulse', label: 'Pulse Check' },
    { value: 'onboarding', label: 'Onboarding' },
    { value: 'exit', label: 'Exit-Interview' },
    { value: 'custom', label: 'Individuell' }
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Abgeschlossen</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Ausstehend</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Überfällig</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <ClipboardList className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Umfragen
        </h2>
        {canCreate('employee_surveys') && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Umfrage zuweisen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{surveys.length}</p>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {surveys.filter(s => s.status === 'completed').length}
              </p>
              <p className="text-xs text-muted-foreground">Abgeschlossen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {surveys.filter(s => s.status === 'pending').length}
              </p>
              <p className="text-xs text-muted-foreground">Ausstehend</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <BarChart className="h-5 w-5 text-blue-500" />
                <p className="text-2xl font-bold">
                  {surveys.length > 0 
                    ? Math.round((surveys.filter(s => s.status === 'completed').length / surveys.length) * 100)
                    : 0}%
                </p>
              </div>
              <p className="text-xs text-muted-foreground">Teilnahmequote</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Zugewiesene Umfragen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {surveys.length > 0 ? (
            <div className="space-y-3">
              {surveys.map((survey) => (
                <div key={survey.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getStatusIcon(survey.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{survey.name}</span>
                      <Badge variant="outline">
                        {surveyTypes.find(t => t.value === survey.type)?.label || survey.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fällig: {new Date(survey.dueDate).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  {getStatusBadge(survey.status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Umfragen zugewiesen</p>
              {canCreate('employee_surveys') && (
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Umfrage zuweisen
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Umfrage zuweisen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Umfrage-Name</Label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="z.B. Mitarbeiterzufriedenheit Q1 2025"
              />
            </div>
            <div>
              <Label>Umfrage-Typ</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  {surveyTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fälligkeitsdatum</Label>
              <Input 
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
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
