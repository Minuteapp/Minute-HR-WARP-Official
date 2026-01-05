import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle2, Clock, Shield, Users, BarChart3, Smartphone } from 'lucide-react';
import MarketingLayout from '@/components/marketing/layout/MarketingLayout';
import appDesktop from '@/assets/marketing/app-desktop.png';
import TestimonialSection from '@/components/marketing/TestimonialSection';
import VideoModal from '@/components/marketing/VideoModal';

const scrollingTags = [
  'ZEITERFASSUNG',
  'URLAUBSANTRÄGE',
  'ONBOARDING',
  'LOHNABRECHNUNG',
  'RECRUITING',
  'ANALYTICS',
  'PERFORMANCE',
  'DOKUMENTE',
  'MITARBEITER',
  'BERICHTE',
];

const HomePage: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Auto-scroll effect for tags
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => prev + 1);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        {/* Subtle gradient orbs in background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-cyan-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/5 to-violet-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Scrolling Tags Bar */}
          <div className="relative mb-12 overflow-hidden">
            <div 
              className="flex gap-4 animate-scroll"
              style={{
                transform: `translateX(-${scrollPosition % (scrollingTags.length * 160)}px)`,
              }}
            >
              {/* Duplicate tags for seamless loop */}
              {[...scrollingTags, ...scrollingTags, ...scrollingTags].map((tag, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 px-5 py-2 rounded-full border border-border bg-white text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer whitespace-nowrap"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Price Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <span>Ab 4,99€ pro Mitarbeiter/Monat</span>
              <span className="text-primary/60">•</span>
              <Link to="/preise" className="hover:underline">Preise ansehen</Link>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Zeiterfassung, Urlaub, Schichtplanung –{' '}
              <span className="text-primary">alles in einer App</span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Sparen Sie 5+ Stunden pro Woche bei HR-Aufgaben. 
              Minute HR automatisiert Ihre Personalverwaltung – DSGVO-konform und Made in Germany.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-base px-8 h-12"
                >
                  Kostenlos starten
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto text-base px-8 h-12 border-border"
                onClick={() => setIsVideoOpen(true)}
              >
                <Play className="mr-2 h-4 w-4" />
                Demo ansehen
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex items-center justify-center gap-6 md:gap-8 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>DSGVO-konform</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Made in Germany</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>14 Tage kostenlos testen</span>
              </div>
            </div>
          </div>

          {/* Browser Mockup with App Screenshot */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            {/* Browser Chrome */}
            <div className="bg-slate-100 rounded-t-xl border border-b-0 border-border p-3">
              <div className="flex items-center gap-2">
                {/* Traffic lights */}
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                {/* URL Bar */}
                <div className="flex-1 flex justify-center">
                  <div className="bg-white rounded-md px-4 py-1.5 text-sm text-muted-foreground w-64 text-center border border-border">
                    app.minute-hr.de
                  </div>
                </div>
                <div className="w-16" /> {/* Spacer for symmetry */}
              </div>
            </div>
            {/* Screenshot with Play Button Overlay */}
            <div className="relative rounded-b-xl overflow-hidden border border-t-0 border-border shadow-2xl group">
              <img 
                src={appDesktop} 
                alt="Minute HR Dashboard" 
                className="w-full"
              />
              {/* Play Button Overlay */}
              <button 
                onClick={() => setIsVideoOpen(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-white ml-1 fill-white" />
                </div>
              </button>
            </div>

            {/* Mobile Preview Badge */}
            <div className="absolute -bottom-4 -right-4 md:bottom-8 md:-right-8 bg-white rounded-xl shadow-xl p-3 border border-border hidden md:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Auch als App</p>
                  <p className="text-xs text-muted-foreground">iOS & Android</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section (replaces fake trust logos) */}
      <TestimonialSection />

      {/* Video Modal */}
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Warum Minute HR?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Entdecken Sie, wie Minute HR Ihr HR-Management transformiert.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Clock,
                title: 'Zeit sparen',
                description: 'Automatisierte HR-Workflows reduzieren Ihren Verwaltungsaufwand um bis zu 60%.',
              },
              {
                icon: Shield,
                title: 'Compliance sicher',
                description: 'DSGVO-konforme Prozesse und automatische Dokumentation für rechtliche Sicherheit.',
              },
              {
                icon: Users,
                title: 'Mitarbeiter begeistern',
                description: 'Self-Service Portal für alle HR-Anliegen – jederzeit und von überall.',
              },
              {
                icon: BarChart3,
                title: 'Datenbasiert entscheiden',
                description: 'Echtzeit-Analytics und KI-gestützte Insights für bessere Entscheidungen.',
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="group p-6 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                    <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Alle HR-Funktionen in einer Plattform
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Minute HR bietet Ihnen alle Werkzeuge, die Sie für modernes Personalmanagement benötigen.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Mitarbeiterverwaltung',
              'Zeiterfassung',
              'Urlaubsverwaltung',
              'Lohnabrechnung',
              'Recruiting',
              'Onboarding',
              'Performance Management',
              'Analytics & Reports',
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-background border border-border"
              >
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="font-medium text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/funktionen">
              <Button 
                variant="outline" 
                size="lg"
                className="border-primary text-primary hover:bg-primary/5"
              >
                Alle Funktionen entdecken
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
            Bereit für modernes HR-Management?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Starten Sie noch heute mit Minute HR und erleben Sie, wie einfach HR sein kann.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-background text-primary hover:bg-background/90 text-base px-8"
              >
                Kostenlos starten
              </Button>
            </Link>
            <Link to="/preise">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 text-base px-8"
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

export default HomePage;
