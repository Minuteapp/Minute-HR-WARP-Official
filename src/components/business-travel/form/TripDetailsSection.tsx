
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TripDetailsSectionProps {
  register: any;
  setValue: any;
  watch: any;
  errors: any;
  getCurrentDate: () => string;
}

const TripDetailsSection = ({ register, setValue, watch, errors, getCurrentDate }: TripDetailsSectionProps) => {
  return (
    <div className="col-span-2 space-y-4">
      <h3 className="text-lg font-medium">Reisedetails</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="purpose">Zweck der Reise</Label>
          <Textarea
            id="purpose"
            {...register("purpose", { required: "Zweck der Reise ist erforderlich" })}
            placeholder="Beschreiben Sie den Zweck der Geschäftsreise"
            rows={2}
          />
          {errors.purpose && <p className="text-sm text-red-500">{errors.purpose.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="purpose_type">Art der Reise</Label>
          <Select defaultValue="customer_meeting" onValueChange={(value) => setValue("purpose_type", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer_meeting">Kundentermin</SelectItem>
              <SelectItem value="trade_fair">Messe</SelectItem>
              <SelectItem value="training">Schulung</SelectItem>
              <SelectItem value="internal_meeting">Interner Termin</SelectItem>
              <SelectItem value="other">Sonstiges</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="transport">Transportmittel</Label>
          <Select defaultValue="car" onValueChange={(value) => setValue("transport", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="car">Auto</SelectItem>
              <SelectItem value="train">Zug</SelectItem>
              <SelectItem value="plane">Flugzeug</SelectItem>
              <SelectItem value="public_transport">ÖPNV</SelectItem>
              <SelectItem value="taxi">Taxi</SelectItem>
              <SelectItem value="rental_car">Mietwagen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="destination">Reiseziel</Label>
          <Input
            id="destination"
            {...register("destination", { required: "Reiseziel ist erforderlich" })}
            placeholder="Stadt oder Ort"
          />
          {errors.destination && <p className="text-sm text-red-500">{errors.destination.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="destination_address">Genaue Adresse (optional)</Label>
          <Input
            id="destination_address"
            {...register("destination_address")}
            placeholder="Straße, Hausnummer"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="start_date">Startdatum</Label>
          <Input
            id="start_date"
            type="date"
            min={getCurrentDate()}
            {...register("start_date", { required: "Startdatum ist erforderlich" })}
          />
          {errors.start_date && <p className="text-sm text-red-500">{errors.start_date.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="end_date">Enddatum</Label>
          <Input
            id="end_date"
            type="date"
            min={watch("start_date") || getCurrentDate()}
            {...register("end_date", { required: "Enddatum ist erforderlich" })}
          />
          {errors.end_date && <p className="text-sm text-red-500">{errors.end_date.message}</p>}
        </div>
      </div>
    </div>
  );
};

export default TripDetailsSection;
