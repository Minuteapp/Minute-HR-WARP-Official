import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Clock, Shield, Plus, Settings, AlertTriangle } from "lucide-react";

export default function WorkTimeModelsLaws() {
  const workTimeModels = [
    { id: "fulltime", name: "Vollzeit (40h)", employees: 6200, weeklyHours: 40, country: "DE", flexible: false },
    { id: "parttime", name: "Teilzeit (20h)", employees: 1450, weeklyHours: 20, country: "DE", flexible: true },
    { id: "shift", name: "Schichtarbeit", employees: 890, weeklyHours: 40, country: "DE", flexible: false },
    { id: "flextime", name: "Gleitzeit", employees: 3200, weeklyHours: 38.5, country: "CH", flexible: true },
    { id: "student", name: "Werkstudent", employees: 125, weeklyHours: 20, country: "DE", flexible: true }
  ];

  const countryLaws = [
    { 
      country: "DE", 
      flag: "🇩🇪", 
      name: "Deutschland", 
      law: "ArbZG",
      maxDaily: 10, 
      maxWeekly: 48, 
      minRest: 11, 
      employees: 7200,
      specialRules: ["Ruhezeiten", "Nachtarbeit", "Sonn-/Feiertagsruhe"]
    },
    { 
      country: "AT", 
      flag: "🇦🇹", 
      name: "Österreich", 
      law: "AZG",
      maxDaily: 12, 
      maxWeekly: 60, 
      minRest: 11, 
      employees: 890,
      specialRules: ["Kollektivverträge", "All-in-Verträge", "Überstundenzuschläge"]
    },
    { 
      country: "CH", 
      flag: "🇨🇭", 
      name: "Schweiz", 
      law: "L-GAV",
      maxDaily: 9, 
      maxWeekly: 45, 
      minRest: 11, 
      employees: 1250,
      specialRules: ["45/50h Grenzen", "Nachtarbeit 25%", "Überstunden 125%"]
    }
  ];

  const specialCategories = [
    { 
      name: "Sicherheitskräfte", 
      employees: 248, 
      laws: ["§7 ArbZG Ausnahme", "24h-Bereitschaft", "Wachdienst-Tarifvertrag"],
      maxDaily: 12,
      specialRights: true
    },
    { 
      name: "Rettungsdienst", 
      employees: 89, 
      laws: ["Bereitschaftszeit", "Notfall-Überstunden", "24h-Schichten erlaubt"],
      maxDaily: 24,
      specialRights: true
    },
    { 
      name: "Polizei/Bundeswehr", 
      employees: 34, 
      laws: ["Beamtenrecht", "Einsatzzeiten", "Sondergesetze"],
      maxDaily: 24,
      specialRights: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Arbeitszeitmodelle</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workTimeModels.length}</div>
            <p className="text-xs text-muted-foreground">Konfigurierte Modelle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ländergesetze</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{countryLaws.length}</div>
            <p className="text-xs text-muted-foreground">Implementiert</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sonderkategorien</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{specialCategories.length}</div>
            <p className="text-xs text-muted-foreground">Spezielle Berufsgruppen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtmitarbeiter</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9,711</div>
            <p className="text-xs text-muted-foreground">Erfasst</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">Arbeitszeitmodelle</TabsTrigger>
          <TabsTrigger value="laws">Ländergesetze</TabsTrigger>
          <TabsTrigger value="special">Sonderkategorien</TabsTrigger>
          <TabsTrigger value="calculations">Berechnungen</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flexible Arbeitszeitmodelle</CardTitle>
              <CardDescription>
                Konfiguration verschiedener Arbeitszeit- und Schichtmodelle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Konfigurierte Modelle</h4>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Neues Modell
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modell</TableHead>
                    <TableHead>Wochenstunden</TableHead>
                    <TableHead>Mitarbeiter</TableHead>
                    <TableHead>Flexibel</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workTimeModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{model.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Land: {model.country}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{model.weeklyHours}h</TableCell>
                      <TableCell>{model.employees.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={model.flexible ? 'text-green-600' : 'text-gray-600'}>
                          {model.flexible ? 'Ja' : 'Nein'}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Neues Modell erstellen</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model-name">Modellname</Label>
                    <Input id="model-name" placeholder="z.B. Teilzeit 30h" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weekly-hours">Wochenstunden</Label>
                    <Input id="weekly-hours" type="number" placeholder="38.5" step="0.5" min="10" max="60" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model-country">Geltungsbereich</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Land auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DE">🇩🇪 Deutschland</SelectItem>
                        <SelectItem value="AT">🇦🇹 Österreich</SelectItem>
                        <SelectItem value="CH">🇨🇭 Schweiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Modell-Eigenschaften</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="flexible-hours">Flexible Arbeitszeiten</Label>
                      <Switch id="flexible-hours" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="core-hours">Kernarbeitszeiten</Label>
                      <Switch id="core-hours" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="overtime-allowed">Überstunden erlaubt</Label>
                      <Switch id="overtime-allowed" checked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weekend-work">Wochenendarbeit</Label>
                      <Switch id="weekend-work" />
                    </div>
                  </div>

                  <Button className="w-full">Modell erstellen</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="laws" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Länder-abhängige Arbeitszeitgesetze</CardTitle>
              <CardDescription>
                Automatische Anwendung nationaler Arbeitsgesetze und Bestimmungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Land</TableHead>
                    <TableHead>Gesetz</TableHead>
                    <TableHead>Max. täglich</TableHead>
                    <TableHead>Max. wöchentlich</TableHead>
                    <TableHead>Min. Ruhezeit</TableHead>
                    <TableHead>Mitarbeiter</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countryLaws.map((law) => (
                    <TableRow key={law.country}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{law.flag}</span>
                          <div>
                            <div className="font-medium">{law.name}</div>
                            <div className="text-sm text-muted-foreground">{law.country}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{law.law}</Badge>
                      </TableCell>
                      <TableCell>{law.maxDaily}h</TableCell>
                      <TableCell>{law.maxWeekly}h</TableCell>
                      <TableCell>{law.minRest}h</TableCell>
                      <TableCell>{law.employees.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {countryLaws.map((law) => (
                  <Card key={law.country} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{law.flag}</span>
                      <span className="font-medium">{law.name}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Besondere Bestimmungen:</div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {law.specialRules.map((rule, index) => (
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

              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    Rechtliche Hinweise
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-yellow-800 space-y-2">
                  <p><strong>Deutschland (ArbZG):</strong> Maximale tägliche Arbeitszeit 8h (erweiterbar auf 10h). Mindestens 11h Ruhezeit zwischen den Arbeitstagen.</p>
                  <p><strong>Österreich (AZG):</strong> Normalarbeitszeit 8h täglich, 40h wöchentlich. Überstunden bis 60h/Woche möglich mit Kollektivvertragsregelungen.</p>
                  <p><strong>Schweiz (ArG):</strong> 45h/Woche für Büroarbeit, 50h für andere Tätigkeiten. L-GAV-Regelungen für spezielle Branchen beachten.</p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sonderregelungen für spezielle Berufsgruppen</CardTitle>
              <CardDescription>
                Abweichende Gesetze für Sicherheitskräfte, Rettungsdienste und andere Spezialberufe
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {specialCategories.map((category) => (
                  <Card key={category.name} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge variant="outline">{category.employees} Mitarbeiter</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium">Max. tägliche Arbeitszeit:</div>
                        <div className="text-lg font-bold text-blue-600">{category.maxDaily}h</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Anwendbare Gesetze:</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {category.laws.map((law, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                              {law}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button variant="outline" size="sm" className="w-full">
                        Konfigurieren
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Neue Sonderkategorie hinzufügen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="special-name">Kategorie-Name</Label>
                      <Input id="special-name" placeholder="z.B. Pflegepersonal" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="special-max-hours">Max. tägliche Arbeitszeit</Label>
                      <Input id="special-max-hours" type="number" placeholder="12" min="8" max="24" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="special-law">Anwendbares Gesetz</Label>
                      <Input id="special-law" placeholder="z.B. Arbeitszeitgesetz §7" />
                    </div>
                  </div>

                  <Button>Sonderkategorie erstellen</Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatische Berechnungen</CardTitle>
              <CardDescription>
                Konfiguration für Überstunden, Zuschläge und Tarifverträge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Überstunden-Berechnung</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="overtime-calc">Automatische Überstunden-Berechnung</Label>
                      <Switch id="overtime-calc" checked />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="overtime-threshold">Überstunden ab (täglich)</Label>
                      <Input id="overtime-threshold" type="number" defaultValue="8" step="0.5" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="overtime-factor">Überstunden-Faktor</Label>
                      <Input id="overtime-factor" type="number" defaultValue="1.25" step="0.05" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Zuschläge</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Nachtarbeitszuschlag</div>
                        <div className="text-sm text-muted-foreground">22:00 - 06:00 Uhr</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue="25" className="w-16" />
                        <span className="text-sm">%</span>
                        <Switch checked />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Sonntagszuschlag</div>
                        <div className="text-sm text-muted-foreground">00:00 - 24:00 Uhr</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue="50" className="w-16" />
                        <span className="text-sm">%</span>
                        <Switch checked />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Feiertagszuschlag</div>
                        <div className="text-sm text-muted-foreground">Gesetzliche Feiertage</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input type="number" defaultValue="100" className="w-16" />
                        <span className="text-sm">%</span>
                        <Switch checked />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Tarifverträge & Betriebsvereinbarungen</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="collective-agreement">Tarifvertrag anwenden</Label>
                    <Switch id="collective-agreement" checked />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tariff-name">Tarifvertrag</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Tarifvertrag auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ig-metall">IG Metall</SelectItem>
                        <SelectItem value="verdi">ver.di</SelectItem>
                        <SelectItem value="ig-bce">IG BCE</SelectItem>
                        <SelectItem value="custom">Betriebsvereinbarung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="text-sm text-green-800">
                  <strong>Berechnungsbeispiel:</strong><br />
                  Normale Arbeitszeit: 8h × 25€/h = 200€<br />
                  Überstunden (2h): 2h × 25€ × 1,25 = 62,50€<br />
                  Nachtarbeit (3h): 3h × 25€ × 1,25 = 93,75€<br />
                  <strong>Gesamt: 356,25€</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}