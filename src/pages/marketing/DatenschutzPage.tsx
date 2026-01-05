import React from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';

export default function DatenschutzPage() {
  return (
    <>
      <Helmet>
        <title>Datenschutzerklärung | MINUTE HR</title>
        <meta name="description" content="Datenschutzerklärung der MINUTE HR Plattform gemäß DSGVO." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <LandingHeader />
        
        <main className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
            <h1>Datenschutzerklärung</h1>
            <p className="lead">
              Wir freuen uns über Ihr Interesse an unserer Plattform. Der Schutz Ihrer 
              personenbezogenen Daten ist uns ein wichtiges Anliegen.
            </p>

            <Card className="my-8">
              <CardContent className="p-6">
                <h2 className="mt-0">Inhaltsverzeichnis</h2>
                <ol className="text-sm">
                  <li><a href="#verantwortlicher">Verantwortlicher</a></li>
                  <li><a href="#datenerfassung">Datenerfassung auf dieser Website</a></li>
                  <li><a href="#rechte">Ihre Rechte</a></li>
                  <li><a href="#analyse">Analyse-Tools und Werbung</a></li>
                  <li><a href="#plugins">Plugins und Tools</a></li>
                  <li><a href="#hosting">Hosting und CDN</a></li>
                  <li><a href="#drittanbieter">Drittanbieter-Dienste</a></li>
                </ol>
              </CardContent>
            </Card>

            <section id="verantwortlicher">
              <h2>1. Verantwortlicher</h2>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <address className="not-italic">
                MINUTE HR GmbH<br />
                Musterstraße 123<br />
                80331 München<br />
                Deutschland<br /><br />
                Telefon: +49 89 123 456 789<br />
                E-Mail: datenschutz@minute-hr.de
              </address>
            </section>

            <section id="datenerfassung">
              <h2>2. Datenerfassung auf dieser Website</h2>
              
              <h3>2.1 Cookies</h3>
              <p>
                Unsere Internetseiten verwenden so genannte „Cookies". Cookies sind kleine 
                Datenpakete und richten auf Ihrem Endgerät keinen Schaden an. Sie werden 
                entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder 
                dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert.
              </p>

              <h3>2.2 Server-Log-Dateien</h3>
              <p>
                Der Provider der Seiten erhebt und speichert automatisch Informationen in 
                so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt:
              </p>
              <ul>
                <li>Browsertyp und Browserversion</li>
                <li>verwendetes Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Hostname des zugreifenden Rechners</li>
                <li>Uhrzeit der Serveranfrage</li>
                <li>IP-Adresse</li>
              </ul>
              <p>
                Diese Daten werden nicht mit anderen Datenquellen zusammengeführt. 
                Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
              </p>

              <h3>2.3 Kontaktformular</h3>
              <p>
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben 
                aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten 
                zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns 
                gespeichert.
              </p>

              <h3>2.4 Registrierung und Nutzerkonto</h3>
              <p>
                Bei der Registrierung für die Nutzung unserer Plattform erheben wir folgende Daten:
              </p>
              <ul>
                <li>E-Mail-Adresse</li>
                <li>Vor- und Nachname</li>
                <li>Unternehmensinformationen</li>
                <li>Passwort (verschlüsselt gespeichert)</li>
              </ul>
              <p>
                Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO 
                (Vertragserfüllung) und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).
              </p>
            </section>

            <section id="rechte">
              <h2>3. Ihre Rechte</h2>
              <p>Sie haben folgende Rechte hinsichtlich Ihrer bei uns gespeicherten Daten:</p>
              
              <h3>3.1 Auskunftsrecht</h3>
              <p>
                Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob personenbezogene 
                Daten verarbeitet werden und Auskunft über diese Daten zu erhalten.
              </p>

              <h3>3.2 Recht auf Berichtigung</h3>
              <p>
                Sie haben das Recht, unrichtige Daten berichtigen oder unvollständige Daten 
                vervollständigen zu lassen.
              </p>

              <h3>3.3 Recht auf Löschung</h3>
              <p>
                Sie haben das Recht, die Löschung Ihrer personenbezogenen Daten zu verlangen, 
                sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
              </p>

              <h3>3.4 Recht auf Einschränkung der Verarbeitung</h3>
              <p>
                Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer Daten zu verlangen.
              </p>

              <h3>3.5 Recht auf Datenübertragbarkeit</h3>
              <p>
                Sie haben das Recht, die Sie betreffenden Daten in einem strukturierten, 
                gängigen und maschinenlesbaren Format zu erhalten.
              </p>

              <h3>3.6 Widerspruchsrecht</h3>
              <p>
                Sie haben das Recht, jederzeit gegen die Verarbeitung Ihrer Daten Widerspruch 
                einzulegen.
              </p>

              <h3>3.7 Beschwerderecht</h3>
              <p>
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
              </p>
            </section>

            <section id="analyse">
              <h2>4. Analyse-Tools und Werbung</h2>
              <p>
                Wir nutzen Analyse-Tools zur statistischen Auswertung der Besucherzugriffe. 
                Die Verarbeitung erfolgt auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO).
              </p>
            </section>

            <section id="plugins">
              <h2>5. Plugins und Tools</h2>
              
              <h3>5.1 Google Fonts (lokal)</h3>
              <p>
                Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten so genannte 
                Google Fonts, die lokal installiert sind. Eine Verbindung zu Servern von 
                Google findet dabei nicht statt.
              </p>
            </section>

            <section id="hosting">
              <h2>6. Hosting und CDN</h2>
              
              <h3>6.1 Supabase</h3>
              <p>
                Wir nutzen Supabase als Backend-Dienst für Authentifizierung, Datenbank und 
                Dateispeicherung. Supabase Inc. hat seinen Sitz in den USA. Wir haben einen 
                Auftragsverarbeitungsvertrag (AVV) mit Supabase geschlossen.
              </p>
              <p>
                Weitere Informationen: 
                <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                  https://supabase.com/privacy
                </a>
              </p>
            </section>

            <section id="drittanbieter">
              <h2>7. Drittanbieter-Dienste</h2>
              
              <h3>7.1 Resend (E-Mail-Dienst)</h3>
              <p>
                Für den Versand von E-Mails nutzen wir den Dienst Resend. Dabei werden 
                E-Mail-Adressen und Nachrichteninhalte an Resend übermittelt.
              </p>
              <p>
                Weitere Informationen: 
                <a href="https://resend.com/privacy" target="_blank" rel="noopener noreferrer">
                  https://resend.com/privacy
                </a>
              </p>

              <h3>7.2 Stripe (Zahlungsabwicklung)</h3>
              <p>
                Für die Zahlungsabwicklung nutzen wir den Dienst Stripe. Bei der Bezahlung 
                werden Ihre Zahlungsdaten direkt an Stripe übermittelt. Stripe ist PCI DSS 
                zertifiziert und speichert Ihre Zahlungsdaten sicher.
              </p>
              <p>
                Weitere Informationen: 
                <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer">
                  https://stripe.com/de/privacy
                </a>
              </p>
            </section>

            <section>
              <h2>8. Datensicherheit</h2>
              <p>
                Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL-Verfahren 
                (Secure Socket Layer) in Verbindung mit der jeweils höchsten 
                Verschlüsselungsstufe, die von Ihrem Browser unterstützt wird. 
                Alle Daten werden verschlüsselt übertragen.
              </p>
            </section>

            <section>
              <h2>9. Aufbewahrungsdauer</h2>
              <p>
                Personenbezogene Daten werden nur so lange gespeichert, wie es für die 
                Zwecke, für die sie verarbeitet werden, erforderlich ist oder sofern 
                dies gesetzlich vorgesehen ist.
              </p>
              <ul>
                <li>Vertragsunterlagen: 10 Jahre (gem. § 257 HGB, § 147 AO)</li>
                <li>Rechnungen: 10 Jahre (gem. § 14b UStG)</li>
                <li>Log-Dateien: 7 Tage</li>
                <li>Nutzerkonto-Daten: Bis zur Löschung des Kontos</li>
              </ul>
            </section>

            <section>
              <h2>10. Änderungen dieser Datenschutzerklärung</h2>
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie 
                stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen 
                unserer Leistungen umzusetzen.
              </p>
            </section>

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
