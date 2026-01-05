
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";
import { AssistantStepData } from "@/types/business-travel";

interface DestinationStepProps {
  data: AssistantStepData;
  updateData: (data: Partial<AssistantStepData>) => void;
}

const DestinationStep: React.FC<DestinationStepProps> = ({ data, updateData }) => {
  const [destination, setDestination] = useState(data.destination || '');
  const [address, setAddress] = useState(data.destination_address || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestination(e.target.value);
    updateData({ destination: e.target.value });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAddress(e.target.value);
    updateData({ destination_address: e.target.value });
  };

  const handleSearch = () => {
    if (!destination.trim()) return;
    
    setIsSearching(true);
    
    // Simuliere eine Suchfunktion mit Google Maps API
    setTimeout(() => {
      setSearchResults([
        {
          place_id: 'place1',
          description: destination + ', Deutschland',
          structured_formatting: {
            main_text: destination,
            secondary_text: 'Deutschland'
          }
        },
        {
          place_id: 'place2',
          description: destination + ', Österreich',
          structured_formatting: {
            main_text: destination,
            secondary_text: 'Österreich'
          }
        },
        {
          place_id: 'place3',
          description: destination + ', Schweiz',
          structured_formatting: {
            main_text: destination,
            secondary_text: 'Schweiz'
          }
        }
      ]);
      setIsSearching(false);
    }, 1000);
  };

  const selectPlace = (place: any) => {
    setDestination(place.structured_formatting.main_text);
    setAddress(place.description);
    updateData({ 
      destination: place.structured_formatting.main_text,
      destination_address: place.description
    });
    setSearchResults([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">Wohin möchten Sie reisen?</h2>
        <p className="text-gray-600 mb-6">
          Bitte geben Sie Ihr Reiseziel an. Sie können nach einem Ort suchen oder die Adresse direkt eingeben.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="destination">Reiseziel</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="destination"
                placeholder="z.B. Berlin, Paris, London"
                className="pl-10"
                value={destination}
                onChange={handleDestinationChange}
              />
            </div>
            <Button type="button" onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="border rounded-md divide-y">
            {searchResults.map((place) => (
              <div
                key={place.place_id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => selectPlace(place)}
              >
                <div className="font-medium">{place.structured_formatting.main_text}</div>
                <div className="text-sm text-gray-500">{place.structured_formatting.secondary_text}</div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="address">Genaue Adresse (optional)</Label>
          <Textarea
            id="address"
            placeholder="Straße, Hausnummer, Postleitzahl, Stadt"
            value={address}
            onChange={handleAddressChange}
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Tipp</h3>
        <p className="text-sm text-blue-700">
          Eine genaue Adresse hilft bei der Planung von Transport und Unterkunft. 
          Wenn Sie das Ziel kennen, können wir Ihnen passende Optionen vorschlagen.
        </p>
      </div>
    </div>
  );
};

export default DestinationStep;
