
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Project } from '@/types/project';
import { Save, Archive, Trash2, AlertTriangle } from 'lucide-react';

interface ProjectSettingsProps {
  project: Project;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({ project }) => {
  const [settings, setSettings] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    budget: project.budget?.toString() || '',
    autoArchive: false,
    notifications: true,
    publicAccess: false
  });

  const handleSave = () => {
    console.log('Saving project settings:', settings);
    // Hier würde die API-Aufrufe zur Aktualisierung stattfinden
  };

  const handleArchive = () => {
    if (window.confirm('Möchten Sie dieses Projekt wirklich archivieren?')) {
      console.log('Archiving project:', project.id);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Möchten Sie dieses Projekt wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      console.log('Deleting project:', project.id);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grundeinstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Projektname</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="budget">Budget (€)</Label>
              <Input
                id="budget"
                type="number"
                value={settings.budget}
                onChange={(e) => setSettings({ ...settings, budget: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={settings.status} onValueChange={(value) => setSettings({ ...settings, status: value as Project['status'] })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planung</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="on_hold">Pausiert</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="cancelled">Abgebrochen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priorität</Label>
              <Select value={settings.priority} onValueChange={(value) => setSettings({ ...settings, priority: value as 'high' | 'medium' | 'low' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Mittel</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Erweiterte Einstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Automatische Archivierung</Label>
              <p className="text-sm text-gray-600">Projekt nach Abschluss automatisch archivieren</p>
            </div>
            <Switch
              checked={settings.autoArchive}
              onCheckedChange={(checked) => setSettings({ ...settings, autoArchive: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Benachrichtigungen</Label>
              <p className="text-sm text-gray-600">E-Mail-Benachrichtigungen für Projektaktualisierungen</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Öffentlicher Zugriff</Label>
              <p className="text-sm text-gray-600">Projekt für alle Mitarbeiter sichtbar machen</p>
            </div>
            <Switch
              checked={settings.publicAccess}
              onCheckedChange={(checked) => setSettings({ ...settings, publicAccess: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Gefährliche Aktionen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50">
            <div className="flex items-center space-x-3">
              <Archive className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium">Projekt archivieren</p>
                <p className="text-sm text-gray-600">Projekt aus der aktiven Liste entfernen</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleArchive}>
              Archivieren
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center space-x-3">
              <Trash2 className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium">Projekt löschen</p>
                <p className="text-sm text-gray-600">Projekt permanent entfernen (nicht rückgängig machbar)</p>
              </div>
            </div>
            <Button variant="destructive" onClick={handleDelete}>
              Löschen
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-[#3B44F6] hover:bg-[#3B44F6]/90">
          <Save className="h-4 w-4 mr-2" />
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};
