import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, Smartphone, Clock, AlertTriangle, FileText, Languages, Plus, Edit } from 'lucide-react';

export const NotificationsCommunicationTab = () => {
  const [settings, setSettings] = useState({
    inAppEnabled: true,
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    defaultChannel: 'inapp',
    quietHoursEnabled: true,
    quietHoursStart: '20:00',
    quietHoursEnd: '08:00',
    quietHoursWeekends: true,
    criticalOverrideQuietHours: true,
    urgencyLevels: true,
    urgencyLow: 'inapp',
    urgencyMedium: 'email',
    urgencyHigh: 'push',
    urgencyCritical: 'all',
    escalationEnabled: true,
    escalationAfterMinutes: 60,
    escalationLevels: 3,
    escalationToManager: true,
    escalationToHR: true,
    digestEnabled: true,
    digestFrequency: 'daily',
    digestTime: '09:00',
    digestGroupBy: 'module',
    templatesEnabled: true,
    templateLanguages: ['de', 'en'],
    templateCustomization: true,
    templateApproval: false,
    emailSenderName: 'Minute HR',
    emailSenderAddress: 'noreply@minutehr.com',
    emailReplyTo: '',
    emailFooterEnabled: true,
    emailUnsubscribeEnabled: true,
    pushIcon: true,
    pushSound: true,
    pushBadge: true,
    pushPreview: true,
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Standardkanäle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Benachrichtigungskanäle
          </CardTitle>
          <CardDescription>Welche Kanäle sind verfügbar?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>In-App</span>
              </div>
              <Switch 
                checked={settings.inAppEnabled}
                onCheckedChange={(checked) => updateSetting('inAppEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>E-Mail</span>
              </div>
              <Switch 
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => updateSetting('emailEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Push</span>
              </div>
              <Switch 
                checked={settings.pushEnabled}
                onCheckedChange={(checked) => updateSetting('pushEnabled', checked)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>SMS</span>
                <Badge variant="secondary">Premium</Badge>
              </div>
              <Switch 
                checked={settings.smsEnabled}
                onCheckedChange={(checked) => updateSetting('smsEnabled', checked)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Standard-Kanal</Label>
            <Select value={settings.defaultChannel} onValueChange={(v) => updateSetting('defaultChannel', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inapp">In-App</SelectItem>
                <SelectItem value="email">E-Mail</SelectItem>
                <SelectItem value="push">Push</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ruhezeiten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Ruhezeiten
          </CardTitle>
          <CardDescription>Wann sollen keine Benachrichtigungen gesendet werden?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Ruhezeiten aktivieren</Label>
              <p className="text-sm text-muted-foreground">Keine Benachrichtigungen außerhalb der Arbeitszeit</p>
            </div>
            <Switch 
              checked={settings.quietHoursEnabled}
              onCheckedChange={(checked) => updateSetting('quietHoursEnabled', checked)}
            />
          </div>

          {settings.quietHoursEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ruhezeit Start</Label>
                  <Input 
                    type="time"
                    value={settings.quietHoursStart}
                    onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ruhezeit Ende</Label>
                  <Input 
                    type="time"
                    value={settings.quietHoursEnd}
                    onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Ruhezeit am Wochenende</Label>
                  <p className="text-sm text-muted-foreground">Ganztägig am Samstag und Sonntag</p>
                </div>
                <Switch 
                  checked={settings.quietHoursWeekends}
                  onCheckedChange={(checked) => updateSetting('quietHoursWeekends', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    Kritische Meldungen durchlassen
                    <Badge variant="destructive">Wichtig</Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">Dringende Meldungen ignorieren Ruhezeit</p>
                </div>
                <Switch 
                  checked={settings.criticalOverrideQuietHours}
                  onCheckedChange={(checked) => updateSetting('criticalOverrideQuietHours', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kritikalitätsstufen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Kritikalitätsstufen
          </CardTitle>
          <CardDescription>Kanal je nach Dringlichkeit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Kritikalitätsstufen aktivieren</Label>
              <p className="text-sm text-muted-foreground">Unterschiedliche Kanäle je Dringlichkeit</p>
            </div>
            <Switch 
              checked={settings.urgencyLevels}
              onCheckedChange={(checked) => updateSetting('urgencyLevels', checked)}
            />
          </div>

          {settings.urgencyLevels && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Badge className="bg-gray-500">Niedrig</Badge>
                  </Label>
                  <Select value={settings.urgencyLow} onValueChange={(v) => updateSetting('urgencyLow', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inapp">Nur In-App</SelectItem>
                      <SelectItem value="email">E-Mail</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Badge className="bg-blue-500">Mittel</Badge>
                  </Label>
                  <Select value={settings.urgencyMedium} onValueChange={(v) => updateSetting('urgencyMedium', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inapp">Nur In-App</SelectItem>
                      <SelectItem value="email">E-Mail</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Badge className="bg-orange-500">Hoch</Badge>
                  </Label>
                  <Select value={settings.urgencyHigh} onValueChange={(v) => updateSetting('urgencyHigh', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inapp">Nur In-App</SelectItem>
                      <SelectItem value="email">E-Mail</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="all">Alle Kanäle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Badge variant="destructive">Kritisch</Badge>
                  </Label>
                  <Select value={settings.urgencyCritical} onValueChange={(v) => updateSetting('urgencyCritical', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="all">Alle Kanäle</SelectItem>
                      <SelectItem value="all_sms">Alle + SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eskalationsregeln */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Eskalationsregeln
          </CardTitle>
          <CardDescription>Bei nicht beachteten Meldungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Eskalation aktivieren</Label>
              <p className="text-sm text-muted-foreground">Automatisch eskalieren bei fehlender Reaktion</p>
            </div>
            <Switch 
              checked={settings.escalationEnabled}
              onCheckedChange={(checked) => updateSetting('escalationEnabled', checked)}
            />
          </div>

          {settings.escalationEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Eskalation nach (Minuten)</Label>
                  <Input 
                    type="number"
                    value={settings.escalationAfterMinutes}
                    onChange={(e) => updateSetting('escalationAfterMinutes', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Eskalationsstufen</Label>
                  <Input 
                    type="number"
                    min={1}
                    max={5}
                    value={settings.escalationLevels}
                    onChange={(e) => updateSetting('escalationLevels', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>An Manager eskalieren</Label>
                  <p className="text-sm text-muted-foreground">Vorgesetzten informieren</p>
                </div>
                <Switch 
                  checked={settings.escalationToManager}
                  onCheckedChange={(checked) => updateSetting('escalationToManager', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>An HR eskalieren</Label>
                  <p className="text-sm text-muted-foreground">HR-Abteilung informieren</p>
                </div>
                <Switch 
                  checked={settings.escalationToHR}
                  onCheckedChange={(checked) => updateSetting('escalationToHR', checked)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Digest / Zusammenfassung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Zusammenfassungen (Digest)
          </CardTitle>
          <CardDescription>Gebündelte Benachrichtigungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Digest aktivieren</Label>
              <p className="text-sm text-muted-foreground">Benachrichtigungen bündeln</p>
            </div>
            <Switch 
              checked={settings.digestEnabled}
              onCheckedChange={(checked) => updateSetting('digestEnabled', checked)}
            />
          </div>

          {settings.digestEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Häufigkeit</Label>
                  <Select value={settings.digestFrequency} onValueChange={(v) => updateSetting('digestFrequency', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Echtzeit (kein Digest)</SelectItem>
                      <SelectItem value="hourly">Stündlich</SelectItem>
                      <SelectItem value="daily">Täglich</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Versandzeit</Label>
                  <Input 
                    type="time"
                    value={settings.digestTime}
                    onChange={(e) => updateSetting('digestTime', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gruppierung</Label>
                <Select value={settings.digestGroupBy} onValueChange={(v) => updateSetting('digestGroupBy', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="module">Nach Modul</SelectItem>
                    <SelectItem value="urgency">Nach Dringlichkeit</SelectItem>
                    <SelectItem value="chronological">Chronologisch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vorlagen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Vorlagen & Sprachen
          </CardTitle>
          <CardDescription>Unternehmensweite Benachrichtigungsvorlagen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Benutzerdefinierte Vorlagen</Label>
              <p className="text-sm text-muted-foreground">Eigene Benachrichtigungstexte</p>
            </div>
            <Switch 
              checked={settings.templatesEnabled}
              onCheckedChange={(checked) => updateSetting('templatesEnabled', checked)}
            />
          </div>

          {settings.templatesEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label>Vorlagen-Sprachen</Label>
                <div className="flex gap-2">
                  {settings.templateLanguages.map((lang) => (
                    <Badge key={lang} variant="secondary">
                      {lang === 'de' ? '🇩🇪 Deutsch' : lang === 'en' ? '🇬🇧 English' : lang}
                    </Badge>
                  ))}
                  <Button variant="outline" size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Sprache
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Vorlagen bearbeiten erlauben</Label>
                  <p className="text-sm text-muted-foreground">Lokale Anpassungen</p>
                </div>
                <Switch 
                  checked={settings.templateCustomization}
                  onCheckedChange={(checked) => updateSetting('templateCustomization', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Genehmigung für Änderungen</Label>
                  <p className="text-sm text-muted-foreground">Änderungen müssen genehmigt werden</p>
                </div>
                <Switch 
                  checked={settings.templateApproval}
                  onCheckedChange={(checked) => updateSetting('templateApproval', checked)}
                />
              </div>

              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Vorlagen verwalten
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* E-Mail-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-Mail-Einstellungen
          </CardTitle>
          <CardDescription>Absender und Footer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Absendername</Label>
              <Input 
                value={settings.emailSenderName}
                onChange={(e) => updateSetting('emailSenderName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Absender-Adresse</Label>
              <Input 
                value={settings.emailSenderAddress}
                onChange={(e) => updateSetting('emailSenderAddress', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Antwort-Adresse (Reply-To)</Label>
            <Input 
              value={settings.emailReplyTo}
              onChange={(e) => updateSetting('emailReplyTo', e.target.value)}
              placeholder="Leer = Absender-Adresse"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>E-Mail-Footer anzeigen</Label>
              <p className="text-sm text-muted-foreground">Rechtliche Hinweise im Footer</p>
            </div>
            <Switch 
              checked={settings.emailFooterEnabled}
              onCheckedChange={(checked) => updateSetting('emailFooterEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Abmelde-Link</Label>
              <p className="text-sm text-muted-foreground">Benutzer können sich abmelden</p>
            </div>
            <Switch 
              checked={settings.emailUnsubscribeEnabled}
              onCheckedChange={(checked) => updateSetting('emailUnsubscribeEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push-Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push-Einstellungen
          </CardTitle>
          <CardDescription>Mobile Benachrichtigungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>App-Icon anzeigen</Label>
              <Switch 
                checked={settings.pushIcon}
                onCheckedChange={(checked) => updateSetting('pushIcon', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Ton abspielen</Label>
              <Switch 
                checked={settings.pushSound}
                onCheckedChange={(checked) => updateSetting('pushSound', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Badge-Zähler</Label>
              <Switch 
                checked={settings.pushBadge}
                onCheckedChange={(checked) => updateSetting('pushBadge', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Vorschau anzeigen</Label>
              <Switch 
                checked={settings.pushPreview}
                onCheckedChange={(checked) => updateSetting('pushPreview', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsCommunicationTab;
