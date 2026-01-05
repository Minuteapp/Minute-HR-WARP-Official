import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Search, Calendar, FileSearch, Zap, Target, Save } from "lucide-react";
import { useEffectiveSettings } from "@/hooks/useEffectiveSettings";
import { toast } from "@/hooks/use-toast";

interface FormState {
  ai_tagging_enabled: boolean;
  ocr_for_scans: boolean;
  handwriting_recognition: boolean;
  multilingual_ocr: boolean;
  expiry_warnings: boolean;
  certificate_monitoring: boolean;
  visa_reminders: boolean;
  warning_days_1: number;
  warning_days_2: number;
  warning_days_final: number;
  detect_missing_docs: boolean;
  onboarding_support: boolean;
  compliance_checker: boolean;
  content_based_search: boolean;
  semantic_search: boolean;
  auto_complete_search: boolean;
}

export default function DocumentAutomationAI() {
  const { settings, getValue, saveSettings, loading } = useEffectiveSettings('documents');
  
  const [formState, setFormState] = useState<FormState>({
    ai_tagging_enabled: true,
    ocr_for_scans: true,
    handwriting_recognition: false,
    multilingual_ocr: true,
    expiry_warnings: true,
    certificate_monitoring: true,
    visa_reminders: false,
    warning_days_1: 90,
    warning_days_2: 30,
    warning_days_final: 7,
    detect_missing_docs: true,
    onboarding_support: true,
    compliance_checker: false,
    content_based_search: true,
    semantic_search: false,
    auto_complete_search: true,
  });

  useEffect(() => {
    if (settings) {
      setFormState({
        ai_tagging_enabled: getValue('automation_ai_tagging_enabled', true) as boolean,
        ocr_for_scans: getValue('automation_ocr_for_scans', true) as boolean,
        handwriting_recognition: getValue('automation_handwriting_recognition', false) as boolean,
        multilingual_ocr: getValue('automation_multilingual_ocr', true) as boolean,
        expiry_warnings: getValue('automation_expiry_warnings', true) as boolean,
        certificate_monitoring: getValue('automation_certificate_monitoring', true) as boolean,
        visa_reminders: getValue('automation_visa_reminders', false) as boolean,
        warning_days_1: getValue('automation_warning_days_1', 90) as number,
        warning_days_2: getValue('automation_warning_days_2', 30) as number,
        warning_days_final: getValue('automation_warning_days_final', 7) as number,
        detect_missing_docs: getValue('automation_detect_missing_docs', true) as boolean,
        onboarding_support: getValue('automation_onboarding_support', true) as boolean,
        compliance_checker: getValue('automation_compliance_checker', false) as boolean,
        content_based_search: getValue('automation_content_based_search', true) as boolean,
        semantic_search: getValue('automation_semantic_search', false) as boolean,
        auto_complete_search: getValue('automation_auto_complete_search', true) as boolean,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    const settingsToSave = Object.entries(formState).reduce((acc, [key, value]) => {
      acc[`automation_${key}`] = value;
      return acc;
    }, {} as Record<string, any>);
    
    await saveSettings(settingsToSave);
    toast({ title: "KI & Automatisierung-Einstellungen gespeichert" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Automatisches Tagging
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>KI-basiertes Tagging aktivieren</Label>
              <p className="text-sm text-muted-foreground">Automatische Verschlagwortung neuer Dokumente</p>
            </div>
            <Switch 
              checked={formState.ai_tagging_enabled}
              onCheckedChange={(checked) => setFormState(prev => ({ ...prev, ai_tagging_enabled: checked }))}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">📄 Vertrag</h4>
                  <Badge variant="secondary">Aktiv</Badge>
                </div>
                <Progress value={95} className="mb-2" />
                <p className="text-sm text-muted-foreground">95% Erkennungsrate</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">🧾 Rechnung</h4>
                  <Badge variant="secondary">Aktiv</Badge>
                </div>
                <Progress value={98} className="mb-2" />
                <p className="text-sm text-muted-foreground">98% Erkennungsrate</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">🏥 Krankmeldung</h4>
                  <Badge variant="secondary">Aktiv</Badge>
                </div>
                <Progress value={92} className="mb-2" />
                <p className="text-sm text-muted-foreground">92% Erkennungsrate</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            KI-gestützte Texterkennung (OCR)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>OCR für Scans aktivieren</Label>
                <p className="text-sm text-muted-foreground">Automatische Texterkennung in Bildern und PDFs</p>
              </div>
              <Switch 
                checked={formState.ocr_for_scans}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, ocr_for_scans: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Handschrift-Erkennung</Label>
                <p className="text-sm text-muted-foreground">Erkennung handgeschriebener Notizen</p>
              </div>
              <Switch 
                checked={formState.handwriting_recognition}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, handwriting_recognition: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Mehrsprachige OCR</Label>
                <p className="text-sm text-muted-foreground">Unterstützung für Deutsch, Englisch, Französisch</p>
              </div>
              <Switch 
                checked={formState.multilingual_ocr}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, multilingual_ocr: checked }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>OCR-Genauigkeit</Label>
              <Progress value={89} />
              <p className="text-sm text-muted-foreground">89% durchschnittliche Genauigkeit</p>
            </div>
            <div className="space-y-2">
              <Label>Verarbeitungsgeschwindigkeit</Label>
              <Input value="~2.3 Sekunden pro Seite" readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Automatische Erinnerungen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Ablaufdatum-Warnungen</Label>
                <p className="text-sm text-muted-foreground">Automatische Benachrichtigungen vor Ablauf</p>
              </div>
              <Switch 
                checked={formState.expiry_warnings}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, expiry_warnings: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Zertifikats-Überwachung</Label>
                <p className="text-sm text-muted-foreground">Warnung vor ablaufenden Qualifikationen</p>
              </div>
              <Switch 
                checked={formState.certificate_monitoring}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, certificate_monitoring: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Visa-Erinnerungen</Label>
                <p className="text-sm text-muted-foreground">Arbeitserlaubnis-Überwachung für ausländische Mitarbeiter</p>
              </div>
              <Switch 
                checked={formState.visa_reminders}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, visa_reminders: checked }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Warnung 1 (Tage vorher)</Label>
              <Input 
                type="number" 
                value={formState.warning_days_1}
                onChange={(e) => setFormState(prev => ({ ...prev, warning_days_1: parseInt(e.target.value) || 90 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Warnung 2 (Tage vorher)</Label>
              <Input 
                type="number" 
                value={formState.warning_days_2}
                onChange={(e) => setFormState(prev => ({ ...prev, warning_days_2: parseInt(e.target.value) || 30 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Finale Warnung (Tage vorher)</Label>
              <Input 
                type="number" 
                value={formState.warning_days_final}
                onChange={(e) => setFormState(prev => ({ ...prev, warning_days_final: parseInt(e.target.value) || 7 }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Smart Detection & Vorschläge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Fehlende Dokumente erkennen</Label>
                <p className="text-sm text-muted-foreground">Vorschläge für unvollständige Mitarbeiterakten</p>
              </div>
              <Switch 
                checked={formState.detect_missing_docs}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, detect_missing_docs: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Onboarding-Unterstützung</Label>
                <p className="text-sm text-muted-foreground">Automatische Checkliste für neue Mitarbeiter</p>
              </div>
              <Switch 
                checked={formState.onboarding_support}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, onboarding_support: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Compliance-Checker</Label>
                <p className="text-sm text-muted-foreground">Automatische Überprüfung auf Vollständigkeit</p>
              </div>
              <Switch 
                checked={formState.compliance_checker}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, compliance_checker: checked }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📋 Onboarding-Checkliste</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Arbeitsvertrag</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Personalfragebogen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Führungszeugnis fehlt</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">⚠️ Compliance-Warnungen</h4>
                <div className="space-y-1">
                  <Badge variant="destructive" className="text-xs">Zertifikat läuft in 15 Tagen ab</Badge>
                  <Badge variant="outline" className="text-xs">Gesundheitszeugnis erneuern</Badge>
                  <Badge variant="secondary" className="text-xs">Datenschutzschulung fällig</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            KI-gestützte Suche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Inhaltsbasierte Suche</Label>
                <p className="text-sm text-muted-foreground">Suche über Dokumentinhalte, nicht nur Dateinamen</p>
              </div>
              <Switch 
                checked={formState.content_based_search}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, content_based_search: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Semantic Search</Label>
                <p className="text-sm text-muted-foreground">Verstehen des Suchkontexts und Synonyme</p>
              </div>
              <Switch 
                checked={formState.semantic_search}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, semantic_search: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Vervollständigung</Label>
                <p className="text-sm text-muted-foreground">Suchvorschläge basierend auf vorherigen Suchen</p>
              </div>
              <Switch 
                checked={formState.auto_complete_search}
                onCheckedChange={(checked) => setFormState(prev => ({ ...prev, auto_complete_search: checked }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Suchbeispiele</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="p-2 bg-muted rounded text-sm">
                "Alle Verträge von 2023 mit Gehaltserhöhung"
              </div>
              <div className="p-2 bg-muted rounded text-sm">
                "Krankmeldungen länger als 6 Wochen"
              </div>
              <div className="p-2 bg-muted rounded text-sm">
                "Zertifikate die in Q2 ablaufen"
              </div>
              <div className="p-2 bg-muted rounded text-sm">
                "Dokumente von Müller aus der IT"
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance & Optimierung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">⚡ Verarbeitungszeit</h4>
                <div className="text-2xl font-bold mb-1">2.8s</div>
                <p className="text-sm text-muted-foreground">Durchschnitt pro Dokument</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">🎯 Genauigkeit</h4>
                <div className="text-2xl font-bold mb-1">94.2%</div>
                <p className="text-sm text-muted-foreground">KI-Klassifizierung</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">📈 Effizienzsteigerung</h4>
                <div className="text-2xl font-bold mb-1">78%</div>
                <p className="text-sm text-muted-foreground">Weniger manuelle Arbeit</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">KI-Training starten</Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Speichern..." : "Einstellungen speichern"}
        </Button>
      </div>
    </div>
  );
}
