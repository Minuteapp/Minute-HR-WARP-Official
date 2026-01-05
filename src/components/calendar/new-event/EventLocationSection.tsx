
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface EventLocationSectionProps {
  address: string;
  onAddressChange: (address: string) => void;
}

const EventLocationSection = ({ 
  address, 
  onAddressChange 
}: EventLocationSectionProps) => {
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Hier würde normalerweise ein Geocoding-API-Aufruf erfolgen
          onAddressChange("Aktuelle Position");
        },
        (error) => {
          console.error("Standortabfrage fehlgeschlagen:", error);
        }
      );
    }
  };

  return (
    <div>
      <Label htmlFor="location">Standort</Label>
      <div className="mt-1 flex gap-2">
        <Input
          id="location"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Büro, Konferenzraum oder Adresse"
          className="flex-1"
        />
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={getCurrentLocation}
          title="Aktuellen Standort verwenden"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
      {!address && (
        <p className="text-xs text-gray-500 mt-1">
          Geben Sie einen Standort ein oder nutzen Sie den Standortbutton, um Ihren aktuellen Standort zu verwenden.
        </p>
      )}
    </div>
  );
};

export default EventLocationSection;
