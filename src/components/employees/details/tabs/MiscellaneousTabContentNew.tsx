import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { MoreHorizontal, Plus, FileText, Calendar, Tag, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MiscellaneousTabContentNewProps {
  employeeId: string;
}

export const MiscellaneousTabContentNew: React.FC<MiscellaneousTabContentNewProps> = ({ employeeId }) => {
  const { canCreate, canEdit, canDelete } = useEnterprisePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    date: ''
  });

  const handleCreate = () => {
    setEntries([...entries, { id: Date.now(), ...formData, createdAt: new Date().toISOString() }]);
    setDialogOpen(false);
    setFormData({ title: '', category: '', content: '', date: '' });
  };

  const handleDelete = (id: number) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const categories = [
    { value: 'equipment', label: 'Ausstattung' },
    { value: 'keys', label: 'Schlüssel/Zugänge' },
    { value: 'parking', label: 'Parkplatz' },
    { value: 'locker', label: 'Spind' },
    { value: 'special', label: 'Besonderheiten' },
    { value: 'other', label: 'Sonstiges' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MoreHorizontal className="h-5 w-5" />
          Verschiedenes
        </h2>
        {canCreate('employee_misc') && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Eintrag hinzufügen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{entries.length}</p>
              <p className="text-xs text-muted-foreground">Einträge gesamt</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{new Set(entries.map(e => e.category)).size}</p>
              <p className="text-xs text-muted-foreground">Kategorien</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {entries.filter(e => e.category === 'equipment').length}
              </p>
              <p className="text-xs text-muted-foreground">Ausstattung</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Alle Einträge
          </CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length > 0 ? (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{entry.title}</span>
                      <Badge variant="outline">
                        {categories.find(c => c.value === entry.category)?.label || entry.category}
                      </Badge>
                    </div>
                    {entry.content && (
                      <p className="text-sm text-muted-foreground mt-1">{entry.content}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {entry.date || new Date(entry.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {canEdit('employee_misc') && (
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete('employee_misc') && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MoreHorizontal className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Einträge vorhanden</p>
              {canCreate('employee_misc') && (
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ersten Eintrag hinzufügen
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eintrag hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titel</Label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="z.B. Büroschlüssel ausgehändigt"
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
              <Label>Datum</Label>
              <Input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <Label>Inhalt</Label>
              <Textarea 
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Details zum Eintrag..."
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
