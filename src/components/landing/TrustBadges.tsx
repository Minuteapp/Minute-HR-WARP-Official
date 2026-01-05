import React from 'react';

export const TrustBadges = () => {
  // Placeholder company logos
  const companies = [
    { name: 'TechCorp', placeholder: true },
    { name: 'InnovateCo', placeholder: true },
    { name: 'GrowthLabs', placeholder: true },
    { name: 'ScaleUp', placeholder: true },
    { name: 'FutureTech', placeholder: true },
    { name: 'NextGen', placeholder: true },
  ];

  return (
    <section className="py-12 border-y bg-muted/30">
      <div className="container">
        <p className="text-center text-muted-foreground mb-8">
          Über <span className="font-semibold text-foreground">15.000 Unternehmen</span> vertrauen uns
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {companies.map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center h-12 px-6 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
            >
              <div className="text-xl font-bold text-muted-foreground/50">
                {company.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
