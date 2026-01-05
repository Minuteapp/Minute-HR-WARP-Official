import React from 'react';
import { ArrowRight, Monitor, Smartphone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import desktopPreview from '@/assets/landing-desktop-preview.png';
import mobilePreview from '@/assets/landing-mobile-preview.png';

export const ProductShowcaseSection = () => {
  const features = [
    'Intuitive Benutzeroberfläche',
    'Echtzeit-Synchronisation',
    'Offline-fähig',
    'Sichere Datenverschlüsselung',
  ];

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background via-muted/20 to-background overflow-hidden">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Monitor className="h-4 w-4" />
              Web & Mobile
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Ihre HR-Zentrale.{' '}
              <span className="text-primary">Überall verfügbar.</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              Ob am Desktop im Büro oder unterwegs auf dem Smartphone – MINUTE HR 
              passt sich Ihrem Arbeitsalltag an. Alle Funktionen, alle Daten, 
              immer synchron.
            </p>

            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-foreground">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Button size="lg" className="group">
                Jetzt kostenlos testen
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Right - Device Mockups */}
          <div className="relative">
            {/* Desktop Preview */}
            <div className="relative z-10">
              <div className="rounded-xl border-2 border-border/50 shadow-2xl overflow-hidden bg-card">
                <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 border-b">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-background/80 rounded-md px-4 py-1 text-xs text-muted-foreground">
                      app.minute-hr.de
                    </div>
                  </div>
                </div>
                <img 
                  src={desktopPreview} 
                  alt="MINUTE HR Desktop Dashboard" 
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Mobile Preview - Overlapping */}
            <div className="absolute -bottom-8 -right-4 lg:right-8 z-20 w-40 md:w-52">
              <div className="rounded-3xl border-4 border-foreground/10 shadow-2xl overflow-hidden bg-card">
                <img 
                  src={mobilePreview} 
                  alt="MINUTE HR Mobile App" 
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10" />
            <div className="absolute -bottom-8 right-1/4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};
