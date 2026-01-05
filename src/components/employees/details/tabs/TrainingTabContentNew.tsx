import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { GraduationCap, Plus, Calendar, Award, BookOpen, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TrainingTabContentNewProps {
  employeeId: string;
}

export const TrainingTabContentNew: React.FC<TrainingTabContentNewProps> = ({ employeeId }) => {
  const { canCreate, canEdit, canDelete } = useEnterprisePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    provider: '',
    startDate: '',
    endDate: '',
    duration: '',
    status: 'scheduled'
  });

  const { data: trainings = [], isLoading } = useQuery({
    queryKey: ['employeeTrainings', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_trainings')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['employeeCertificates', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_certificates')
        .select('*')
        .eq('employee_id', employeeId)
        .order('issued_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleCreate = () => {
    console.log('Create training:', formData);
    setDialogOpen(false);
    setFormData({ title: '', description: '', provider: '', startDate: '', endDate: '', duration: '', status: 'scheduled' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      completed: { label: 'Abgeschlossen', className: 'bg-green-100 text-green-800' },
      in_progress: { label: 'Laufend', className: 'bg-blue-100 text-blue-800' },
      scheduled: { label: 'Geplant', className: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'Abgebrochen', className: 'bg-red-100 text-red-800' }
    };
    const variant = variants[status] || variants.scheduled;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Lade Schulungsdaten...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Schulungen & Zertifikate
        </h2>
        {canCreate('employee_training') && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schulung hinzufügen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{trainings.length}</p>
              <p className="text-xs text-muted-foreground">Schulungen gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {trainings.filter((t: any) => t.status === 'completed').length}
              </p>
              <p className="text-xs text-muted-foreground">Abgeschlossen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{certificates.length}</p>
              <p className="text-xs text-muted-foreground">Zertifikate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Schulungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trainings.length > 0 ? (
            <div className="space-y-3">
              {trainings.map((training: any) => (
                <div key={training.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{training.title}</span>
                      {getStatusBadge(training.status)}
                    </div>
                    {training.description && (
                      <p className="text-sm text-muted-foreground mt-1">{training.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {training.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(training.start_date).toLocaleDateString('de-DE')}
                        </span>
                      )}
                      {training.duration && <span>Dauer: {training.duration}h</span>}
                      {training.provider && <span>Anbieter: {training.provider}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {canEdit('employee_training') && (
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete('employee_training') && (
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Schulungen vorhanden</p>
              {canCreate('employee_training') && (
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Schulung hinzufügen
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Zertifikate
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length > 0 ? (
            <div className="space-y-3">
              {certificates.map((cert: any) => (
                <div key={cert.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{cert.name}</span>
                      {cert.expiry_date && (
                        <Badge variant={new Date(cert.expiry_date) > new Date() ? 'default' : 'destructive'}>
                          {new Date(cert.expiry_date) > new Date() ? 'Gültig' : 'Abgelaufen'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      {cert.issued_date && <span>Ausgestellt: {new Date(cert.issued_date).toLocaleDateString('de-DE')}</span>}
                      {cert.expiry_date && <span>Gültig bis: {new Date(cert.expiry_date).toLocaleDateString('de-DE')}</span>}
                      {cert.issuer && <span>Aussteller: {cert.issuer}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Zertifikate vorhanden</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schulung hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titel</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="z.B. Projektmanagement-Grundlagen"
              />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Kurzbeschreibung der Schulung..."
              />
            </div>
            <div>
              <Label>Anbieter</Label>
              <Input 
                value={formData.provider}
                onChange={(e) => setFormData({...formData, provider: e.target.value})}
                placeholder="z.B. LinkedIn Learning"
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
                <Label>Dauer (Stunden)</Label>
                <Input 
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  placeholder="8"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Geplant</SelectItem>
                  <SelectItem value="in_progress">Laufend</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                </SelectContent>
              </Select>
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
