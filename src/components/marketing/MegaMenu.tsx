import { useState } from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Users,
  Clock,
  Calendar,
  CreditCard,
  UserPlus,
  ClipboardCheck,
  Target,
  BarChart3,
  CalendarClock,
  ArrowRight,
} from "lucide-react";

// Categories for the mega menu
const categories = [
  {
    id: "personal",
    name: "Personal",
    description: "Mitarbeiter verwalten",
    color: "bg-blue-500",
  },
  {
    id: "zeit",
    name: "Zeit & Abwesenheit",
    description: "Arbeitszeiten erfassen",
    color: "bg-green-500",
  },
  {
    id: "finanzen",
    name: "Finanzen",
    description: "Gehälter abrechnen",
    color: "bg-amber-500",
  },
  {
    id: "recruiting",
    name: "Recruiting & Entwicklung",
    description: "Talente finden & fördern",
    color: "bg-purple-500",
  },
];

const features = [
  {
    title: "Mitarbeiterverwaltung",
    description: "Digitale Personalakte & Organigramm",
    icon: Users,
    href: "/funktionen/mitarbeiterverwaltung",
    category: "personal",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    title: "Zeiterfassung",
    description: "Mobile Stempeluhr & Projektzeiten",
    icon: Clock,
    href: "/funktionen/zeiterfassung",
    category: "zeit",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    title: "Urlaubsverwaltung",
    description: "Anträge & Abwesenheitskalender",
    icon: Calendar,
    href: "/funktionen/urlaubsverwaltung",
    category: "zeit",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    title: "Schichtplanung",
    description: "Dienstpläne & Einsatzplanung",
    icon: CalendarClock,
    href: "/funktionen/schichtplanung",
    category: "zeit",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    title: "Lohnabrechnung",
    description: "Gehaltsberechnung & Export",
    icon: CreditCard,
    href: "/funktionen/lohnabrechnung",
    category: "finanzen",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    title: "Recruiting",
    description: "Stellenausschreibungen & Bewerbungen",
    icon: UserPlus,
    href: "/funktionen/recruiting",
    category: "recruiting",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    title: "Onboarding",
    description: "Checklisten & Workflows",
    icon: ClipboardCheck,
    href: "/funktionen/onboarding",
    category: "recruiting",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    title: "Performance",
    description: "Ziele & 360°-Feedback",
    icon: Target,
    href: "/funktionen/performance",
    category: "recruiting",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    title: "Analytics",
    description: "Dashboards & Reports",
    icon: BarChart3,
    href: "/funktionen/analytics",
    category: "personal",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
];

export const MegaMenu = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredFeatures = activeCategory
    ? features.filter((f) => f.category === activeCategory)
    : features;

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent hover:bg-muted/50 data-[state=open]:bg-muted/50">
            Funktionen
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="flex w-[800px]">
              {/* Left sidebar - Categories */}
              <div className="w-56 bg-slate-50 p-4 border-r border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Kategorien
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeCategory === null
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    Alle Module
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        activeCategory === category.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${category.color}`} />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <p className={`text-xs mt-0.5 ml-4 ${
                        activeCategory === category.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}>
                        {category.description}
                      </p>
                    </button>
                  ))}
                </div>

                {/* All features link */}
                <div className="mt-4 pt-4 border-t border-border">
                  <Link
                    to="/funktionen"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:underline"
                  >
                    Alle Funktionen
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Right side - Features grid */}
              <div className="flex-1 p-4">
                <div className="grid grid-cols-2 gap-2">
                  {filteredFeatures.map((feature) => (
                    <NavigationMenuLink key={feature.title} asChild>
                      <Link
                        to={feature.href}
                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted transition-all group"
                      >
                        <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <feature.icon className={`h-5 w-5 ${feature.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                            {feature.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {feature.description}
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </div>

                {/* CTA Banner */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        Kostenlos starten
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        14 Tage testen – keine Kreditkarte nötig
                      </p>
                    </div>
                    <Link
                      to="/auth/register"
                      className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Jetzt testen
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
