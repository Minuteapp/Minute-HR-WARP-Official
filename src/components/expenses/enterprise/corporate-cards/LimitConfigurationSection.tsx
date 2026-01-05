
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface LimitConfiguration {
  monthlyLimit: number;
  categoryLimit: string;
  countryLimit: string;
}

interface LimitConfigurationSectionProps {
  config: LimitConfiguration;
  onChange: (config: LimitConfiguration) => void;
}

const LimitConfigurationSection = ({ config, onChange }: LimitConfigurationSectionProps) => {
  const categories = [
    { value: 'all', label: 'Alle Kategorien' },
    { value: 'travel', label: 'Reisekosten' },
    { value: 'entertainment', label: 'Bewirtung' },
    { value: 'supplies', label: 'Arbeitsmittel' },
    { value: 'software', label: 'Software' },
  ];

  const countries = [
    { value: 'all', label: 'Alle Länder' },
    { value: 'de', label: 'Deutschland' },
    { value: 'at', label: 'Österreich' },
    { value: 'ch', label: 'Schweiz' },
    { value: 'eu', label: 'EU' },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          Limit-Konfiguration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="monthlyLimit" className="text-sm text-muted-foreground">
              Limit pro Monat
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
              <Input
                id="monthlyLimit"
                type="number"
                value={config.monthlyLimit}
                onChange={(e) => onChange({ ...config, monthlyLimit: Number(e.target.value) })}
                className="pl-7"
                placeholder="5000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryLimit" className="text-sm text-muted-foreground">
              Limit pro Kategorie
            </Label>
            <Select
              value={config.categoryLimit}
              onValueChange={(value) => onChange({ ...config, categoryLimit: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryLimit" className="text-sm text-muted-foreground">
              Limit pro Land
            </Label>
            <Select
              value={config.countryLimit}
              onValueChange={(value) => onChange({ ...config, countryLimit: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Land wählen" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LimitConfigurationSection;
