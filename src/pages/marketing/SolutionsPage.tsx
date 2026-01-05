import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MarketingLayout from '@/components/marketing/layout/MarketingLayout';
import { 
  UserCog, 
  Users2, 
  User,
  ArrowRight,
  CheckCircle2,
  Building2,
  Rocket
} from 'lucide-react';

const roles = [
  {
    icon: UserCog,
    title: 'Für HR-Manager',
    description: 'Behalten Sie alle HR-Prozesse im Blick und automatisieren Sie wiederkehrende Aufgaben. Weniger Papierkram, mehr strategische Arbeit.',
    features: [
      'Zentrale Personalakte für alle Mitarbeiterdaten',
      'Automatische Compliance-Dokumentation',
      'HR-Analytics Dashboard mit Echtzeit-Daten',
      'Workflow-Automatisierung für Genehmigungen',
      'Digitale Lohnabrechnung und Reporting',
    ],
    color: 'from-[#3730a3] to-[#4f46e5]',
  },
  {
    icon: Users2,
    title: 'Für Teamleiter',
    description: 'Verwalten Sie Ihr Team effizient mit einem klaren Überblick über Abwesenheiten, Arbeitszeiten und Performance.',
    features: [
      'Team-Abwesenheitskalender auf einen Blick',
      'Schnelle Genehmigung von Urlaubsanträgen',
      'Performance Reviews durchführen',
      'Team-Entwicklung und Ziele verfolgen',
      'Arbeitszeiten des Teams überwachen',
    ],
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: User,
    title: 'Für Mitarbeiter',
    description: 'Self-Service für alle HR-Anliegen. Urlaubsanträge, Zeiterfassung und Gehaltsabrechnungen – alles in einer App.',
    features: [
      'Mobile App für unterwegs',
      'Self-Service Portal 24/7 verfügbar',
      'Digitale Gehaltsabrechnungen einsehen',
      'Persönliches Dashboard mit allen Infos',
      'Einfache Urlaubsanträge mit einem Klick',
    ],
    color: 'from-emerald-500 to-emerald-600',
  },
];

const scalabilityFeatures = {
  kmu: [
    'Schneller Start ohne IT-Aufwand',
    'Bezahlbar für kleine Teams',
    'Einfache Bedienung ohne Schulung',
    'Flexible Skalierung bei Wachstum',
  ],
  enterprise: [
    'Single Sign-On (SSO)',
    'Custom Integrationen via API',
    'Dedicated Success Manager',
    'On-Premise Option verfügbar',
    'SLA-Garantie',
  ],
};

const SolutionsPage: React.FC = () => {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-[#3730a3]/5 via-white to-cyan-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Die richtige Lösung für{' '}
            <span className="text-[#3730a3]">jeden</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Minute HR passt sich Ihren Anforderungen an – egal ob Sie HR-Manager, Teamleiter oder Mitarbeiter sind.
          </p>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12 lg:space-y-16">
            {roles.map((role, index) => {
              const Icon = role.icon;
              const isReversed = index % 2 === 1;
              
              return (
                <div 
                  key={index}
                  id={role.title.toLowerCase().replace(/\s+/g, '-').replace('für-', '')}
                  className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${isReversed ? 'lg:flex-row-reverse' : ''}`}
                >
                  <div className={isReversed ? 'lg:order-2' : ''}>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${role.color} text-white text-sm font-medium mb-4`}>
                      <Icon className="h-4 w-4" />
                      {role.title}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                      {role.title}
                    </h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      {role.description}
                    </p>
                    <ul className="space-y-3">
                      {role.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-[#3730a3] flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${isReversed ? 'lg:order-1' : ''}`}>
                    <div className={`aspect-video rounded-2xl bg-gradient-to-br ${role.color} p-8 flex items-center justify-center`}>
                      <Icon className="h-24 w-24 text-white/80" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scalability Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Von 5 bis 5.000 Mitarbeiter
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Minute HR wächst mit Ihrem Unternehmen. Starten Sie klein und skalieren Sie nach Bedarf.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* KMU */}
            <div className="p-8 rounded-2xl bg-white border border-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#3730a3]/10 flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-[#3730a3]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Für KMU</h3>
                  <p className="text-sm text-muted-foreground">Kleine und mittlere Unternehmen</p>
                </div>
              </div>
              <ul className="space-y-3">
                {scalabilityFeatures.kmu.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#3730a3] flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-2xl bg-white border border-[#3730a3]/30 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#3730a3] flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Für Enterprise</h3>
                  <p className="text-sm text-muted-foreground">Große Unternehmen</p>
                </div>
              </div>
              <ul className="space-y-3">
                {scalabilityFeatures.enterprise.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#3730a3] flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#3730a3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Finden Sie die passende Lösung
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Lassen Sie uns gemeinsam herausfinden, wie Minute HR Ihr Unternehmen unterstützen kann.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white text-[#3730a3] hover:bg-white/90 text-base px-8"
              >
                Demo vereinbaren
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

export default SolutionsPage;
