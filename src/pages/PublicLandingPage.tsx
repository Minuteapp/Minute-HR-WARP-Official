import React from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustBadges } from '@/components/landing/TrustBadges';
import { ProductShowcaseSection } from '@/components/landing/ProductShowcaseSection';
import { FeatureSection } from '@/components/landing/FeatureSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Helmet } from 'react-helmet-async';

export default function PublicLandingPage() {
  return (
    <>
      <Helmet>
        <title>MINUTE HR - Die intelligente HR-Plattform | Personalmanagement Software</title>
        <meta 
          name="description" 
          content="MINUTE HR vereint HR und Lohnbuchhaltung in einer intelligenten Plattform. Automatisieren Sie Ihre Personalprozesse, verwalten Sie Abwesenheiten und gewinnen Sie wertvolle Insights. Jetzt kostenlos testen!" 
        />
        <meta name="keywords" content="HR Software, Personalmanagement, Zeiterfassung, Lohnbuchhaltung, Abwesenheitsverwaltung, Recruiting" />
        <link rel="canonical" href="https://minute-hr.de" />
        
        {/* Open Graph */}
        <meta property="og:title" content="MINUTE HR - Die intelligente HR-Plattform" />
        <meta property="og:description" content="HR und Lohnbuchhaltung endlich vereint. Starten Sie kostenlos mit 14 Tagen Testphase." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://minute-hr.de" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MINUTE HR - Die intelligente HR-Plattform" />
        <meta name="twitter:description" content="HR und Lohnbuchhaltung endlich vereint. Starten Sie kostenlos." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <LandingHeader />
        <main>
          <HeroSection />
          <TrustBadges />
          <ProductShowcaseSection />
          <FeatureSection />
          <PricingSection />
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
