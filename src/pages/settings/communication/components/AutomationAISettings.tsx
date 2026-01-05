import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Zap, Target, Clock, AlertCircle } from "lucide-react";

export default function AutomationAISettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Intelligentes Benachrichtigungs-Clustering
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Smart Clustering aktivieren</Label>
              <p className="text-sm text-muted-foreground">Mehrere ähnliche Nachrichten zu einer Zusammenfassung kombinieren</p>
            </div>
            <Switch />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Clustering-Zeitfenster (Minuten)</Label>
              <Input placeholder="15" type="number" />
            </div>
            <div className="space-y-2">
              <Label>Min. Nachrichten für Clustering</Label>
              <Input placeholder="3" type="number" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Priorisierung nach Dringlichkeit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Automatische Priorisierung</Label>
              <p className="text-sm text-muted-foreground">KI bestimmt Wichtigkeit basierend auf Inhalt und Kontext</p>
            </div>
            <Switch />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h4 className="font-medium">Hoch</h4>
                </div>
                <p className="text-sm text-muted-foreground">Sofortige Zustellung, Push + E-Mail</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h4 className="font-medium">Mittel</h4>
                </div>
                <p className="text-sm text-muted-foreground">Innerhalb 1 Stunde, In-App</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-medium">Niedrig</h4>
                </div>
                <p className="text-sm text-muted-foreground">Tägliche Zusammenfassung</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            KI-Vorhersage & Früherkennung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Kündigungsrisiko-Erkennung</Label>
                <p className="text-sm text-muted-foreground">Manager-Alarm bei erhöhtem Kündigungsrisiko</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Überlastung-Vorhersage</Label>
                <p className="text-sm text-muted-foreground">Warnung vor potentieller Mitarbeiterüberlastung</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Compliance-Risiko-Analyse</Label>
                <p className="text-sm text-muted-foreground">Automatische Erkennung von Regelkonformitätsproblemen</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Performance-Trend-Analyse</Label>
                <p className="text-sm text-muted-foreground">Früherkennung von Leistungsveränderungen</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Automatische Erinnerungsschleifen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Erinnerungsschleifen aktivieren</Label>
              <p className="text-sm text-muted-foreground">Automatische Nachfassen bei fehlender Reaktion</p>
            </div>
            <Switch />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>1. Erinnerung nach (Stunden)</Label>
              <Input placeholder="24" type="number" />
            </div>
            <div className="space-y-2">
              <Label>2. Erinnerung nach (Tagen)</Label>
              <Input placeholder="3" type="number" />
            </div>
            <div className="space-y-2">
              <Label>Eskalation nach (Tagen)</Label>
              <Input placeholder="7" type="number" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Smart Detection & OCR
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Automatische Dokumenterkennung</Label>
                <p className="text-sm text-muted-foreground">KI erkennt Dokumenttyp und extrahiert relevante Daten</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Krankmeldung-Extraktion</Label>
                <p className="text-sm text-muted-foreground">Automatische Erkennung von Krankheitsdauer und Rückkehrtermin</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Vertragsanalyse</Label>
                <p className="text-sm text-muted-foreground">Automatische Extraktion von Vertragslaufzeiten und wichtigen Daten</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Spesenerkennung</Label>
                <p className="text-sm text-muted-foreground">Automatische Kategorisierung und Betragsextraktion von Belegen</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>KI-Lernverhalten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lernmodus</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Modus wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Konservativ</SelectItem>
                  <SelectItem value="balanced">Ausgewogen</SelectItem>
                  <SelectItem value="aggressive">Aggressiv</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trainingsdaten-Retention (Tage)</Label>
              <Input placeholder="90" type="number" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Personalisiertes Lernen</Label>
              <p className="text-sm text-muted-foreground">KI lernt individuelle Präferenzen der Nutzer</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">Zurücksetzen</Button>
        <Button>Einstellungen speichern</Button>
      </div>
    </div>
  );
}