import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MarketingLayout from '@/components/marketing/layout/MarketingLayout';
import { 
  Users, 
  Clock, 
  Calendar, 
  Wallet, 
  UserPlus, 
  ClipboardList, 
  Target, 
  BarChart3,
  CalendarClock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const features = [
  {
    slug: 'mitarbeiterverwaltung',
    icon: Users,
    title: 'Mitarbeiterverwaltung',
    description: 'Digitale Personalakte, Organigramm und Stammdatenpflege – alles an einem Ort.',
    details: [
      'Zentrale Personalakte',
      'Organigramm-Visualisierung',
      'Dokumentenverwaltung',
      'Kontaktdaten & Notfallkontakte',
    ],
  },
  {
    slug: 'zeiterfassung',
    icon: Clock,
    title: 'Zeiterfassung',
    description: 'Mobile Stempeluhr, Projektzeiterfassung und automatisches Überstundenmanagement.',
    details: [
      'Mobile Stempeluhr',
      'Projektzeiterfassung',
      'Überstunden-Tracking',
      'GPS-Zeiterfassung',
    ],
  },
  {
    slug: 'urlaubsverwaltung',
    icon: Calendar,
    title: 'Urlaubsverwaltung',
    description: 'Urlaubsanträge, Abwesenheitskalender und automatische Genehmigungsworkflows.',
    details: [
      'Urlaubsanträge',
      'Team-Kalender',
      'Automatische Genehmigung',
      'Resturlaub-Berechnung',
    ],
  },
  {
    slug: 'lohnabrechnung',
    icon: Wallet,
    title: 'Lohnabrechnung',
    description: 'Gehaltsberechnung, Lohnbuchhaltungs-Export und digitale Entgeltabrechnungen.',
    details: [
      'Gehaltsberechnung',
      'DATEV-Export',
      'Digitale Lohnzettel',
      'Steuer-Reporting',
    ],
  },
  {
    slug: 'recruiting',
    icon: UserPlus,
    title: 'Recruiting',
    description: 'Stellenausschreibungen, Bewerbermanagement und Interview-Planung.',
    details: [
      'Stellenausschreibungen',
      'Bewerbermanagement',
      'Interview-Planung',
      'Talent-Pool',
    ],
  },
  {
    slug: 'onboarding',
    icon: ClipboardList,
    title: 'Onboarding',
    description: 'Digitale Checklisten, Dokumenten-Upload und strukturierte Willkommens-Workflows.',
    details: [
      'Onboarding-Checklisten',
      'Dokumenten-Upload',
      'Willkommens-Workflows',
      'Fortschritts-Tracking',
    ],
  },
  {
    slug: 'performance',
    icon: Target,
    title: 'Performance Management',
    description: 'Zielvereinbarungen, 360-Grad-Feedback und individuelle Entwicklungspläne.',
    details: [
      'Zielvereinbarungen',
      '360-Grad-Feedback',
      'Performance Reviews',
      'Entwicklungspläne',
    ],
  },
  {
    slug: 'analytics',
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'HR-Dashboards, Custom Reports und Trend-Analysen auf Knopfdruck.',
    details: [
      'HR-Dashboards',
      'Custom Reports',
      'Trend-Analysen',
      'KPI-Tracking',
    ],
  },
  {
    slug: 'schichtplanung',
    icon: CalendarClock,
    title: 'Schichtplanung',
    description: 'Automatische Dienstplanung, Tauschbörse und ArbZG-konforme Schichtmodelle.',
    details: [
      'Automatische Planung',
      'Schicht-Tauschbörse',
      'Qualifikationsplanung',
      'Mobile Dienstplan-App',
    ],
  },
];

const FeaturesPage: React.FC = () => {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-primary/5 via-white to-cyan-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Alle HR-Funktionen in{' '}
            <span className="text-primary">einer Plattform</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Minute HR bietet Ihnen alle Werkzeuge, die Sie für modernes Personalmanagement benötigen – 
            von der Zeiterfassung bis zur Lohnabrechnung.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link 
                  key={index}
                  to={`/funktionen/${feature.slug}`}
                  className="group p-8 rounded-2xl bg-white border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                      <Icon className="h-7 w-7 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {feature.description}
                      </p>
                      <ul className="space-y-2 mb-4">
                        {feature.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                      <span className="inline-flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                        Mehr erfahren
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Nahtlose Integrationen
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Minute HR lässt sich problemlos in Ihre bestehende Infrastruktur integrieren.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {['DATEV', 'SAP', 'Microsoft 365', 'Google Workspace', 'Slack', 'Personio'].map((integration, index) => (
              <div 
                key={index}
                className="flex items-center justify-center p-6 rounded-xl bg-white border border-border"
              >
                <span className="font-medium text-muted-foreground">{integration}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Überzeugen Sie sich selbst
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Starten Sie jetzt Ihre kostenlose Testphase und erleben Sie alle Funktionen von Minute HR.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 text-base px-8"
              >
                14 Tage kostenlos testen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/preise">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-base px-8"
              >
                Preise ansehen
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default FeaturesPage;
