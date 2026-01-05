
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Code, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Users, 
  Calculator, 
  Calendar, 
  UserSearch, 
  GraduationCap,
  MessageSquare,
  FileText,
  Building,
  CreditCard,
  Bot,
  Shield,
  BarChart3,
  Settings,
  Key,
  Globe
} from "lucide-react";

// Integration Kategorien mit Icons
const integrationCategories = {
  hr_payroll: {
    name: "HR & Lohnabrechnung",
    icon: Users,
    integrations: [
      { name: "DATEV", purpose: "Lohnabrechnung (DE)", status: "active", type: "oauth" },
      { name: "Sage", purpose: "Payroll, Buchhaltung", status: "inactive", type: "oauth" },
      { name: "ADP", purpose: "Global Payroll", status: "inactive", type: "oauth" },
      { name: "Personio", purpose: "Recruiting, Onboarding", status: "inactive", type: "oauth" },
      { name: "SAP SuccessFactors", purpose: "HRIS, Payroll", status: "inactive", type: "oauth" },
      { name: "Workday", purpose: "HRIS, Finance", status: "inactive", type: "oauth" },
      { name: "BMD", purpose: "Lohnbuchhaltung (AT)", status: "inactive", type: "oauth" },
      { name: "Lexware", purpose: "Buchhaltung & Lohn", status: "inactive", type: "api_key" },
      { name: "QuickBooks Payroll", purpose: "US/UK Payroll", status: "inactive", type: "oauth" },
      { name: "Gusto", purpose: "US Payroll", status: "inactive", type: "oauth" },
      { name: "Zenefits", purpose: "US HR", status: "inactive", type: "oauth" },
      { name: "PayFit", purpose: "EU Payroll", status: "inactive", type: "oauth" },
      { name: "Factorial", purpose: "HR & Payroll", status: "inactive", type: "oauth" }
    ]
  },
  accounting: {
    name: "Buchhaltung & Finance",
    icon: Calculator,
    integrations: [
      { name: "SevDesk", purpose: "DE Buchhaltung", status: "inactive", type: "oauth" },
      { name: "Billomat", purpose: "Rechnungswesen", status: "inactive", type: "oauth" },
      { name: "Xero", purpose: "Global SME Finance", status: "inactive", type: "oauth" },
      { name: "Freshbooks", purpose: "Buchhaltung & Rechnungen", status: "inactive", type: "oauth" },
      { name: "Oracle NetSuite", purpose: "ERP, Finance", status: "inactive", type: "oauth" },
      { name: "Microsoft Dynamics 365", purpose: "ERP, Finance", status: "inactive", type: "oauth" },
      { name: "Stripe Billing", purpose: "Revenue & Subscriptions", status: "inactive", type: "api_key" },
      { name: "Square Invoices", purpose: "Rechnungen", status: "inactive", type: "oauth" }
    ]
  },
  scheduling: {
    name: "Schichtplanung",
    icon: Calendar,
    integrations: [
      { name: "Deputy", purpose: "Schichtplanung", status: "inactive", type: "oauth" },
      { name: "Planday", purpose: "Workforce Scheduling", status: "inactive", type: "oauth" },
      { name: "WhenIWork", purpose: "Schichten & Arbeitszeit", status: "inactive", type: "oauth" },
      { name: "Papershift", purpose: "DE Schichtplanung", status: "inactive", type: "oauth" }
    ]
  },
  recruiting: {
    name: "Recruiting & ATS",
    icon: UserSearch,
    integrations: [
      { name: "Greenhouse", purpose: "Applicant Tracking", status: "inactive", type: "oauth" },
      { name: "Lever", purpose: "Recruiting", status: "inactive", type: "oauth" },
      { name: "SmartRecruiters", purpose: "Recruiting", status: "inactive", type: "oauth" },
      { name: "BambooHR", purpose: "HR + Recruiting", status: "inactive", type: "oauth" },
      { name: "LinkedIn Jobs API", purpose: "Job Postings", status: "inactive", type: "oauth" },
      { name: "Indeed API", purpose: "Job Listings", status: "inactive", type: "api_key" },
      { name: "Monster API", purpose: "Job Listings", status: "inactive", type: "api_key" }
    ]
  },
  learning: {
    name: "Learning & Development",
    icon: GraduationCap,
    integrations: [
      { name: "LinkedIn Learning", purpose: "Online Learning", status: "inactive", type: "oauth" },
      { name: "Coursera", purpose: "Learning Paths", status: "inactive", type: "oauth" },
      { name: "Udemy Business", purpose: "Trainings", status: "inactive", type: "oauth" },
      { name: "Moodle", purpose: "LMS Open Source", status: "inactive", type: "api_key" },
      { name: "Docebo", purpose: "LMS Enterprise", status: "inactive", type: "oauth" }
    ]
  },
  communication: {
    name: "Kommunikation & Kollaboration",
    icon: MessageSquare,
    integrations: [
      { name: "Slack", purpose: "Notifications, Workflows", status: "active", type: "oauth" },
      { name: "Microsoft Teams", purpose: "Meetings, Benachrichtigungen", status: "active", type: "oauth" },
      { name: "Zoom", purpose: "Meetings", status: "inactive", type: "oauth" },
      { name: "Google Meet", purpose: "Video Meetings", status: "inactive", type: "oauth" },
      { name: "WebEx", purpose: "Meetings", status: "inactive", type: "oauth" },
      { name: "Discord", purpose: "Internes Chat-Tool", status: "inactive", type: "oauth" },
      { name: "Twilio", purpose: "SMS, Voice, WhatsApp", status: "inactive", type: "api_key" },
      { name: "3CX", purpose: "VoIP / Telefonanlage", status: "inactive", type: "api_key" },
      { name: "Aircall", purpose: "Telefonie & CRM", status: "inactive", type: "oauth" }
    ]
  },
  documents: {
    name: "DMS & Files",
    icon: FileText,
    integrations: [
      { name: "Google Drive", purpose: "Dokumentenablage", status: "inactive", type: "oauth" },
      { name: "Microsoft OneDrive", purpose: "Dokumentenablage", status: "inactive", type: "oauth" },
      { name: "Dropbox", purpose: "Dokumentenablage", status: "inactive", type: "oauth" },
      { name: "Box", purpose: "Secure Enterprise Files", status: "inactive", type: "oauth" },
      { name: "DocuSign", purpose: "Signaturen", status: "inactive", type: "oauth" },
      { name: "HelloSign", purpose: "Signaturen", status: "inactive", type: "oauth" }
    ]
  },
  erp: {
    name: "ERP & Inventory",
    icon: Building,
    integrations: [
      { name: "SAP ERP", purpose: "Voll-ERP", status: "inactive", type: "oauth" },
      { name: "Oracle ERP", purpose: "Voll-ERP", status: "inactive", type: "oauth" },
      { name: "Odoo", purpose: "OpenSource ERP", status: "inactive", type: "oauth" },
      { name: "Microsoft Dynamics 365 BC", purpose: "ERP", status: "inactive", type: "oauth" }
    ]
  },
  crm: {
    name: "CRM",
    icon: CreditCard,
    integrations: [
      { name: "Salesforce", purpose: "CRM, Sales Cloud", status: "inactive", type: "oauth" },
      { name: "HubSpot", purpose: "CRM, Marketing", status: "inactive", type: "oauth" },
      { name: "Zoho CRM", purpose: "CRM", status: "inactive", type: "oauth" },
      { name: "Pipedrive", purpose: "CRM", status: "inactive", type: "oauth" },
      { name: "Freshsales", purpose: "CRM", status: "inactive", type: "oauth" }
    ]
  },
  ai: {
    name: "KI & Automatisierung",
    icon: Bot,
    integrations: [
      { name: "OpenAI GPT-4/5", purpose: "Texte, Automatisierung", status: "inactive", type: "api_key" },
      { name: "ElevenLabs", purpose: "Voice AI", status: "inactive", type: "api_key" },
      { name: "Google Vertex AI", purpose: "ML & Predictive", status: "inactive", type: "oauth" },
      { name: "Microsoft Azure AI", purpose: "KI Models", status: "inactive", type: "oauth" },
      { name: "Amazon SageMaker", purpose: "KI Ops", status: "inactive", type: "oauth" },
      { name: "Make (Integromat)", purpose: "Workflow Automatisierung", status: "inactive", type: "oauth" },
      { name: "Zapier", purpose: "Workflow Automatisierung", status: "inactive", type: "oauth" }
    ]
  },
  security: {
    name: "Security & Identity",
    icon: Shield,
    integrations: [
      { name: "Okta", purpose: "SSO & IAM", status: "inactive", type: "oauth" },
      { name: "Auth0", purpose: "Identity Management", status: "inactive", type: "oauth" },
      { name: "Microsoft Entra ID", purpose: "SSO / Multi-Tenant IAM", status: "inactive", type: "oauth" },
      { name: "Duo Security", purpose: "MFA", status: "inactive", type: "oauth" }
    ]
  },
  analytics: {
    name: "Analytics & BI",
    icon: BarChart3,
    integrations: [
      { name: "Tableau", purpose: "BI Dashboards", status: "inactive", type: "oauth" },
      { name: "PowerBI", purpose: "BI Dashboards", status: "inactive", type: "oauth" },
      { name: "Google Looker Studio", purpose: "Reporting", status: "inactive", type: "oauth" },
      { name: "Grafana", purpose: "Monitoring", status: "inactive", type: "api_key" },
      { name: "Superset", purpose: "OpenSource BI", status: "inactive", type: "oauth" }
    ]
  }
};

const APISettings = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("hr_payroll");
  const [isAddingIntegration, setIsAddingIntegration] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  
  const handleToggleIntegration = (categoryKey, integrationName) => {
    toast({
      title: "Integration aktualisiert",
      description: `${integrationName} wurde ${integrationCategories[categoryKey].integrations.find(i => i.name === integrationName)?.status === 'active' ? 'deaktiviert' : 'aktiviert'}.`,
    });
  };

  const handleAddIntegration = (integration) => {
    setSelectedIntegration(integration);
    setIsAddingIntegration(true);
  };

  const handleConfigureIntegration = () => {
    toast({
      title: "Integration wird konfiguriert",
      description: `OAuth-Flow für ${selectedIntegration?.name} wird gestartet...`,
    });
    setIsAddingIntegration(false);
    setSelectedIntegration(null);
  };

  const getActiveIntegrationsCount = () => {
    return Object.values(integrationCategories).reduce((total, category) => {
      return total + category.integrations.filter(i => i.status === 'active').length;
    }, 0);
  };

  const getAllIntegrations = () => {
    return Object.values(integrationCategories).flatMap(category => 
      category.integrations.map(integration => ({
        ...integration,
        category: category.name
      }))
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            API & Integrationen Verwaltung
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Verwalten Sie externe API-Verbindungen und Integrationen für Ihr System.
            </p>
            <Badge variant="secondary">
              {getActiveIntegrationsCount()} aktive Integrationen
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
        <TabsList className="grid grid-cols-6 lg:grid-cols-12 w-full h-auto">
          {Object.entries(integrationCategories).map(([key, category]) => {
            const IconComponent = category.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex flex-col gap-1 p-2">
                <IconComponent className="h-4 w-4" />
                <span className="text-xs hidden lg:inline">{category.name.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(integrationCategories).map(([categoryKey, category]) => (
          <TabsContent key={categoryKey} value={categoryKey}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5" />
                    {category.name}
                  </CardTitle>
                  <Dialog open={isAddingIntegration} onOpenChange={setIsAddingIntegration}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Integration hinzufügen
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Integration konfigurieren: {selectedIntegration?.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Integration</Label>
                          <p className="text-sm text-muted-foreground">{selectedIntegration?.purpose}</p>
                        </div>
                        <div>
                          <Label>Authentifizierungstyp</Label>
                          <Badge variant={selectedIntegration?.type === 'oauth' ? 'default' : 'secondary'}>
                            {selectedIntegration?.type === 'oauth' ? 'OAuth 2.0' : 'API Key'}
                          </Badge>
                        </div>
                        {selectedIntegration?.type === 'oauth' ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="client-id">Client ID</Label>
                              <Input id="client-id" placeholder="Ihre Client ID" />
                            </div>
                            <div>
                              <Label htmlFor="client-secret">Client Secret</Label>
                              <Input id="client-secret" type="password" placeholder="Ihr Client Secret" />
                            </div>
                            <div>
                              <Label htmlFor="webhook-url">Webhook URL (optional)</Label>
                              <Input id="webhook-url" placeholder="https://ihre-webhook-url.com" />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Label htmlFor="api-key">API Key</Label>
                            <Input id="api-key" type="password" placeholder="Ihr API Key" />
                          </div>
                        )}
                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleConfigureIntegration} className="flex-1">
                            <Globe className="h-4 w-4 mr-2" />
                            {selectedIntegration?.type === 'oauth' ? 'OAuth-Verbindung starten' : 'API Key speichern'}
                          </Button>
                          <Button variant="outline" onClick={() => setIsAddingIntegration(false)}>
                            Abbrechen
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {category.integrations.map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {integration.status === 'active' ? 
                          <CheckCircle className="h-5 w-5 text-green-500" /> : 
                          <XCircle className="h-5 w-5 text-gray-400" />
                        }
                        <div>
                          <h3 className="font-medium">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">{integration.purpose}</p>
                          <Badge variant="outline" className="mt-1">
                            {integration.type === 'oauth' ? 'OAuth 2.0' : 'API Key'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {integration.status === 'active' && (
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Konfigurieren
                          </Button>
                        )}
                        {integration.status === 'inactive' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleAddIntegration(integration)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Hinzufügen
                          </Button>
                        )}
                        <Switch 
                          checked={integration.status === 'active'}
                          onCheckedChange={() => handleToggleIntegration(categoryKey, integration.name)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Übersicht aller aktiven Integrationen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Aktive Integrationen Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {getAllIntegrations()
              .filter(integration => integration.status === 'active')
              .map((integration, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">{integration.name}</span>
                    <Badge variant="outline" className="text-xs">{integration.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={integration.type === 'oauth' ? 'default' : 'secondary'} className="text-xs">
                      {integration.type === 'oauth' ? 'OAuth' : 'API Key'}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            {getActiveIntegrationsCount() === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Noch keine Integrationen aktiviert. Wählen Sie eine Kategorie aus, um zu beginnen.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APISettings;
