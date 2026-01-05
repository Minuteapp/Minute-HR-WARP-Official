
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationsCardProps {
  employeeId: string;
}

interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  vacation_notifications: boolean;
  sick_leave_notifications: boolean;
}

const defaultPreferences: NotificationPreferences = {
  email_enabled: true,
  push_enabled: true,
  vacation_notifications: true,
  sick_leave_notifications: true,
};

export const NotificationsCard = ({ employeeId }: NotificationsCardProps) => {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['employee-notification-preferences', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', employeeId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        return defaultPreferences;
      }
      
      return {
        email_enabled: data.email_enabled ?? true,
        push_enabled: data.push_enabled ?? true,
        vacation_notifications: data.vacation_notifications ?? true,
        sick_leave_notifications: data.sick_leave_notifications ?? true,
      } as NotificationPreferences;
    },
    enabled: !!employeeId,
  });

  const updateMutation = useMutation({
    mutationFn: async (newPrefs: Partial<NotificationPreferences>) => {
      const { data: existing } = await supabase
        .from('user_notification_preferences')
        .select('id')
        .eq('user_id', employeeId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_notification_preferences')
          .update(newPrefs)
          .eq('user_id', employeeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_notification_preferences')
          .insert({ user_id: employeeId, ...newPrefs });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-notification-preferences', employeeId] });
      toast.success('Benachrichtigungseinstellungen gespeichert');
    },
    onError: (error) => {
      console.error('Error updating notification preferences:', error);
      toast.error('Fehler beim Speichern der Einstellungen');
    },
  });

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    updateMutation.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const currentPrefs = preferences ?? defaultPreferences;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Benachrichtigungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Email Benachrichtigungen</Label>
          <Switch 
            checked={currentPrefs.email_enabled}
            onCheckedChange={(checked) => handleToggle('email_enabled', checked)}
            disabled={updateMutation.isPending}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Push Benachrichtigungen</Label>
          <Switch 
            checked={currentPrefs.push_enabled}
            onCheckedChange={(checked) => handleToggle('push_enabled', checked)}
            disabled={updateMutation.isPending}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Urlaubsanträge</Label>
          <Switch 
            checked={currentPrefs.vacation_notifications}
            onCheckedChange={(checked) => handleToggle('vacation_notifications', checked)}
            disabled={updateMutation.isPending}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Krankmeldungen</Label>
          <Switch 
            checked={currentPrefs.sick_leave_notifications}
            onCheckedChange={(checked) => handleToggle('sick_leave_notifications', checked)}
            disabled={updateMutation.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
};
