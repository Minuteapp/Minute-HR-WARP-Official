import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plane, AlertCircle, PlusCircle } from "lucide-react";
import FlightMap from './FlightMap';
import FlightStatus from './FlightStatus';
import FlightDataForm from './FlightDataForm';
import { FlightDetails } from "@/types/business-travel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface FlightTrackerProps {
  businessTripId?: string;
  initialFlightNumber?: string;
}

const FlightTracker: React.FC<FlightTrackerProps> = ({ businessTripId, initialFlightNumber }) => {
  const { user } = useAuth();
  const [flightNumber, setFlightNumber] = useState(initialFlightNumber || '');
  const [flightData, setFlightData] = useState<FlightDetails | null>(null);
  const [savedFlights, setSavedFlights] = useState<FlightDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('search');

  // Lade gespeicherte Flüge aus der Datenbank
  const loadSavedFlights = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('flight_details')
        .select('*')
        .order('departure_time', { ascending: true });

      if (error) throw error;
      
      // Map DB data to FlightDetails type
      const mappedFlights: FlightDetails[] = (data || []).map(flight => ({
        id: flight.id,
        business_trip_id: flight.business_trip_id || '',
        flight_number: flight.flight_number,
        airline: flight.airline || '',
        departure_airport: flight.departure_airport,
        departure_time: flight.departure_time || '',
        arrival_airport: flight.arrival_airport,
        arrival_time: flight.arrival_time || '',
        status: (flight.status as 'scheduled' | 'delayed' | 'cancelled' | 'in_air' | 'landed') || 'scheduled',
        created_at: flight.created_at || '',
        updated_at: flight.updated_at || '',
        is_return_flight: flight.is_return_flight || false,
        delay_minutes: flight.delay_minutes || 0,
      }));
      
      setSavedFlights(mappedFlights);
    } catch (err) {
      console.error('Error loading flights:', err);
    }
  };

  useEffect(() => {
    loadSavedFlights();
  }, [user?.id]);

  const handleSearch = async () => {
    if (!flightNumber) {
      setError('Bitte geben Sie eine Flugnummer ein.');
      return;
    }

    setIsLoading(true);
    setError('');
    setFlightData(null);

    try {
      // Suche zuerst in gespeicherten Flügen
      const savedFlight = savedFlights.find(
        f => f.flight_number.toLowerCase() === flightNumber.toLowerCase()
      );

      if (savedFlight) {
        setFlightData(savedFlight);
      } else {
        setError('Flug nicht gefunden. Bitte tragen Sie die Flugdaten manuell ein.');
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Abrufen der Flugdaten.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlightSelect = (flight: FlightDetails) => {
    setFlightData(flight);
    setFlightNumber(flight.flight_number);
    setActiveTab('search');
  };

  return (
    <div className="w-full py-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Flug suchen
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Flug eintragen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Flugverfolgung
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="flightNumber">Flugnummer</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="flightNumber"
                    placeholder="z.B. LH1234"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                  />
                  <Button onClick={handleSearch} disabled={isLoading}>
                    {isLoading ? (
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Suchen
                  </Button>
                </div>
              </div>

              {error && (
                <div className="flex items-center text-sm text-amber-600 bg-amber-50 p-3 rounded-md space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {flightData && (
                <div className="space-y-4">
                  <FlightStatus flightData={flightData} />
                  <FlightMap 
                    departureCode={flightData.departure_airport} 
                    arrivalCode={flightData.arrival_airport}
                    status={flightData.status}
                  />
                </div>
              )}

              {/* Gespeicherte Flüge anzeigen */}
              {savedFlights.length > 0 && !flightData && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Ihre gespeicherten Flüge</h3>
                  <div className="space-y-2">
                    {savedFlights.map((flight) => (
                      <Card 
                        key={flight.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleFlightSelect(flight)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Plane className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{flight.flight_number}</p>
                                <p className="text-sm text-muted-foreground">
                                  {flight.departure_airport} → {flight.arrival_airport}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{flight.airline}</p>
                              <p className="text-xs text-muted-foreground">
                                {flight.departure_time ? new Date(flight.departure_time).toLocaleDateString('de-DE') : '-'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {savedFlights.length === 0 && !flightData && !error && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Plane className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Noch keine Flüge gespeichert</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tragen Sie Ihren ersten Flug ein, um ihn zu verfolgen
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab('add')}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Flug eintragen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <FlightDataForm 
            businessTripId={businessTripId} 
            onFlightSaved={() => {
              loadSavedFlights();
              setActiveTab('search');
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FlightTracker;
