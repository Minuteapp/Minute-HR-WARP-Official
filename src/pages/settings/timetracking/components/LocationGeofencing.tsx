import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { MapPin, Globe, Users, Plus, Eye, Settings, AlertTriangle, Map } from "lucide-react";

export default function LocationGeofencing() {
  const geofenceLocations = [
    {
      id: "GF001",
      name: "Hauptstandort Hamburg",
      type: "Bürogebäude",
      radius: 100,
      employees: 450,
      status: "active",
      checkedIn: 387,
      workTimeRules: ["DE-Standard", "Gleitzeit"],
      address: "Beispielstraße 123, Hamburg"
    },
    {
      id: "GF002", 
      name: "Produktionshalle München",
      type: "Industriebereich",
      radius: 250,
      employees: 280,
      status: "active",
      checkedIn: 268,
      workTimeRules: ["DE-Schichtarbeit", "Überstunden-Regelung"],
      address: "Industriestraße 45, München"
    },
    {
      id: "GF003",
      name: "Außendienst Nord",
      type: "Mobile Zone",
      radius: 5000,
      employees: 25,
      status: "active", 
      checkedIn: 18,
      workTimeRules: ["Mobile-Arbeitszeit"],
      address: "Region Norddeutschland"
    },
    {
      id: "GF004",
      name: "Baustelle Berlin",
      type: "Temporärer Standort",
      radius: 150,
      employees: 42,
      status: "warning",
      checkedIn: 39,
      workTimeRules: ["DE-Bauarbeiter", "Wetter-Abhängig"],
      address: "Baustelle Potsdamer Platz, Berlin"
    }
  ];

  const countryRules = [
    {
      country: "DE",
      flag: "🇩🇪",
      name: "Deutschland", 
      locations: 12,
      specialRules: ["Nachtarbeitszuschlag 25%", "Überstunden ab 8h", "Sonntagsarbeit +50%"],
      employees: 7200
    },
    {
      country: "AT", 
      flag: "🇦🇹",
      name: "Österreich",
      locations: 3,
      specialRules: ["Kollektivvertrag", "All-in Regelung", "Überstunden 50%"],
      employees: 890
    },
    {
      country: "CH",
      flag: "🇨🇭", 
      name: "Schweiz",
      locations: 4,
      specialRules: ["L-GAV Bestimmungen", "45h/Woche", "Nachtarbeit 25%"],
      employees: 1250
    }
  ];

  const realTimeData = [
    { location: "Hamburg Büro", checkedIn: 387, capacity: 450, utilizationPercent: 86 },
    { location: "München Werk", checkedIn: 268, capacity: 280, utilizationPercent: 96 },
    { location: "Berlin Baustelle", checkedIn: 39, capacity: 42, utilizationPercent: 93 },
    { location: "Dresden Lager", checkedIn: 85, capacity: 120, utilizationPercent: 71 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Geofences</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{geofenceLocations.length}</div>
            <p className="text-xs text-muted-foreground">Konfigurierte Standorte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Länder konfiguriert</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countryRules.length}</div>
            <p className="text-xs text-muted-foreground">Mit spezifischen Regeln</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eingecheckte Mitarbeiter</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {geofenceLocations.reduce((sum, loc) => sum + loc.checkedIn, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Aktuell vor Ort</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtkapazität</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {geofenceLocations.reduce((sum, loc) => sum + loc.employees, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Max. Mitarbeiter</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Geofencing für mobile Zeiterfassung</CardTitle>
            <CardDescription>
              Konfiguration von geografischen Grenzen für Check-in/out Berechtigung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Konfigurierte Standorte</h4>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Geofence hinzufügen
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Standort</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Radius</TableHead>
                  <TableHead>Eingecheckt</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {geofenceLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-muted-foreground">{location.address}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{location.type}</Badge>
                    </TableCell>
                    <TableCell>{location.radius}m</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{location.checkedIn}/{location.employees}</div>
                        <div className="text-muted-foreground">
                          {Math.round((location.checkedIn / location.employees) * 100)}% Auslastung
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={location.status === 'active' ? 'text-green-600' : 'text-yellow-600'}
                      >
                        {location.status === 'active' ? 'Aktiv' : 'Warnung'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="space-y-4">
              <h4 className="font-medium">Neuen Geofence erstellen</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="geofence-name">Standortname</Label>
                  <Input id="geofence-name" placeholder="z.B. Filiale Süd" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geofence-type">Typ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Typ auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Bürogebäude</SelectItem>
                      <SelectItem value="production">Produktionsstätte</SelectItem>
                      <SelectItem value="warehouse">Lager</SelectItem>
                      <SelectItem value="construction">Baustelle</SelectItem>
                      <SelectItem value="mobile">Mobile Zone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geofence-address">Adresse</Label>
                  <Input id="geofence-address" placeholder="Vollständige Adresse" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="geofence-capacity">Max. Mitarbeiter</Label>
                  <Input id="geofence-capacity" type="number" placeholder="500" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="geofence-radius">Geofence-Radius (Meter)</Label>
                <div className="space-y-2">
                  <Slider
                    id="geofence-radius"
                    min={50}
                    max={1000}
                    step={25}
                    defaultValue={[150]}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>50m</span>
                    <span>150m (aktuell)</span>
                    <span>1000m</span>
                  </div>
                </div>
              </div>

              <Button className="w-full">Geofence erstellen</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Standortabhängige Arbeitszeitregeln</CardTitle>
            <CardDescription>
              Unterschiedliche Arbeitszeit- und Zuschlagsregeln je nach Standort und Land
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Land</TableHead>
                  <TableHead>Standorte</TableHead>
                  <TableHead>Mitarbeiter</TableHead>
                  <TableHead>Spezialregeln</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countryRules.map((country) => (
                  <TableRow key={country.country}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{country.flag}</span>
                        <div>
                          <div className="font-medium">{country.name}</div>
                          <div className="text-sm text-muted-foreground">{country.country}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{country.locations}</TableCell>
                    <TableCell>{country.employees.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Bearbeiten
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="space-y-4">
              {countryRules.map((country) => (
                <Card key={country.country} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{country.flag}</span>
                    <span className="font-medium">{country.name}</span>
                    <Badge variant="outline">{country.locations} Standorte</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Besondere Regelungen:</div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {country.specialRules.map((rule, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Partner-Länder hinzufügen</h4>
              
              <div className="space-y-2">
                <Label htmlFor="partner-country">Land auswählen</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Land auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FR">🇫🇷 Frankreich</SelectItem>
                    <SelectItem value="IT">🇮🇹 Italien</SelectItem>
                    <SelectItem value="NL">🇳🇱 Niederlande</SelectItem>
                    <SelectItem value="PL">🇵🇱 Polen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Partner-Land konfigurieren</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Echtzeitkarte: Mitarbeiter-Standorte</CardTitle>
            <CardDescription>
              Live-Übersicht eingecheckter Mitarbeiter und Standort-Auslastung
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Standort-Auslastung (Live)</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Map className="h-4 w-4 mr-2" />
                  Karte anzeigen
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Live-Modus
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {realTimeData.map((location, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{location.location}</div>
                        <div className="text-sm text-muted-foreground">
                          {location.checkedIn}/{location.capacity} Mitarbeiter
                        </div>
                      </div>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Auslastung</span>
                        <span className="font-medium">{location.utilizationPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            location.utilizationPercent > 90 ? 'bg-red-500' :
                            location.utilizationPercent > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${location.utilizationPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Geofencing-Einstellungen</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="realtime-tracking">Echtzeit-Standort-Verfolgung</Label>
                    <Switch id="realtime-tracking" checked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-checkout">Automatisches Check-out bei Verlassen</Label>
                    <Switch id="auto-checkout" checked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="location-alerts">Standort-Benachrichtigungen</Label>
                    <Switch id="location-alerts" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="check-frequency">Standort-Prüfung (Minuten)</Label>
                    <Input id="check-frequency" type="number" defaultValue="5" min="1" max="60" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accuracy-threshold">GPS-Genauigkeit (Meter)</Label>
                    <Input id="accuracy-threshold" type="number" defaultValue="20" min="5" max="100" />
                  </div>
                </div>
              </div>
            </div>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Datenschutz-Hinweis
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-yellow-800">
                <p>
                  Die Standortverfolgung erfolgt nur während der Arbeitszeit und 
                  nur zur Verifizierung der Anwesenheit am Arbeitsplatz. Alle 
                  Standortdaten werden DSGVO-konform verarbeitet und nach Ende 
                  der gesetzlichen Aufbewahrungsfrist automatisch gelöscht.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}