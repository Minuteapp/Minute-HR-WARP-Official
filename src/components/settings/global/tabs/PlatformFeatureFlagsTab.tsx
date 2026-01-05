import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Flag, AlertTriangle, Wrench, Plus, Trash2, Edit, 
  FlaskConical, Globe, Building2, MapPin, Users, User,
  Clock, Shield, Save
} from 'lucide-react';
import { toast } from 'sonner';

interface FeatureFlag {
  id: string;
  feature_key: string;
  feature_name: string;
  description: string;
  enabled: boolean;
  scope_type: 'global' | 'company' | 'location' | 'role' | 'user';
  is_beta: boolean;
  rollout_percentage: number;
}

interface PlatformSettings {
  maintenance_mode: boolean;
  maintenance_message: string;
  maintenance_start: string;
  maintenance_end: string;
  maintenance_allowed_roles: string[];
  geo_blocking_enabled: boolean;
  geo_whitelist: string[];
  geo_blacklist: string[];
  max_parallel_sessions: number;
  force_logout_oldest: boolean;
  login_time_restrictions: {
    enabled: boolean;
    allowed_days: number[];
    start_hour: number;
    end_hour: number;
  };
}

const defaultFeatureFlags: FeatureFlag[] = [
  { id: '1', feature_key: 'module_hr', feature_name: 'HR-Modul', description: 'Personalverwaltung', enabled: true, scope_type: 'global', is_beta: false, rollout_percentage: 100 },
  { id: '2', feature_key: 'module_time', feature_name: 'Zeiterfassung', description: 'Zeiterfassungsmodul', enabled: true, scope_type: 'global', is_beta: false, rollout_percentage: 100 },
  { id: '3', feature_key: 'module_absence', feature_name: 'Abwesenheit', description: 'Abwesenheitsverwaltung', enabled: true, scope_type: 'global', is_beta: false, rollout_percentage: 100 },
  { id: '4', feature_key: 'ai_assistant', feature_name: 'KI-Assistent', description: 'KI-gestützte Funktionen', enabled: true, scope_type: 'global', is_beta: true, rollout_percentage: 50 },
  { id: '5', feature_key: 'natural_language', feature_name: 'Natural Language Queries', description: 'Natürlichsprachliche Abfragen', enabled: false, scope_type: 'global', is_beta: true, rollout_percentage: 25 },
];

const defaultPlatformSettings: PlatformSettings = {
  maintenance_mode: false,
  maintenance_message: 'Die Plattform wird aktuell gewartet. Bitte versuchen Sie es später erneut.',
  maintenance_start: '',
  maintenance_end: '',
  maintenance_allowed_roles: ['superadmin'],
  geo_blocking_enabled: false,
  geo_whitelist: ['DE', 'AT', 'CH'],
  geo_blacklist: [],
  max_parallel_sessions: 5,
  force_logout_oldest: true,
  login_time_restrictions: {
    enabled: false,
    allowed_days: [1, 2, 3, 4, 5],
    start_hour: 6,
    end_hour: 22,
  },
};

const scopeIcons = {
  global: Globe,
  company: Building2,
  location: MapPin,
  role: Users,
  user: User,
};

const PlatformFeatureFlagsTab: React.FC = () => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(defaultFeatureFlags);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(defaultPlatformSettings);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFlagToggle = (flagId: string) => {
    setFeatureFlags(flags => 
      flags.map(f => f.id === flagId ? { ...f, enabled: !f.enabled } : f)
    );
    toast.success('Feature-Flag aktualisiert');
  };

  const handleRolloutChange = (flagId: string, value: number[]) => {
    setFeatureFlags(flags =>
      flags.map(f => f.id === flagId ? { ...f, rollout_percentage: value[0] } : f)
    );
  };

  const handleSave = () => {
    toast.success('Einstellungen gespeichert');
  };

  const weekdays = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-6 p-1">
        {/* Wartungsmodus */}
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-destructive" />
              <CardTitle>Wartungsmodus</CardTitle>
            </div>
            <CardDescription>
              Aktivieren Sie den Wartungsmodus, um die Plattform für Benutzer zu sperren
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Wartungsmodus aktiv</Label>
                <p className="text-sm text-muted-foreground">
                  Nur ausgewählte Rollen können zugreifen
                </p>
              </div>
              <Switch
                checked={platformSettings.maintenance_mode}
                onCheckedChange={(checked) => 
                  setPlatformSettings(s => ({ ...s, maintenance_mode: checked }))
                }
              />
            </div>

            {platformSettings.maintenance_mode && (
              <div className="grid gap-4 pt-4 border-t">
                <div>
                  <Label>Wartungsnachricht</Label>
                  <Textarea
                    value={platformSettings.maintenance_message}
                    onChange={(e) => 
                      setPlatformSettings(s => ({ ...s, maintenance_message: e.target.value }))
                    }
                    placeholder="Nachricht für Benutzer..."
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Geplanter Start</Label>
                    <Input
                      type="datetime-local"
                      value={platformSettings.maintenance_start}
                      onChange={(e) =>
                        setPlatformSettings(s => ({ ...s, maintenance_start: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Geplantes Ende</Label>
                    <Input
                      type="datetime-local"
                      value={platformSettings.maintenance_end}
                      onChange={(e) =>
                        setPlatformSettings(s => ({ ...s, maintenance_end: e.target.value }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Zugriff erlauben für Rollen</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['superadmin', 'admin', 'hr_manager'].map((role) => (
                      <Badge
                        key={role}
                        variant={platformSettings.maintenance_allowed_roles.includes(role) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const roles = platformSettings.maintenance_allowed_roles.includes(role)
                            ? platformSettings.maintenance_allowed_roles.filter(r => r !== role)
                            : [...platformSettings.maintenance_allowed_roles, role];
                          setPlatformSettings(s => ({ ...s, maintenance_allowed_roles: roles }));
                        }}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature-Flags */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-primary" />
                <CardTitle>Feature-Flags</CardTitle>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Neues Feature
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Neues Feature-Flag</DialogTitle>
                    <DialogDescription>
                      Erstellen Sie ein neues Feature-Flag zur Steuerung von Funktionen
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label>Feature-Key</Label>
                      <Input placeholder="z.B. new_dashboard" className="mt-1" />
                    </div>
                    <div>
                      <Label>Anzeigename</Label>
                      <Input placeholder="z.B. Neues Dashboard" className="mt-1" />
                    </div>
                    <div>
                      <Label>Beschreibung</Label>
                      <Textarea placeholder="Was macht dieses Feature?" className="mt-1" />
                    </div>
                    <div>
                      <Label>Geltungsbereich</Label>
                      <Select defaultValue="global">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="company">Pro Gesellschaft</SelectItem>
                          <SelectItem value="location">Pro Standort</SelectItem>
                          <SelectItem value="role">Pro Rolle</SelectItem>
                          <SelectItem value="user">Pro Benutzer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="is-beta" />
                      <Label htmlFor="is-beta">Als Beta markieren</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={() => {
                      toast.success('Feature-Flag erstellt');
                      setIsDialogOpen(false);
                    }}>
                      Erstellen
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <CardDescription>
              Steuern Sie Module und Features für verschiedene Benutzergruppen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature</TableHead>
                  <TableHead>Geltungsbereich</TableHead>
                  <TableHead>Rollout</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureFlags.map((flag) => {
                  const ScopeIcon = scopeIcons[flag.scope_type];
                  return (
                    <TableRow key={flag.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{flag.feature_name}</span>
                              {flag.is_beta && (
                                <Badge variant="secondary" className="text-xs">
                                  <FlaskConical className="h-3 w-3 mr-1" />
                                  Beta
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{flag.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ScopeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm capitalize">{flag.scope_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[150px]">
                          <Slider
                            value={[flag.rollout_percentage]}
                            onValueChange={(v) => handleRolloutChange(flag.id, v)}
                            max={100}
                            step={5}
                            className="w-24"
                          />
                          <span className="text-sm w-10">{flag.rollout_percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={() => handleFlagToggle(flag.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Geo-Blocking & Sicherheit */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Geo-Blocking & Zugriffsbeschränkungen</CardTitle>
            </div>
            <CardDescription>
              Beschränken Sie den Zugriff auf bestimmte Regionen und Zeiten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Geo-Blocking */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Geo-Blocking aktivieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Zugriff nur aus bestimmten Ländern erlauben
                  </p>
                </div>
                <Switch
                  checked={platformSettings.geo_blocking_enabled}
                  onCheckedChange={(checked) =>
                    setPlatformSettings(s => ({ ...s, geo_blocking_enabled: checked }))
                  }
                />
              </div>

              {platformSettings.geo_blocking_enabled && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label>Erlaubte Länder (Whitelist)</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {platformSettings.geo_whitelist.map((code) => (
                        <Badge key={code} variant="secondary" className="cursor-pointer">
                          {code}
                          <Trash2 className="h-3 w-3 ml-1" onClick={() => {
                            setPlatformSettings(s => ({
                              ...s,
                              geo_whitelist: s.geo_whitelist.filter(c => c !== code)
                            }));
                          }} />
                        </Badge>
                      ))}
                    </div>
                    <Input placeholder="Ländercode hinzufügen (z.B. DE)" className="mt-2" />
                  </div>
                  <div>
                    <Label>Gesperrte Länder (Blacklist)</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {platformSettings.geo_blacklist.map((code) => (
                        <Badge key={code} variant="destructive" className="cursor-pointer">
                          {code}
                          <Trash2 className="h-3 w-3 ml-1" onClick={() => {
                            setPlatformSettings(s => ({
                              ...s,
                              geo_blacklist: s.geo_blacklist.filter(c => c !== code)
                            }));
                          }} />
                        </Badge>
                      ))}
                    </div>
                    <Input placeholder="Ländercode hinzufügen" className="mt-2" />
                  </div>
                </div>
              )}
            </div>

            {/* Login-Zeiten */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Login-Zeitbeschränkungen
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Logins nur zu bestimmten Zeiten erlauben
                  </p>
                </div>
                <Switch
                  checked={platformSettings.login_time_restrictions.enabled}
                  onCheckedChange={(checked) =>
                    setPlatformSettings(s => ({
                      ...s,
                      login_time_restrictions: { ...s.login_time_restrictions, enabled: checked }
                    }))
                  }
                />
              </div>

              {platformSettings.login_time_restrictions.enabled && (
                <div className="space-y-4">
                  <div>
                    <Label>Erlaubte Wochentage</Label>
                    <div className="flex gap-2 mt-2">
                      {weekdays.map((day, index) => (
                        <Badge
                          key={index}
                          variant={platformSettings.login_time_restrictions.allowed_days.includes(index) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => {
                            const days = platformSettings.login_time_restrictions.allowed_days.includes(index)
                              ? platformSettings.login_time_restrictions.allowed_days.filter(d => d !== index)
                              : [...platformSettings.login_time_restrictions.allowed_days, index];
                            setPlatformSettings(s => ({
                              ...s,
                              login_time_restrictions: { ...s.login_time_restrictions, allowed_days: days }
                            }));
                          }}
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Von (Uhrzeit)</Label>
                      <Select
                        value={String(platformSettings.login_time_restrictions.start_hour)}
                        onValueChange={(v) =>
                          setPlatformSettings(s => ({
                            ...s,
                            login_time_restrictions: { ...s.login_time_restrictions, start_hour: parseInt(v) }
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {String(i).padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Bis (Uhrzeit)</Label>
                      <Select
                        value={String(platformSettings.login_time_restrictions.end_hour)}
                        onValueChange={(v) =>
                          setPlatformSettings(s => ({
                            ...s,
                            login_time_restrictions: { ...s.login_time_restrictions, end_hour: parseInt(v) }
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>
                              {String(i).padStart(2, '0')}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Session-Limits */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Maximale parallele Sessions</Label>
                  <p className="text-sm text-muted-foreground">
                    Anzahl gleichzeitiger Anmeldungen pro Benutzer
                  </p>
                </div>
                <Select
                  value={String(platformSettings.max_parallel_sessions)}
                  onValueChange={(v) =>
                    setPlatformSettings(s => ({ ...s, max_parallel_sessions: parseInt(v) }))
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 5, 10, 999].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n === 999 ? 'Unbegrenzt' : n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Älteste Session automatisch beenden</Label>
                  <p className="text-sm text-muted-foreground">
                    Bei Überschreitung des Limits
                  </p>
                </div>
                <Switch
                  checked={platformSettings.force_logout_oldest}
                  onCheckedChange={(checked) =>
                    setPlatformSettings(s => ({ ...s, force_logout_oldest: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Speichern Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Alle Einstellungen speichern
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

export default PlatformFeatureFlagsTab;
