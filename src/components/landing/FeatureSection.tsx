import React from 'react';
import { 
  Zap, 
  Settings2, 
  BarChart3, 
  Clock, 
  Users, 
  FileText,
  Briefcase,
  TrendingUp,
  Shield
} from 'lucide-react';

export const FeatureSection = () => {
  const mainFeatures = [
    {
      badge: 'AUTOMATISIERT',
      title: 'Alltägliches automatisieren',
      description: 'Entfernen Sie überflüssige Arbeitsschritte und optimieren Sie Ihre Personalprozesse – alles mit eingebauter Compliance.',
      icon: Zap,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      badge: 'ANPASSUNGSFÄHIG',
      title: 'So einzigartig wie Sie',
      description: 'Erwecken Sie Ihre Marke zum Leben, passen Sie Richtlinien individuell an und fügen Sie Funktionen hinzu, wenn Sie sie brauchen.',
      icon: Settings2,
      color: 'text-violet-600',
      bgColor: 'bg-violet-100',
    },
    {
      badge: 'FUNDIERT',
      title: 'Trends erkennen statt Daten analysieren',
      description: 'Mit KI-gestützten Insights erkennen Sie Muster und treffen bessere Entscheidungen – bevor Probleme entstehen.',
      icon: BarChart3,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  const moduleFeatures = [
    {
      title: 'Zeitmanagement',
      description: 'Zeiterfassung, Urlaubsanträge und Schichtplanung in einem System.',
      icon: Clock,
      features: ['Stempeluhr-App', 'Automatische Überstundenberechnung', 'Schichtplanung'],
    },
    {
      title: 'HR & Lohnabrechnung',
      description: 'Von der Einstellung bis zur Gehaltsabrechnung – alles digital.',
      icon: Briefcase,
      features: ['Digitale Personalakte', 'Lohnabrechnungs-Export', 'Dokumentenmanagement'],
    },
    {
      title: 'Talentmanagement',
      description: 'Finden, entwickeln und halten Sie die besten Talente.',
      icon: Users,
      features: ['Bewerbermanagement', 'Performance Reviews', 'Onboarding-Workflows'],
    },
    {
      title: 'Analytics & Reports',
      description: 'Datenbasierte Entscheidungen mit Echtzeit-Dashboards.',
      icon: TrendingUp,
      features: ['HR-Kennzahlen', 'Custom Reports', 'Trend-Analysen'],
    },
  ];

  return (
    <section className="py-20 lg:py-32">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Das ist intelligente HR.
          </h2>
          <p className="text-xl text-muted-foreground">
            Automatisiert. Anpassungsfähig. Fundiert.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.bgColor} mb-6`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              <div className={`text-xs font-semibold ${feature.color} mb-3`}>
                {feature.badge}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
              <button className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${feature.color} hover:underline`}>
                Mehr erfahren
                <span>→</span>
              </button>
            </div>
          ))}
        </div>

        {/* Module Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {moduleFeatures.map((module, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <module.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{module.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {module.description}
              </p>
              <ul className="space-y-2">
                {module.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
