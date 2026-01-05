import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, MapPin, Shield, Users, Clock, Calendar, Euro, FileText, Bell, Bot, Palette, ChevronRight, Globe, Settings, Briefcase, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface CompanySettingsModule {
  id: string;
  title: string;
  description: string;
  icon: any;
  status: 'configured' | 'partial' | 'empty';
  submodules: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
  }[];
}

export default function CompanySettings() {
  const navigate = useNavigate();

  const settingsModules: CompanySettingsModule[] = [
    {
      id: "company-data",
      title: "Unternehmensstammdaten",
      description: "Firmennamen, Rechtsform, Identifikationsdaten und Kontaktinformationen",
      icon: Building,
      status: "configured",
      submodules: [
        { id: "basic-info", title: "Grundinformationen", description: "Firmenname, Rechtsform, Beschreibung", completed: true },
        { id: "identification", title: "Steuer & Registrierung", description: "Steuer-ID, VAT-Nummer, Handelsregister", completed: true },
        { id: "contact", title: "Kontaktdaten", description: "Adresse, Telefon, E-Mail, Website", completed: true },
        { id: "regional", title: "Regionale Einstellungen", description: "Zeitzone, Währung, Sprache, Datumsformat", completed: true }
      ]
    },
    {
      id: "locations",
      title: "Standorte & Niederlassungen",
      description: "Verwaltung von Hauptsitz, Niederlassungen und Betriebsstätten",
      icon: MapPin,
      status: "partial",
      submodules: [
        { id: "headquarters", title: "Hauptsitz", description: "Zentrale Firmenadresse und Details", completed: true },
        { id: "branches", title: "Niederlassungen", description: "Weitere Standorte und Filialen", completed: false },
        { id: "operating-sites", title: "Betriebsstätten", description: "Steuerlich relevante Betriebsstätten", completed: false },
        { id: "local-contacts", title: "Standortverantwortliche", description: "Ansprechpartner vor Ort", completed: false }
      ]
    },
    {
      id: "subsidiaries",
      title: "Tochterunternehmen & Konzernstruktur",
      description: "Verwaltung von Tochtergesellschaften und Konzernverbund",
      icon: Briefcase,
      status: "empty",
      submodules: [
        { id: "legal-entities", title: "Rechtliche Einheiten", description: "Tochtergesellschaften und Beteiligungen", completed: false },
        { id: "ownership", title: "Beteiligungsstrukturen", description: "Eigentumsverhältnisse und Anteile", completed: false },
        { id: "consolidation", title: "Konsolidierungskreis", description: "Welche Einheiten fließen in Berichte ein", completed: false },
        { id: "intercompany", title: "Konzernverrechnung", description: "Interne Verrechnungspreise", completed: false }
      ]
    },
    {
      id: "branding",
      title: "Corporate Design & Branding",
      description: "Logo, Farben, Schriftarten und visuelles Erscheinungsbild",
      icon: Palette,
      status: "empty", 
      submodules: [
        { id: "logo", title: "Firmenlogo", description: "Upload und Verwaltung verschiedener Logo-Varianten", completed: false },
        { id: "colors", title: "Corporate Colors", description: "Primär- und Sekundärfarben, Farbpalette", completed: false },
        { id: "typography", title: "Typographie", description: "Hausschrift und Schriftgrößen", completed: false },
        { id: "templates", title: "Design-Templates", description: "Vorlagen für Dokumente und Berichte", completed: false }
      ]
    },
    {
      id: "banking",
      title: "Bankverbindungen & Finanzen",
      description: "Firmen-Bankkonten und finanzielle Stammdaten",
      icon: CreditCard,
      status: "partial",
      submodules: [
        { id: "main-accounts", title: "Haupt-Bankverbindungen", description: "Geschäftskonten für Zahlungsverkehr", completed: true },
        { id: "payroll-accounts", title: "Lohn-Bankkonten", description: "Spezielle Konten für Gehaltszahlungen", completed: false },
        { id: "subsidiary-accounts", title: "Tochter-Bankverbindungen", description: "Konten der Tochtergesellschaften", completed: false },
        { id: "payment-terms", title: "Zahlungskonditionen", description: "Standard-Zahlungsziele und -bedingungen", completed: false }
      ]
    },
    {
      id: "compliance-docs",
      title: "Compliance-Dokumentation", 
      description: "Unternehmensrelevante Compliance-Dokumente und Zertifikate",
      icon: FileText,
      status: "empty",
      submodules: [
        { id: "certificates", title: "Zertifikate", description: "ISO, SOC und andere Zertifizierungen", completed: false },
        { id: "licenses", title: "Lizenzen & Genehmigungen", description: "Betriebserlaubnisse und Gewerbeanmeldungen", completed: false },
        { id: "policies", title: "Unternehmensrichtlinien", description: "Compliance-Richtlinien und Verfahrensanweisungen", completed: false },
        { id: "audits", title: "Audit-Dokumentation", description: "Prüfberichte und Audit-Nachweise", completed: false }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'configured': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'empty': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'configured': return 'Konfiguriert';
      case 'partial': return 'Teilweise';
      case 'empty': return 'Nicht konfiguriert';
      default: return 'Unbekannt';
    }
  };

  const handleModuleClick = (moduleId: string) => {
    // Navigation zu spezifischen Modulen
    navigate(`/settings/company/${moduleId}`);
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Unternehmenseinstellungen</h1>
            <p className="text-muted-foreground mt-2">
              Umfassende Konfiguration aller Unternehmensbereiche und -prozesse
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Konfiguriert</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {settingsModules.filter(m => m.status === 'configured').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium">Teilweise</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {settingsModules.filter(m => m.status === 'partial').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium">Offen</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {settingsModules.filter(m => m.status === 'empty').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Gesamt</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {settingsModules.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsModules.map((module) => {
            const Icon = module.icon;
            const completedCount = module.submodules.filter(sub => sub.completed).length;
            const totalCount = module.submodules.length;
            const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

            return (
              <Card 
                key={module.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleModuleClick(module.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                          {module.title}
                        </CardTitle>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardDescription className="text-sm line-clamp-2">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getStatusColor(module.status)}>
                      {getStatusLabel(module.status)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {completedCount}/{totalCount} konfiguriert
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>

                  {/* Submodules Preview */}
                  <div className="space-y-1">
                    {module.submodules.slice(0, 3).map((submodule) => (
                      <div key={submodule.id} className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${submodule.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className="text-muted-foreground truncate">{submodule.title}</span>
                      </div>
                    ))}
                    {module.submodules.length > 3 && (
                      <div className="text-xs text-muted-foreground ml-4">
                        +{module.submodules.length - 3} weitere...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Schnellaktionen</CardTitle>
            <CardDescription>
              Häufig verwendete Konfigurationsoptionen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleModuleClick('company-data')}
              >
                <Building className="h-6 w-6" />
                <span className="text-sm">Firmendaten bearbeiten</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleModuleClick('locations')}
              >
                <MapPin className="h-6 w-6" />
                <span className="text-sm">Standorte verwalten</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleModuleClick('branding')}
              >
                <Palette className="h-6 w-6" />
                <span className="text-sm">Corporate Design</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleModuleClick('banking')}
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-sm">Bankverbindungen</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}