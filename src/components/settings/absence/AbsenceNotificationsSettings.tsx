import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Mail, Smartphone, MessageSquare, Save, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRolePermissions } from "@/hooks/useRolePermissions";

interface NotificationChannel {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  description: string;
}

interface NotificationEvent {
  id: string;
  name: string;
  description: string;
  channels: Record<string, boolean>;
  template: string;
}

export const AbsenceNotificationsSettings = () => {
  const { toast } = useToast();
  const { hasPermission } = useRolePermissions();
  
  const canEdit = hasPermission('absence_settings');

  const [channels] = useState<NotificationChannel[]>([
    {
      id: 'email',
      name: 'E-Mail',
      icon: <Mail className="h-4 w-4" />,
      enabled: true,
      description: 'E-Mail-Benachrichtigungen an die registrierte E-Mail-Adresse',
    },
    {
      id: 'push',
      name: 'Push-Benachrichtigung',
      icon: <Smartphone className="h-4 w-4" />,
      enabled: true,
      description: 'Mobile Push-Benachrichtigungen über die App',
    },
    {
      id: 'inapp',
      name: 'In-App',
      icon: <Bell className="h-4 w-4" />,
      enabled: true,
      description: 'Benachrichtigungen innerhalb der Anwendung',
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: <MessageSquare className="h-4 w-4" />,
      enabled: false,
      description: 'SMS-Benachrichtigungen an die Mobilnummer',
    },
  ]);

  const [events, setEvents] = useState<NotificationEvent[]>([
    {
      id: 'new_request',
      name: 'Neuer Antrag',
      description: 'Ein neuer Abwesenheitsantrag wurde gestellt',
      channels: { email: true, push: true, inapp: true, sms: false },
      template: 'Ein neuer Abwesenheitsantrag von {{employee_name}} wartet auf Ihre Genehmigung.',
    },
    {
      id: 'request_approved',
      name: 'Antrag genehmigt',
      description: 'Ein Abwesenheitsantrag wurde genehmigt',
      channels: { email: true, push: true, inapp: true, sms: false },
      template: 'Ihr Abwesenheitsantrag für {{start_date}} bis {{end_date}} wurde genehmigt.',
    },
    {
      id: 'request_rejected',
      name: 'Antrag abgelehnt',
      description: 'Ein Abwesenheitsantrag wurde abgelehnt',
      channels: { email: true, push: true, inapp: true, sms: false },
      template: 'Ihr Abwesenheitsantrag wurde leider abgelehnt. Grund: {{rejection_reason}}',
    },
    {
      id: 'status_changed',
      name: 'Status geändert',
      description: 'Der Status eines Antrags wurde geändert',
      channels: { email: true, push: false, inapp: true, sms: false },
      template: 'Der Status Ihres Abwesenheitsantrags hat sich geändert: {{new_status}}',
    },
    {
      id: 'upcoming_absence',
      name: 'Bevorstehende Abwesenheit',
      description: 'Erinnerung an bevorstehende Abwesenheit',
      channels: { email: true, push: true, inapp: false, sms: false },
      template: 'Erinnerung: Ihre Abwesenheit beginnt morgen ({{start_date}}).',
    },
    {
      id: 'vacation_reminder',
      name: 'Urlaubserinnerung',
      description: 'Erinnerung vor Urlaubsverfall',
      channels: { email: true, push: false, inapp: true, sms: false },
      template: 'Sie haben noch {{remaining_days}} Urlaubstage, die am {{expiry_date}} verfallen.',
    },
  ]);

  const handleSave = () => {
    toast({
      title: "Benachrichtigungseinstellungen gespeichert",
      description: "Die Benachrichtigungseinstellungen wurden erfolgreich aktualisiert.",
    });
  };

  const updateEventChannels = (eventId: string, channelId: string, enabled: boolean) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, channels: { ...event.channels, [channelId]: enabled } }
        : event
    ));
  };

  const updateEventTemplate = (eventId: string, template: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, template }
        : event
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Benachrichtigungseinstellungen</h2>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="channels">Kanäle</TabsTrigger>
          <TabsTrigger value="events">Ereignisse</TabsTrigger>
          <TabsTrigger value="templates">Vorlagen</TabsTrigger>
        </TabsList>

        <TabsContent value="channels">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Benachrichtigungskanäle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {channels.map((channel) => (
                <div key={channel.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {channel.icon}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{channel.name}</span>
                        <Badge variant={channel.enabled ? "default" : "secondary"}>
                          {channel.enabled ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {channel.description}
                      </p>
                    </div>
                  </div>
                  <Switch 
                    checked={channel.enabled} 
                    disabled={!canEdit}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungsereignisse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {events.map((event) => (
                <div key={event.id} className="p-4 border rounded-lg space-y-4">
                  <div>
                    <h4 className="font-medium">{event.name}</h4>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Aktive Kanäle:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {channels.map((channel) => (
                        <div key={channel.id} className="flex items-center gap-2">
                          <Switch
                            checked={event.channels[channel.id]}
                            disabled={!canEdit || !channel.enabled}
                            onCheckedChange={(checked) => 
                              updateEventChannels(event.id, channel.id, checked)
                            }
                            
                          />
                          <span className="text-sm">{channel.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="space-y-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="text-base">{event.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`template-${event.id}`}>Nachrichtenvorlage</Label>
                    <Textarea
                      id={`template-${event.id}`}
                      value={event.template}
                      onChange={(e) => updateEventTemplate(event.id, e.target.value)}
                      disabled={!canEdit}
                      rows={3}
                      placeholder="Geben Sie die Nachrichtenvorlage ein..."
                    />
                    <div className="text-xs text-muted-foreground">
                      Verfügbare Variablen: &#123;&#123;employee_name&#125;&#125;, &#123;&#123;start_date&#125;&#125;, &#123;&#123;end_date&#125;&#125;, 
                      &#123;&#123;absence_type&#125;&#125;, &#123;&#123;rejection_reason&#125;&#125;, &#123;&#123;remaining_days&#125;&#125;, &#123;&#123;expiry_date&#125;&#125;
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Zusätzliche Einstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Stille Stunden</Label>
              <p className="text-sm text-muted-foreground">
                Keine Push-Benachrichtigungen zwischen 22:00 und 06:00 Uhr
              </p>
            </div>
            <Switch disabled={!canEdit} defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Tägliche Zusammenfassung</Label>
              <p className="text-sm text-muted-foreground">
                Tägliche E-Mail mit Übersicht aller offenen Anträge (nur für Manager)
              </p>
            </div>
            <Switch disabled={!canEdit} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Wöchentlicher Bericht</Label>
              <p className="text-sm text-muted-foreground">
                Wöchentlicher E-Mail-Bericht mit Abwesenheitsstatistiken
              </p>
            </div>
            <Switch disabled={!canEdit} defaultChecked />
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="flex justify-end">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Einstellungen speichern
          </Button>
        </div>
      )}
    </div>
  );
};