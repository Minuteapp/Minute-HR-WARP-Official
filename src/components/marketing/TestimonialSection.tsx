import React from 'react';
import { Star } from 'lucide-react';

interface Testimonial {
  name: string;
  position: string;
  company: string;
  quote: string;
  rating: number;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Müller',
    position: 'HR-Leiterin',
    company: 'TechStart GmbH',
    quote: 'Mit Minute HR haben wir unseren Onboarding-Prozess von 2 Wochen auf 3 Tage verkürzt. Die Mitarbeiter lieben die einfache Zeiterfassung.',
    rating: 5,
  },
  {
    name: 'Michael Weber',
    position: 'Geschäftsführer',
    company: 'Weber & Partner',
    quote: 'Endlich eine HR-Software, die wirklich intuitiv ist. Unsere Urlaubsverwaltung läuft jetzt komplett automatisiert.',
    rating: 5,
  },
  {
    name: 'Lisa Schmidt',
    position: 'People Operations',
    company: 'Digital Solutions AG',
    quote: 'Die DSGVO-Konformität war für uns entscheidend. Minute HR bietet alles, was wir brauchen – Made in Germany.',
    rating: 5,
  },
];

const TestimonialSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Das sagen unsere Kunden
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Über 500 Unternehmen vertrauen bereits auf Minute HR
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-lg transition-shadow"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-foreground leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.position}, {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '500+', label: 'Unternehmen' },
            { value: '50.000+', label: 'Mitarbeiter verwaltet' },
            { value: '99,9%', label: 'Verfügbarkeit' },
            { value: '4,8/5', label: 'Kundenbewertung' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
