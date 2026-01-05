import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useToast } from '@/hooks/use-toast';
import { Building2, Plus, Trash2 } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  city: string;
}

interface LocationsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const LocationsStep = ({ onNext, onBack }: LocationsStepProps) => {
  const { tenantCompany } = useTenant();
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newLocation, setNewLocation] = useState({
    name: '',
    street: '',
    house_number: '',
    postal_code: '',
    city: '',
    country: 'Deutschland',
  });

  const companyId = tenantCompany?.id;

  useEffect(() => {
    if (companyId) {
      loadLocations();
    }
  }, [companyId]);

  const loadLocations = async () => {
    if (!companyId) return;
    
    const { data, error } = await supabase
      .from('locations')
      .select('id, name, city')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setLocations(data);
    }
    setIsLoading(false);
  };

  const handleAddLocation = async () => {
    if (!companyId || !newLocation.name || !newLocation.city) {
      toast({
        title: 'Felder ausfüllen',
        description: 'Bitte Name und Stadt angeben.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    
    const { error } = await supabase
      .from('locations')
      .insert({
        company_id: companyId,
        name: newLocation.name,
        street: newLocation.street,
        house_number: newLocation.house_number,
        postal_code: newLocation.postal_code,
        city: newLocation.city,
        country: newLocation.country,
      });

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Standort konnte nicht erstellt werden.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Standort erstellt',
        description: `${newLocation.name} wurde erfolgreich angelegt.`,
      });
      setNewLocation({
        name: '',
        street: '',
        house_number: '',
        postal_code: '',
        city: '',
        country: 'Deutschland',
      });
      await loadLocations();
    }
    
    setIsSaving(false);
  };

  const handleDeleteLocation = async (id: string) => {
    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (!error) {
      await loadLocations();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Standorte einrichten</h2>
        <p className="text-muted-foreground mt-2">
          Legen Sie die Standorte Ihrer Firma an.
        </p>
      </div>

      {/* Existing locations */}
      {locations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vorhandene Standorte ({locations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{location.name}</p>
                    <p className="text-sm text-muted-foreground">{location.city}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteLocation(location.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add new location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Neuen Standort hinzufügen</CardTitle>
          <CardDescription>
            Fügen Sie mindestens einen Standort hinzu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="locationName">Standortname *</Label>
              <Input
                id="locationName"
                placeholder="z.B. Hauptsitz Berlin"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="street">Straße</Label>
              <Input
                id="street"
                placeholder="Musterstraße"
                value={newLocation.street}
                onChange={(e) => setNewLocation({ ...newLocation, street: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="houseNumber">Hausnummer</Label>
              <Input
                id="houseNumber"
                placeholder="123"
                value={newLocation.house_number}
                onChange={(e) => setNewLocation({ ...newLocation, house_number: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="postalCode">PLZ</Label>
              <Input
                id="postalCode"
                placeholder="10115"
                value={newLocation.postal_code}
                onChange={(e) => setNewLocation({ ...newLocation, postal_code: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="city">Stadt *</Label>
              <Input
                id="city"
                placeholder="Berlin"
                value={newLocation.city}
                onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
              />
            </div>
          </div>
          
          <Button
            onClick={handleAddLocation}
            disabled={isSaving || !newLocation.name || !newLocation.city}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Standort hinzufügen
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Zurück
        </Button>
        <Button onClick={onNext} disabled={locations.length === 0}>
          Weiter
        </Button>
      </div>
    </div>
  );
};
