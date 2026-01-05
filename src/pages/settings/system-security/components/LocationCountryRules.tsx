import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Shield, AlertTriangle, Plus, Settings } from "lucide-react";

export default function LocationCountryRules() {
  const countries = [
    { 
      code: "DE", 
      name: "Deutschland", 
      flag: "🇩🇪", 
      employees: 5420, 
      regulations: ["Arbeitszeitgesetz", "DSGVO", "Betriebsverfassungsgesetz"],
      status: "active"
    },
    { 
      code: "CH", 
      name: "Schweiz", 
      flag: "🇨🇭", 
      employees: 1250, 
      regulations: ["L-GAV", "Datenschutzgesetz", "Arbeitsgesetz"],
      status: "active"
    },
    { 
      code: "AT", 
      name: "Österreich", 
      flag: "🇦🇹", 
      employees: 890, 
      regulations: ["Urlaubsgesetz", "Kollektivverträge", "DSGVO"],
      status: "active"
    },
    { 
      code: "US", 
      name: "USA", 
      flag: "🇺🇸", 
      employees: 340, 
      regulations: ["FLSA", "GDPR Compliance", "State Laws"],
      status: "pending"
    }
  ];

  const geofences = [
    { id: "GF001", name: "Hauptstandort Hamburg", type: "Bürogebäude", radius: "100m", employees: 450, status: "active" },
    { id: "GF002", name: "Produktionshalle München", type: "Industriebereich", radius: "250m", employees: 280, status: "active" },
    { id: "GF003", name: "Lager Dresden", type: "Logistikzentrum", radius: "300m", employees: 120, status: "active" },
    { id: "GF004", name: "Krisengebiet Nahost", type: "Risikozone", radius: "50km", employees: 2, status: "warning" }
  ];

  const specialCategories = [
    { name: "Polizei & Sicherheitskräfte", employees: 125, specialRights: ["24h Arbeitszeit", "Notfall-Override", "Sonder-Geofencing"] },
    { name: "Feuerwehr & Rettungsdienst", employees: 89, specialRights: ["Bereitschaftsdienst", "Sofort-Alarmierung", "Standort-Tracking"] },
    { name: "Bundeswehr Personal", employees: 34, specialRights: ["Klassifizierte Bereiche", "Sonder-Authentifizierung", "Auslands-Regelungen"] }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Länder</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">1 in Bearbeitung</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geofences</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">3 Risikozonen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sicherheitskräfte</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground">Mit Sonderrechten</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risikozonen-Alarme</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Diese Woche</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Länder & Rechtliche Bestimmungen</CardTitle>
            <CardDescription>
              Konfiguration länderspezifischer Gesetze und Arbeitsvorschriften
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Aktive Länder</h4>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Land hinzufügen
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Land</TableHead>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map((country) => (
                  <TableRow key={country.code}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{country.flag}</span>
                        <div>
                          <div className="font-medium">{country.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {country.regulations.slice(0, 2).join(", ")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{country.employees.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={country.status === 'active' ? 'text-green-600' : 'text-yellow-600'}
                      >
                        {country.status === 'active' ? 'Aktiv' : 'Ausstehend'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geofencing & Standort-Sicherheit</CardTitle>
            <CardDescription>
              Verwaltung von Geofences und standortbasierter Sicherheit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Geofences</h4>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Geofence hinzufügen
              </Button>
            </div>

            <div className="space-y-3">
              {geofences.map((geofence) => (
                <div key={geofence.id} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{geofence.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {geofence.type} • {geofence.radius} • {geofence.employees} Mitarbeiter
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        geofence.status === 'active' ? 'text-green-600' : 
                        geofence.status === 'warning' ? 'text-red-600' : 'text-gray-600'
                      }
                    >
                      {geofence.status === 'active' ? 'Aktiv' : 
                       geofence.status === 'warning' ? 'Warnung' : 'Inaktiv'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Geofencing-Einstellungen</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="realtime-tracking">Echtzeit-Standort-Tracking</Label>
                  <Switch id="realtime-tracking" checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="crisis-alerts">Krisenzonen-Alarme</Label>
                  <Switch id="crisis-alerts" checked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-checkout">Automatisches Aus-Checken</Label>
                  <Switch id="auto-checkout" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert-radius">Alarm-Radius für Risikozonen (km)</Label>
                <Input id="alert-radius" type="number" defaultValue="50" min="1" max="1000" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spezialfälle & Sonderrechte</CardTitle>
            <CardDescription>
              Konfiguration für Sicherheitskräfte, Polizei, Feuerwehr und andere Spezialgruppen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {specialCategories.map((category) => (
                <div key={category.name} className="p-4 border rounded-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <div className="font-medium">{category.name}</div>
                    </div>
                    <Badge variant="outline">{category.employees} Mitarbeiter</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Sonderrechte:</Label>
                    <div className="space-y-1">
                      {category.specialRights.map((right) => (
                        <div key={right} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                          {right}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    Konfigurieren
                  </Button>
                </div>
              ))}
            </div>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Rechtliche Hinweise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-yellow-800 space-y-2">
                  <p>
                    <strong>Deutschland:</strong> Arbeitszeitgesetz (ArbZG) begrenzt die tägliche Arbeitszeit auf 8 Stunden (max. 10h). 
                    Ausnahmen für Sicherheitskräfte nach § 7 ArbZG.
                  </p>
                  <p>
                    <strong>Schweiz:</strong> Arbeitsgesetz (ArG) mit L-GAV für spezielle Berufsgruppen. 
                    Sonderregelungen für Polizei und Feuerwehr nach kantonalem Recht.
                  </p>
                  <p>
                    <strong>Österreich:</strong> Kollektivverträge und spezielle Bestimmungen für 
                    Exekutive und Bundesheer nach Beamten-Dienstrechtsgesetz.
                  </p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}