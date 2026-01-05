import { 
  Users, 
  Clock, 
  Calendar, 
  Wallet, 
  UserPlus, 
  ClipboardList, 
  Target, 
  BarChart3,
  CalendarClock,
  LucideIcon
} from 'lucide-react';

export interface ModuleTab {
  title: string;
  description: string;
  bullets: string[];
}

export interface ModuleStat {
  value: string;
  label: string;
  description: string;
}

export interface ModuleFAQ {
  question: string;
  answer: string;
}

export interface ModuleConfig {
  slug: string;
  title: string;
  subtitle: string;
  heroDescription: string;
  heroBullets: string[];
  icon: LucideIcon;
  benefits: {
    title: string;
    description: string;
    icon: string;
  }[];
  tabs: {
    mitarbeitende: ModuleTab;
    vorgesetzte: ModuleTab;
    administration: ModuleTab;
  };
  stats: ModuleStat[];
  appFeatures: string[];
  faq: ModuleFAQ[];
  relatedModules: string[];
}

export const modules: ModuleConfig[] = [
  {
    slug: 'mitarbeiterverwaltung',
    title: 'Mitarbeiterverwaltung',
    subtitle: 'Digitale Personalakte & Organigramm',
    heroDescription: 'Verwalten Sie alle Mitarbeiterdaten zentral an einem Ort. Von der digitalen Personalakte bis zum dynamischen Organigramm – alles übersichtlich und DSGVO-konform.',
    heroBullets: [
      'Zentrale digitale Personalakte',
      'Dynamisches Organigramm',
      'Dokumentenverwaltung mit Versionierung',
      'Automatische Erinnerungen für Fristen',
      'DSGVO-konforme Datenhaltung'
    ],
    icon: Users,
    benefits: [
      {
        title: 'Effizienz',
        description: 'Reduzieren Sie den Verwaltungsaufwand um bis zu 60% durch zentrale Datenhaltung.',
        icon: '⚡'
      },
      {
        title: 'Transparenz',
        description: 'Jeder sieht genau das, was er braucht – mit rollenbasierter Zugriffskontrolle.',
        icon: '👁️'
      },
      {
        title: 'Compliance',
        description: 'Automatische DSGVO-Konformität und revisionssichere Dokumentation.',
        icon: '✅'
      }
    ],
    tabs: {
      mitarbeitende: {
        title: 'Für Mitarbeitende',
        description: 'Behalten Sie den Überblick über Ihre eigenen Daten und aktualisieren Sie diese selbstständig.',
        bullets: [
          'Eigene Stammdaten einsehen und aktualisieren',
          'Dokumente digital hochladen',
          'Bescheinigungen anfordern',
          'Organigramm durchsuchen',
          'Kollegen finden und kontaktieren'
        ]
      },
      vorgesetzte: {
        title: 'Für Vorgesetzte',
        description: 'Verwalten Sie Ihr Team effizient und behalten Sie alle wichtigen Informationen im Blick.',
        bullets: [
          'Team-Übersicht auf einen Blick',
          'Mitarbeiterdaten einsehen',
          'Fristen und Termine verwalten',
          'Performance-Daten analysieren',
          'Schnelle Kommunikation im Team'
        ]
      },
      administration: {
        title: 'Für HR & Administration',
        description: 'Steuern Sie alle Personalprozesse zentral und automatisieren Sie Routineaufgaben.',
        bullets: [
          'Komplette Personalakte verwalten',
          'Massenimport und -export',
          'Automatische Workflows einrichten',
          'Compliance-Reports erstellen',
          'Berechtigungen granular steuern'
        ]
      }
    },
    stats: [
      { value: '60%', label: 'Zeitersparnis', description: 'bei administrativen Aufgaben' },
      { value: '100%', label: 'Digital', description: 'papierlose Personalakte' },
      { value: '24/7', label: 'Zugriff', description: 'auf alle Mitarbeiterdaten' }
    ],
    appFeatures: [
      'Stammdaten mobil aktualisieren',
      'Dokumente fotografieren & hochladen',
      'Kollegen im Organigramm finden',
      'Push-Benachrichtigungen bei Änderungen'
    ],
    faq: [
      {
        question: 'Wie sicher sind meine Mitarbeiterdaten?',
        answer: 'Alle Daten werden verschlüsselt in deutschen Rechenzentren gespeichert. Wir sind ISO 27001 zertifiziert und DSGVO-konform.'
      },
      {
        question: 'Kann ich bestehende Daten importieren?',
        answer: 'Ja, wir bieten einen einfachen Import aus Excel, CSV und gängigen HR-Systemen. Unser Support hilft Ihnen bei der Migration.'
      },
      {
        question: 'Wie funktioniert die Zugriffskontrolle?',
        answer: 'Sie definieren Rollen und Berechtigungen granular. Jeder sieht nur die Daten, die er sehen darf.'
      },
      {
        question: 'Gibt es eine Schnittstelle zu anderen Systemen?',
        answer: 'Ja, wir bieten REST-APIs und fertige Integrationen für DATEV, SAP und viele weitere Systeme.'
      }
    ],
    relatedModules: ['zeiterfassung', 'urlaubsverwaltung', 'onboarding']
  },
  {
    slug: 'zeiterfassung',
    title: 'Zeiterfassung',
    subtitle: 'Mobile Stempeluhr & Projektzeiten',
    heroDescription: 'Erfassen Sie Arbeitszeiten präzise und gesetzeskonform. Mit mobiler Stempeluhr, Projektzeit-Tracking und automatischer Überstundenberechnung.',
    heroBullets: [
      'Mobile Stempeluhr mit GPS-Option',
      'Projektzeit-Tracking',
      'Automatische Pausenberechnung',
      'Überstunden-Management',
      'DATEV-Export für die Lohnbuchhaltung'
    ],
    icon: Clock,
    benefits: [
      {
        title: 'Präzision',
        description: 'Sekundengenaue Zeiterfassung mit automatischer Pausenberechnung nach ArbZG.',
        icon: '⏱️'
      },
      {
        title: 'Flexibilität',
        description: 'Erfassen Sie Zeit per App, Terminal, Web oder automatisch per Kalenderintegration.',
        icon: '📱'
      },
      {
        title: 'Compliance',
        description: 'Vollständig ArbZG-konform mit automatischen Warnungen bei Verstößen.',
        icon: '⚖️'
      }
    ],
    tabs: {
      mitarbeitende: {
        title: 'Für Mitarbeitende',
        description: 'Erfassen Sie Ihre Arbeitszeit einfach und schnell – überall und jederzeit.',
        bullets: [
          'Ein-Klick-Stempeln per App',
          'Überstunden-Übersicht in Echtzeit',
          'Projektzeiten zuordnen',
          'Korrekturen selbst beantragen',
          'Arbeitszeitkonto einsehen'
        ]
      },
      vorgesetzte: {
        title: 'Für Vorgesetzte',
        description: 'Behalten Sie die Arbeitszeiten Ihres Teams im Blick und genehmigen Sie Korrekturen.',
        bullets: [
          'Team-Arbeitszeiten überwachen',
          'Überstunden genehmigen',
          'Projektzeiten auswerten',
          'Kapazitäten planen',
          'Compliance-Verstöße erkennen'
        ]
      },
      administration: {
        title: 'Für HR & Administration',
        description: 'Automatisieren Sie die gesamte Zeiterfassung und exportieren Sie nahtlos zur Lohnbuchhaltung.',
        bullets: [
          'Automatischer DATEV-Export',
          'Flexible Arbeitszeitmodelle',
          'Zuschlagsregelungen konfigurieren',
          'Audit-Trail für alle Änderungen',
          'Standort-spezifische Regeln'
        ]
      }
    },
    stats: [
      { value: '99.9%', label: 'Uptime', description: 'garantierte Verfügbarkeit' },
      { value: '<2s', label: 'Stempelzeit', description: 'blitzschnelle Erfassung' },
      { value: '100%', label: 'ArbZG-konform', description: 'gesetzliche Compliance' }
    ],
    appFeatures: [
      'Stempeln mit einem Klick',
      'GPS-Standort optional',
      'Offline-Modus verfügbar',
      'Widget für Schnellzugriff'
    ],
    faq: [
      {
        question: 'Erfüllt die Zeiterfassung die gesetzlichen Anforderungen?',
        answer: 'Ja, unsere Zeiterfassung ist vollständig konform mit dem Arbeitszeitgesetz (ArbZG) und den EU-Vorgaben zur Arbeitszeiterfassung.'
      },
      {
        question: 'Funktioniert die App auch offline?',
        answer: 'Ja, Stempelungen werden lokal gespeichert und automatisch synchronisiert, sobald wieder eine Verbindung besteht.'
      },
      {
        question: 'Kann ich verschiedene Arbeitszeitmodelle abbilden?',
        answer: 'Ja, ob Vollzeit, Teilzeit, Gleitzeit oder Schichtarbeit – alle Modelle sind flexibel konfigurierbar.'
      },
      {
        question: 'Wie funktioniert der Export zur Lohnbuchhaltung?',
        answer: 'Mit einem Klick exportieren Sie alle Daten im DATEV-Format oder als CSV für andere Systeme.'
      }
    ],
    relatedModules: ['schichtplanung', 'lohnabrechnung', 'urlaubsverwaltung']
  },
  {
    slug: 'urlaubsverwaltung',
    title: 'Urlaubsverwaltung',
    subtitle: 'Anträge & Abwesenheitskalender',
    heroDescription: 'Verwalten Sie Urlaub und Abwesenheiten digital. Mit automatischen Genehmigungsworkflows, Team-Kalendern und intelligentem Resturlaub-Management.',
    heroBullets: [
      'Digitale Urlaubsanträge',
      'Automatische Genehmigungsworkflows',
      'Team-Abwesenheitskalender',
      'Resturlaub-Berechnung',
      'Vertretungsregelungen'
    ],
    icon: Calendar,
    benefits: [
      {
        title: 'Schnelligkeit',
        description: 'Urlaubsanträge in Sekunden stellen und genehmigen – ohne Papierkram.',
        icon: '🚀'
      },
      {
        title: 'Übersicht',
        description: 'Team-Kalender zeigt sofort, wer wann abwesend ist.',
        icon: '📅'
      },
      {
        title: 'Automatisierung',
        description: 'Resturlaub, Übertrag und Verfall werden automatisch berechnet.',
        icon: '🤖'
      }
    ],
    tabs: {
      mitarbeitende: {
        title: 'Für Mitarbeitende',
        description: 'Stellen Sie Urlaubsanträge in Sekunden und behalten Sie Ihren Resturlaub im Blick.',
        bullets: [
          'Urlaubsantrag in 30 Sekunden',
          'Resturlaub immer aktuell',
          'Team-Abwesenheiten sehen',
          'Vertretung festlegen',
          'Bescheinigungen herunterladen'
        ]
      },
      vorgesetzte: {
        title: 'Für Vorgesetzte',
        description: 'Genehmigen Sie Anträge mit einem Klick und planen Sie Teamabwesenheiten vorausschauend.',
        bullets: [
          'Anträge per Push-Notification',
          'Team-Kalender auf einen Blick',
          'Konflikte automatisch erkennen',
          'Urlaubssperre einrichten',
          'Vertretungen sicherstellen'
        ]
      },
      administration: {
        title: 'Für HR & Administration',
        description: 'Automatisieren Sie die komplette Urlaubsverwaltung und behalten Sie die Kontrolle.',
        bullets: [
          'Urlaubsansprüche verwalten',
          'Übertrag-Regeln konfigurieren',
          'Compliance-Reports erstellen',
          'Feiertage pro Standort pflegen',
          'Integration mit Lohnabrechnung'
        ]
      }
    },
    stats: [
      { value: '90%', label: 'Schneller', description: 'als papierbasierte Prozesse' },
      { value: '0', label: 'Papierkram', description: 'vollständig digital' },
      { value: '100%', label: 'Transparent', description: 'für alle Beteiligten' }
    ],
    appFeatures: [
      'Urlaub mobil beantragen',
      'Push bei Genehmigung',
      'Team-Kalender einsehen',
      'Resturlaub prüfen'
    ],
    faq: [
      {
        question: 'Wie werden Resturlaub und Übertrag berechnet?',
        answer: 'Das System berechnet automatisch den Resturlaub und berücksichtigt Ihre individuellen Übertrag-Regeln und Verfallfristen.'
      },
      {
        question: 'Kann ich verschiedene Abwesenheitsarten verwalten?',
        answer: 'Ja, neben Urlaub können Sie auch Sonderurlaub, Krankheit, Homeoffice und beliebige weitere Abwesenheitsarten konfigurieren.'
      },
      {
        question: 'Wie funktioniert der Genehmigungsworkflow?',
        answer: 'Sie definieren, wer Anträge genehmigen darf. Vorgesetzte erhalten automatisch Benachrichtigungen und können mit einem Klick genehmigen.'
      },
      {
        question: 'Werden Feiertage automatisch berücksichtigt?',
        answer: 'Ja, Feiertage werden pro Standort/Bundesland automatisch berücksichtigt und von der Urlaubsberechnung ausgenommen.'
      }
    ],
    relatedModules: ['zeiterfassung', 'mitarbeiterverwaltung', 'schichtplanung']
  },
  {
    slug: 'lohnabrechnung',
    title: 'Lohnabrechnung',
    subtitle: 'Gehaltsberechnung & Export',
    heroDescription: 'Vereinfachen Sie Ihre Lohnabrechnung mit automatischen Berechnungen, DATEV-Export und digitalen Entgeltabrechnungen für Ihre Mitarbeiter.',
    heroBullets: [
      'Automatische Gehaltsberechnung',
      'DATEV-Schnittstelle',
      'Digitale Lohnzettel',
      'Steuer- und SV-Berechnung',
      'Sonderzahlungen & Benefits'
    ],
    icon: Wallet,
    benefits: [
      {
        title: 'Automatisierung',
        description: 'Lohnberechnung mit allen Abzügen und Zuschlägen auf Knopfdruck.',
        icon: '💰'
      },
      {
        title: 'Integration',
        description: 'Nahtlose Verbindung zu DATEV, SAP und anderen Buchhaltungssystemen.',
        icon: '🔗'
      },
      {
        title: 'Transparenz',
        description: 'Mitarbeiter sehen ihre Lohnzettel jederzeit digital.',
        icon: '📄'
      }
    ],
    tabs: {
      mitarbeitende: {
        title: 'Für Mitarbeitende',
        description: 'Greifen Sie jederzeit auf Ihre Lohnzettel zu und behalten Sie den Überblick.',
        bullets: [
          'Digitale Lohnzettel abrufen',
          'Jahresbescheinigungen herunterladen',
          'Bankverbindung aktualisieren',
          'Steuerklasse-Änderungen melden',
          'Benefits-Übersicht einsehen'
        ]
      },
      vorgesetzte: {
        title: 'Für Vorgesetzte',
        description: 'Verwalten Sie Prämien und Sonderzahlungen für Ihr Team.',
        bullets: [
          'Prämien vorschlagen',
          'Überstunden-Auszahlung genehmigen',
          'Team-Gehaltsübersicht',
          'Budget-Kontrolle',
          'Gehaltsanpassungen beantragen'
        ]
      },
      administration: {
        title: 'Für HR & Administration',
        description: 'Steuern Sie die komplette Lohnabrechnung zentral und automatisiert.',
        bullets: [
          'Monatliche Abrechnungsläufe',
          'DATEV-Export automatisieren',
          'Sonderzahlungen verwalten',
          'Steuer-Reporting erstellen',
          'Revision und Audit-Trail'
        ]
      }
    },
    stats: [
      { value: '80%', label: 'Weniger Aufwand', description: 'durch Automatisierung' },
      { value: '100%', label: 'Digital', description: 'keine Papierlohnzettel' },
      { value: '0', label: 'Fehler', description: 'durch automatische Prüfungen' }
    ],
    appFeatures: [
      'Lohnzettel mobil abrufen',
      'Push bei neuer Abrechnung',
      'Jahresbescheinigungen',
      'Bankdaten ändern'
    ],
    faq: [
      {
        question: 'Wie funktioniert die DATEV-Integration?',
        answer: 'Alle Lohndaten werden automatisch im DATEV-Format exportiert. Sie können den Export manuell oder automatisiert auslösen.'
      },
      {
        question: 'Werden alle Abzüge automatisch berechnet?',
        answer: 'Ja, Steuern, Sozialversicherungsbeiträge, Vermögenswirksame Leistungen und alle weiteren Abzüge werden automatisch berechnet.'
      },
      {
        question: 'Kann ich Sonderzahlungen verwalten?',
        answer: 'Ja, Sie können Prämien, Weihnachtsgeld, Urlaubsgeld und beliebige weitere Sonderzahlungen konfigurieren.'
      },
      {
        question: 'Sind die digitalen Lohnzettel rechtssicher?',
        answer: 'Ja, die digitalen Lohnzettel erfüllen alle gesetzlichen Anforderungen und werden revisionssicher archiviert.'
      }
    ],
    relatedModules: ['zeiterfassung', 'mitarbeiterverwaltung', 'analytics']
  },
  {
    slug: 'recruiting',
    title: 'Recruiting',
    subtitle: 'Stellenausschreibungen & Bewerbungen',
    heroDescription: 'Finden Sie die besten Talente schneller. Mit Multiposting, Bewerbermanagement und KI-gestützter Vorauswahl – alles in einer Plattform.',
    heroBullets: [
      'Multiposting auf allen Jobportalen',
      'Zentrales Bewerbermanagement',
      'KI-gestützte Vorauswahl',
      'Interview-Planung',
      'Talent-Pool-Aufbau'
    ],
    icon: UserPlus,
    benefits: [
      {
        title: 'Reichweite',
        description: 'Veröffentlichen Sie Stellen mit einem Klick auf allen relevanten Jobportalen.',
        icon: '🌐'
      },
      {
        title: 'Effizienz',
        description: 'KI sortiert Bewerbungen vor und empfiehlt die besten Kandidaten.',
        icon: '🤖'
      },
      {
        title: 'Zusammenarbeit',
        description: 'Das gesamte Team kann Kandidaten bewerten und kommentieren.',
        icon: '👥'
      }
    ],
    tabs: {
      mitarbeitende: {
        title: 'Für Mitarbeitende',
        description: 'Empfehlen Sie Kandidaten aus Ihrem Netzwerk und verdienen Sie Prämien.',
        bullets: [
          'Stellen teilen',
          'Kandidaten empfehlen',
          'Empfehlungs-Prämien erhalten',
          'Interne Stellen finden',
          'Karrierechancen entdecken'
        ]
      },
      vorgesetzte: {
        title: 'Für Vorgesetzte',
        description: 'Definieren Sie Anforderungen und wählen Sie die besten Kandidaten für Ihr Team.',
        bullets: [
          'Stellenanforderungen definieren',
          'Bewerbungen bewerten',
          'Interviews führen',
          'Feedback geben',
          'Einstellungsentscheidung treffen'
        ]
      },
      administration: {
        title: 'Für HR & Recruiting',
        description: 'Steuern Sie den gesamten Recruiting-Prozess effizient und transparent.',
        bullets: [
          'Stellen veröffentlichen',
          'Bewerbungen sichten',
          'Kandidaten-Pipeline verwalten',
          'Kommunikation automatisieren',
          'Reporting und Analytics'
        ]
      }
    },
    stats: [
      { value: '50%', label: 'Schneller', description: 'zum passenden Kandidaten' },
      { value: '300+', label: 'Jobportale', description: 'mit einem Klick' },
      { value: '85%', label: 'Zufriedenheit', description: 'bei Hiring Managern' }
    ],
    appFeatures: [
      'Bewerbungen mobil sichten',
      'Termine koordinieren',
      'Feedback geben',
      'Kandidaten kontaktieren'
    ],
    faq: [
      {
        question: 'Auf welchen Jobportalen wird veröffentlicht?',
        answer: 'Sie können auf über 300 Jobportalen veröffentlichen, darunter LinkedIn, Indeed, StepStone, XING und viele weitere.'
      },
      {
        question: 'Wie funktioniert die KI-Vorauswahl?',
        answer: 'Die KI analysiert Lebensläufe und Anschreiben und bewertet die Eignung basierend auf Ihren definierten Anforderungen.'
      },
      {
        question: 'Kann ich einen Talent-Pool aufbauen?',
        answer: 'Ja, Sie können interessante Kandidaten im Talent-Pool speichern und bei passenden Stellen automatisch benachrichtigen.'
      },
      {
        question: 'Gibt es ein Empfehlungsprogramm?',
        answer: 'Ja, Mitarbeiter können Kandidaten empfehlen und erhalten bei erfolgreicher Einstellung eine definierbare Prämie.'
      }
    ],
    relatedModules: ['onboarding', 'mitarbeiterverwaltung', 'performance']
  },
  {
    slug: 'onboarding',
    title: 'Onboarding',
    subtitle: 'Checklisten & Workflows',
    heroDescription: 'Begrüßen Sie neue Mitarbeiter professionell. Mit digitalen Checklisten, automatisierten Workflows und strukturierten Einarbeitungsplänen.',
    heroBullets: [
      'Digitale Onboarding-Checklisten',
      'Automatisierte Workflows',
      'Preboarding vor dem ersten Tag',
      'Einarbeitungspläne',
      'Buddy-System'
    ],
    icon: ClipboardList,
    benefits: [
      {
        title: 'Struktur',
        description: 'Standardisierte Prozesse stellen sicher, dass nichts vergessen wird.',
        icon: '📋'
      },
      {
        title: 'Erlebnis',
        description: 'Neue Mitarbeiter fühlen sich von Tag 1 willkommen und gut betreut.',
        icon: '🎉'
      },
      {
        title: 'Produktivität',
        description: 'Schnellere Einarbeitung durch klare Pläne und Ansprechpartner.',
        icon: '📈'
      }
    ],
    tabs: {
      mitarbeitende: {
        title: 'Für neue Mitarbeitende',
        description: 'Starten Sie perfekt vorbereitet in Ihren neuen Job.',
        bullets: [
          'Preboarding-Portal nutzen',
          'Dokumente hochladen',
          'Team kennenlernen',
          'Aufgaben abarbeiten',
          'Fragen stellen'
        ]
      },
      vorgesetzte: {
        title: 'Für Vorgesetzte',
        description: 'Begleiten Sie neue Teammitglieder strukturiert durch die Einarbeitung.',
        bullets: [
          'Einarbeitungsplan erstellen',
          'Buddy zuweisen',
          'Fortschritt verfolgen',
          'Feedback-Gespräche planen',
          'Ziele definieren'
        ]
      },
      administration: {
        title: 'Für HR & Administration',
        description: 'Automatisieren Sie den gesamten Onboarding-Prozess.',
        bullets: [
          'Onboarding-Vorlagen erstellen',
          'Automatische Workflows',
          'IT-Ausstattung beauftragen',
          'Compliance sicherstellen',
          'Onboarding-Analytics'
        ]
      }
    },
    stats: [
      { value: '40%', label: 'Schneller', description: 'produktiv im neuen Job' },
      { value: '95%', label: 'Zufriedenheit', description: 'bei neuen Mitarbeitern' },
      { value: '0', label: 'Vergessene Tasks', description: 'durch Checklisten' }
    ],
    appFeatures: [
      'Aufgaben mobil erledigen',
      'Dokumente hochladen',
      'Team kontaktieren',
      'Fortschritt sehen'
    ],
    faq: [
      {
        question: 'Was ist Preboarding?',
        answer: 'Preboarding beginnt zwischen Vertragsunterschrift und erstem Arbeitstag. Neue Mitarbeiter können bereits Dokumente hochladen und das Team kennenlernen.'
      },
      {
        question: 'Kann ich verschiedene Onboarding-Vorlagen erstellen?',
        answer: 'Ja, Sie können beliebig viele Vorlagen für verschiedene Rollen, Abteilungen oder Standorte erstellen.'
      },
      {
        question: 'Wie funktioniert das Buddy-System?',
        answer: 'Sie können jedem neuen Mitarbeiter einen erfahrenen Kollegen als Buddy zuweisen, der als Ansprechpartner dient.'
      },
      {
        question: 'Werden IT und Facility Management automatisch informiert?',
        answer: 'Ja, Workflows können automatisch Aufgaben an IT, Facility Management und andere Abteilungen zuweisen.'
      }
    ],
    relatedModules: ['recruiting', 'mitarbeiterverwaltung', 'performance']
  },
  {
    slug: 'performance',
    title: 'Performance Management',
    subtitle: 'Ziele & 360°-Feedback',
    heroDescription: 'Entwickeln Sie Ihre Mitarbeiter gezielt weiter. Mit Zielvereinbarungen, 360-Grad-Feedback und individuellen Entwicklungsplänen.',
    heroBullets: [
      'Zielvereinbarungen (OKR/MbO)',
      '360-Grad-Feedback',
      'Performance Reviews',
      'Entwicklungspläne',
      'Skill-Matrix'
    ],
    icon: Target,
    benefits: [
      {
        title: 'Klarheit',
        description: 'Transparente Ziele und Erwartungen für jeden Mitarbeiter.',
        icon: '🎯'
      },
      {
        title: 'Feedback',
        description: 'Kontinuierliches Feedback statt jährlicher Beurteilung.',
        icon: '💬'
      },
      {
        title: 'Entwicklung',
        description: 'Individuelle Entwicklungspläne fördern Talente gezielt.',
        icon: '🌱'
      }
    ],
    tabs: {
      mitarbeitende: {
        title: 'Für Mitarbeitende',
        description: 'Verfolgen Sie Ihre Ziele und entwickeln Sie sich kontinuierlich weiter.',
        bullets: [
          'Eigene Ziele verwalten',
          'Feedback geben und erhalten',
          'Entwicklungsplan einsehen',
          'Skills dokumentieren',
          'Erfolge feiern'
        ]
      },
      vorgesetzte: {
        title: 'Für Vorgesetzte',
        description: 'Fördern Sie Ihr Team durch klare Ziele und regelmäßiges Feedback.',
        bullets: [
          'Teamziele kaskadieren',
          'Reviews durchführen',
          'Feedback sammeln',
          'Potenziale erkennen',
          'Entwicklung fördern'
        ]
      },
      administration: {
        title: 'Für HR & Administration',
        description: 'Steuern Sie Performance Management unternehmensweit.',
        bullets: [
          'Performance-Zyklen planen',
          'Review-Vorlagen erstellen',
          'Kalibrierung durchführen',
          'Talent-Analytics',
          'Nachfolgeplanung'
        ]
      }
    },
    stats: [
      { value: '30%', label: 'Mehr Engagement', description: 'durch klare Ziele' },
      { value: '4x', label: 'Mehr Feedback', description: 'als vorher' },
      { value: '100%', label: 'Transparenz', description: 'bei Erwartungen' }
    ],
    appFeatures: [
      'Ziele mobil tracken',
      'Feedback unterwegs geben',
      'Check-ins durchführen',
      'Erfolge teilen'
    ],
    faq: [
      {
        question: 'Welche Zielmethoden werden unterstützt?',
        answer: 'Wir unterstützen OKRs, MbO, SMART-Ziele und beliebige eigene Formate. Sie können auch verschiedene Methoden kombinieren.'
      },
      {
        question: 'Wie funktioniert das 360-Grad-Feedback?',
        answer: 'Mitarbeiter werden von Vorgesetzten, Kollegen, Mitarbeitern und sich selbst bewertet. Ergebnisse werden anonymisiert aggregiert.'
      },
      {
        question: 'Kann ich Entwicklungspläne erstellen?',
        answer: 'Ja, für jeden Mitarbeiter können individuelle Entwicklungspläne mit Maßnahmen, Zielen und Zeitplänen erstellt werden.'
      },
      {
        question: 'Gibt es eine Skill-Matrix?',
        answer: 'Ja, Sie können Skills definieren, bewerten und Gaps identifizieren. Die Matrix hilft bei der Planung von Weiterbildungen.'
      }
    ],
    relatedModules: ['mitarbeiterverwaltung', 'analytics', 'recruiting']
  },
  {
    slug: 'analytics',
    title: 'Analytics & Reports',
    subtitle: 'Dashboards & Reports',
    heroDescription: 'Treffen Sie datenbasierte Entscheidungen. Mit HR-Dashboards, Custom Reports und Trend-Analysen auf Knopfdruck.',
    heroBullets: [
      'Interaktive HR-Dashboards',
      'Custom Report Builder',
      'Trend-Analysen',
      'KPI-Tracking',
      'Automatische Reports'
    ],
    icon: BarChart3,
    benefits: [
      {
        title: 'Insights',
        description: 'Verstehen Sie Ihre HR-Daten und erkennen Sie Trends frühzeitig.',
        icon: '📊'
      },
      {
        title: 'Flexibilität',
        description: 'Erstellen Sie eigene Reports ohne IT-Unterstützung.',
        icon: '🔧'
      },
      {
        title: 'Automation',
        description: 'Reports werden automatisch generiert und versendet.',
        icon: '⚙️'
      }
    ],
    tabs: {
      mitarbeitende: {
        title: 'Für Mitarbeitende',
        description: 'Verfolgen Sie Ihre persönlichen Kennzahlen und Entwicklung.',
        bullets: [
          'Persönliche Statistiken',
          'Zeitkonto-Übersicht',
          'Urlaubshistorie',
          'Weiterbildungsfortschritt',
          'Ziel-Tracking'
        ]
      },
      vorgesetzte: {
        title: 'Für Vorgesetzte',
        description: 'Behalten Sie die wichtigsten Team-KPIs im Blick.',
        bullets: [
          'Team-Dashboard',
          'Abwesenheits-Übersicht',
          'Performance-Metriken',
          'Kapazitätsplanung',
          'Budget-Tracking'
        ]
      },
      administration: {
        title: 'Für HR & Administration',
        description: 'Nutzen Sie alle Daten für strategische Entscheidungen.',
        bullets: [
          'Unternehmensweite Dashboards',
          'Custom Reports erstellen',
          'Benchmarking',
          'Predictive Analytics',
          'Compliance-Reporting'
        ]
      }
    },
    stats: [
      { value: '50+', label: 'Standard-Reports', description: 'sofort verfügbar' },
      { value: '∞', label: 'Custom Reports', description: 'selbst erstellen' },
      { value: 'Real-time', label: 'Daten', description: 'immer aktuell' }
    ],
    appFeatures: [
      'Dashboards mobil',
      'KPIs auf einen Blick',
      'Alerts bei Abweichungen',
      'Reports teilen'
    ],
    faq: [
      {
        question: 'Welche Standard-Reports gibt es?',
        answer: 'Wir bieten über 50 Standard-Reports für Personalbestand, Fluktuation, Abwesenheiten, Kosten und viele weitere HR-Bereiche.'
      },
      {
        question: 'Kann ich eigene Reports erstellen?',
        answer: 'Ja, mit dem Report Builder können Sie ohne Programmierkenntnisse beliebige Reports aus allen verfügbaren Daten erstellen.'
      },
      {
        question: 'Können Reports automatisch versendet werden?',
        answer: 'Ja, Sie können Reports zeitgesteuert generieren und per E-Mail an definierte Empfänger versenden lassen.'
      },
      {
        question: 'Gibt es Benchmarking-Möglichkeiten?',
        answer: 'Ja, Sie können Ihre KPIs mit Branchendurchschnitten und Best Practices vergleichen (anonymisiert).'
      }
    ],
    relatedModules: ['mitarbeiterverwaltung', 'zeiterfassung', 'performance']
  },
  {
    slug: 'schichtplanung',
    title: 'Schichtplanung',
    subtitle: 'Dienstpläne & Einsatzplanung',
    heroDescription: 'Erstellen Sie Schicht- und Dienstpläne effizient. Mit automatischer Planung, Tauschbörse und Berücksichtigung aller Arbeitszeitregeln.',
    heroBullets: [
      'Automatische Schichtplanung',
      'Tauschbörse für Mitarbeiter',
      'Qualifikationsbasierte Planung',
      'ArbZG-konforme Prüfung',
      'Mobile Dienstplan-App'
    ],
    icon: CalendarClock,
    benefits: [
      {
        title: 'Automatisierung',
        description: 'KI erstellt optimale Dienstpläne unter Berücksichtigung aller Regeln.',
        icon: '🤖'
      },
      {
        title: 'Flexibilität',
        description: 'Mitarbeiter können Schichten tauschen und Wünsche angeben.',
        icon: '🔄'
      },
      {
        title: 'Compliance',
        description: 'Automatische Prüfung aller Arbeitszeitgesetze und Tarifverträge.',
        icon: '✅'
      }
    ],
    tabs: {
      mitarbeitende: {
        title: 'Für Mitarbeitende',
        description: 'Sehen Sie Ihren Dienstplan und tauschen Sie Schichten unkompliziert.',
        bullets: [
          'Dienstplan immer dabei',
          'Schichten tauschen',
          'Wünsche angeben',
          'Verfügbarkeit eintragen',
          'Push bei Änderungen'
        ]
      },
      vorgesetzte: {
        title: 'Für Vorgesetzte',
        description: 'Planen Sie Schichten effizient und reagieren Sie flexibel auf Änderungen.',
        bullets: [
          'Dienstpläne erstellen',
          'Tausche genehmigen',
          'Unterbesetzung erkennen',
          'Qualifikationen prüfen',
          'Überstunden vermeiden'
        ]
      },
      administration: {
        title: 'Für HR & Administration',
        description: 'Steuern Sie die Schichtplanung unternehmensweit und sichern Sie Compliance.',
        bullets: [
          'Schichtmodelle definieren',
          'Tarifverträge hinterlegen',
          'Compliance-Prüfung',
          'Auslastungsreports',
          'Kostenanalyse'
        ]
      }
    },
    stats: [
      { value: '70%', label: 'Weniger Planungszeit', description: 'durch Automatisierung' },
      { value: '100%', label: 'ArbZG-konform', description: 'automatische Prüfung' },
      { value: '0', label: 'Unterbesetzung', description: 'durch Frühwarnung' }
    ],
    appFeatures: [
      'Dienstplan mobil',
      'Schichten tauschen',
      'Verfügbarkeit melden',
      'Push bei Änderungen'
    ],
    faq: [
      {
        question: 'Wie funktioniert die automatische Schichtplanung?',
        answer: 'Die KI berücksichtigt Verfügbarkeiten, Qualifikationen, Arbeitszeitgesetze, Wünsche und historische Daten, um optimale Pläne zu erstellen.'
      },
      {
        question: 'Können Mitarbeiter Schichten tauschen?',
        answer: 'Ja, Mitarbeiter können in der Tauschbörse Schichten anbieten und übernehmen. Je nach Konfiguration mit oder ohne Genehmigung.'
      },
      {
        question: 'Werden Qualifikationen berücksichtigt?',
        answer: 'Ja, Sie können pro Schicht erforderliche Qualifikationen definieren. Das System stellt sicher, dass nur geeignete Mitarbeiter eingeplant werden.'
      },
      {
        question: 'Wie werden Arbeitszeitgesetze eingehalten?',
        answer: 'Das System prüft automatisch alle relevanten Vorgaben wie maximale Arbeitszeit, Ruhezeiten und Pausenregelungen und warnt bei Verstößen.'
      }
    ],
    relatedModules: ['zeiterfassung', 'urlaubsverwaltung', 'mitarbeiterverwaltung']
  }
];

export const getModuleBySlug = (slug: string): ModuleConfig | undefined => {
  return modules.find(m => m.slug === slug);
};

export const getRelatedModules = (slugs: string[]): ModuleConfig[] => {
  return slugs.map(slug => modules.find(m => m.slug === slug)).filter(Boolean) as ModuleConfig[];
};
