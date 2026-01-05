import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Linkedin, 
  Twitter, 
  Youtube, 
  Instagram,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

// Use Link for internal routes

export const LandingFooter = () => {
  const footerLinks = {
    produkt: [
      { label: 'Funktionen', href: '#funktionen' },
      { label: 'Preise', href: '#preise' },
      { label: 'Integrationen', href: '#integrationen' },
      { label: 'API', href: '#api' },
      { label: 'Updates', href: '#updates' },
    ],
    loesungen: [
      { label: 'Startups', href: '#startups' },
      { label: 'Mittelstand', href: '#mittelstand' },
      { label: 'Enterprise', href: '#enterprise' },
      { label: 'Branchen', href: '#branchen' },
    ],
    ressourcen: [
      { label: 'Blog', href: '#blog' },
      { label: 'Webinare', href: '#webinare' },
      { label: 'E-Books', href: '#ebooks' },
      { label: 'Hilfe-Center', href: '#hilfe' },
      { label: 'Status', href: '#status' },
    ],
    unternehmen: [
      { label: 'Über uns', href: '#ueber-uns' },
      { label: 'Karriere', href: '#karriere' },
      { label: 'Partner', href: '#partner' },
      { label: 'Presse', href: '#presse' },
      { label: 'Kontakt', href: '#kontakt' },
    ],
    legal: [
      { label: 'Impressum', href: '/impressum' },
      { label: 'Datenschutz', href: '/datenschutz' },
      { label: 'AGB', href: '/agb' },
      { label: 'Cookie-Einstellungen', href: '#cookies' },
    ],
  };

  const socialLinks = [
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  ];

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <img 
              src="/lovable-uploads/109213da-2fd7-4b1e-b340-3e4b70a942a2.png" 
              alt="MINUTE" 
              className="h-8 mb-4 invert"
            />
            <p className="text-sm text-background/70 mb-6">
              Die intelligente HR-Plattform für moderne Unternehmen.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/60 hover:text-background transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Produkt</h4>
            <ul className="space-y-3">
              {footerLinks.produkt.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-semibold mb-4">Lösungen</h4>
            <ul className="space-y-3">
              {footerLinks.loesungen.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Ressourcen</h4>
            <ul className="space-y-3">
              {footerLinks.ressourcen.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Unternehmen</h4>
            <ul className="space-y-3">
              {footerLinks.unternehmen.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-background/70 hover:text-background transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 pt-8 border-t border-background/10">
          <div className="grid md:grid-cols-3 gap-4 text-sm text-background/70">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Musterstraße 123, 80331 München</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>+49 89 123 456 789</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>info@minute-hr.de</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-background/60">
              © {new Date().getFullYear()} MINUTE HR. Alle Rechte vorbehalten.
            </p>
            <div className="flex flex-wrap gap-6">
              {footerLinks.legal.map((link, index) => (
                link.href.startsWith('/') ? (
                  <Link
                    key={index}
                    to={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={index}
                    href={link.href}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </a>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
