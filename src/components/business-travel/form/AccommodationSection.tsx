
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface AccommodationSectionProps {
  register: any;
  setValue: any;
  hotelRequired: boolean;
  setHotelRequired: (value: boolean) => void;
}

const AccommodationSection = ({ register, setValue, hotelRequired, setHotelRequired }: AccommodationSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Unterkunft</h3>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hotel_required"
          checked={hotelRequired}
          onCheckedChange={(checked) => {
            setHotelRequired(checked as boolean);
            setValue("hotel_required", checked);
          }}
        />
        <Label htmlFor="hotel_required">Hotelübernachtung erforderlich</Label>
      </div>
      
      {hotelRequired && (
        <div className="space-y-2">
          <Label htmlFor="hotel_details">Hotel-Details</Label>
          <Textarea
            id="hotel_details"
            {...register("hotel_details")}
            placeholder="Besondere Wünsche oder Anforderungen für die Unterkunft"
            rows={3}
          />
        </div>
      )}
    </div>
  );
};

export default AccommodationSection;
