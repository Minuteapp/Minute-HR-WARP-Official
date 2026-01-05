import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, ClipboardList, Users, Target, FileText, Save, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "sonner";

const RecruitingSettings = () => {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('recruiting');

  const handleSave = async () => {
    try {
      await saveSettings(settings);
      toast.success("Recruiting-Einstellungen gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const updateSetting = (key: string, value: any) => {
    if (settings) {
      settings[key] = value;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bewerbungsprozess */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Bewerbungsprozess
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-acknowledgment">Automatische Eingangsbestätigung</Label>
                <Switch 
                  id="auto-acknowledgment" 
                  checked={getValue('auto_acknowledgment', true)}
                  onCheckedChange={(checked) => updateSetting('auto_acknowledgment', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="cv-parsing">Automatisches CV-Parsing</Label>
                <Switch 
                  id="cv-parsing" 
                  checked={getValue('cv_parsing', false)}
                  onCheckedChange={(checked) => updateSetting('cv_parsing', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="duplicate-detection">Duplikatserkennung</Label>
                <Switch 
                  id="duplicate-detection" 
                  checked={getValue('duplicate_detection', true)}
                  onCheckedChange={(checked) => updateSetting('duplicate_detection', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="response-time">Standard-Antwortzeit (Tage)</Label>
                <Input 
                  id="response-time" 
                  type="number" 
                  value={getValue('response_time_days', 5)}
                  onChange={(e) => updateSetting('response_time_days', parseInt(e.target.value))}
                  className="mt-1" 
                />
              </div>
              
              <div>
                <Label htmlFor="retention-period">Aufbewahrungszeit Bewerberdaten (Monate)</Label>
                <Input 
                  id="retention-period" 
                  type="number" 
                  value={getValue('retention_period_months', 6)}
                  onChange={(e) => updateSetting('retention_period_months', parseInt(e.target.value))}
                  className="mt-1" 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interview-Stufen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Interview-Stufen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">1. Telefon-Screening</h4>
              <p className="text-sm text-muted-foreground mb-3">Erste Bewertung der Kandidaten</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Dauer:</span>
                  <Input 
                    type="number" 
                    className="w-20 h-7"
                    value={getValue('stage_1_duration', 30)}
                    onChange={(e) => updateSetting('stage_1_duration', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Verantwortlich:</span>
                  <Select 
                    value={getValue('stage_1_responsible', 'hr')}
                    onValueChange={(value) => updateSetting('stage_1_responsible', value)}
                  >
                    <SelectTrigger className="w-28 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="department">Fachbereich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">2. Fachinterview</h4>
              <p className="text-sm text-muted-foreground mb-3">Technische Kompetenzprüfung</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Dauer:</span>
                  <Input 
                    type="number" 
                    className="w-20 h-7"
                    value={getValue('stage_2_duration', 60)}
                    onChange={(e) => updateSetting('stage_2_duration', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Verantwortlich:</span>
                  <Select 
                    value={getValue('stage_2_responsible', 'department')}
                    onValueChange={(value) => updateSetting('stage_2_responsible', value)}
                  >
                    <SelectTrigger className="w-28 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="department">Fachbereich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">3. Abschlussgespräch</h4>
              <p className="text-sm text-muted-foreground mb-3">Finale Entscheidung</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Dauer:</span>
                  <Input 
                    type="number" 
                    className="w-20 h-7"
                    value={getValue('stage_3_duration', 45)}
                    onChange={(e) => updateSetting('stage_3_duration', parseInt(e.target.value))}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Verantwortlich:</span>
                  <Select 
                    value={getValue('stage_3_responsible', 'management')}
                    onValueChange={(value) => updateSetting('stage_3_responsible', value)}
                  >
                    <SelectTrigger className="w-28 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                      <SelectItem value="department">Fachbereich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Neue Interview-Stufe hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Bewertungslogik */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Bewertungslogik
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="rating-scale">Bewertungsskala</Label>
                <Select 
                  value={getValue('rating_scale', '5-point')}
                  onValueChange={(value) => updateSetting('rating_scale', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3-point">3-Punkte (Gut/Mittel/Schlecht)</SelectItem>
                    <SelectItem value="5-point">5-Punkte (1-5 Sterne)</SelectItem>
                    <SelectItem value="10-point">10-Punkte (1-10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="min-score">Mindestpunktzahl für Weiterkommen</Label>
                <Input 
                  id="min-score" 
                  type="number" 
                  value={getValue('min_score', 3)}
                  onChange={(e) => updateSetting('min_score', parseInt(e.target.value))}
                  min="1" 
                  max="10" 
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="weighted-scoring">Gewichtete Bewertung</Label>
                <Switch 
                  id="weighted-scoring" 
                  checked={getValue('weighted_scoring', true)}
                  onCheckedChange={(checked) => updateSetting('weighted_scoring', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="multi-evaluator">Mehr-Personen-Bewertung</Label>
                <Switch 
                  id="multi-evaluator" 
                  checked={getValue('multi_evaluator', false)}
                  onCheckedChange={(checked) => updateSetting('multi_evaluator', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="consensus-required">Konsens erforderlich</Label>
                <Switch 
                  id="consensus-required" 
                  checked={getValue('consensus_required', false)}
                  onCheckedChange={(checked) => updateSetting('consensus_required', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulare und Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bewerbungsformulare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Standardfelder</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Persönliche Daten</Label>
                  <Switch 
                    checked={getValue('field_personal_data', true)}
                    onCheckedChange={(checked) => updateSetting('field_personal_data', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Kontaktinformationen</Label>
                  <Switch 
                    checked={getValue('field_contact_info', true)}
                    onCheckedChange={(checked) => updateSetting('field_contact_info', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Ausbildung</Label>
                  <Switch 
                    checked={getValue('field_education', true)}
                    onCheckedChange={(checked) => updateSetting('field_education', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Berufserfahrung</Label>
                  <Switch 
                    checked={getValue('field_experience', true)}
                    onCheckedChange={(checked) => updateSetting('field_experience', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Kompetenzen</Label>
                  <Switch 
                    checked={getValue('field_competencies', true)}
                    onCheckedChange={(checked) => updateSetting('field_competencies', checked)}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Zusätzliche Felder</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Motivationsschreiben</Label>
                  <Switch 
                    checked={getValue('field_cover_letter', true)}
                    onCheckedChange={(checked) => updateSetting('field_cover_letter', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Gehaltsvorstellung</Label>
                  <Switch 
                    checked={getValue('field_salary_expectation', false)}
                    onCheckedChange={(checked) => updateSetting('field_salary_expectation', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Verfügbarkeit</Label>
                  <Switch 
                    checked={getValue('field_availability', false)}
                    onCheckedChange={(checked) => updateSetting('field_availability', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Portfolio-Link</Label>
                  <Switch 
                    checked={getValue('field_portfolio', false)}
                    onCheckedChange={(checked) => updateSetting('field_portfolio', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Referenzen</Label>
                  <Switch 
                    checked={getValue('field_references', false)}
                    onCheckedChange={(checked) => updateSetting('field_references', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button variant="outline" className="mr-2">
              Formular anpassen
            </Button>
            <Button variant="outline">
              Template erstellen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Speichern Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default RecruitingSettings;
