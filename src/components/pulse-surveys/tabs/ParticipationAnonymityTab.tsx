import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, ShieldOff, Lock, Eye, Shield, FileSearch, 
  CheckCircle, TrendingUp, TrendingDown, Minus,
  Info
} from "lucide-react";

export const ParticipationAnonymityTab = () => {
  const [selectedLevel, setSelectedLevel] = useState<'anonymous' | 'pseudonymized' | 'open'>('anonymous');
  const [autoAggregation, setAutoAggregation] = useState(true);

  const kpis = [
    { label: 'Durchschnittliche Teilnahmequote', value: '82%', change: '+3%', trend: 'up' },
    { label: 'Umfragen mit Anonymität', value: '87%', change: '+5%', trend: 'up' },
    { label: 'Teams unter Mindestgröße', value: '4', change: '-1', trend: 'up' },
    { label: 'Datenschutz-Compliance', value: '100%', change: '0%', trend: 'neutral' },
  ];

  const anonymityLevels = [
    {
      id: 'anonymous',
      icon: ShieldOff,
      title: 'Voll anonym',
      description: 'Maximaler Schutz der Identität',
      features: [
        'Keine Rückverfolgung möglich',
        'Demografische Daten optional',
        'Aggregierte Ergebnisse ab 5 Personen',
        'Keine IP-Speicherung'
      ],
      tags: ['Engagement', 'Führungsfeedback', 'Compliance']
    },
    {
      id: 'pseudonymized',
      icon: Lock,
      title: 'Pseudonymisiert',
      description: 'Kodierte Identifikation für Verlaufsanalysen',
      features: [
        'Kodierte Nutzer-IDs',
        'Verlaufsanalysen möglich',
        'Trennung von Antwort & Identität',
        'Nur Admin-Zugriff auf Mapping'
      ],
      tags: ['Entwicklungsfeedback', 'Team-Umfragen']
    },
    {
      id: 'open',
      icon: Eye,
      title: 'Offen (namentlich)',
      description: 'Transparente Zuordnung der Antworten',
      features: [
        'Volle Transparenz',
        'Direkte Nachfragen möglich',
        'Persönliches Follow-up',
        'Vertrauensbasis erforderlich'
      ],
      tags: ['Onboarding', 'Exit-Interviews', '1:1 Feedback']
    }
  ];

  const protectionMechanisms = [
    { icon: Users, title: 'Mindestteilnehmerzahl', description: 'Ergebnisse nur bei mindestens 5 Antworten', active: true },
    { icon: Shield, title: 'Aggregation kleiner Teams', description: 'Automatische Zusammenfassung bei < 5 Personen', active: true },
    { icon: Lock, title: 'Trennung von Identität & Antworten', description: 'Technische Separation in der Datenbank', active: true },
    { icon: FileSearch, title: 'Audit-Log', description: 'Lückenlose Protokollierung aller Zugriffe', active: true },
  ];

  const gdprPoints = [
    'Zweckbindung der erhobenen Daten',
    'Datenminimierung nach Art. 5 DSGVO',
    'Recht auf Auskunft und Löschung',
    'Verschlüsselte Datenübertragung (TLS 1.3)',
    'Hosting in EU-Rechenzentren',
    'Auftragsverarbeitung dokumentiert'
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="bg-white">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold">{kpi.value}</span>
                <span className={`text-sm flex items-center gap-1 ${
                  kpi.trend === 'up' ? 'text-green-600' : 
                  kpi.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  {kpi.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                  {kpi.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                  {kpi.trend === 'neutral' && <Minus className="h-4 w-4" />}
                  {kpi.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Anonymitätsstufen */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Anonymitätsstufen</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {anonymityLevels.map((level) => {
            const Icon = level.icon;
            const isSelected = selectedLevel === level.id;
            return (
              <Card 
                key={level.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-primary bg-gray-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedLevel(level.id as typeof selectedLevel)}
              >
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-gray-100'}`}>
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{level.title}</h4>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {level.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Geeignet für:</p>
                    <div className="flex flex-wrap gap-1">
                      {level.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Schutzmechanismen */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Schutzmechanismen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {protectionMechanisms.map((mechanism, index) => {
            const Icon = mechanism.icon;
            return (
              <Card key={index} className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{mechanism.title}</h4>
                        <p className="text-sm text-muted-foreground">{mechanism.description}</p>
                      </div>
                    </div>
                    {mechanism.active && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Aktiv
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Transparenz für Mitarbeitende */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-primary">Transparenz für Mitarbeitende</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ihre Mitarbeitenden werden vor jeder Umfrage über den Anonymitätslevel und die Datenverarbeitung informiert.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <span>🔒</span>
                <span className="font-medium text-sm">Beispiel: Vor Umfrageteilnahme</span>
              </div>
              <p className="text-xs text-muted-foreground">
                "Diese Umfrage ist vollständig anonym. Ihre Antworten können nicht zu Ihnen zurückverfolgt werden."
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <span>ℹ️</span>
                <span className="font-medium text-sm">Beispiel: Bei kleinen Teams</span>
              </div>
              <p className="text-xs text-muted-foreground">
                "Ihre Antworten werden mit anderen Teams zusammengefasst, um Ihre Anonymität zu schützen."
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DSGVO-Konformität */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">DSGVO-Konformität</CardTitle>
            <Badge variant="outline" className="text-green-600 border-green-600">
              Konform
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {gdprPoints.map((point, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Konfiguration */}
      <Card className="bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Konfiguration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Standard-Anonymitätslevel</Label>
              <Select defaultValue="anonymous">
                <SelectTrigger>
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anonymous">Voll anonym</SelectItem>
                  <SelectItem value="pseudonymized">Pseudonymisiert</SelectItem>
                  <SelectItem value="open">Offen (namentlich)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Mindestteilnehmerzahl</Label>
              <Input type="number" defaultValue={5} min={3} max={20} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Automatische Aggregation</Label>
              <p className="text-sm text-muted-foreground">
                Teams unter Mindestgröße automatisch zusammenfassen
              </p>
            </div>
            <Switch 
              checked={autoAggregation} 
              onCheckedChange={setAutoAggregation}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
