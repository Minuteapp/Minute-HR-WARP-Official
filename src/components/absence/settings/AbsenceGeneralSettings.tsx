import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface GeneralSettings {
  require_approval: boolean;
  allow_self_approval: boolean;
  max_consecutive_days: number;
  notice_period_days: number;
  auto_block_time_tracking: boolean;
  show_in_calendar: boolean;
  require_certificate_after_days: number;
}

export const AbsenceGeneralSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GeneralSettings>({
    require_approval: true,
    allow_self_approval: false,
    max_consecutive_days: 30,
    notice_period_days: 14,
    auto_block_time_tracking: true,
    show_in_calendar: true,
    require_certificate_after_days: 3,
  });

  useEffect(() => {
    loadSettings();
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('absence_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          require_approval: data.requires_approval ?? true,
          allow_self_approval: data.allow_self_approval ?? false,
          max_consecutive_days: data.max_consecutive_days ?? 30,
          notice_period_days: data.notice_period_days ?? 14,
          auto_block_time_tracking: data.auto_block_time_tracking ?? true,
          show_in_calendar: data.show_in_calendar ?? true,
          require_certificate_after_days: data.require_certificate_after_days ?? 3,
        });
      }
    } catch (error) {
      console.error('Fehler beim Laden der Einstellungen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('absence_settings')
        .upsert({
          user_id: user.id,
          requires_approval: settings.require_approval,
          allow_self_approval: settings.allow_self_approval,
          max_consecutive_days: settings.max_consecutive_days,
          notice_period_days: settings.notice_period_days,
          auto_block_time_tracking: settings.auto_block_time_tracking,
          show_in_calendar: settings.show_in_calendar,
          require_certificate_after_days: settings.require_certificate_after_days,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Einstellungen gespeichert",
        description: "Ihre allgemeinen Abwesenheitseinstellungen wurden erfolgreich aktualisiert."
      });
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Einstellungen konnten nicht gespeichert werden."
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Lädt Einstellungen...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Allgemeine Einstellungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Genehmigung */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Genehmigungsprozess</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-approval" className="text-base">
                Genehmigung erforderlich
              </Label>
              <p className="text-sm text-muted-foreground">
                Abwesenheitsanträge müssen genehmigt werden
              </p>
            </div>
            <Switch
              id="require-approval"
              checked={settings.require_approval}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, require_approval: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="self-approval" className="text-base">
                Selbstgenehmigung erlauben
              </Label>
              <p className="text-sm text-muted-foreground">
                Mitarbeiter können eigene Anträge genehmigen
              </p>
            </div>
            <Switch
              id="self-approval"
              checked={settings.allow_self_approval}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, allow_self_approval: checked }))
              }
              disabled={!settings.require_approval}
            />
          </div>
        </div>

        {/* Limits */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold">Limits & Fristen</h3>
          
          <div className="space-y-2">
            <Label htmlFor="max-days">
              Maximale aufeinanderfolgende Tage
            </Label>
            <Input
              id="max-days"
              type="number"
              min="1"
              max="365"
              value={settings.max_consecutive_days}
              onChange={(e) => 
                setSettings(prev => ({ 
                  ...prev, 
                  max_consecutive_days: parseInt(e.target.value) || 30 
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Maximale Anzahl aufeinanderfolgender Abwesenheitstage
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notice-period">
              Vorlaufzeit in Tagen
            </Label>
            <Input
              id="notice-period"
              type="number"
              min="0"
              max="90"
              value={settings.notice_period_days}
              onChange={(e) => 
                setSettings(prev => ({ 
                  ...prev, 
                  notice_period_days: parseInt(e.target.value) || 14 
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Wie viele Tage im Voraus muss ein Antrag gestellt werden
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificate-days">
              Attest erforderlich ab Tag
            </Label>
            <Input
              id="certificate-days"
              type="number"
              min="1"
              max="14"
              value={settings.require_certificate_after_days}
              onChange={(e) => 
                setSettings(prev => ({ 
                  ...prev, 
                  require_certificate_after_days: parseInt(e.target.value) || 3 
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Ab wie vielen Tagen Krankheit ist ein Attest erforderlich
            </p>
          </div>
        </div>

        {/* Integration */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold">Integration</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="block-tracking" className="text-base">
                Zeiterfassung blockieren
              </Label>
              <p className="text-sm text-muted-foreground">
                Zeiterfassung während Abwesenheit automatisch blockieren
              </p>
            </div>
            <Switch
              id="block-tracking"
              checked={settings.auto_block_time_tracking}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, auto_block_time_tracking: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show-calendar" className="text-base">
                Im Kalender anzeigen
              </Label>
              <p className="text-sm text-muted-foreground">
                Genehmigte Abwesenheiten im Kalender anzeigen
              </p>
            </div>
            <Switch
              id="show-calendar"
              checked={settings.show_in_calendar}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, show_in_calendar: checked }))
              }
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={handleSaveSettings} 
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Speichert...' : 'Einstellungen speichern'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
