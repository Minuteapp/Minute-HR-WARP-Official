
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Hash, 
  Video,
  Bot,
  Save,
  Loader2
} from "lucide-react";

const CHANNELS = [
  { id: 'in-app', name: 'In-App', icon: Bell, description: 'Benachrichtigungen innerhalb der Anwendung' },
  { id: 'email', name: 'E-Mail', icon: Mail, description: 'E-Mail-Benachrichtigungen' },
  { id: 'push', name: 'Push (Mobile)', icon: Smartphone, description: 'Push-Benachrichtigungen auf mobilen Geräten' },
  { id: 'sms', name: 'SMS', icon: MessageSquare, description: 'SMS-Benachrichtigungen' },
  { id: 'slack', name: 'Slack', icon: Hash, description: 'Integration mit Slack' },
  { id: 'teams', name: 'Microsoft Teams', icon: Video, description: 'Integration mit Microsoft Teams' },
  { id: 'chatbot', name: 'Chatbot', icon: Bot, description: 'Benachrichtigungen über den HR-Chatbot' },
];

export default function ChannelsTab() {
  const queryClient = useQueryClient();
  const [editingChannel, setEditingChannel] = useState<string | null>(null);

  const { data: channelConfigs, isLoading } = useQuery({
    queryKey: ['notification-channels-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_channels_config')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (config: any) => {
      const { data: existing } = await supabase
        .from('notification_channels_config')
        .select('id')
        .eq('channel', config.channel)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('notification_channels_config')
          .update(config)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notification_channels_config')
          .insert(config);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-channels-config'] });
      toast.success('Kanal-Konfiguration gespeichert');
      setEditingChannel(null);
    },
    onError: () => {
      toast.error('Fehler beim Speichern');
    }
  });

  const getChannelConfig = (channelId: string) => {
    return channelConfigs?.find(c => c.channel === channelId) || {
      channel: channelId,
      is_active: false,
      priority: 1,
      fallback_channel: null,
      quiet_hours_start: null,
      quiet_hours_end: null,
      weekend_enabled: false,
      cost_per_message: null,
      monthly_limit: null
    };
  };

  const handleToggle = async (channelId: string, isActive: boolean) => {
    const config = getChannelConfig(channelId);
    await saveMutation.mutateAsync({
      ...config,
      is_active: isActive
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Kommunikationskanäle</CardTitle>
          <CardDescription>
            Aktivieren und konfigurieren Sie die verfügbaren Benachrichtigungskanäle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {CHANNELS.map((channel) => {
              const config = getChannelConfig(channel.id);
              const Icon = channel.icon;
              const isEditing = editingChannel === channel.id;

              return (
                <Card key={channel.id} className={config.is_active ? 'border-primary/50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${config.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{channel.name}</h4>
                            {config.is_active && (
                              <Badge variant="outline" className="text-xs">Aktiv</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{channel.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={config.is_active}
                          onCheckedChange={(checked) => handleToggle(channel.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingChannel(isEditing ? null : channel.id)}
                        >
                          {isEditing ? 'Schließen' : 'Konfigurieren'}
                        </Button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="mt-4 pt-4 border-t grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Priorität</Label>
                          <Select
                            value={String(config.priority || 1)}
                            onValueChange={(value) => {
                              saveMutation.mutate({ ...config, priority: parseInt(value) });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Hoch (1)</SelectItem>
                              <SelectItem value="2">Mittel (2)</SelectItem>
                              <SelectItem value="3">Niedrig (3)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Fallback-Kanal</Label>
                          <Select
                            value={config.fallback_channel || 'none'}
                            onValueChange={(value) => {
                              saveMutation.mutate({ 
                                ...config, 
                                fallback_channel: value === 'none' ? null : value 
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Kein Fallback" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Kein Fallback</SelectItem>
                              {CHANNELS.filter(c => c.id !== channel.id).map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Ruhezeit Start</Label>
                          <Input
                            type="time"
                            value={config.quiet_hours_start || ''}
                            onChange={(e) => {
                              saveMutation.mutate({ ...config, quiet_hours_start: e.target.value || null });
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Ruhezeit Ende</Label>
                          <Input
                            type="time"
                            value={config.quiet_hours_end || ''}
                            onChange={(e) => {
                              saveMutation.mutate({ ...config, quiet_hours_end: e.target.value || null });
                            }}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={config.weekend_enabled}
                            onCheckedChange={(checked) => {
                              saveMutation.mutate({ ...config, weekend_enabled: checked });
                            }}
                          />
                          <Label>Wochenende erlauben</Label>
                        </div>

                        <div className="space-y-2">
                          <Label>Monatliches Limit</Label>
                          <Input
                            type="number"
                            value={config.monthly_limit || ''}
                            onChange={(e) => {
                              saveMutation.mutate({ 
                                ...config, 
                                monthly_limit: e.target.value ? parseInt(e.target.value) : null 
                              });
                            }}
                            placeholder="Unbegrenzt"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
