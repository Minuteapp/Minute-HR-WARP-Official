import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, 
  Building, 
  Globe, 
  Settings, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Shield,
  Users
} from "lucide-react";
import { useState } from "react";

export const AdminOnboarding = () => {
  const [activeStep, setActiveStep] = useState(1);

  // Mock data für laufende Onboardings
  const onboardingQueue: any[] = [];

  const onboardingTemplates: any[] = [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_info":
        return <Badge variant="outline" className="border-warning text-warning">Info benötigt</Badge>;
      case "in_progress":
        return <Badge className="bg-primary text-primary-foreground">In Bearbeitung</Badge>;
      case "completed":
        return <Badge className="bg-success text-success-foreground">Abgeschlossen</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Abgebrochen</Badge>;
      default:
        return <Badge variant="secondary">Unbekannt</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">Hoch</Badge>;
      case "normal":
        return <Badge variant="outline">Normal</Badge>;
      case "low":
        return <Badge variant="secondary">Niedrig</Badge>;
      default:
        return <Badge variant="secondary">-</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Onboarding Queue</TabsTrigger>
          <TabsTrigger value="templates">Templates & Workflows</TabsTrigger>
          <TabsTrigger value="new">Neues Onboarding</TabsTrigger>
          <TabsTrigger value="settings">Onboarding Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Onboarding-Prozesse</CardTitle>
              <CardDescription>
                Übersicht aller laufenden Kundenintegration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {onboardingQueue.map((onboarding) => (
                  <div key={onboarding.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{onboarding.companyName}</h3>
                          {getStatusBadge(onboarding.status)}
                          {getPriorityBadge(onboarding.priority)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {onboarding.contactPerson}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {onboarding.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {onboarding.phone}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">
                          Erstellt: {onboarding.createdAt}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">Details</Button>
                          <Button size="sm">Bearbeiten</Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Fortschritt</span>
                          <span>{onboarding.currentStep}/{onboarding.totalSteps} Schritte</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(onboarding.currentStep / onboarding.totalSteps) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {onboardingTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Enthaltene Module:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.modules.map((module) => (
                          <Badge key={module} variant="outline" className="text-xs">
                            {module}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Dauer: {template.duration}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Bearbeiten
                      </Button>
                      <Button size="sm" className="flex-1">
                        Verwenden
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Neues Firmen-Onboarding erstellen</CardTitle>
              <CardDescription>
                Vollständiges Setup für eine neue Firma mit allen Enterprise-Features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Schritt 1: Firmendaten */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">1. Firmenstammdaten</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                    <div>
                      <Label htmlFor="companyName">Firmenname *</Label>
                      <Input id="companyName" placeholder="ACME GmbH" />
                    </div>
                    <div>
                      <Label htmlFor="legalForm">Rechtsform</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Rechtsform wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gmbh">GmbH</SelectItem>
                          <SelectItem value="ag">AG</SelectItem>
                          <SelectItem value="ug">UG</SelectItem>
                          <SelectItem value="ohg">OHG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="taxId">Umsatzsteuer-ID</Label>
                      <Input id="taxId" placeholder="DE123456789" />
                    </div>
                    <div>
                      <Label htmlFor="registryNumber">Handelsregister-Nr.</Label>
                      <Input id="registryNumber" placeholder="HRB 98765" />
                    </div>
                  </div>
                </div>

                {/* Schritt 2: Hauptsitz */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">2. Hauptsitz & Standorte</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                    <div>
                      <Label htmlFor="address">Adresse *</Label>
                      <Input id="address" placeholder="Hauptstraße 1" />
                    </div>
                    <div>
                      <Label htmlFor="city">Stadt *</Label>
                      <Input id="city" placeholder="Berlin" />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">PLZ *</Label>
                      <Input id="postalCode" placeholder="10115" />
                    </div>
                    <div>
                      <Label htmlFor="country">Land *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Land wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="de">Deutschland</SelectItem>
                          <SelectItem value="at">Österreich</SelectItem>
                          <SelectItem value="ch">Schweiz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Schritt 3: Ansprechpartner */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">3. Haupt-Ansprechpartner</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                    <div>
                      <Label htmlFor="contactName">Name *</Label>
                      <Input id="contactName" placeholder="Max Mustermann" />
                    </div>
                    <div>
                      <Label htmlFor="contactPosition">Position</Label>
                      <Input id="contactPosition" placeholder="Geschäftsführer" />
                    </div>
                    <div>
                      <Label htmlFor="contactEmail">E-Mail *</Label>
                      <Input id="contactEmail" placeholder="max@acme.com" />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">Telefon</Label>
                      <Input id="contactPhone" placeholder="+49 30 123456" />
                    </div>
                  </div>
                </div>

                {/* Schritt 4: Module & Features */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">4. Module & Funktionen</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                    <div className="space-y-3">
                      <h4 className="font-medium">Kern-Module:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="timetracking" defaultChecked />
                          <Label htmlFor="timetracking">Zeiterfassung</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="vacation" defaultChecked />
                          <Label htmlFor="vacation">Urlaub & Abwesenheiten</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="payroll" />
                          <Label htmlFor="payroll">Lohn & Gehalt</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="projects" />
                          <Label htmlFor="projects">Projekte</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium">Premium-Features:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="reporting" />
                          <Label htmlFor="reporting">Advanced Reporting</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="api" />
                          <Label htmlFor="api">API Zugang</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="sso" />
                          <Label htmlFor="sso">Single Sign-On</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="audit" />
                          <Label htmlFor="audit">Audit Logs</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schritt 5: Einstellungen */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">5. Lokalisierung & Einstellungen</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-7">
                    <div>
                      <Label htmlFor="language">Hauptsprache</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sprache wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="de">Deutsch</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Zeitzone</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Zeitzone wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="europe/berlin">Europe/Berlin</SelectItem>
                          <SelectItem value="europe/london">Europe/London</SelectItem>
                          <SelectItem value="europe/paris">Europe/Paris</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="currency">Währung</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Währung wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eur">EUR (€)</SelectItem>
                          <SelectItem value="usd">USD ($)</SelectItem>
                          <SelectItem value="gbp">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-6 border-t">
                  <Button variant="outline">Als Entwurf speichern</Button>
                  <Button>Onboarding starten</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding-Workflow</CardTitle>
                <CardDescription>Standard-Prozess für neue Firmen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="autoAssignment">Automatische Zuweisung</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Team-Mitglied wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automatisch</SelectItem>
                        <SelectItem value="sarah">Sarah (Customer Success)</SelectItem>
                        <SelectItem value="michael">Michael (Technical Lead)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="defaultSLA">Standard SLA (Tage)</Label>
                    <Input id="defaultSLA" type="number" defaultValue="7" />
                  </div>

                  <div className="space-y-2">
                    <Label>Automatische E-Mails</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="welcomeEmail" defaultChecked />
                        <Label htmlFor="welcomeEmail">Willkommens-E-Mail</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="progressEmails" defaultChecked />
                        <Label htmlFor="progressEmails">Fortschritts-Updates</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="completionEmail" defaultChecked />
                        <Label htmlFor="completionEmail">Abschluss-Bestätigung</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance & Dokumentation</CardTitle>
                <CardDescription>Erforderliche Dokumente und Genehmigungen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pflichtdokumente</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="dataProcessing" defaultChecked />
                        <Label htmlFor="dataProcessing">Auftragsverarbeitungsvertrag</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="gdprConsent" defaultChecked />
                        <Label htmlFor="gdprConsent">DSGVO-Einverständnis</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="contractSigning" defaultChecked />
                        <Label htmlFor="contractSigning">Vertragsunterzeichnung</Label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gdprContact">DSGVO-Verantwortlicher</Label>
                    <Input id="gdprContact" placeholder="privacy@yourcompany.com" />
                  </div>

                  <div>
                    <Label htmlFor="dataRetention">Datenaufbewahrung (Monate)</Label>
                    <Input id="dataRetention" type="number" defaultValue="24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};