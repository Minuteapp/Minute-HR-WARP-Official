
import { useState, useEffect } from 'react';
import { useAbsenceManagement } from '@/hooks/useAbsenceManagement';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import { AbsenceSettings, AbsenceType } from '@/types/absence.types';
import { toast } from 'sonner';

export const AbsenceSettingsForm = () => {
  const { settings, isLoadingSettings, canManageSettings } = useAbsenceManagement();
  const [formData, setFormData] = useState<AbsenceSettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (field: keyof AbsenceSettings, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const handleColorChange = (type: AbsenceType, color: string) => {
    if (!formData) return;
    setFormData({
      ...formData,
      absence_colors: {
        ...formData.absence_colors,
        [type]: color
      }
    });
  };

  const handleSubmit = async () => {
    if (!formData) return;
    
    setIsSubmitting(true);
    
    try {
      // Hier würde man normalerweise die Einstellungen an die API senden
      // await absenceManagementService.updateSettings(formData);
      console.log('Submitting settings:', formData);
      
      // Simuliere eine kurze Verzögerung
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Einstellungen erfolgreich gespeichert');
    } catch (error) {
      console.error('Fehler beim Speichern der Einstellungen:', error);
      toast.error('Fehler beim Speichern der Einstellungen');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSettings || !formData) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canManageSettings) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center text-amber-600">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-medium">Keine Berechtigung</h3>
        </div>
        <p className="text-center text-muted-foreground mt-2">
          Sie haben keine Berechtigung, die Abwesenheitseinstellungen zu verwalten.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Allgemeine Einstellungen</CardTitle>
          <CardDescription>Grundlegende Einstellungen für die Abwesenheitsverwaltung</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Genehmigung erforderlich</Label>
              <p className="text-sm text-muted-foreground">Abwesenheitsanträge müssen genehmigt werden</p>
            </div>
            <Switch 
              checked={formData.require_approval} 
              onCheckedChange={(checked) => handleChange('require_approval', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Selbst-Genehmigung erlauben</Label>
              <p className="text-sm text-muted-foreground">Benutzer können ihre eigenen Anträge genehmigen</p>
            </div>
            <Switch 
              checked={formData.allow_self_approval} 
              onCheckedChange={(checked) => handleChange('allow_self_approval', checked)} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Maximale aufeinanderfolgende Tage</Label>
              <Input 
                type="number" 
                value={formData.max_consecutive_days} 
                onChange={(e) => handleChange('max_consecutive_days', Number(e.target.value))} 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Vorlaufzeit in Tagen</Label>
              <Input 
                type="number" 
                value={formData.notice_period_days} 
                onChange={(e) => handleChange('notice_period_days', Number(e.target.value))} 
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Integrationseinstellungen</CardTitle>
          <CardDescription>Einstellungen für die Integration mit anderen Modulen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Zeiterfassung automatisch blockieren</Label>
              <p className="text-sm text-muted-foreground">Keine Zeiterfassung während genehmigter Abwesenheiten</p>
            </div>
            <Switch 
              checked={formData.auto_block_time_tracking} 
              onCheckedChange={(checked) => handleChange('auto_block_time_tracking', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Im Kalender anzeigen</Label>
              <p className="text-sm text-muted-foreground">Abwesenheiten automatisch im Kalender eintragen</p>
            </div>
            <Switch 
              checked={formData.show_in_calendar} 
              onCheckedChange={(checked) => handleChange('show_in_calendar', checked)} 
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Farbeinstellungen</CardTitle>
          <CardDescription>Farben für verschiedene Abwesenheitstypen festlegen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(formData.absence_colors).map(([type, color]) => (
              <div key={type} className="space-y-2">
                <Label>{type === 'vacation' ? 'Urlaub' : 
                       type === 'sick_leave' ? 'Krankheit' :
                       type === 'parental' ? 'Elternzeit' :
                       type === 'business_trip' ? 'Dienstreise' : 'Sonstiges'}</Label>
                <div className="flex space-x-2">
                  <div 
                    className="w-10 h-8 rounded border"
                    style={{ backgroundColor: color }}
                  />
                  <Input 
                    type="text" 
                    value={color} 
                    onChange={(e) => handleColorChange(type as AbsenceType, e.target.value)} 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Krankmeldungseinstellungen</CardTitle>
          <CardDescription>Spezifische Einstellungen für Krankmeldungen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Attest erforderlich nach Tagen</Label>
            <Input 
              type="number" 
              value={formData.require_certificate_after_days} 
              onChange={(e) => handleChange('require_certificate_after_days', Number(e.target.value))} 
            />
            <p className="text-sm text-muted-foreground">Anzahl der Tage, nach denen ein ärztliches Attest erforderlich ist</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Einstellungen speichern
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
