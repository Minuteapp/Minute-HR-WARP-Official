import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Shield, 
  Zap, 
  Award, 
  Sparkles, 
  Bell, 
  Globe,
  Plus,
  AlertTriangle
} from 'lucide-react';

const bewertungsDimensionen = [
  { name: 'Strategischer Fit', invertiert: false, gewichtung: 10 },
  { name: 'Kundennutzen', invertiert: false, gewichtung: 10 },
  { name: 'Mitarbeiter-Impact', invertiert: false, gewichtung: 10 },
  { name: 'Aufwand', invertiert: true, gewichtung: 10 },
  { name: 'Kosten', invertiert: true, gewichtung: 10 },
  { name: 'Risiko', invertiert: true, gewichtung: 10 },
  { name: 'ESG-Relevanz', invertiert: false, gewichtung: 10 },
  { name: 'Skalierbarkeit', invertiert: false, gewichtung: 10 },
];

const integrationen = [
  { name: 'Strategy & OKR', beschreibung: 'Innovationsbeitrag zu Zielen tracken', aktiv: true },
  { name: 'Roadmap', beschreibung: 'Automatische Roadmap-Integration', aktiv: true },
  { name: 'Projekte', beschreibung: 'Ideen in Projekte überführen', aktiv: true },
  { name: 'Budget & Finance', beschreibung: 'Budgetfreigabe und Kostenverfolgung', aktiv: true },
  { name: 'Performance', beschreibung: 'Innovationsbeiträge in Performance-Reviews', aktiv: false },
  { name: 'ESG & Nachhaltigkeit', beschreibung: 'ESG-Impact-Tracking', aktiv: true },
];

const InnovationEinstellungenTab = () => {
  const [settings, setSettings] = useState({
    anonymeIdeen: true,
    sichtbarkeitBeitraege: true,
    badgesAuszeichnungen: true,
    performanceVerknuepfung: false,
    monetaereIncentives: false,
    automatischesClustering: true,
    autoPriorisierung: true,
    diskussionszusammenfassungen: true,
    trendErkennung: true,
    verbesserungsvorschlaege: true,
    neueIdeeEingereicht: true,
    kommentarAufIdee: true,
    statusaenderung: true,
    bewertungAbgeschlossen: true,
    erinnerungOffeneBewertungen: true,
  });

  const [dimensionen, setDimensionen] = useState(
    bewertungsDimensionen.map(d => ({ ...d, aktiv: true }))
  );

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDimension = (index: number) => {
    setDimensionen(prev => prev.map((d, i) => 
      i === index ? { ...d, aktiv: !d.aktiv } : d
    ));
  };

  const updateGewichtung = (index: number, value: string) => {
    setDimensionen(prev => prev.map((d, i) => 
      i === index ? { ...d, gewichtung: parseInt(value) || 0 } : d
    ));
  };

  return (
    <div className="space-y-6">
      {/* Violette Info-Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Settings className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Innovation Hub Einstellungen</h3>
            <p className="text-sm text-gray-600 mt-1">
              Konfigurieren Sie den Innovation Hub nach Ihren Bedürfnissen: Prozesse, Berechtigungen, KI-Funktionen und Incentives.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-purple-300 text-purple-700">Admin</Badge>
      </div>

      {/* Allgemeine Einstellungen */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <div>
              <CardTitle className="text-base font-semibold">Allgemeine Einstellungen</CardTitle>
              <p className="text-xs text-gray-500">Basis-Konfiguration des Innovation Hubs</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Ideeneinreichung</p>
              <p className="text-xs text-gray-500">Wer darf Ideen einreichen?</p>
            </div>
            <Select defaultValue="alle">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alle">Alle Mitarbeiter</SelectItem>
                <SelectItem value="teams">Nur Teamleiter</SelectItem>
                <SelectItem value="manager">Nur Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Anonyme Ideen erlauben</p>
              <p className="text-xs text-gray-500">Mitarbeiter können Ideen anonym einreichen</p>
            </div>
            <Switch 
              checked={settings.anonymeIdeen} 
              onCheckedChange={() => toggleSetting('anonymeIdeen')} 
            />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Ideensichtbarkeit</p>
              <p className="text-xs text-gray-500">Standardmäßige Sichtbarkeit neuer Ideen</p>
            </div>
            <Select defaultValue="oeffentlich">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oeffentlich">Öffentlich (alle Mitarbeiter)</SelectItem>
                <SelectItem value="team">Nur eigenes Team</SelectItem>
                <SelectItem value="privat">Privat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Kategorien</p>
              <p className="text-xs text-gray-500">Verfügbare Ideenkategorien</p>
            </div>
            <Badge variant="outline" className="bg-gray-50">7 Kategorien aktiv</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Governance & Berechtigungen */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-base font-semibold">Governance & Berechtigungen</CardTitle>
              <p className="text-xs text-gray-500">Entscheidungswege und Zugriffsrechte</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Bewertungsberechtigung</p>
              <p className="text-xs text-gray-500">Wer darf Ideen bewerten?</p>
            </div>
            <span className="text-sm text-gray-600">Teamleiter, Innovation Manager, Management</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Entscheidungsberechtigung</p>
              <p className="text-xs text-gray-500">Wer entscheidet über Umsetzung?</p>
            </div>
            <span className="text-sm text-gray-600">Innovationsboard, Management</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Innovationsboard</p>
              <p className="text-xs text-gray-500">Mitglieder des Entscheidungsgremiums</p>
            </div>
            <Badge variant="outline" className="bg-gray-50">5 Mitglieder definiert</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Budgetfreigabe</p>
              <p className="text-xs text-gray-500">Wer darf Innovationsbudgets freigeben?</p>
            </div>
            <span className="text-sm text-gray-600">Finance Director, CEO</span>
          </div>
        </CardContent>
      </Card>

      {/* Bewertungsdimensionen */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <div>
              <CardTitle className="text-base font-semibold">Bewertungsdimensionen</CardTitle>
              <p className="text-xs text-gray-500">Kriterien für die Ideenbewertung</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {dimensionen.map((dim, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={dim.aktiv} 
                  onCheckedChange={() => toggleDimension(index)}
                />
                <span className="text-sm font-medium text-gray-700">{dim.name}</span>
                {dim.invertiert && (
                  <Badge className="bg-red-100 text-red-700 text-xs">Invertiert</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Gewichtung:</span>
                <Input 
                  type="number"
                  value={dim.gewichtung}
                  onChange={(e) => updateGewichtung(index, e.target.value)}
                  className="w-16 h-8 text-center text-sm"
                  min={1}
                  max={100}
                />
              </div>
            </div>
          ))}
          <button className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 mt-2">
            <Plus className="h-4 w-4" />
            Neue Dimension hinzufügen
          </button>
        </CardContent>
      </Card>

      {/* Incentives & Anerkennung */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-orange-500" />
            <div>
              <CardTitle className="text-base font-semibold">Incentives & Anerkennung</CardTitle>
              <p className="text-xs text-gray-500">Förderung der Innovationskultur</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Sichtbarkeit von Beiträgen</p>
              <p className="text-xs text-gray-500">Innovationsbeiträge im Profil anzeigen</p>
            </div>
            <Switch 
              checked={settings.sichtbarkeitBeitraege} 
              onCheckedChange={() => toggleSetting('sichtbarkeitBeitraege')} 
            />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Badges & Auszeichnungen</p>
              <p className="text-xs text-gray-500">Gamification-Elemente aktivieren</p>
            </div>
            <Switch 
              checked={settings.badgesAuszeichnungen} 
              onCheckedChange={() => toggleSetting('badgesAuszeichnungen')} 
            />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Performance-Verknüpfung</p>
              <p className="text-xs text-gray-500">Innovationsbeiträge in Performance-Bewertung einfließen lassen</p>
            </div>
            <Switch 
              checked={settings.performanceVerknuepfung} 
              onCheckedChange={() => toggleSetting('performanceVerknuepfung')} 
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Monetäre Incentives</p>
              <p className="text-xs text-gray-500">Finanzielle Beteiligung an Einsparungen</p>
            </div>
            <Switch 
              checked={settings.monetaereIncentives} 
              onCheckedChange={() => toggleSetting('monetaereIncentives')} 
            />
          </div>

          {/* Empfehlung Box */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div>
                <span className="font-medium text-sm text-orange-800">Empfehlung:</span>
                <p className="text-sm text-orange-700 mt-1">
                  Intrinsische Motivation (Anerkennung, Sichtbarkeit, Ownership) zeigt nachhaltigere Wirkung als monetäre Incentives.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KI-Funktionen */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <div>
              <CardTitle className="text-base font-semibold">KI-Funktionen</CardTitle>
              <p className="text-xs text-gray-500">Künstliche Intelligenz Unterstützung</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Automatisches Clustering</p>
              <p className="text-xs text-gray-500">KI erkennt ähnliche Ideen und schlägt Zusammenführung vor</p>
            </div>
            <Switch 
              checked={settings.automatischesClustering} 
              onCheckedChange={() => toggleSetting('automatischesClustering')} 
            />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Auto-Priorisierung</p>
              <p className="text-xs text-gray-500">KI gibt Priorisierungsempfehlungen basierend auf Score</p>
            </div>
            <Switch 
              checked={settings.autoPriorisierung} 
              onCheckedChange={() => toggleSetting('autoPriorisierung')} 
            />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Diskussionszusammenfassungen</p>
              <p className="text-xs text-gray-500">KI fasst lange Diskussions-Threads zusammen</p>
            </div>
            <Switch 
              checked={settings.diskussionszusammenfassungen} 
              onCheckedChange={() => toggleSetting('diskussionszusammenfassungen')} 
            />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Trend-Erkennung</p>
              <p className="text-xs text-gray-500">KI analysiert wiederkehrende Themen und Muster</p>
            </div>
            <Switch 
              checked={settings.trendErkennung} 
              onCheckedChange={() => toggleSetting('trendErkennung')} 
            />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Verbesserungsvorschläge</p>
              <p className="text-xs text-gray-500">KI schlägt Optimierungen für Ideen vor</p>
            </div>
            <Switch 
              checked={settings.verbesserungsvorschlaege} 
              onCheckedChange={() => toggleSetting('verbesserungsvorschlaege')} 
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Sprachstil</p>
              <p className="text-xs text-gray-500">Tonalität der KI-Kommunikation</p>
            </div>
            <Select defaultValue="wertschaetzend">
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wertschaetzend">Wertschätzend & konstruktiv</SelectItem>
                <SelectItem value="neutral">Neutral & sachlich</SelectItem>
                <SelectItem value="direkt">Direkt & prägnant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Benachrichtigungen */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <div>
              <CardTitle className="text-base font-semibold">Benachrichtigungen</CardTitle>
              <p className="text-xs text-gray-500">Automatische Updates und Erinnerungen</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Neue Idee eingereicht</p>
              <p className="text-xs text-gray-500">Benachrichtigung an Teamleiter und Innovation Manager</p>
            </div>
            <Switch 
              checked={settings.neueIdeeEingereicht} 
              onCheckedChange={() => toggleSetting('neueIdeeEingereicht')} 
            />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Kommentar auf eigene Idee</p>
              <p className="text-xs text-gray-500">Benachrichtigung an Ideengeber</p>
            </div>
            <Switch 
              checked={settings.kommentarAufIdee} 
              onCheckedChange={() => toggleSetting('kommentarAufIdee')} 
            />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Statusänderung</p>
              <p className="text-xs text-gray-500">Update bei Änderung des Ideen-Status</p>
            </div>
            <Switch 
              checked={settings.statusaenderung} 
              onCheckedChange={() => toggleSetting('statusaenderung')} 
            />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-700">Bewertung abgeschlossen</p>
              <p className="text-xs text-gray-500">Benachrichtigung über Bewertungsergebnis</p>
            </div>
            <Switch 
              checked={settings.bewertungAbgeschlossen} 
              onCheckedChange={() => toggleSetting('bewertungAbgeschlossen')} 
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-700">Erinnerung: Offene Bewertungen</p>
              <p className="text-xs text-gray-500">Wöchentliche Erinnerung an ausstehende Bewertungen</p>
            </div>
            <Switch 
              checked={settings.erinnerungOffeneBewertungen} 
              onCheckedChange={() => toggleSetting('erinnerungOffeneBewertungen')} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Integrationen */}
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-gray-600" />
            <div>
              <CardTitle className="text-base font-semibold">Integrationen</CardTitle>
              <p className="text-xs text-gray-500">Verbindungen zu anderen Modulen</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrationen.map((integration, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-700">{integration.name}</p>
                <p className="text-xs text-gray-500">{integration.beschreibung}</p>
              </div>
              <Badge className={integration.aktiv ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                {integration.aktiv ? 'Aktiv' : 'Inaktiv'}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" className="text-gray-600">
          Zurücksetzen
        </Button>
        <Button className="bg-green-500 hover:bg-green-600 text-white">
          Einstellungen speichern
        </Button>
      </div>
    </div>
  );
};

export default InnovationEinstellungenTab;
