
import { Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface RegionData {
  id: string;
  name: string;
  countries: number;
  locations: number;
  employees: number;
  expenses: number;
  topCountries: string[];
}

interface RegionCardProps {
  region: RegionData;
  onCountryClick?: (country: string) => void;
}

const RegionCard = ({ region, onCountryClick }: RegionCardProps) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `€${(amount / 1000000).toFixed(2)} Mio`;
    }
    return `€${amount.toLocaleString('de-DE')}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('de-DE');
  };

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-100 text-purple-600 rounded-full p-3">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{region.name}</h3>
            <p className="text-sm text-muted-foreground">{region.countries} Länder</p>
          </div>
        </div>

        {/* Data Rows */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Standorte</span>
            <span className="text-sm font-medium text-foreground">{region.locations}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Mitarbeiter</span>
            <span className="text-sm font-medium text-foreground">{formatNumber(region.employees)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Ausgaben</span>
            <span className="text-sm font-medium text-foreground">{formatCurrency(region.expenses)}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-4" />

        {/* Top Countries */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Top-Länder:</p>
          <div className="flex flex-wrap gap-2">
            {region.topCountries.map((country, index) => (
              <button
                key={index}
                onClick={() => onCountryClick?.(country)}
                className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline cursor-pointer"
              >
                {country}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegionCard;
