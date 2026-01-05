import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Mail, AlertTriangle, FileText, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "@/hooks/use-toast";

export default function DocumentNotifications() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formState, setFormState] = useState({
    notifications_new_documents: true,
    notifications_document_updates: true,
    notifications_approval_requests: true,
    notifications_bulk_upload_summary: false,
    notifications_expiry_alerts: true,
    notifications_certificates: true,
    notifications_contracts: true,
    notifications_visa_work_permit: true,
    notifications_compliance_docs: false,
    notifications_first_warning_days: 90,
    notifications_second_warning_days: 30,
    notifications_final_warning_days: 7,
    notifications_approved: true,
    notifications_rejected: true,
    notifications_query_required: true,
    notifications_workflow_status: false,
    notifications_missing_mandatory: true,
    notifications_onboarding: true,
    notifications_compliance_violations: true,
    notifications_archiving: false,
    notifications_channel_inapp: true,
    notifications_channel_email: true,
    notifications_channel_sms: false,
    notifications_email_frequency: 'immediate',
  });

  useEffect(() => {
    if (settings && Array.isArray(settings) && settings.length > 0) {
      setFormState({
        notifications_new_documents: getValue('notifications_new_documents', true),
        notifications_document_updates: getValue('notifications_document_updates', true),
        notifications_approval_requests: getValue('notifications_approval_requests', true),
        notifications_bulk_upload_summary: getValue('notifications_bulk_upload_summary', false),
        notifications_expiry_alerts: getValue('notifications_expiry_alerts', true),
        notifications_certificates: getValue('notifications_certificates', true),
        notifications_contracts: getValue('notifications_contracts', true),
        notifications_visa_work_permit: getValue('notifications_visa_work_permit', true),
        notifications_compliance_docs: getValue('notifications_compliance_docs', false),
        notifications_first_warning_days: getValue('notifications_first_warning_days', 90),
        notifications_second_warning_days: getValue('notifications_second_warning_days', 30),
        notifications_final_warning_days: getValue('notifications_final_warning_days', 7),
        notifications_approved: getValue('notifications_approved', true),
        notifications_rejected: getValue('notifications_rejected', true),
        notifications_query_required: getValue('notifications_query_required', true),
        notifications_workflow_status: getValue('notifications_workflow_status', false),
        notifications_missing_mandatory: getValue('notifications_missing_mandatory', true),
        notifications_onboarding: getValue('notifications_onboarding', true),
        notifications_compliance_violations: getValue('notifications_compliance_violations', true),
        notifications_archiving: getValue('notifications_archiving', false),
        notifications_channel_inapp: getValue('notifications_channel_inapp', true),
        notifications_channel_email: getValue('notifications_channel_email', true),
        notifications_channel_sms: getValue('notifications_channel_sms', false),
        notifications_email_frequency: getValue('notifications_email_frequency', 'immediate'),
      });
    }
  }, [settings, getValue]);

  const handleToggle = (key: string, value: boolean) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (key: string, value: string | number) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveSettings(formState);
      toast({
        title: "Einstellungen gespeichert",
        description: "Die Benachrichtigungs-Einstellungen wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: "Die Einstellungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Push-/E-Mail-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Neue Dokumente</Label>
                <p className="text-sm text-muted-foreground">Benachrichtigung bei Upload neuer Dokumente</p>
              </div>
              <Switch 
                checked={formState.notifications_new_documents}
                onCheckedChange={(v) => handleToggle('notifications_new_documents', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Dokument-Updates</Label>
                <p className="text-sm text-muted-foreground">Information über Änderungen an bestehenden Dokumenten</p>
              </div>
              <Switch 
                checked={formState.notifications_document_updates}
                onCheckedChange={(v) => handleToggle('notifications_document_updates', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Freigabe-Anfragen</Label>
                <p className="text-sm text-muted-foreground">Benachrichtigung bei Dokumenten zur Genehmigung</p>
              </div>
              <Switch 
                checked={formState.notifications_approval_requests}
                onCheckedChange={(v) => handleToggle('notifications_approval_requests', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Bulk-Upload Zusammenfassung</Label>
                <p className="text-sm text-muted-foreground">Zusammenfassung nach größeren Upload-Vorgängen</p>
              </div>
              <Switch 
                checked={formState.notifications_bulk_upload_summary}
                onCheckedChange={(v) => handleToggle('notifications_bulk_upload_summary', v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Erinnerung bei Dokumentablauf
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Zertifikate überwachen</Label>
                <p className="text-sm text-muted-foreground">Warnung vor ablaufenden Qualifikationen</p>
              </div>
              <Switch 
                checked={formState.notifications_certificates}
                onCheckedChange={(v) => handleToggle('notifications_certificates', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Verträge überwachen</Label>
                <p className="text-sm text-muted-foreground">Erinnerung vor Vertragsende</p>
              </div>
              <Switch 
                checked={formState.notifications_contracts}
                onCheckedChange={(v) => handleToggle('notifications_contracts', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Visa & Arbeitserlaubnis</Label>
                <p className="text-sm text-muted-foreground">Kritische Erinnerung für ausländische Mitarbeiter</p>
              </div>
              <Switch 
                checked={formState.notifications_visa_work_permit}
                onCheckedChange={(v) => handleToggle('notifications_visa_work_permit', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Compliance-Dokumente</Label>
                <p className="text-sm text-muted-foreground">Gesetzlich vorgeschriebene Aktualisierungen</p>
              </div>
              <Switch 
                checked={formState.notifications_compliance_docs}
                onCheckedChange={(v) => handleToggle('notifications_compliance_docs', v)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Erste Warnung (Tage vorher)</Label>
              <Input 
                type="number" 
                value={formState.notifications_first_warning_days}
                onChange={(e) => handleInputChange('notifications_first_warning_days', parseInt(e.target.value) || 90)}
              />
            </div>
            <div className="space-y-2">
              <Label>Zweite Warnung (Tage vorher)</Label>
              <Input 
                type="number" 
                value={formState.notifications_second_warning_days}
                onChange={(e) => handleInputChange('notifications_second_warning_days', parseInt(e.target.value) || 30)}
              />
            </div>
            <div className="space-y-2">
              <Label>Finale Warnung (Tage vorher)</Label>
              <Input 
                type="number" 
                value={formState.notifications_final_warning_days}
                onChange={(e) => handleInputChange('notifications_final_warning_days', parseInt(e.target.value) || 7)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Freigabe-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dokument genehmigt</Label>
                <p className="text-sm text-muted-foreground">Bestätigung nach erfolgter Freigabe</p>
              </div>
              <Switch 
                checked={formState.notifications_approved}
                onCheckedChange={(v) => handleToggle('notifications_approved', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Dokument abgelehnt</Label>
                <p className="text-sm text-muted-foreground">Information über Ablehnungsgrund</p>
              </div>
              <Switch 
                checked={formState.notifications_rejected}
                onCheckedChange={(v) => handleToggle('notifications_rejected', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Rückfrage erforderlich</Label>
                <p className="text-sm text-muted-foreground">Benachrichtigung bei Nachfragen</p>
              </div>
              <Switch 
                checked={formState.notifications_query_required}
                onCheckedChange={(v) => handleToggle('notifications_query_required', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Workflow-Status-Updates</Label>
                <p className="text-sm text-muted-foreground">Alle Statusänderungen im Genehmigungsprozess</p>
              </div>
              <Switch 
                checked={formState.notifications_workflow_status}
                onCheckedChange={(v) => handleToggle('notifications_workflow_status', v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            HR-Benachrichtigungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Fehlende Pflichtdokumente</Label>
                <p className="text-sm text-muted-foreground">Warnung bei unvollständigen Mitarbeiterakten</p>
              </div>
              <Switch 
                checked={formState.notifications_missing_mandatory}
                onCheckedChange={(v) => handleToggle('notifications_missing_mandatory', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Onboarding-Erinnerungen</Label>
                <p className="text-sm text-muted-foreground">Checkliste für neue Mitarbeiter</p>
              </div>
              <Switch 
                checked={formState.notifications_onboarding}
                onCheckedChange={(v) => handleToggle('notifications_onboarding', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Compliance-Verstöße</Label>
                <p className="text-sm text-muted-foreground">Sofortige Warnung bei Regelverstoß</p>
              </div>
              <Switch 
                checked={formState.notifications_compliance_violations}
                onCheckedChange={(v) => handleToggle('notifications_compliance_violations', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Archivierungs-Updates</Label>
                <p className="text-sm text-muted-foreground">Information über automatische Archivierung</p>
              </div>
              <Switch 
                checked={formState.notifications_archiving}
                onCheckedChange={(v) => handleToggle('notifications_archiving', v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Benachrichtigungs-Kanäle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-4 w-4" />
                  <h4 className="font-medium">In-App</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Benachrichtigungen in der Anwendung</p>
                <div className="space-y-2">
                  <Switch 
                    checked={formState.notifications_channel_inapp}
                    onCheckedChange={(v) => handleToggle('notifications_channel_inapp', v)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  <h4 className="font-medium">E-Mail</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">E-Mail-Benachrichtigungen</p>
                <div className="space-y-2">
                  <Switch 
                    checked={formState.notifications_channel_email}
                    onCheckedChange={(v) => handleToggle('notifications_channel_email', v)}
                  />
                  <Select 
                    value={formState.notifications_email_frequency}
                    onValueChange={(v) => handleInputChange('notifications_email_frequency', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Häufigkeit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Sofort</SelectItem>
                      <SelectItem value="daily">Täglich</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4" />
                  <h4 className="font-medium">SMS</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Kritische Benachrichtigungen</p>
                <div className="space-y-2">
                  <Switch 
                    checked={formState.notifications_channel_sms}
                    onCheckedChange={(v) => handleToggle('notifications_channel_sms', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Test-Benachrichtigung senden</Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
}
