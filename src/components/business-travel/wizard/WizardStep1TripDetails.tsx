import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { TripFormData, TransportType } from "@/types/business-travel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plane, Train, Car, Package, MapPin, Calendar, Users, Info } from "lucide-react";

interface WizardStep1Props {
  register: UseFormRegister<TripFormData>;
  setValue: UseFormSetValue<TripFormData>;
  watch: UseFormWatch<TripFormData>;
  errors: FieldErrors<TripFormData>;
  isAdmin?: boolean;
  employees?: { id: string; name: string }[];
}

const transportOptions: { value: TransportType; label: string; icon: React.ElementType }[] = [
  { value: 'plane', label: 'Flug', icon: Plane },
  { value: 'train', label: 'Bahn', icon: Train },
  { value: 'car', label: 'PKW', icon: Car },
  { value: 'public_transport', label: 'Sonstige', icon: Package },
];

const WizardStep1TripDetails = ({
  register,
  setValue,
  watch,
  errors,
  isAdmin = false,
  employees = [],
}: WizardStep1Props) => {
  const selectedTransport = watch("transport");
  const hotelRequired = watch("hotel_required");

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      {/* Mitarbeiter-Auswahl für Admins */}
      {isAdmin && employees.length > 0 && (
        <div className="space-y-2 p-4 bg-muted/50 rounded-lg border border-dashed">
          <Label>Reise erstellen für Mitarbeiter</Label>
          <Select onValueChange={(value) => setValue("selected_employee_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Mitarbeiter auswählen" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3 mt-0.5" />
            <span>Als Administrator können Sie Reiseanträge für Ihre Mitarbeiter erstellen</span>
          </div>
        </div>
      )}

      {/* Reise-Titel */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Reise-Titel / Zweck <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          {...register("title", { required: "Titel ist erforderlich" })}
          placeholder="z.B. Kundenbesuch Berlin, Tech Conference München"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Reiseziel + Reiseart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="destination">Reiseziel</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="destination"
              {...register("destination", { required: "Reiseziel ist erforderlich" })}
              placeholder="Stadt, Land"
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Reiseart</Label>
          <Select onValueChange={(value) => setValue("trip_type", value as any)} defaultValue="domestic">
            <SelectTrigger>
              <SelectValue placeholder="Reiseart auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="domestic">Inland (Deutschland)</SelectItem>
              <SelectItem value="europe">Ausland (Europa)</SelectItem>
              <SelectItem value="international">Ausland (Übersee)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Datum */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Abreisedatum</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="start_date"
              type="date"
              {...register("start_date", { required: "Startdatum ist erforderlich" })}
              min={getCurrentDate()}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">Rückreisedatum</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="end_date"
              type="date"
              {...register("end_date", { required: "Enddatum ist erforderlich" })}
              min={getCurrentDate()}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Verkehrsmittel */}
      <div className="space-y-2">
        <Label>Verkehrsmittel</Label>
        <div className="flex gap-2">
          {transportOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedTransport === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setValue("transport", option.value)}
                className={cn(
                  "flex flex-col items-center gap-1 p-4 rounded-lg border-2 transition-all flex-1",
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted hover:border-muted-foreground/50"
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Übernachtung erforderlich */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hotel_required"
          checked={hotelRequired}
          onCheckedChange={(checked) => setValue("hotel_required", !!checked)}
        />
        <Label htmlFor="hotel_required" className="cursor-pointer">
          Ja, Hotel benötigt
        </Label>
      </div>

      {/* Detaillierter Reisezweck */}
      <div className="space-y-2">
        <Label htmlFor="purpose">
          Detaillierter Reisezweck <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="purpose"
          {...register("purpose", { required: "Reisezweck ist erforderlich" })}
          placeholder="Beschreiben Sie den Zweck der Reise, geplante Meetings, Projekte, etc."
          rows={4}
        />
        {errors.purpose && (
          <p className="text-sm text-destructive">{errors.purpose.message}</p>
        )}
      </div>

      {/* Teilnehmer */}
      <div className="space-y-2">
        <Label htmlFor="participants">Teilnehmer (optional)</Label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="participants"
            placeholder="Weitere Teilnehmer hinzufügen..."
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
};

export default WizardStep1TripDetails;
