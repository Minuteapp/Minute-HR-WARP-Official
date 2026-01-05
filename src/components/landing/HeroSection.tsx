import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Play, Mail } from 'lucide-react';

export const HeroSection = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleStartFree = () => {
    if (email) {
      navigate(`/signup?email=${encodeURIComponent(email)}`);
    } else {
      navigate('/signup');
    }
  };

  return (
    <section className="relative overflow-hidden min-h-screen">
      {/* Beautiful Gradient Background - Blue themed */}
      <div className="absolute inset-0 -z-10">
        {/* Main gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        
        {/* Colored orbs for depth */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-200/60 via-blue-100/40 to-transparent rounded-full blur-3xl -translate-x-1/4 -translate-y-1/4" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-200/50 via-purple-100/30 to-transparent rounded-full blur-3xl translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-[700px] h-[500px] bg-gradient-to-t from-cyan-100/40 via-blue-100/30 to-transparent rounded-full blur-3xl translate-y-1/4" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-sky-200/40 via-indigo-100/20 to-transparent rounded-full blur-3xl" />
        
        {/* Subtle mesh overlay for texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent" />
      </div>

      <div className="container py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Die intelligente HR-Plattform
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            HR und Lohnbuchhaltung{' '}
            <span className="text-primary">endlich vereint</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Aufgaben automatisieren, Workflows anpassen und Erkenntnisse aus HR-Daten gewinnen – alles an einem Ort.
          </p>

          {/* Email CTA */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Geschäftliche E-Mail-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button 
              size="lg" 
              onClick={handleStartFree}
              className="h-12 px-8 text-base font-medium"
            >
              Kostenlos starten
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Secondary CTA */}
          <button className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
            <Play className="h-4 w-4" />
            Produkttour starten
          </button>

          {/* Product Preview */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
            <div className="relative rounded-xl border shadow-2xl overflow-hidden bg-card">
              <div className="aspect-[16/10] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                {/* Simulated Dashboard Preview */}
                <div className="w-full h-full p-6">
                  <div className="bg-background rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-foreground">Guten Morgen, Anne</h2>
                        <p className="text-muted-foreground">Willkommen zurück in Ihrer HR-Zentrale</p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Lohnbuchhaltung</div>
                        <div className="text-xl font-semibold text-foreground">€235.000</div>
                        <div className="text-xs text-green-600 mt-1">✓ Freigegeben</div>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Mitarbeiter</div>
                        <div className="text-xl font-semibold text-foreground">43</div>
                        <div className="text-xs text-green-600 mt-1">+12%</div>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-sm text-muted-foreground mb-1">Abwesenheiten</div>
                        <div className="text-xl font-semibold text-foreground">5</div>
                        <div className="text-xs text-muted-foreground mt-1">heute</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
