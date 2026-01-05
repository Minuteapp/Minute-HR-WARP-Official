import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import MarketingLayout from '@/components/marketing/layout/MarketingLayout';
import { CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '0',
    priceYearly: '0',
    description: 'Perfekt für kleine Teams bis 5 Mitarbeiter',
    features: [
      'Bis zu 5 Mitarbeiter',
      'Zeiterfassung',
      'Abwesenheitsverwaltung',
      'Mitarbeiterverwaltung',
      'Mobile App',
      'E-Mail Support',
    ],
    cta: '14 Tage kostenlos testen',
    popular: false,
  },
  {
    name: 'Professional',
    price: '6',
    priceYearly: '5',
    description: 'Für wachsende Unternehmen mit erweiterten Anforderungen',
    features: [
      'Unbegrenzte Mitarbeiter',
      'Alle Starter-Features',
      'Recruiting & Onboarding',
      'Performance Management',
      'Custom Reports',
      'API-Zugang',
      'Priority Support',
    ],
    cta: '14 Tage kostenlos testen',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Auf Anfrage',
    priceYearly: 'Auf Anfrage',
    description: 'Maßgeschneiderte Lösungen für große Unternehmen',
    features: [
      'Alle Professional-Features',
      'Single Sign-On (SSO)',
      'Custom Integrationen',
      'Dedicated Success Manager',
      'On-Premise Option',
      'SLA-Garantie',
      '24/7 Support',
    ],
    cta: 'Kontakt aufnehmen',
    popular: false,
  },
];

const faqs = [
  {
    question: 'Kann ich jederzeit kündigen?',
    answer: 'Ja, Sie können Ihr Abonnement jederzeit zum Ende des Abrechnungszeitraums kündigen. Es gibt keine Mindestlaufzeit.',
  },
  {
    question: 'Gibt es eine kostenlose Testphase?',
    answer: 'Ja, alle Pläne können 14 Tage lang kostenlos und unverbindlich getestet werden. Keine Kreditkarte erforderlich.',
  },
  {
    question: 'Wie wird die Mitarbeiteranzahl berechnet?',
    answer: 'Es werden nur aktive Mitarbeiter berechnet. Ausgeschiedene Mitarbeiter werden automatisch nicht mehr berechnet.',
  },
  {
    question: 'Gibt es Rabatte für Non-Profits?',
    answer: 'Ja, wir bieten spezielle Konditionen für gemeinnützige Organisationen. Kontaktieren Sie uns für mehr Informationen.',
  },
  {
    question: 'Welche Zahlungsmethoden werden akzeptiert?',
    answer: 'Wir akzeptieren Kreditkarten (Visa, Mastercard, Amex), SEPA-Lastschrift und auf Anfrage auch Rechnungszahlung.',
  },
];

const PricingPage: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-[#3730a3]/5 via-white to-cyan-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Transparente{' '}
            <span className="text-[#3730a3]">Preise</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Wählen Sie den Plan, der zu Ihrem Unternehmen passt. Keine versteckten Kosten.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monatlich
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Jährlich
            </span>
            {isYearly && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                2 Monate gratis
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative p-8 rounded-2xl border ${
                  plan.popular 
                    ? 'border-[#3730a3] shadow-xl scale-105' 
                    : 'border-border bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 text-sm font-medium bg-[#3730a3] text-white rounded-full">
                      Beliebt
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    {plan.price !== 'Auf Anfrage' ? (
                      <>
                        <span className="text-4xl font-bold text-foreground">
                          €{isYearly ? plan.priceYearly : plan.price}
                        </span>
                        <span className="text-muted-foreground">/Mitarbeiter/Monat</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-foreground">
                        {plan.price}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#3730a3] flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.name === 'Enterprise' ? '/kontakt' : '/auth/register'}>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-[#3730a3] hover:bg-[#4f46e5] text-white' 
                        : 'bg-slate-100 hover:bg-slate-200 text-foreground'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Häufig gestellte Fragen
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl bg-white border border-border"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-[#3730a3] flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#3730a3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Noch Fragen?
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Unser Team berät Sie gerne bei der Auswahl des richtigen Plans.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/kontakt">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white text-[#3730a3] hover:bg-white/90 text-base px-8"
              >
                Kontakt aufnehmen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-base px-8"
              >
                Kostenlos starten
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default PricingPage;
