import React from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Mail, Phone, MapPin, Scale, FileText } from 'lucide-react';

export default function ImpressumPage() {
  return (
    <>
      <Helmet>
        <title>Impressum | MINUTE HR - Rechtliche Informationen</title>
        <meta name="description" content="Impressum und rechtliche Informationen der MINUTE HR Plattform gemäß § 5 TMG." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <LandingHeader />
        
        <main className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Impressum</h1>
            <p className="text-muted-foreground mb-12">
              Angaben gemäß § 5 TMG (Telemediengesetz)
            </p>

            <div className="space-y-8">
              {/* Anbieterkennung */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Building2 className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Anbieterkennung</h2>
                      <div className="space-y-2 text-muted-foreground">
                        <p className="font-medium text-foreground">MINUTE HR GmbH</p>
                        <p>Musterstraße 123</p>
                        <p>80331 München</p>
                        <p>Deutschland</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Kontakt */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Kontakt</h2>
                      <div className="space-y-2 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>Telefon: +49 89 123 456 789</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span>E-Mail: info@minute-hr.de</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>Web: www.minute-hr.de</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vertretungsberechtigte */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Scale className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Vertretungsberechtigte Geschäftsführer</h2>
                      <div className="space-y-2 text-muted-foreground">
                        <p>Max Mustermann (CEO)</p>
                        <p>Maria Musterfrau (COO)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Registereintrag */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <FileText className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Registereintrag</h2>
                      <div className="space-y-2 text-muted-foreground">
                        <p>Registergericht: Amtsgericht München</p>
                        <p>Registernummer: HRB 123456</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Umsatzsteuer-ID */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Umsatzsteuer-Identifikationsnummer</h2>
                  <p className="text-muted-foreground">
                    USt-IdNr. gemäß § 27a Umsatzsteuergesetz: DE123456789
                  </p>
                </CardContent>
              </Card>

              {/* Verantwortlicher für den Inhalt */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
                  </h2>
                  <div className="space-y-2 text-muted-foreground">
                    <p>Max Mustermann</p>
                    <p>MINUTE HR GmbH</p>
                    <p>Musterstraße 123</p>
                    <p>80331 München</p>
                  </div>
                </CardContent>
              </Card>

              {/* Streitschlichtung */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Streitschlichtung</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
                      <a 
                        href="https://ec.europa.eu/consumers/odr/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline ml-1"
                      >
                        https://ec.europa.eu/consumers/odr/
                      </a>
                    </p>
                    <p>Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
                    <p>
                      Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren 
                      vor einer Verbraucherschlichtungsstelle teilzunehmen.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Haftungsausschluss */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Haftung für Inhalte</h2>
                  <div className="space-y-4 text-muted-foreground text-sm">
                    <p>
                      Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen 
                      Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind 
                      wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte 
                      fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine 
                      rechtswidrige Tätigkeit hinweisen.
                    </p>
                    <p>
                      Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach 
                      den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung 
                      ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung 
                      möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese 
                      Inhalte umgehend entfernen.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Haftung für Links */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Haftung für Links</h2>
                  <div className="space-y-4 text-muted-foreground text-sm">
                    <p>
                      Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir 
                      keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine 
                      Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige 
                      Anbieter oder Betreiber der Seiten verantwortlich.
                    </p>
                    <p>
                      Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche 
                      Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der 
                      Verlinkung nicht erkennbar.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Urheberrecht */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Urheberrecht</h2>
                  <div className="space-y-4 text-muted-foreground text-sm">
                    <p>
                      Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten 
                      unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, 
                      Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes 
                      bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. 
                      Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen 
                      Gebrauch gestattet.
                    </p>
                    <p>
                      Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden 
                      die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche 
                      gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam 
                      werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von 
                      Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <p className="text-sm text-muted-foreground mt-12">
              Stand: Januar 2026
            </p>
          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  );
}
