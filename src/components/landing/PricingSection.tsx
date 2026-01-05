import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Check, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_users: number | null;
  features: string[];
  is_popular: boolean;
  sort_order: number;
}

export const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (error) throw error;
        
        const formattedPlans = (data || []).map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features as string || '[]')
        }));
        
        setPlans(formattedPlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
        // Fallback plans
        setPlans([
          {
            id: '1',
            name: 'Basic',
            slug: 'basic',
            description: 'Perfekt für kleine Teams',
            price_monthly: 29,
            price_yearly: 290,
            max_users: 10,
            features: ['Zeiterfassung', 'Abwesenheitsverwaltung', 'Mitarbeiterverwaltung (bis 10)', 'E-Mail Support'],
            is_popular: false,
            sort_order: 1,
          },
          {
            id: '2',
            name: 'Pro',
            slug: 'pro',
            description: 'Für wachsende Unternehmen',
            price_monthly: 79,
            price_yearly: 790,
            max_users: 50,
            features: ['Alle Basic-Features', 'Recruiting & Bewerbermanagement', 'Performance Management', 'Digitale Personalakte', 'Lohnabrechnung-Export', 'Prioritäts-Support'],
            is_popular: true,
            sort_order: 2,
          },
          {
            id: '3',
            name: 'Enterprise',
            slug: 'enterprise',
            description: 'Für große Organisationen',
            price_monthly: 199,
            price_yearly: 1990,
            max_users: null,
            features: ['Alle Pro-Features', 'Unbegrenzte Mitarbeiter', 'Compliance & Audit-Trail', 'Workforce Planning', 'API-Zugang', 'Dedicated Account Manager', 'Custom Integrationen', 'SLA-Garantie'],
            is_popular: false,
            sort_order: 3,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    navigate(`/signup?plan=${plan.slug}&billing=${isYearly ? 'yearly' : 'monthly'}`);
  };

  if (loading) {
    return (
      <section id="preise" className="py-20 lg:py-32 bg-muted/30">
        <div className="container">
          <div className="text-center">
            <div className="animate-pulse h-10 w-48 bg-muted rounded mx-auto mb-4" />
            <div className="animate-pulse h-6 w-72 bg-muted rounded mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="preise" className="py-20 lg:py-32 bg-muted/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Transparente Preise für jede Unternehmensgröße
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Starten Sie kostenlos mit 14 Tagen Testphase. Keine Kreditkarte erforderlich.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monatlich
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Jährlich
              <span className="ml-2 text-xs text-primary font-semibold">2 Monate gratis</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 ${
                plan.is_popular
                  ? 'bg-card border-2 border-primary shadow-xl scale-105'
                  : 'bg-card border shadow-sm'
              }`}
            >
              {/* Popular Badge */}
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Beliebteste Wahl
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    €{isYearly ? Math.round(plan.price_yearly / 12) : plan.price_monthly}
                  </span>
                  <span className="text-muted-foreground">/Monat</span>
                </div>
                {isYearly && (
                  <p className="text-xs text-muted-foreground mt-1">
                    €{plan.price_yearly} jährlich abgerechnet
                  </p>
                )}
                {plan.max_users && (
                  <p className="text-xs text-muted-foreground mt-2">
                    bis zu {plan.max_users} Mitarbeiter
                  </p>
                )}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full mb-6 ${
                  plan.is_popular
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {plan.slug === 'enterprise' ? 'Kontakt aufnehmen' : 'Kostenlos testen'}
              </Button>

              {/* Features */}
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Haben Sie spezielle Anforderungen?{' '}
            <a href="#kontakt" className="text-primary hover:underline font-medium">
              Sprechen Sie mit unserem Team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
