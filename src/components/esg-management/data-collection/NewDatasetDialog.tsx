import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, Calculator, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface NewDatasetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: string;
}

export const NewDatasetDialog = ({ open, onOpenChange, scope }: NewDatasetDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    location: '',
    category: '',
    quantity: '',
    unit: 'kWh',
    source: '',
    responsible: '',
  });

  const getScopeLabel = () => {
    switch (scope) {
      case 'scope1': return 'Scope 1 - Direkte Emissionen';
      case 'scope2': return 'Scope 2 - Indirekte Energie';
      case 'scope3': return 'Scope 3 - Weitere indirekte Emissionen';
      default: return 'Scope 1';
    }
  };

  const getScopeValue = () => {
    switch (scope) {
      case 'scope1': return 'Scope 1';
      case 'scope2': return 'Scope 2';
      case 'scope3': return 'Scope 3';
      default: return 'Scope 1';
    }
  };

  // CO2-Emissionsfaktoren (kg CO2 pro Einheit) nach UBA/DEFRA
  const getCO2Factor = (category: string): number => {
    const factors: Record<string, number> = {
      'gas-heating': 0.201,        // kg CO2 pro kWh Erdgas
      'diesel-fleet': 2.65,        // kg CO2 pro Liter Diesel
      'petrol-fleet': 2.33,        // kg CO2 pro Liter Benzin
      'heating-oil': 2.66,         // kg CO2 pro Liter Heizöl
      'refrigerants': 1430,        // kg CO2-eq pro kg (R-134a)
      'electricity-grid': 0.366,   // kg CO2 pro kWh (DE Strommix 2024)
      'electricity-green': 0.02,   // kg CO2 pro kWh Ökostrom
      'district-heating': 0.15,    // kg CO2 pro kWh Fernwärme
      'district-cooling': 0.08,    // kg CO2 pro kWh Fernkälte
      'business-travel': 0.255,    // kg CO2 pro km (Durchschnitt)
      'commuting': 0.147,          // kg CO2 pro km (PKW Durchschnitt)
      'purchased-goods': 0.5,      // kg CO2 pro kg (Durchschnitt)
      'transport-upstream': 0.1,   // kg CO2 pro tkm
      'waste': 0.5,                // kg CO2 pro kg Abfall
    };
    return factors[category] || 1;
  };

  const getCategoryOptions = () => {
    switch (scope) {
      case 'scope1':
        return [
          { value: 'gas-heating', label: 'Erdgas - Heizung' },
          { value: 'diesel-fleet', label: 'Diesel - Firmenwagen' },
          { value: 'petrol-fleet', label: 'Benzin - Firmenwagen' },
          { value: 'heating-oil', label: 'Heizöl' },
          { value: 'refrigerants', label: 'Kältemittel' },
        ];
      case 'scope2':
        return [
          { value: 'electricity-grid', label: 'Strom - Netz' },
          { value: 'electricity-green', label: 'Strom - Grün' },
          { value: 'district-heating', label: 'Fernwärme' },
          { value: 'district-cooling', label: 'Fernkälte' },
        ];
      case 'scope3':
        return [
          { value: 'business-travel', label: 'Kat. 6 - Geschäftsreisen' },
          { value: 'commuting', label: 'Kat. 7 - Pendlerverkehr' },
          { value: 'purchased-goods', label: 'Kat. 1 - Eingekaufte Güter' },
          { value: 'transport-upstream', label: 'Kat. 4 - Transport (upstream)' },
          { value: 'waste', label: 'Kat. 5 - Abfall' },
        ];
      default:
        return [];
    }
  };

  const handleSave = async () => {
    if (!formData.date || !formData.category || !formData.quantity) {
      toast({
        title: 'Pflichtfelder fehlen',
        description: 'Bitte füllen Sie Datum, Kategorie und Menge aus.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // company_id über RPC ermitteln
      const { data: companyId } = await supabase.rpc('get_effective_company_id');
      
      if (!companyId) {
        throw new Error('Keine Firma zugeordnet');
      }

      // CO2-Emissionen berechnen
      const quantity = parseFloat(formData.quantity);
      const co2Factor = getCO2Factor(formData.category);
      const calculatedCO2 = quantity * co2Factor;

      // Kategorie-Label für Anzeige ermitteln
      const categoryLabel = getCategoryOptions().find(c => c.value === formData.category)?.label || formData.category;

      // In esg_emissions speichern
      const { error } = await supabase
        .from('esg_emissions')
        .insert({
          company_id: companyId,
          scope: getScopeValue(),
          category: categoryLabel,
          location: formData.location || null,
          quantity: quantity,
          unit: formData.unit,
          amount: calculatedCO2,
          source: formData.source || null,
          status: 'pending',
          recorded_at: formData.date,
        });

      if (error) throw error;

      toast({
        title: 'Datensatz gespeichert',
        description: `${quantity} ${formData.unit} = ${calculatedCO2.toFixed(2)} kg CO₂`,
      });

      // Queries invalidieren für Refresh
      queryClient.invalidateQueries({ queryKey: ['esg-emissions'] });
      queryClient.invalidateQueries({ queryKey: ['esg-dashboard'] });

      onOpenChange(false);
      setFormData({
        date: '',
        location: '',
        category: '',
        quantity: '',
        unit: 'kWh',
        source: '',
        responsible: '',
      });
    } catch (error) {
      console.error('ESG save error:', error);
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Speichern fehlgeschlagen',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-600" />
            Neuer Datensatz - {getScopeLabel()}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Standort</Label>
              <Select 
                value={formData.location} 
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="munich">München HQ</SelectItem>
                  <SelectItem value="berlin">Berlin</SelectItem>
                  <SelectItem value="hamburg">Hamburg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategorie</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie wählen..." />
              </SelectTrigger>
              <SelectContent>
                {getCategoryOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Menge</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Einheit</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kWh">kWh</SelectItem>
                  <SelectItem value="L">Liter</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="km">km</SelectItem>
                  <SelectItem value="m3">m³</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Quelle / Beleg</Label>
            <Input
              id="source"
              placeholder="z.B. Rechnung, Tankbeleg, Lieferschein"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible">Verantwortlich</Label>
            <Input
              id="responsible"
              placeholder="Name des Verantwortlichen"
              value={formData.responsible}
              onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Automatische Berechnung</p>
                <p className="text-xs text-blue-700">
                  CO₂-Emissionen werden basierend auf hinterlegten Emissionsfaktoren automatisch berechnet.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Abbrechen
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={isLoading}>
            {isLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Speichern...</> : 'Speichern & Berechnen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
