import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plane, Save, Calendar, Clock, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FlightDataFormProps {
  businessTripId?: string;
  onFlightSaved?: () => void;
}

const AIRPORTS = [
  { code: 'FRA', name: 'Frankfurt' },
  { code: 'MUC', name: 'München' },
  { code: 'BER', name: 'Berlin' },
  { code: 'DUS', name: 'Düsseldorf' },
  { code: 'HAM', name: 'Hamburg' },
  { code: 'CGN', name: 'Köln/Bonn' },
  { code: 'STR', name: 'Stuttgart' },
  { code: 'VIE', name: 'Wien' },
  { code: 'ZRH', name: 'Zürich' },
  { code: 'LHR', name: 'London Heathrow' },
  { code: 'CDG', name: 'Paris CDG' },
  { code: 'AMS', name: 'Amsterdam' },
  { code: 'JFK', name: 'New York JFK' },
  { code: 'SFO', name: 'San Francisco' },
];

const FlightDataForm: React.FC<FlightDataFormProps> = ({ businessTripId, onFlightSaved }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    flightNumber: '',
    airline: '',
    departureAirport: '',
    arrivalAirport: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    isReturnFlight: false,
  });

  const detectAirline = (flightNumber: string) => {
    const prefix = flightNumber.substring(0, 2).toUpperCase();
    const airlines: Record<string, string> = {
      'LH': 'Lufthansa',
      'EW': 'Eurowings',
      'DE': 'Condor',
      'AB': 'Air Berlin',
      'OS': 'Austrian Airlines',
      'LX': 'Swiss',
      'BA': 'British Airways',
      'AF': 'Air France',
      'KL': 'KLM',
      'UA': 'United Airlines',
      'AA': 'American Airlines',
      'DL': 'Delta',
    };
    return airlines[prefix] || '';
  };

  const handleFlightNumberChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setFormData(prev => ({
      ...prev,
      flightNumber: upperValue,
      airline: detectAirline(upperValue) || prev.airline
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!formData.flightNumber || !formData.departureAirport || !formData.arrivalAirport) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }

    if (!user?.id) {
      setError('Sie müssen angemeldet sein.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Kombiniere Datum und Zeit
      const departureDateTime = formData.departureDate && formData.departureTime 
        ? `${formData.departureDate}T${formData.departureTime}:00`
        : formData.departureDate ? `${formData.departureDate}T00:00:00` : null;
      
      const arrivalDateTime = formData.arrivalDate && formData.arrivalTime 
        ? `${formData.arrivalDate}T${formData.arrivalTime}:00`
        : formData.arrivalDate ? `${formData.arrivalDate}T23:59:00` : null;

      // Speichere in flight_details Tabelle
      const { error: flightError } = await supabase
        .from('flight_details')
        .insert({
          business_trip_id: businessTripId || null,
          flight_number: formData.flightNumber,
          airline: formData.airline || detectAirline(formData.flightNumber),
          departure_airport: formData.departureAirport,
          arrival_airport: formData.arrivalAirport,
          departure_time: departureDateTime,
          arrival_time: arrivalDateTime,
          status: 'scheduled',
          is_return_flight: formData.isReturnFlight,
        });

      if (flightError) throw flightError;

      // Aktualisiere auch traveler_locations für die Live-Karte
      const departureAirport = AIRPORTS.find(a => a.code === formData.departureAirport);
      if (departureAirport) {
        await supabase
          .from('traveler_locations')
          .upsert({
            user_id: user.id,
            business_trip_id: businessTripId || null,
            current_location: departureAirport.name,
            location_type: 'airport',
            flight_number: formData.flightNumber,
            status: 'scheduled',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });
      }

      setSuccess(true);
      toast.success('Flugdaten erfolgreich gespeichert!');
      
      // Reset form
      setFormData({
        flightNumber: '',
        airline: '',
        departureAirport: '',
        arrivalAirport: '',
        departureDate: '',
        departureTime: '',
        arrivalDate: '',
        arrivalTime: '',
        isReturnFlight: false,
      });

      onFlightSaved?.();
    } catch (err: any) {
      console.error('Error saving flight data:', err);
      setError(err.message || 'Fehler beim Speichern der Flugdaten.');
      toast.error('Fehler beim Speichern der Flugdaten');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Flugdaten eintragen
        </CardTitle>
        <CardDescription>
          Tragen Sie Ihre Flugbuchung ein, um sie auf der Live-Karte zu verfolgen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Flugnummer und Airline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flightNumber">Flugnummer *</Label>
              <Input
                id="flightNumber"
                placeholder="z.B. LH1234"
                value={formData.flightNumber}
                onChange={(e) => handleFlightNumberChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="airline">Airline</Label>
              <Input
                id="airline"
                placeholder="Wird automatisch erkannt"
                value={formData.airline}
                onChange={(e) => setFormData(prev => ({ ...prev, airline: e.target.value }))}
              />
            </div>
          </div>

          {/* Abflug/Ankunft Flughäfen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureAirport">Abflughafen *</Label>
              <Select 
                value={formData.departureAirport} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, departureAirport: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Flughafen wählen" />
                </SelectTrigger>
                <SelectContent>
                  {AIRPORTS.map(airport => (
                    <SelectItem key={airport.code} value={airport.code}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {airport.code} - {airport.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalAirport">Zielflughafen *</Label>
              <Select 
                value={formData.arrivalAirport} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, arrivalAirport: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Flughafen wählen" />
                </SelectTrigger>
                <SelectContent>
                  {AIRPORTS.map(airport => (
                    <SelectItem key={airport.code} value={airport.code}>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {airport.code} - {airport.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Abflug Datum/Zeit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="departureDate">Abflugdatum</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="departureDate"
                  type="date"
                  className="pl-10"
                  value={formData.departureDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureTime">Abflugzeit</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="departureTime"
                  type="time"
                  className="pl-10"
                  value={formData.departureTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Ankunft Datum/Zeit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="arrivalDate">Ankunftsdatum</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="arrivalDate"
                  type="date"
                  className="pl-10"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, arrivalDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalTime">Ankunftszeit</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="arrivalTime"
                  type="time"
                  className="pl-10"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, arrivalTime: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Rückflug Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isReturnFlight"
              checked={formData.isReturnFlight}
              onChange={(e) => setFormData(prev => ({ ...prev, isReturnFlight: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isReturnFlight" className="cursor-pointer">
              Dies ist ein Rückflug
            </Label>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span>Flugdaten erfolgreich gespeichert!</span>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Speichern...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Flugdaten speichern
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FlightDataForm;
