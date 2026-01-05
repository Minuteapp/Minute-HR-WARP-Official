import React from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';

export default function AGBPage() {
  return (
    <>
      <Helmet>
        <title>Allgemeine Geschäftsbedingungen | MINUTE HR</title>
        <meta name="description" content="Allgemeine Geschäftsbedingungen (AGB) für die Nutzung der MINUTE HR Plattform." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <LandingHeader />
        
        <main className="container py-16 md:py-24">
          <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
            <h1>Allgemeine Geschäftsbedingungen</h1>
            <p className="lead">
              Diese Allgemeinen Geschäftsbedingungen regeln die Nutzung der MINUTE HR 
              Software-as-a-Service Plattform.
            </p>

            <Card className="my-8">
              <CardContent className="p-6">
                <h2 className="mt-0">Inhaltsverzeichnis</h2>
                <ol className="text-sm">
                  <li><a href="#geltungsbereich">Geltungsbereich</a></li>
                  <li><a href="#vertragsgegenstand">Vertragsgegenstand</a></li>
                  <li><a href="#vertragsschluss">Vertragsschluss und Testphase</a></li>
                  <li><a href="#nutzungsrechte">Nutzungsrechte</a></li>
                  <li><a href="#pflichten">Pflichten des Kunden</a></li>
                  <li><a href="#preise">Preise und Zahlung</a></li>
                  <li><a href="#laufzeit">Laufzeit und Kündigung</a></li>
                  <li><a href="#gewaehrleistung">Gewährleistung und Haftung</a></li>
                  <li><a href="#datenschutz">Datenschutz</a></li>
                  <li><a href="#schlussbestimmungen">Schlussbestimmungen</a></li>
                </ol>
              </CardContent>
            </Card>

            <section id="geltungsbereich">
              <h2>§ 1 Geltungsbereich</h2>
              <p>
                (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle 
                Verträge zwischen der MINUTE HR GmbH, Musterstraße 123, 80331 München 
                (nachfolgend „Anbieter") und dem Kunden über die Nutzung der MINUTE HR 
                Software-as-a-Service Plattform (nachfolgend „Plattform").
              </p>
              <p>
                (2) Abweichende, entgegenstehende oder ergänzende AGB des Kunden werden nur 
                dann Vertragsbestandteil, wenn der Anbieter ihrer Geltung ausdrücklich 
                schriftlich zugestimmt hat.
              </p>
              <p>
                (3) Die Plattform richtet sich ausschließlich an Unternehmer im Sinne des 
                § 14 BGB.
              </p>
            </section>

            <section id="vertragsgegenstand">
              <h2>§ 2 Vertragsgegenstand</h2>
              <p>
                (1) Der Anbieter stellt dem Kunden die MINUTE HR Plattform als 
                Software-as-a-Service (SaaS) über das Internet zur Verfügung.
              </p>
              <p>
                (2) Die Plattform umfasst folgende Module und Funktionen:
              </p>
              <ul>
                <li>Personalverwaltung und Mitarbeiterdatenbank</li>
                <li>Zeiterfassung und Arbeitszeitmanagement</li>
                <li>Abwesenheits- und Urlaubsverwaltung</li>
                <li>Lohnbuchhaltungs-Schnittstellen</li>
                <li>Recruiting und Bewerbermanagement</li>
                <li>Dokumentenmanagement</li>
                <li>Reporting und Analytics</li>
                <li>KI-gestützte HR-Assistenz</li>
              </ul>
              <p>
                (3) Der genaue Leistungsumfang richtet sich nach dem vom Kunden gewählten 
                Tarif (Starter, Professional, Enterprise).
              </p>
              <p>
                (4) Der Anbieter ist berechtigt, die Plattform weiterzuentwickeln und zu 
                verbessern, solange die wesentlichen Funktionen erhalten bleiben.
              </p>
            </section>

            <section id="vertragsschluss">
              <h2>§ 3 Vertragsschluss und Testphase</h2>
              <p>
                (1) Die Darstellung der Plattform auf der Website stellt kein verbindliches 
                Angebot dar, sondern eine Aufforderung zur Abgabe eines Angebots.
              </p>
              <p>
                (2) Der Kunde gibt durch Abschluss des Registrierungsprozesses ein 
                verbindliches Angebot zum Vertragsschluss ab.
              </p>
              <p>
                (3) Der Vertrag kommt durch Freischaltung des Kundenkontos oder durch 
                ausdrückliche Annahme zustande.
              </p>
              <p>
                (4) Neukunden erhalten eine kostenlose Testphase von 14 Tagen. Nach Ablauf 
                der Testphase geht das Abonnement automatisch in ein kostenpflichtiges 
                Abonnement über, sofern der Kunde nicht vorher kündigt.
              </p>
              <p>
                (5) Die Testphase kann nur einmal pro Unternehmen in Anspruch genommen werden.
              </p>
            </section>

            <section id="nutzungsrechte">
              <h2>§ 4 Nutzungsrechte</h2>
              <p>
                (1) Der Anbieter räumt dem Kunden für die Dauer des Vertragsverhältnisses 
                ein einfaches, nicht übertragbares, nicht unterlizenzierbares Recht ein, 
                die Plattform bestimmungsgemäß zu nutzen.
              </p>
              <p>
                (2) Der Kunde darf die Plattform nur für eigene betriebliche Zwecke nutzen. 
                Eine kommerzielle Weitervermietung oder Unterlizenzierung ist nicht gestattet.
              </p>
              <p>
                (3) Der Kunde ist berechtigt, seinen Mitarbeitern Zugang zur Plattform zu 
                gewähren. Die Anzahl der zugelassenen Nutzer richtet sich nach dem 
                gewählten Tarif.
              </p>
              <p>
                (4) Eine Dekompilierung, Reverse Engineering oder sonstige Bearbeitung der 
                Software ist nicht gestattet.
              </p>
            </section>

            <section id="pflichten">
              <h2>§ 5 Pflichten des Kunden</h2>
              <p>
                (1) Der Kunde ist verpflichtet, seine Zugangsdaten geheim zu halten und vor 
                dem Zugriff Dritter zu schützen.
              </p>
              <p>
                (2) Der Kunde haftet für sämtliche Aktivitäten, die unter seinem Konto 
                vorgenommen werden.
              </p>
              <p>
                (3) Der Kunde ist verpflichtet, die Plattform nicht missbräuchlich zu nutzen, 
                insbesondere:
              </p>
              <ul>
                <li>Keine rechtswidrigen Inhalte hochzuladen</li>
                <li>Keine Schadsoftware einzuschleusen</li>
                <li>Die Plattform nicht zu überlasten</li>
                <li>Keine Sicherheitsmaßnahmen zu umgehen</li>
              </ul>
              <p>
                (4) Der Kunde ist für die Rechtmäßigkeit der von ihm eingegebenen Daten 
                verantwortlich, insbesondere für die Einhaltung datenschutzrechtlicher 
                Bestimmungen.
              </p>
            </section>

            <section id="preise">
              <h2>§ 6 Preise und Zahlung</h2>
              <p>
                (1) Die Vergütung richtet sich nach der bei Vertragsschluss gültigen 
                Preisliste bzw. dem individuell vereinbarten Angebot.
              </p>
              <p>
                (2) Alle Preise verstehen sich zuzüglich der gesetzlichen Umsatzsteuer.
              </p>
              <p>
                (3) Die Vergütung ist monatlich oder jährlich im Voraus zu zahlen, 
                je nach gewähltem Abrechnungszeitraum.
              </p>
              <p>
                (4) Bei jährlicher Zahlung gewährt der Anbieter einen Rabatt von 20% 
                gegenüber der monatlichen Zahlung.
              </p>
              <p>
                (5) Die Zahlung erfolgt per Kreditkarte, SEPA-Lastschrift oder Rechnung 
                (nur bei Enterprise-Tarifen).
              </p>
              <p>
                (6) Bei Zahlungsverzug ist der Anbieter berechtigt, den Zugang zur 
                Plattform vorübergehend zu sperren.
              </p>
            </section>

            <section id="laufzeit">
              <h2>§ 7 Laufzeit und Kündigung</h2>
              <p>
                (1) Der Vertrag wird auf unbestimmte Zeit geschlossen.
              </p>
              <p>
                (2) Bei monatlicher Abrechnung kann der Vertrag mit einer Frist von 
                30 Tagen zum Monatsende gekündigt werden.
              </p>
              <p>
                (3) Bei jährlicher Abrechnung kann der Vertrag mit einer Frist von 
                30 Tagen zum Ende des Vertragsjahres gekündigt werden.
              </p>
              <p>
                (4) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt 
                unberührt.
              </p>
              <p>
                (5) Die Kündigung bedarf der Textform und kann über die Plattform, per 
                E-Mail oder per Post erfolgen.
              </p>
              <p>
                (6) Nach Vertragsende hat der Kunde 30 Tage Zeit, seine Daten zu exportieren. 
                Danach werden die Daten unwiderruflich gelöscht.
              </p>
            </section>

            <section id="gewaehrleistung">
              <h2>§ 8 Gewährleistung und Haftung</h2>
              <p>
                (1) Der Anbieter gewährleistet eine Verfügbarkeit der Plattform von 99,5% 
                im Jahresmittel, ausgenommen geplante Wartungsarbeiten und höhere Gewalt.
              </p>
              <p>
                (2) Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit 
                sowie bei Verletzung von Leben, Körper oder Gesundheit.
              </p>
              <p>
                (3) Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung 
                wesentlicher Vertragspflichten. Die Haftung ist in diesem Fall auf den 
                vertragstypischen, vorhersehbaren Schaden begrenzt.
              </p>
              <p>
                (4) Die Haftung für Datenverlust wird auf den typischen 
                Wiederherstellungsaufwand beschränkt.
              </p>
              <p>
                (5) Der Anbieter haftet nicht für Schäden, die durch eine missbräuchliche 
                oder vertragswidrige Nutzung der Plattform entstehen.
              </p>
            </section>

            <section id="datenschutz">
              <h2>§ 9 Datenschutz</h2>
              <p>
                (1) Die Verarbeitung personenbezogener Daten erfolgt gemäß der 
                Datenschutzgrundverordnung (DSGVO) und dem Bundesdatenschutzgesetz (BDSG).
              </p>
              <p>
                (2) Soweit der Anbieter personenbezogene Daten im Auftrag des Kunden 
                verarbeitet, wird ein separater Auftragsverarbeitungsvertrag (AVV) 
                geschlossen.
              </p>
              <p>
                (3) Einzelheiten zur Datenverarbeitung sind in der Datenschutzerklärung 
                geregelt.
              </p>
            </section>

            <section id="schlussbestimmungen">
              <h2>§ 10 Schlussbestimmungen</h2>
              <p>
                (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss 
                des UN-Kaufrechts.
              </p>
              <p>
                (2) Erfüllungsort und ausschließlicher Gerichtsstand für alle 
                Streitigkeiten aus diesem Vertrag ist München.
              </p>
              <p>
                (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, 
                bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An die Stelle 
                der unwirksamen Bestimmung tritt eine wirksame Bestimmung, die dem 
                wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.
              </p>
              <p>
                (4) Änderungen dieser AGB werden dem Kunden mindestens 30 Tage vor 
                Inkrafttreten in Textform mitgeteilt. Widerspricht der Kunde nicht 
                innerhalb von 30 Tagen nach Zugang der Mitteilung, gelten die Änderungen 
                als genehmigt.
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
