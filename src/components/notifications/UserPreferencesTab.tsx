import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  BellOff, 
  Volume2,
  Sparkles,
  Send,
  RotateCcw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const UserPreferencesTab = () => {
  const [preferences, setPreferences] = useState({
    inApp: true,
    email: true,
    push: false,
    quietHours: true,
    quietHoursStart: "20:00",
    quietHoursEnd: "08:00",
    doNotDisturb: false,
    soundEnabled: true,
    aiPrioritization: true,
    weekendMode: false,
    groupSimilar: true,
    autoArchive: true,
  });

  const [categories, setCategories] = useState({
    system: true,
    tasks: true,
    requests: true,
    events: true,
    info: true,
  });

  const handleSave = () => {
    toast({
      title: "Einstellungen gespeichert",
      description: "Ihre Benachrichtigungspräferenzen wurden aktualisiert.",
    });
  };

  const handleReset = () => {
    toast({
      title: "Zurückgesetzt",
      description: "Alle Einstellungen wurden auf Standard zurückgesetzt.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Schnelleinstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-500" />
            Schnelleinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-violet-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <BellOff className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium">Nicht stören</p>
                  <p className="text-sm text-muted-foreground">Alle pausieren</p>
                </div>
              </div>
              <Switch 
                checked={preferences.doNotDisturb} 
                onCheckedChange={(checked) => setPreferences({...preferences, doNotDisturb: checked})}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Stille Stunden</p>
                  <p className="text-sm text-muted-foreground">20:00 - 08:00</p>
                </div>
              </div>
              <Switch 
                checked={preferences.quietHours} 
                onCheckedChange={(checked) => setPreferences({...preferences, quietHours: checked})}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">KI-Priorisierung</p>
                  <p className="text-sm text-muted-foreground">Intelligente Sortierung</p>
                </div>
              </div>
              <Switch 
                checked={preferences.aiPrioritization} 
                onCheckedChange={(checked) => setPreferences({...preferences, aiPrioritization: checked})}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Volume2 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Benachrichtigungston</p>
                  <p className="text-sm text-muted-foreground">Akustisches Signal</p>
                </div>
              </div>
              <Switch 
                checked={preferences.soundEnabled} 
                onCheckedChange={(checked) => setPreferences({...preferences, soundEnabled: checked})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanäle */}
      <Card>
        <CardHeader>
          <CardTitle>Benachrichtigungskanäle</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-violet-600" />
              <div>
                <p className="font-medium">In-App Benachrichtigungen</p>
                <p className="text-sm text-muted-foreground">Direkt in der Anwendung</p>
              </div>
            </div>
            <Switch 
              checked={preferences.inApp} 
              onCheckedChange={(checked) => setPreferences({...preferences, inApp: checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">E-Mail Benachrichtigungen</p>
                <p className="text-sm text-muted-foreground">Wichtige Updates per E-Mail</p>
              </div>
            </div>
            <Switch 
              checked={preferences.email} 
              onCheckedChange={(checked) => setPreferences({...preferences, email: checked})}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">Push-Benachrichtigungen</p>
                <p className="text-sm text-muted-foreground">Mobile Benachrichtigungen</p>
              </div>
            </div>
            <Switch 
              checked={preferences.push} 
              onCheckedChange={(checked) => setPreferences({...preferences, push: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Kategorien */}
      <Card>
        <CardHeader>
          <CardTitle>Benachrichtigungskategorien</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { id: 'system', label: 'System & Sicherheit', desc: 'Kritische Systembenachrichtigungen' },
            { id: 'tasks', label: 'Aufgaben & Projekte', desc: 'Aufgabenzuweisungen und Updates' },
            { id: 'requests', label: 'Anfragen & Freigaben', desc: 'Genehmigungsanfragen' },
            { id: 'events', label: 'Termine & Events', desc: 'Kalender und Erinnerungen' },
            { id: 'info', label: 'Informationen', desc: 'Allgemeine Mitteilungen' },
          ].map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-sm">{cat.label}</p>
                <p className="text-xs text-muted-foreground">{cat.desc}</p>
              </div>
              <Switch 
                checked={categories[cat.id as keyof typeof categories]} 
                onCheckedChange={(checked) => setCategories({...categories, [cat.id]: checked})}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Zurücksetzen
        </Button>
        <Button onClick={handleSave}>
          <Send className="h-4 w-4 mr-2" />
          Speichern
        </Button>
      </div>
    </div>
  );
};

export default UserPreferencesTab;
