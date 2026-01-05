
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useState } from "react";

interface LocationPickerProps {
  address: string;
  onAddressChange: (address: string) => void;
}

const LocationPicker = ({ address, onAddressChange }: LocationPickerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = () => {
    setIsLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Hier würde normalerweise ein Geocoding-API-Aufruf erfolgen
          // um die Koordinaten in eine Adresse zu verwandeln
          onAddressChange("Aktuelle Position verwendet");
          setIsLoading(false);
        },
        (error) => {
          console.error("Fehler bei der Standortabfrage:", error);
          setIsLoading(false);
        }
      );
    } else {
      console.error("Geolocation wird von diesem Browser nicht unterstützt");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="Standort eingeben"
        className="flex-1"
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
      />
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        onClick={getCurrentLocation}
        disabled={isLoading}
      >
        <MapPin className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default LocationPicker;
