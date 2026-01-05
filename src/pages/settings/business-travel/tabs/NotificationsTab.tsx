import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";
import { Bell, Mail, Smartphone, MessageSquare, Settings, Loader2 } from "lucide-react";

interface FormState {
  notification_email: boolean;
  notification_push: boolean;
  notification_sms: boolean;
  notify_booking_confirmation: boolean;
  notify_approval_required: boolean;
  notify_travel_reminder: boolean;
  notify_expense_deadline: boolean;
  notify_policy_violation: boolean;
  notify_document_expiry: boolean;
}

export default function NotificationsTab() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('business_travel');
  const [saving, setSaving] = useState(false);

  const [formState, setFormState] = useState<FormState>({
    notification_email: true,
    notification_push: true,
    notification_sms: false,
    notify_booking_confirmation: true,
    notify_approval_required: true,
    notify_travel_reminder: true,
    notify_expense_deadline: true,
    notify_policy_violation: true,
    notify_document_expiry: true,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        notification_email: getValue('notification_email', true) as boolean,
        notification_push: getValue('notification_push', true) as boolean,
        notification_sms: getValue('notification_sms', false) as boolean,
        notify_booking_confirmation: getValue('notify_booking_confirmation', true) as boolean,
        notify_approval_required: getValue('notify_approval_required', true) as boolean,
        notify_travel_reminder: getValue('notify_travel_reminder', true) as boolean,
        notify_expense_deadline: getValue('notify_expense_deadline', true) as boolean,
        notify_policy_violation: getValue('notify_policy_violation', true) as boolean,
        notify_document_expiry: getValue('notify_document_expiry', true) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(formState);
      toast.success("Benachrichtigungen gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-sky-600" />
            Benachrichtigungskanäle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-semibold">E-Mail</h4>
              </div>
              <Switch 
                checked={formState.notification_email}
                onCheckedChange={(checked) => setFormState(prev => ({...prev, notification_email: checked}))}
              />
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-semibold">Push</h4>
              </div>
              <Switch 
                checked={formState.notification_push}
                onCheckedChange={(checked) => setFormState(prev => ({...prev, notification_push: checked}))}
              />
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <h4 className="font-semibold">SMS</h4>
              </div>
              <Switch 
                checked={formState.notification_sms}
                onCheckedChange={(checked) => setFormState(prev => ({...prev, notification_sms: checked}))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-sky-600" />
            Benachrichtigungstypen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Buchungsbestätigung</Label>
              <p className="text-sm text-muted-foreground">Nach erfolgreicher Buchung</p>
            </div>
            <Switch 
              checked={formState.notify_booking_confirmation}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, notify_booking_confirmation: checked}))}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Genehmigung erforderlich</Label>
              <p className="text-sm text-muted-foreground">Wenn eine Reise genehmigt werden muss</p>
            </div>
            <Switch 
              checked={formState.notify_approval_required}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, notify_approval_required: checked}))}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Reise-Erinnerung</Label>
              <p className="text-sm text-muted-foreground">Vor Reiseantritt</p>
            </div>
            <Switch 
              checked={formState.notify_travel_reminder}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, notify_travel_reminder: checked}))}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Spesen-Deadline</Label>
              <p className="text-sm text-muted-foreground">Erinnerung an Speseneinreichung</p>
            </div>
            <Switch 
              checked={formState.notify_expense_deadline}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, notify_expense_deadline: checked}))}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Policy-Verstoß</Label>
              <p className="text-sm text-muted-foreground">Bei Abweichungen von Richtlinien</p>
            </div>
            <Switch 
              checked={formState.notify_policy_violation}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, notify_policy_violation: checked}))}
            />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <Label className="font-medium">Dokumenten-Ablauf</Label>
              <p className="text-sm text-muted-foreground">Bei ablaufenden Reisedokumenten</p>
            </div>
            <Switch 
              checked={formState.notify_document_expiry}
              onCheckedChange={(checked) => setFormState(prev => ({...prev, notify_document_expiry: checked}))}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-sky-600 hover:bg-sky-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}
          Benachrichtigungen speichern
        </Button>
      </div>
    </div>
  );
}
