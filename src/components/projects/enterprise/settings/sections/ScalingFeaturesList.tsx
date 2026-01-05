import { Check } from 'lucide-react';

const features = [
  'Skaliert auf 100.000+ Mitarbeiter',
  'Sub-200ms Initial Load',
  'Optimierte Datenbank-Indizes',
  'CDN für statische Assets',
  'GraphQL für effiziente Queries'
];

const ScalingFeaturesList = () => {
  return (
    <div className="mt-6 pt-6 border-t border-border">
      <p className="font-medium mb-3">Skalierungs-Features</p>
      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-muted-foreground">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScalingFeaturesList;
