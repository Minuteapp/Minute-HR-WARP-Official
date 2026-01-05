
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import VatRateItem from './VatRateItem';

interface VatRate {
  id: string;
  name: string;
  rate: string;
  isActive: boolean;
}

const CurrenciesTaxesSection = () => {
  const [mainCurrency, setMainCurrency] = useState('eur');
  const [exchangeRateSource, setExchangeRateSource] = useState('ecb');
  const [vatRates, setVatRates] = useState<VatRate[]>([]);

  const handleVatToggle = (id: string, isActive: boolean) => {
    setVatRates(prev => 
      prev.map(vat => vat.id === id ? { ...vat, isActive } : vat)
    );
  };

  return (
    <div className="space-y-6">
      {/* Währungen */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Währungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="mainCurrency">Hauptwährung</Label>
              <Select value={mainCurrency} onValueChange={setMainCurrency}>
                <SelectTrigger id="mainCurrency" className="bg-background">
                  <SelectValue placeholder="Währung wählen" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="eur">EUR - Euro</SelectItem>
                  <SelectItem value="usd">USD - US Dollar</SelectItem>
                  <SelectItem value="gbp">GBP - Britisches Pfund</SelectItem>
                  <SelectItem value="chf">CHF - Schweizer Franken</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="exchangeRate">Wechselkursquelle</Label>
              <Select value={exchangeRateSource} onValueChange={setExchangeRateSource}>
                <SelectTrigger id="exchangeRate" className="bg-background">
                  <SelectValue placeholder="Quelle wählen" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="ecb">Europäische Zentralbank</SelectItem>
                  <SelectItem value="xe">XE.com</SelectItem>
                  <SelectItem value="manual">Manuell</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mehrwertsteuer */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Mehrwertsteuer</CardTitle>
        </CardHeader>
        <CardContent>
          {vatRates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Keine MwSt.-Sätze konfiguriert.
            </div>
          ) : (
            <div>
              {vatRates.map((vat) => (
                <VatRateItem
                  key={vat.id}
                  {...vat}
                  onToggle={handleVatToggle}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrenciesTaxesSection;
