import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import MarketingLayout from '@/components/marketing/layout/MarketingLayout';
import { getModuleBySlug, getRelatedModules } from './features/modules';
import { ArrowRight, Check, Smartphone } from 'lucide-react';
import appDesktop from '@/assets/marketing/app-desktop.png';
import appMobile from '@/assets/marketing/app-mobile.png';

const FeatureDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const module = slug ? getModuleBySlug(slug) : undefined;

  if (!module) {
    return <Navigate to="/funktionen" replace />;
  }

  const relatedModules = getRelatedModules(module.relatedModules);
  const Icon = module.icon;

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 via-cyan-400/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-500/10 via-primary/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Icon className="h-4 w-4" />
                {module.subtitle}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {module.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {module.heroDescription}
              </p>
              <ul className="space-y-3 mb-8">
                {module.heroBullets.map((bullet, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                    Kostenlos starten
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/preise">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Preise ansehen
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Desktop Preview */}
            <div className="relative">
              <div className="relative bg-slate-800 rounded-lg p-2 shadow-2xl">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="relative aspect-video bg-slate-100 rounded overflow-hidden">
                  <img 
                    src={appDesktop} 
                    alt={`${module.title} Desktop Ansicht`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10">
                    <span className="px-4 py-2 bg-white/90 rounded-lg text-sm font-medium text-muted-foreground">
                      Screenshot: {module.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-slate-50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-6">
            Vertraut von führenden Unternehmen
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {['Unternehmen A', 'Unternehmen B', 'Unternehmen C', 'Unternehmen D', 'Unternehmen E'].map((company, index) => (
              <div key={index} className="px-6 py-3 bg-white rounded-lg border border-border">
                <span className="text-muted-foreground font-medium">{company}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Warum {module.title}?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Entdecken Sie die Vorteile, die {module.title} für Ihr Unternehmen bringt.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {module.benefits.map((benefit, index) => (
              <div 
                key={index}
                className="p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-cyan-50/50 border border-primary/10 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Für jeden die richtige Lösung
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Egal ob Mitarbeiter, Vorgesetzter oder HR – {module.title} bietet für jeden die passenden Funktionen.
            </p>
          </div>

          <Tabs defaultValue="mitarbeitende" className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="mitarbeitende">Mitarbeitende</TabsTrigger>
              <TabsTrigger value="vorgesetzte">Vorgesetzte</TabsTrigger>
              <TabsTrigger value="administration">Administration</TabsTrigger>
            </TabsList>

            {Object.entries(module.tabs).map(([key, tab]) => (
              <TabsContent key={key} value={key} className="mt-0">
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-border">
                  <h3 className="text-2xl font-semibold text-foreground mb-4">
                    {tab.title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-8">
                    {tab.description}
                  </p>
                  <ul className="grid md:grid-cols-2 gap-4">
                    {tab.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {module.stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white"
              >
                <div className="text-5xl md:text-6xl font-bold mb-2">{stat.value}</div>
                <div className="text-xl font-medium mb-1">{stat.label}</div>
                <div className="text-white/80">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Mobile Preview */}
            <div className="relative flex justify-center">
              <div className="relative w-64">
                <div className="bg-slate-800 rounded-[2.5rem] p-3 shadow-2xl">
                  <div className="bg-slate-100 rounded-[2rem] overflow-hidden aspect-[9/19]">
                    <img 
                      src={appMobile} 
                      alt={`${module.title} Mobile App`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="px-3 py-1.5 bg-white/90 rounded-lg text-xs font-medium text-muted-foreground">
                        Mobile App
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Smartphone className="h-4 w-4" />
                Mobile App
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {module.title} – immer dabei
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Mit der MINUTE HR App haben Sie {module.title} immer in der Tasche. 
                Erledigen Sie wichtige Aufgaben auch unterwegs.
              </p>
              <ul className="space-y-4">
                {module.appFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Related Modules Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Verknüpfen Sie {module.title} mit allen HR-Prozessen
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Entdecken Sie weitere Module, die perfekt mit {module.title} zusammenarbeiten.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {relatedModules.map((related) => {
              const RelatedIcon = related.icon;
              return (
                <Link 
                  key={related.slug}
                  to={`/funktionen/${related.slug}`}
                  className="group p-6 rounded-2xl bg-white border border-border hover:border-primary/30 hover:shadow-xl transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                    <RelatedIcon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {related.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {related.subtitle}
                  </p>
                  <span className="inline-flex items-center text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    Mehr erfahren
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Häufig gestellte Fragen
            </h2>
            <p className="text-lg text-muted-foreground">
              Finden Sie Antworten auf die wichtigsten Fragen zu {module.title}.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {module.faq.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-lg mb-3 border border-border px-6">
                <AccordionTrigger className="text-left font-medium py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Bereit für modernes {module.title}?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Starten Sie jetzt Ihre kostenlose Testphase und erleben Sie, wie {module.title} Ihre HR-Prozesse transformiert.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 text-base px-8"
              >
                14 Tage kostenlos testen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/funktionen">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-base px-8"
              >
                Alle Funktionen ansehen
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default FeatureDetailPage;
