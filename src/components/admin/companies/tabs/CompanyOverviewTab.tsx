import React from 'react';
import { CompanyDetails } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Mail, Phone, Globe, MapPin, FileText, CreditCard, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CompanyOverviewTabProps {
  company: CompanyDetails;
}

export const CompanyOverviewTab: React.FC<CompanyOverviewTabProps> = ({ company }) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const healthScore = 92;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Firmendaten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Firmendaten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Firmenname</p>
              <p className="font-medium">{company.name}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Branche</p>
              <p className="font-medium">IT & Software</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Adresse</p>
              <p className="font-medium">
                {company.address || 'Friedrichstraße 123, 10117 Berlin'}<br/>
                Deutschland
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Domain</p>
              <p className="font-medium">{company.website || 'techvision.de'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">USt-ID</p>
              <p className="font-medium">{company.vat_id || 'DE123456789'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Handelsregisternummer</p>
              <p className="font-medium">HRB 98765 B</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Unternehmensgröße</p>
              <p className="font-medium">51-200</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kontaktdaten */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Kontaktdaten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Hauptansprechpartner</p>
            <p className="font-medium">{company.contact_person || 'Dr. Michael Schneider'}</p>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">E-Mail (Geschäftlich)</p>
              <p className="font-medium">{company.primary_contact_email || company.billing_email || 'm.schneider@techvision.de'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Telefon</p>
              <p className="font-medium">{company.phone || '+49 30 1234567'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Rechnungs-E-Mail</p>
              <p className="font-medium">{company.billing_email || 'buchhaltung@techvision.de'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Technischer Kontakt (E-Mail)</p>
              <p className="font-medium">tech@techvision.de</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Technischer Kontakt (Telefon)</p>
              <p className="font-medium">+49 30 654321</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abonnement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            Abonnement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <p className="font-medium capitalize">{company.subscription_status === 'enterprise' ? 'Enterprise' : company.subscription_status}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Abrechnungsintervall</p>
            <p className="font-medium">Jährlich</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Monatlicher Umsatz</p>
            <p className="font-medium">€199</p>
          </div>

          <div className="flex items-start gap-3">
            <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Nächste Abrechnung</p>
              <p className="font-medium">1.12.2025</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Aktive Module</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">HR Core</Badge>
              <Badge variant="secondary" className="text-xs">Zeiterfassung</Badge>
              <Badge variant="secondary" className="text-xs">Urlaubsverwaltung</Badge>
              <Badge variant="secondary" className="text-xs">Gehaltsabrechnung</Badge>
              <Badge variant="secondary" className="text-xs">Recruiting</Badge>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Bankverbindung (IBAN)</p>
              <p className="font-mono text-sm">DE89 3704 0044 0532 0130 00</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System-Informationen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            System-Informationen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Erstellt am</p>
            <p className="font-medium">{formatDate(company.created_at)}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Letzter Login</p>
            <p className="font-medium">17.10.2025, 16:56:57</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Zeitzone</p>
            <p className="font-medium">Europe/Berlin (CET)</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Health Score</p>
            <div className="flex items-center gap-3">
              <Progress 
                value={healthScore} 
                className="flex-1 h-2"
                indicatorClassName="bg-green-500"
              />
              <span className="text-sm font-medium">{healthScore}%</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Speichernutzung</p>
            <p className="font-medium">2847 MB</p>
          </div>

          {/* Stripe IDs werden nur angezeigt wenn echte Werte vorhanden sind */}
          {(company as any).stripe_customer_id && (
            <div className="pt-2 border-t space-y-1">
              <p className="text-xs text-purple-600 font-mono">Stripe Customer ID: {(company as any).stripe_customer_id}</p>
              {(company as any).stripe_subscription_id && (
                <p className="text-xs text-purple-600 font-mono">Subscription ID: {(company as any).stripe_subscription_id}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notizen */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Notizen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Langjähriger Kunde seit 2021. Benötigt erweiterten Support für DSGVO-Compliance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
