
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, Bell, Settings, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const AbsenceSettings = () => {
  const [settings, setSettings] = useState({
    autoApproval: false,
    maxDaysInAdvance: 90,
    minNotificationDays: 7,
    allowHalfDays: true,
    allowOverlap: false,
    maxConcurrentAbsences: 3,
    emailNotifications: true,
    managerApprovalRequired: true,
    blockoutDates: [] as string[],
    workingDaysOnly: true
  });

  const [absenceTypes, setAbsenceTypes] = useState([
    { id: '1', name: 'Urlaub', color: '#10B981', requiresApproval: true, maxDays: 30 },
    { id: '2', name: 'Krankenstand', color: '#EF4444', requiresApproval: false, maxDays: null },
    { id: '3', name: 'Homeoffice', color: '#3B82F6', requiresApproval: true, maxDays: null },
    { id: '4', name: 'Weiterbildung', color: '#8B5CF6', requiresApproval: true, maxDays: 10 },
    { id: '5', name: 'Sonstiges', color: '#6B7280', requiresApproval: true, maxDays: null }
  ]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // TODO: Implementiere API-Aufruf
    toast.success("Abwesenheitseinstellungen gespeichert");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Abwesenheiten & Urlaubsmanagement</h2>
          <p className="text-sm text-gray-600 mt-1">
            Verwalten Sie Abwesenheitstypen, Genehmigungsworkflows und Einstellungen
          </p>
        </div>
        <Button onClick={handleSaveSettings}>
          Einstellungen speichern
        </Button>
      </div>

      <Tabs defaultValue="types" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="types" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Abwesenheitstypen
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Genehmigung
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Benachrichtigungen
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Regeln
          </TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abwesenheitstypen verwalten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {absenceTypes.map((type) => (
                <Card key={type.id} className="border-gray-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: type.color }}
                        />
                        <div>
                          <h4 className="font-medium">{type.name}</h4>
                          <p className="text-sm text-gray-500">
                            {type.requiresApproval ? 'Genehmigung erforderlich' : 'Automatisch genehmigt'}
                            {type.maxDays && ` • Max. ${type.maxDays} Tage`}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Bearbeiten
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Genehmigungsworkflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Automatische Genehmigung</Label>
                  <p className="text-sm text-gray-500">
                    Bestimmte Abwesenheitstypen automatisch genehmigen
                  </p>
                </div>
                <Switch
                  checked={settings.autoApproval}
                  onCheckedChange={(checked) => handleSettingChange('autoApproval', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Vorgesetztengenehmigung</Label>
                  <p className="text-sm text-gray-500">
                    Genehmigung durch direkten Vorgesetzten erforderlich
                  </p>
                </div>
                <Switch
                  checked={settings.managerApprovalRequired}
                  onCheckedChange={(checked) => handleSettingChange('managerApprovalRequired', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-notification">Mindest-Vorlaufzeit (Tage)</Label>
                  <Input
                    id="min-notification"
                    type="number"
                    value={settings.minNotificationDays}
                    onChange={(e) => handleSettingChange('minNotificationDays', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-advance">Max. Tage im Voraus</Label>
                  <Input
                    id="max-advance"
                    type="number"
                    value={settings.maxDaysInAdvance}
                    onChange={(e) => handleSettingChange('maxDaysInAdvance', Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungseinstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">E-Mail-Benachrichtigungen</Label>
                  <p className="text-sm text-gray-500">
                    Automatische E-Mails bei Anträgen und Statusänderungen
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Benachrichtigungstypen</h4>
                
                <div className="space-y-3">
                  {[
                    { key: 'newRequest', label: 'Neue Abwesenheitsanträge', description: 'Benachrichtigung bei neuen Anträgen' },
                    { key: 'approved', label: 'Genehmigte Anträge', description: 'Bestätigung bei Genehmigung' },
                    { key: 'rejected', label: 'Abgelehnte Anträge', description: 'Information bei Ablehnung' },
                    { key: 'reminder', label: 'Erinnerungen', description: 'Erinnerung vor geplanter Abwesenheit' }
                  ].map((notification) => (
                    <div key={notification.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Label className="font-medium">{notification.label}</Label>
                        <p className="text-sm text-gray-500">{notification.description}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Abwesenheitsregeln</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Halbe Tage erlauben</Label>
                  <p className="text-sm text-gray-500">
                    Mitarbeiter können halbe Abwesenheitstage beantragen
                  </p>
                </div>
                <Switch
                  checked={settings.allowHalfDays}
                  onCheckedChange={(checked) => handleSettingChange('allowHalfDays', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Überschneidungen verhindern</Label>
                  <p className="text-sm text-gray-500">
                    Verhindert überlappende Abwesenheiten im Team
                  </p>
                </div>
                <Switch
                  checked={settings.allowOverlap}
                  onCheckedChange={(checked) => handleSettingChange('allowOverlap', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Nur Arbeitstage</Label>
                  <p className="text-sm text-gray-500">
                    Abwesenheiten nur an Arbeitstagen möglich
                  </p>
                </div>
                <Switch
                  checked={settings.workingDaysOnly}
                  onCheckedChange={(checked) => handleSettingChange('workingDaysOnly', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-concurrent">Max. gleichzeitige Abwesenheiten</Label>
                <Input
                  id="max-concurrent"
                  type="number"
                  value={settings.maxConcurrentAbsences}
                  onChange={(e) => handleSettingChange('maxConcurrentAbsences', Number(e.target.value))}
                />
                <p className="text-sm text-gray-500">
                  Maximale Anzahl von Mitarbeitern, die gleichzeitig abwesend sein dürfen
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blockout-dates">Sperrtermine</Label>
                <Textarea
                  id="blockout-dates"
                  placeholder="Geben Sie Termine ein, an denen keine Abwesenheiten möglich sind..."
                  className="min-h-[100px]"
                />
                <p className="text-sm text-gray-500">
                  Termine oder Zeiträume, in denen keine Abwesenheiten genehmigt werden
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AbsenceSettings;
