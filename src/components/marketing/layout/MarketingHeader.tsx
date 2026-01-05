import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { MegaMenu } from '@/components/marketing/MegaMenu';
import minuteWordmark from '@/assets/minute-wordmark.png';

const MarketingHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { href: '/loesungen', label: t.nav.solutions },
    { href: '/preise', label: t.nav.pricing },
    { href: '/blog', label: t.nav.blog },
    { href: '/ueber-uns', label: t.nav.about },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const toggleLanguage = () => {
    setLanguage(language === 'de' ? 'en' : 'de');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={minuteWordmark} 
              alt="Minute HR" 
              className="h-8 md:h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {/* MegaMenu for Funktionen */}
            <MegaMenu />
            
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              {language.toUpperCase()}
            </button>
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">
                {t.nav.login}
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {t.nav.demo}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-border">
          <nav className="px-4 py-4 space-y-2">
            <Link
              to="/funktionen"
              onClick={() => setIsMenuOpen(false)}
              className={`block py-2 text-base font-medium transition-colors ${
                isActive('/funktionen') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {t.nav.features}
            </Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block py-2 text-base font-medium transition-colors ${
                  isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-border space-y-2">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 py-2 text-base font-medium text-muted-foreground"
              >
                <Globe className="h-5 w-5" />
                {language === 'de' ? 'English' : 'Deutsch'}
              </button>
              <Link
                to="/auth/login"
                onClick={() => setIsMenuOpen(false)}
                className="block py-2 text-base font-medium text-muted-foreground"
              >
                {t.nav.login}
              </Link>
              <Link
                to="/auth/register"
                onClick={() => setIsMenuOpen(false)}
              >
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  {t.nav.demo}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default MarketingHeader;
