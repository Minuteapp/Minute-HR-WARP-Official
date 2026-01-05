import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { MessageSquare, Plus, Mail, Phone, Video, Calendar, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CommunicationTabContentNewProps {
  employeeId: string;
}

export const CommunicationTabContentNew: React.FC<CommunicationTabContentNewProps> = ({ employeeId }) => {
  const { canCreate } = useEnterprisePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [communications, setCommunications] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    content: '',
    date: ''
  });

  const handleCreate = () => {
    setCommunications([...communications, { id: Date.now(), ...formData, createdAt: new Date().toISOString() }]);
    setDialogOpen(false);
    setFormData({ type: '', subject: '', content: '', date: '' });
  };

  const communicationTypes = [
    { value: 'email', label: 'E-Mail', icon: Mail },
    { value: 'phone', label: 'Telefon', icon: Phone },
    { value: 'video', label: 'Videokonferenz', icon: Video },
    { value: 'meeting', label: 'Persönliches Gespräch', icon: Calendar },
    { value: 'message', label: 'Nachricht', icon: MessageSquare }
  ];

  const getTypeIcon = (type: string) => {
    const typeConfig = communicationTypes.find(t => t.value === type);
    if (typeConfig) {
      const Icon = typeConfig.icon;
      return <Icon className="h-5 w-5 text-blue-500" />;
    }
    return <MessageSquare className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Kommunikation
        </h2>
        {canCreate('employee_communication') && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Kommunikation hinzufügen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{communications.length}</p>
              <p className="text-xs text-muted-foreground">Gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {communications.filter(c => c.type === 'email').length}
              </p>
              <p className="text-xs text-muted-foreground">E-Mails</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {communications.filter(c => c.type === 'meeting').length}
              </p>
              <p className="text-xs text-muted-foreground">Meetings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {communications.filter(c => c.type === 'phone').length}
              </p>
              <p className="text-xs text-muted-foreground">Anrufe</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Kommunikationsverlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          {communications.length > 0 ? (
            <div className="space-y-3">
              {communications.map((comm) => (
                <div key={comm.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getTypeIcon(comm.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comm.subject}</span>
                      <Badge variant="outline">
                        {communicationTypes.find(t => t.value === comm.type)?.label || comm.type}
                      </Badge>
                    </div>
                    {comm.content && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{comm.content}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {comm.date ? new Date(comm.date).toLocaleDateString('de-DE') : new Date(comm.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Kommunikation erfasst</p>
              {canCreate('employee_communication') && (
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Kommunikation hinzufügen
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kommunikation hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Art der Kommunikation</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Art wählen" />
                </SelectTrigger>
                <SelectContent>
                  {communicationTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Betreff</Label>
              <Input 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="z.B. Feedbackgespräch Q4"
              />
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
              <Label>Inhalt / Notizen</Label>
              <Textarea 
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Zusammenfassung der Kommunikation..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleCreate}>
              <Send className="h-4 w-4 mr-2" />
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
