import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import MarketingLayout from '@/components/marketing/layout/MarketingLayout';
import { 
  Target, 
  Lightbulb, 
  Shield, 
  Heart,
  ArrowRight,
  Users,
  Building2,
  Globe,
  Award
} from 'lucide-react';

const values = [
  {
    icon: Lightbulb,
    title: 'Einfachheit',
    description: 'Komplexe HR-Prozesse einfach und intuitiv gestalten.',
  },
  {
    icon: Target,
    title: 'Innovation',
    description: 'Kontinuierliche Weiterentwicklung mit modernster Technologie.',
  },
  {
    icon: Shield,
    title: 'Vertrauen',
    description: 'Datenschutz und Sicherheit haben höchste Priorität.',
  },
  {
    icon: Heart,
    title: 'Partnerschaft',
    description: 'Wir wachsen gemeinsam mit unseren Kunden.',
  },
];

const stats = [
  { value: '500+', label: 'Kunden', icon: Building2 },
  { value: '50.000+', label: 'Mitarbeiter verwaltet', icon: Users },
  { value: '99,9%', label: 'Uptime', icon: Globe },
  { value: 'Seit 2020', label: 'Am Markt', icon: Award },
];

const team = [
  { name: 'Max Müller', role: 'CEO & Co-Founder', initials: 'MM' },
  { name: 'Anna Schmidt', role: 'CTO & Co-Founder', initials: 'AS' },
  { name: 'Thomas Weber', role: 'Head of Product', initials: 'TW' },
  { name: 'Sarah Fischer', role: 'Head of Customer Success', initials: 'SF' },
];

const AboutPage: React.FC = () => {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-[#3730a3]/5 via-white to-cyan-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Über{' '}
            <span className="text-[#3730a3]">Minute HR</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Wir glauben, dass HR-Arbeit wertschätzend und effizient sein kann. Mit Minute HR ermöglichen wir Unternehmen, sich auf das Wesentliche zu konzentrieren: ihre Menschen.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Unsere Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Minute HR wurde 2020 mit einer klaren Vision gegründet: HR-Arbeit soll Spaß machen. 
                Zu lange wurden HR-Teams mit veralteten Tools und ineffizienten Prozessen belastet.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Wir haben uns zum Ziel gesetzt, eine Plattform zu entwickeln, die so intuitiv ist, 
                dass sie jeder sofort nutzen kann – und gleichzeitig so leistungsstark, dass sie 
                auch den komplexesten Anforderungen großer Unternehmen gerecht wird.
              </p>
              <p className="text-lg text-muted-foreground">
                Heute vertrauen über 500 Unternehmen auf Minute HR, um ihre HR-Prozesse zu digitalisieren 
                und ihre Mitarbeiter zu begeistern.
              </p>
            </div>
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#3730a3] to-[#4f46e5] p-8 flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-6xl font-bold mb-2">❤️</p>
                <p className="text-xl font-medium">Made with love in Germany</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#3730a3]/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-[#3730a3]" />
                  </div>
                  <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Unsere Werte
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Diese Prinzipien leiten uns bei allem, was wir tun.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="text-center p-6 rounded-2xl bg-white border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-[#3730a3]/10 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-[#3730a3]" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Unser Team
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Die Menschen hinter Minute HR.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#3730a3] to-[#4f46e5] flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{member.initials}</span>
                </div>
                <h3 className="font-semibold text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#3730a3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Werden Sie Teil der Minute-Familie
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Entdecken Sie, wie Minute HR Ihr Unternehmen transformieren kann.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-white text-[#3730a3] hover:bg-white/90 text-base px-8"
              >
                Kostenlos starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/karriere">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-white text-white hover:bg-white/10 text-base px-8"
              >
                Karriere bei uns
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default AboutPage;
