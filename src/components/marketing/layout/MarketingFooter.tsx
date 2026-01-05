import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import minuteWordmark from '@/assets/minute-wordmark.png';

const MarketingFooter: React.FC = () => {
  const { t } = useLanguage();

  const footerLinks = {
    product: [
      { label: t.nav.features, href: '/funktionen' },
      { label: t.nav.pricing, href: '/preise' },
      { label: 'Zeiterfassung', href: '/funktionen/zeiterfassung' },
      { label: 'Urlaubsverwaltung', href: '/funktionen/urlaubsverwaltung' },
      { label: 'Lohnabrechnung', href: '/funktionen/lohnabrechnung' },
      { label: 'Schichtplanung', href: '/funktionen/schichtplanung' },
    ],
    solutions: [
      { label: 'Für HR-Manager', href: '/loesungen#hr-manager' },
      { label: 'Für Teamleiter', href: '/loesungen#teamleiter' },
      { label: 'Für Mitarbeiter', href: '/loesungen#mitarbeiter' },
      { label: 'Für KMU', href: '/loesungen#kmu' },
      { label: 'Für Enterprise', href: '/loesungen#enterprise' },
    ],
    resources: [
      { label: t.nav.blog, href: '/blog' },
      { label: 'Hilfe-Center', href: '/hilfe' },
      { label: 'API Dokumentation', href: '/api-docs' },
      { label: 'Webinare', href: '/webinare' },
    ],
    company: [
      { label: t.nav.about, href: '/ueber-uns' },
      { label: 'Karriere', href: '/karriere' },
      { label: t.footer.contact, href: '/kontakt' },
      { label: 'Presse', href: '/presse' },
    ],
  };

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <img 
              src={minuteWordmark} 
              alt="Minute HR" 
              className="h-8 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-slate-400 text-sm leading-relaxed">
              Die All-in-One HR-Plattform für modernes Personalmanagement.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
              {t.footer.product}
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
              {t.footer.solutions}
            </h4>
            <ul className="space-y-3">
              {footerLinks.solutions.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
              {t.footer.resources}
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">
              {t.footer.company}
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            {t.footer.copyright}
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/datenschutz"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              {t.footer.privacy}
            </Link>
            <Link
              to="/agb"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              {t.footer.terms}
            </Link>
            <Link
              to="/impressum"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              {t.footer.imprint}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MarketingFooter;
