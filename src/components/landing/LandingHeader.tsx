import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Menu, X, ChevronRight, Clock, CalendarDays, Users, FileText, Target, FolderOpen, Building2, Rocket, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuCategory {
  id: string;
  title: string;
  items: {
    title: string;
    description: string;
    href: string;
    icon: React.ReactNode;
  }[];
}

export const LandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('zeitmanagement');
  const [activeSolutionCategory, setActiveSolutionCategory] = useState<string>('unternehmen');
  const navigate = useNavigate();

  const funktionenCategories: MenuCategory[] = [
    {
      id: 'zeitmanagement',
      title: 'Zeitmanagement',
      items: [
        { title: 'Abwesenheiten', description: 'Verwalten Sie Abwesenheiten und Urlaubsanträge Ihrer Mitarbeiter.', href: '#abwesenheit', icon: <CalendarDays className="h-5 w-5 text-muted-foreground" /> },
        { title: 'Zeiterfassung', description: 'Erfassen Sie die Arbeitszeiten Ihrer Mitarbeiter und steigern Sie die Produktivität.', href: '#zeiterfassung', icon: <Clock className="h-5 w-5 text-muted-foreground" /> },
        { title: 'Schichtplanung', description: 'Planen Sie die Schichten Ihrer Mitarbeiter.', href: '#schichtplanung', icon: <CalendarDays className="h-5 w-5 text-muted-foreground" /> },
        { title: 'Projektzeiterfassung', description: 'Sichern Sie eine effiziente Planung, Kontrolle und Verrechnung von Projekten.', href: '#projektzeiterfassung', icon: <FileText className="h-5 w-5 text-muted-foreground" /> },
      ],
    },
    {
      id: 'talentmanagement',
      title: 'Talentmanagement',
      items: [
        { title: 'Recruiting', description: 'Bewerbermanagement der nächsten Generation.', href: '#recruiting', icon: <Users className="h-5 w-5 text-muted-foreground" /> },
        { title: 'Onboarding', description: 'Neue Mitarbeiter erfolgreich einarbeiten.', href: '#onboarding', icon: <Rocket className="h-5 w-5 text-muted-foreground" /> },
        { title: 'Performance', description: 'Mitarbeiterentwicklung und Feedback.', href: '#performance', icon: <Target className="h-5 w-5 text-muted-foreground" /> },
      ],
    },
    {
      id: 'gehaltsabrechnung',
      title: 'Gehaltsabrechnung',
      items: [
        { title: 'Lohnabrechnung', description: 'Integrierte Gehaltsabrechnung für alle Mitarbeiter.', href: '#lohnabrechnung', icon: <FileText className="h-5 w-5 text-muted-foreground" /> },
        { title: 'Lohnexport', description: 'Nahtlose Integration mit DATEV und anderen Systemen.', href: '#lohnexport', icon: <FolderOpen className="h-5 w-5 text-muted-foreground" /> },
      ],
    },
    {
      id: 'dokumentenverwaltung',
      title: 'Dokumentenverwaltung',
      items: [
        { title: 'Digitale Personalakte', description: 'Alle Dokumente an einem Ort.', href: '#dokumente', icon: <FolderOpen className="h-5 w-5 text-muted-foreground" /> },
        { title: 'Vertragsmanagement', description: 'Verträge digital verwalten und unterschreiben.', href: '#vertraege', icon: <FileText className="h-5 w-5 text-muted-foreground" /> },
      ],
    },
  ];

  const loesungenCategories: MenuCategory[] = [
    {
      id: 'unternehmen',
      title: 'Nach Unternehmensgröße',
      items: [
        { title: 'Startups', description: 'Schnell wachsen mit schlanken HR-Prozessen.', href: '#startups', icon: <Rocket className="h-5 w-5 text-muted-foreground" /> },
        { title: 'Mittelstand', description: 'Skalierbare Lösungen für Ihr Wachstum.', href: '#mittelstand', icon: <Building2 className="h-5 w-5 text-muted-foreground" /> },
        { title: 'Enterprise', description: 'Komplexe Anforderungen meistern.', href: '#enterprise', icon: <Building className="h-5 w-5 text-muted-foreground" /> },
      ],
    },
    {
      id: 'branchen',
      title: 'Nach Branche',
      items: [
        { title: 'IT & Tech', description: 'Moderne HR-Lösungen für Tech-Unternehmen.', href: '#it', icon: <Building2 className="h-5 w-5 text-muted-foreground" /> },
        { title: 'Handel & Retail', description: 'Flexible Schichtplanung und Zeiterfassung.', href: '#handel', icon: <Building2 className="h-5 w-5 text-muted-foreground" /> },
        { title: 'Produktion', description: 'Effiziente Prozesse für produzierende Unternehmen.', href: '#produktion', icon: <Building2 className="h-5 w-5 text-muted-foreground" /> },
      ],
    },
  ];

  const activeItems = funktionenCategories.find(c => c.id === activeCategory)?.items || [];
  const activeSolutionItems = loesungenCategories.find(c => c.id === activeSolutionCategory)?.items || [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/109213da-2fd7-4b1e-b340-3e4b70a942a2.png" 
            alt="MINUTE" 
            className="h-8"
          />
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden lg:flex">
          <NavigationMenuList>
            {/* Funktionen Mega Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent">Produkt</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="flex w-[800px]">
                  {/* Left column - Categories */}
                  <div className="w-[280px] border-r border-border bg-muted/30 p-4">
                    <ul className="space-y-1">
                      {funktionenCategories.map((category) => (
                        <li key={category.id}>
                          <button
                            onMouseEnter={() => setActiveCategory(category.id)}
                            className={cn(
                              "w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                              activeCategory === category.id
                                ? "bg-background text-primary shadow-sm"
                                : "text-foreground hover:bg-background/50"
                            )}
                          >
                            {category.title}
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Right column - Items */}
                  <div className="flex-1 p-6">
                    <ul className="space-y-4">
                      {activeItems.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <a
                              href={item.href}
                              className="flex items-start gap-4 rounded-md p-3 transition-colors hover:bg-accent"
                            >
                              <div className="mt-0.5">{item.icon}</div>
                              <div>
                                <div className="text-sm font-medium leading-none mb-1">{item.title}</div>
                                <p className="text-sm text-muted-foreground leading-snug">
                                  {item.description}
                                </p>
                              </div>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 pt-4 border-t border-border">
                      <a href="#alle-funktionen" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                        Mehr zu {funktionenCategories.find(c => c.id === activeCategory)?.title}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Lösungen Mega Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent">Lösungen</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="flex w-[700px]">
                  {/* Left column - Categories */}
                  <div className="w-[240px] border-r border-border bg-muted/30 p-4">
                    <ul className="space-y-1">
                      {loesungenCategories.map((category) => (
                        <li key={category.id}>
                          <button
                            onMouseEnter={() => setActiveSolutionCategory(category.id)}
                            className={cn(
                              "w-full flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                              activeSolutionCategory === category.id
                                ? "bg-background text-primary shadow-sm"
                                : "text-foreground hover:bg-background/50"
                            )}
                          >
                            {category.title}
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Right column - Items */}
                  <div className="flex-1 p-6">
                    <ul className="space-y-4">
                      {activeSolutionItems.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <a
                              href={item.href}
                              className="flex items-start gap-4 rounded-md p-3 transition-colors hover:bg-accent"
                            >
                              <div className="mt-0.5">{item.icon}</div>
                              <div>
                                <div className="text-sm font-medium leading-none mb-1">{item.title}</div>
                                <p className="text-sm text-muted-foreground leading-snug">
                                  {item.description}
                                </p>
                              </div>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link to="#preise" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
                Preise
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="#ueber-uns" className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
                Über uns
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/auth/login')}>
            Login
          </Button>
          <Button onClick={() => navigate('/signup')} className="bg-primary hover:bg-primary/90">
            Kostenlos starten
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <div className="container py-4 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Produkt</p>
              {funktionenCategories.map((category) => (
                <div key={category.id} className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground/70 pt-2">{category.title}</p>
                  {category.items.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      className="block py-2 text-sm hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Lösungen</p>
              {loesungenCategories.map((category) => (
                <div key={category.id} className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground/70 pt-2">{category.title}</p>
                  {category.items.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      className="block py-2 text-sm hover:text-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              ))}
            </div>
            <a href="#preise" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              Preise
            </a>
            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full" onClick={() => navigate('/auth/login')}>
                Login
              </Button>
              <Button className="w-full" onClick={() => navigate('/signup')}>
                Kostenlos starten
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};