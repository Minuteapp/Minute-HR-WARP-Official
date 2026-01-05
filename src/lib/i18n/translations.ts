// Translations für die Marketing-Website
// Vorbereitet für DE/EN - aktuell nur DE implementiert

export type Language = 'de' | 'en';

export interface Translations {
  // Navigation
  nav: {
    features: string;
    solutions: string;
    pricing: string;
    blog: string;
    about: string;
    login: string;
    demo: string;
  };
  // Hero
  hero: {
    tagline: string;
    subtitle: string;
    cta: string;
    ctaSecondary: string;
    trustedBy: string;
  };
  // Benefits
  benefits: {
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  // Features
  features: {
    title: string;
    subtitle: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  // Solutions
  solutions: {
    title: string;
    subtitle: string;
    scalability: {
      title: string;
      description: string;
    };
    roles: Array<{
      title: string;
      description: string;
      features: string[];
    }>;
  };
  // Pricing
  pricing: {
    title: string;
    subtitle: string;
    monthly: string;
    yearly: string;
    yearlyDiscount: string;
    perEmployee: string;
    contact: string;
    cta: string;
    ctaEnterprise: string;
    popular: string;
    plans: Array<{
      name: string;
      price: string;
      description: string;
      features: string[];
    }>;
  };
  // Blog
  blog: {
    title: string;
    subtitle: string;
    readMore: string;
    categories: {
      trends: string;
      tips: string;
      updates: string;
      legal: string;
    };
  };
  // About
  about: {
    title: string;
    mission: {
      title: string;
      text: string;
    };
    values: {
      title: string;
      items: Array<{
        title: string;
        description: string;
      }>;
    };
    team: {
      title: string;
    };
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
  // Footer
  footer: {
    product: string;
    solutions: string;
    resources: string;
    company: string;
    legal: string;
    privacy: string;
    terms: string;
    imprint: string;
    contact: string;
    copyright: string;
  };
  // CTA Section
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
}

export const translations: Record<Language, Translations> = {
  de: {
    nav: {
      features: 'Funktionen',
      solutions: 'Lösungen',
      pricing: 'Preise',
      blog: 'Blog',
      about: 'Über uns',
      login: 'Anmelden',
      demo: 'Demo vereinbaren',
    },
    hero: {
      tagline: 'HR-Management, das mitwächst',
      subtitle: 'Von der Zeiterfassung bis zur Lohnabrechnung – Minute HR vereint alle HR-Prozesse in einer intelligenten Plattform. Für KMU und Enterprise.',
      cta: 'Jetzt Demo vereinbaren',
      ctaSecondary: 'Kostenlos testen',
      trustedBy: 'Vertrauen von über 500 Unternehmen',
    },
    benefits: {
      title: 'Warum Minute HR?',
      items: [
        {
          title: 'Zeit sparen',
          description: 'Automatisierte HR-Workflows reduzieren Ihren Verwaltungsaufwand um bis zu 60%.',
        },
        {
          title: 'Compliance sicher',
          description: 'DSGVO-konforme Prozesse und automatische Dokumentation für rechtliche Sicherheit.',
        },
        {
          title: 'Mitarbeiter begeistern',
          description: 'Self-Service Portal für alle HR-Anliegen – jederzeit und von überall.',
        },
        {
          title: 'Datenbasiert entscheiden',
          description: 'Echtzeit-Analytics und KI-gestützte Insights für bessere Entscheidungen.',
        },
      ],
    },
    features: {
      title: 'Alle HR-Funktionen in einer Plattform',
      subtitle: 'Minute HR bietet Ihnen alle Werkzeuge, die Sie für modernes Personalmanagement benötigen.',
      items: [
        {
          title: 'Mitarbeiterverwaltung',
          description: 'Digitale Personalakte, Organigramm und Stammdatenpflege – alles an einem Ort.',
        },
        {
          title: 'Zeiterfassung',
          description: 'Mobile Stempeluhr, Projektzeiterfassung und automatisches Überstundenmanagement.',
        },
        {
          title: 'Urlaubsverwaltung',
          description: 'Urlaubsanträge, Abwesenheitskalender und automatische Genehmigungsworkflows.',
        },
        {
          title: 'Lohnabrechnung',
          description: 'Gehaltsberechnung, Lohnbuchhaltungs-Export und digitale Entgeltabrechnungen.',
        },
        {
          title: 'Recruiting',
          description: 'Stellenausschreibungen, Bewerbermanagement und Interview-Planung.',
        },
        {
          title: 'Onboarding',
          description: 'Digitale Checklisten, Dokumenten-Upload und strukturierte Willkommens-Workflows.',
        },
        {
          title: 'Performance Management',
          description: 'Zielvereinbarungen, 360-Grad-Feedback und individuelle Entwicklungspläne.',
        },
        {
          title: 'Analytics & Reports',
          description: 'HR-Dashboards, Custom Reports und Trend-Analysen auf Knopfdruck.',
        },
      ],
    },
    solutions: {
      title: 'Die richtige Lösung für jeden',
      subtitle: 'Minute HR passt sich Ihren Anforderungen an – egal ob KMU oder Enterprise.',
      scalability: {
        title: 'Von 5 bis 5.000 Mitarbeiter',
        description: 'Minute HR wächst mit Ihrem Unternehmen. Starten Sie klein und skalieren Sie nach Bedarf.',
      },
      roles: [
        {
          title: 'Für HR-Manager',
          description: 'Behalten Sie alle HR-Prozesse im Blick und automatisieren Sie wiederkehrende Aufgaben. Weniger Papierkram, mehr strategische Arbeit.',
          features: [
            'Zentrale Personalakte',
            'Automatische Compliance',
            'HR-Analytics Dashboard',
            'Workflow-Automatisierung',
          ],
        },
        {
          title: 'Für Teamleiter',
          description: 'Verwalten Sie Ihr Team effizient mit einem klaren Überblick über Abwesenheiten, Arbeitszeiten und Performance.',
          features: [
            'Team-Abwesenheitskalender',
            'Genehmigungsworkflows',
            'Performance Reviews',
            'Team-Entwicklung',
          ],
        },
        {
          title: 'Für Mitarbeiter',
          description: 'Self-Service für alle HR-Anliegen. Urlaubsanträge, Zeiterfassung und Gehaltsabrechnungen – alles in einer App.',
          features: [
            'Mobile App',
            'Self-Service Portal',
            'Digitale Gehaltsabrechnungen',
            'Persönliches Dashboard',
          ],
        },
      ],
    },
    pricing: {
      title: 'Transparente Preise',
      subtitle: 'Wählen Sie den Plan, der zu Ihrem Unternehmen passt. Keine versteckten Kosten.',
      monthly: 'Monatlich',
      yearly: 'Jährlich',
      yearlyDiscount: '2 Monate gratis',
      perEmployee: 'pro Mitarbeiter / Monat',
      contact: 'Auf Anfrage',
      cta: '14 Tage kostenlos testen',
      ctaEnterprise: 'Kontakt aufnehmen',
      popular: 'Beliebt',
      plans: [
        {
          name: 'Starter',
          price: '0',
          description: 'Perfekt für kleine Teams bis 5 Mitarbeiter',
          features: [
            'Bis zu 5 Mitarbeiter',
            'Zeiterfassung',
            'Abwesenheitsverwaltung',
            'Mitarbeiterverwaltung',
            'Mobile App',
            'E-Mail Support',
          ],
        },
        {
          name: 'Professional',
          price: '6',
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
        },
        {
          name: 'Enterprise',
          price: 'custom',
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
        },
      ],
    },
    blog: {
      title: 'HR-Insights & News',
      subtitle: 'Aktuelle Trends, praktische Tipps und Neuigkeiten aus der Welt des HR-Managements.',
      readMore: 'Weiterlesen',
      categories: {
        trends: 'HR-Trends',
        tips: 'Tipps & Tricks',
        updates: 'Produktupdates',
        legal: 'Rechtliches',
      },
    },
    about: {
      title: 'Über Minute HR',
      mission: {
        title: 'Unsere Mission',
        text: 'Wir glauben, dass HR-Arbeit wertschätzend und effizient sein kann. Mit Minute HR ermöglichen wir Unternehmen, sich auf das Wesentliche zu konzentrieren: ihre Menschen.',
      },
      values: {
        title: 'Unsere Werte',
        items: [
          {
            title: 'Einfachheit',
            description: 'Komplexe HR-Prozesse einfach und intuitiv gestalten.',
          },
          {
            title: 'Innovation',
            description: 'Kontinuierliche Weiterentwicklung mit modernster Technologie.',
          },
          {
            title: 'Vertrauen',
            description: 'Datenschutz und Sicherheit haben höchste Priorität.',
          },
          {
            title: 'Partnerschaft',
            description: 'Wir wachsen gemeinsam mit unseren Kunden.',
          },
        ],
      },
      team: {
        title: 'Unser Team',
      },
      stats: [
        { value: '500+', label: 'Kunden' },
        { value: '50.000+', label: 'Mitarbeiter verwaltet' },
        { value: '99,9%', label: 'Uptime' },
        { value: 'Seit 2020', label: 'Am Markt' },
      ],
    },
    footer: {
      product: 'Produkt',
      solutions: 'Lösungen',
      resources: 'Ressourcen',
      company: 'Unternehmen',
      legal: 'Rechtliches',
      privacy: 'Datenschutz',
      terms: 'AGB',
      imprint: 'Impressum',
      contact: 'Kontakt',
      copyright: '© 2025 Minute HR. Alle Rechte vorbehalten.',
    },
    cta: {
      title: 'Bereit für modernes HR-Management?',
      subtitle: 'Starten Sie noch heute mit Minute HR und erleben Sie, wie einfach HR sein kann.',
      button: 'Kostenlos starten',
    },
  },
  en: {
    // English translations - to be implemented
    nav: {
      features: 'Features',
      solutions: 'Solutions',
      pricing: 'Pricing',
      blog: 'Blog',
      about: 'About',
      login: 'Login',
      demo: 'Book Demo',
    },
    hero: {
      tagline: 'HR Management that Grows with You',
      subtitle: 'From time tracking to payroll – Minute HR unifies all HR processes in one intelligent platform. For SMBs and enterprises.',
      cta: 'Book a Demo',
      ctaSecondary: 'Try for Free',
      trustedBy: 'Trusted by over 500 companies',
    },
    benefits: {
      title: 'Why Minute HR?',
      items: [
        {
          title: 'Save Time',
          description: 'Automated HR workflows reduce your administrative workload by up to 60%.',
        },
        {
          title: 'Stay Compliant',
          description: 'GDPR-compliant processes and automatic documentation for legal security.',
        },
        {
          title: 'Delight Employees',
          description: 'Self-service portal for all HR matters – anytime, anywhere.',
        },
        {
          title: 'Data-Driven Decisions',
          description: 'Real-time analytics and AI-powered insights for better decisions.',
        },
      ],
    },
    features: {
      title: 'All HR Features in One Platform',
      subtitle: 'Minute HR provides all the tools you need for modern HR management.',
      items: [
        {
          title: 'Employee Management',
          description: 'Digital personnel files, org charts, and master data management – all in one place.',
        },
        {
          title: 'Time Tracking',
          description: 'Mobile clock-in, project time tracking, and automatic overtime management.',
        },
        {
          title: 'Leave Management',
          description: 'Leave requests, absence calendar, and automatic approval workflows.',
        },
        {
          title: 'Payroll',
          description: 'Salary calculation, payroll export, and digital pay slips.',
        },
        {
          title: 'Recruiting',
          description: 'Job postings, applicant management, and interview scheduling.',
        },
        {
          title: 'Onboarding',
          description: 'Digital checklists, document uploads, and structured welcome workflows.',
        },
        {
          title: 'Performance Management',
          description: 'Goal setting, 360-degree feedback, and individual development plans.',
        },
        {
          title: 'Analytics & Reports',
          description: 'HR dashboards, custom reports, and trend analysis at your fingertips.',
        },
      ],
    },
    solutions: {
      title: 'The Right Solution for Everyone',
      subtitle: 'Minute HR adapts to your needs – whether SMB or enterprise.',
      scalability: {
        title: 'From 5 to 5,000 Employees',
        description: 'Minute HR grows with your company. Start small and scale as needed.',
      },
      roles: [
        {
          title: 'For HR Managers',
          description: 'Keep track of all HR processes and automate recurring tasks. Less paperwork, more strategic work.',
          features: [
            'Central Personnel File',
            'Automatic Compliance',
            'HR Analytics Dashboard',
            'Workflow Automation',
          ],
        },
        {
          title: 'For Team Leaders',
          description: 'Manage your team efficiently with a clear overview of absences, work hours, and performance.',
          features: [
            'Team Absence Calendar',
            'Approval Workflows',
            'Performance Reviews',
            'Team Development',
          ],
        },
        {
          title: 'For Employees',
          description: 'Self-service for all HR matters. Leave requests, time tracking, and pay slips – all in one app.',
          features: [
            'Mobile App',
            'Self-Service Portal',
            'Digital Pay Slips',
            'Personal Dashboard',
          ],
        },
      ],
    },
    pricing: {
      title: 'Transparent Pricing',
      subtitle: 'Choose the plan that fits your company. No hidden costs.',
      monthly: 'Monthly',
      yearly: 'Yearly',
      yearlyDiscount: '2 months free',
      perEmployee: 'per employee / month',
      contact: 'Contact us',
      cta: 'Try 14 days for free',
      ctaEnterprise: 'Contact Sales',
      popular: 'Popular',
      plans: [
        {
          name: 'Starter',
          price: '0',
          description: 'Perfect for small teams up to 5 employees',
          features: [
            'Up to 5 employees',
            'Time tracking',
            'Leave management',
            'Employee management',
            'Mobile app',
            'Email support',
          ],
        },
        {
          name: 'Professional',
          price: '6',
          description: 'For growing companies with advanced needs',
          features: [
            'Unlimited employees',
            'All Starter features',
            'Recruiting & Onboarding',
            'Performance Management',
            'Custom Reports',
            'API Access',
            'Priority Support',
          ],
        },
        {
          name: 'Enterprise',
          price: 'custom',
          description: 'Custom solutions for large enterprises',
          features: [
            'All Professional features',
            'Single Sign-On (SSO)',
            'Custom Integrations',
            'Dedicated Success Manager',
            'On-Premise Option',
            'SLA Guarantee',
            '24/7 Support',
          ],
        },
      ],
    },
    blog: {
      title: 'HR Insights & News',
      subtitle: 'Current trends, practical tips, and news from the world of HR management.',
      readMore: 'Read more',
      categories: {
        trends: 'HR Trends',
        tips: 'Tips & Tricks',
        updates: 'Product Updates',
        legal: 'Legal',
      },
    },
    about: {
      title: 'About Minute HR',
      mission: {
        title: 'Our Mission',
        text: 'We believe that HR work can be appreciative and efficient. With Minute HR, we enable companies to focus on what matters most: their people.',
      },
      values: {
        title: 'Our Values',
        items: [
          {
            title: 'Simplicity',
            description: 'Making complex HR processes simple and intuitive.',
          },
          {
            title: 'Innovation',
            description: 'Continuous development with cutting-edge technology.',
          },
          {
            title: 'Trust',
            description: 'Data protection and security are our top priority.',
          },
          {
            title: 'Partnership',
            description: 'We grow together with our customers.',
          },
        ],
      },
      team: {
        title: 'Our Team',
      },
      stats: [
        { value: '500+', label: 'Customers' },
        { value: '50,000+', label: 'Employees managed' },
        { value: '99.9%', label: 'Uptime' },
        { value: 'Since 2020', label: 'In the market' },
      ],
    },
    footer: {
      product: 'Product',
      solutions: 'Solutions',
      resources: 'Resources',
      company: 'Company',
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      imprint: 'Imprint',
      contact: 'Contact',
      copyright: '© 2025 Minute HR. All rights reserved.',
    },
    cta: {
      title: 'Ready for Modern HR Management?',
      subtitle: 'Start today with Minute HR and experience how easy HR can be.',
      button: 'Start for Free',
    },
  },
};
