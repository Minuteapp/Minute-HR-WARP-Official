import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, DollarSign, Plane, Car, Building2, AlertTriangle } from "lucide-react";
import { useBusinessTravelRequests } from "@/hooks/business-travel/useBusinessTravelRequests";

const travelRequestSchema = z.object({
  destination: z.string().min(1, "Reiseziel ist erforderlich"),
  purpose: z.string().min(10, "Reisezweck muss mindestens 10 Zeichen lang sein"),
  start_date: z.string().min(1, "Startdatum ist erforderlich"),
  end_date: z.string().min(1, "Enddatum ist erforderlich"),
  estimated_cost: z.number().min(0, "Geschätzte Kosten müssen positiv sein"),
  cost_center: z.string().optional(),
  car_rental_needed: z.boolean().default(false),
  flight_preferences: z.object({
    class: z.string().default("economy"),
    direct_flights_only: z.boolean().default(false),
    airline_preference: z.string().optional()
  }).default({}),
  hotel_preferences: z.object({
    category: z.string().default("3-4-star"),
    location_preference: z.string().optional(),
    special_requirements: z.string().optional()
  }).default({})
});

type TravelRequestFormData = z.infer<typeof travelRequestSchema>;

interface TravelRequestFormProps {
  onClose?: () => void;
}

export const TravelRequestForm = ({ onClose }: TravelRequestFormProps) => {
  const { createTravelRequest, isCreating } = useBusinessTravelRequests();
  const [budgetWarning, setBudgetWarning] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<TravelRequestFormData>({
    resolver: zodResolver(travelRequestSchema),
    defaultValues: {
      car_rental_needed: false,
      flight_preferences: {
        class: "economy",
        direct_flights_only: false
      },
      hotel_preferences: {
        category: "3-4-star"
      }
    }
  });

  const estimatedCost = watch("estimated_cost");
  const carRentalNeeded = watch("car_rental_needed");

  // AI Budget Warning Simulation
  React.useEffect(() => {
    if (estimatedCost > 2500) {
      setBudgetWarning("Warnung: Überschreitet das Team-Budget für Q3. Verfügbar: €8.900");
    } else if (estimatedCost > 1500) {
      setBudgetWarning("Info: Höhere Kostenschätzung. Möglicherweise erweiterte Genehmigung erforderlich.");
    } else {
      setBudgetWarning(null);
    }
  }, [estimatedCost]);

  const onSubmit = async (data: TravelRequestFormData) => {
    try {
      await createTravelRequest(data as any);
      onClose?.();
    } catch (error) {
      console.error('Error creating travel request:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reisedetails */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Reisedetails
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="destination">Reiseziel *</Label>
              <Input
                id="destination"
                {...register("destination")}
                placeholder="z.B. Berlin, Deutschland"
                className="mt-1"
              />
              {errors.destination && (
                <p className="text-sm text-destructive mt-1">{errors.destination.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="purpose">Reisezweck *</Label>
              <Textarea
                id="purpose"
                {...register("purpose")}
                placeholder="Beschreiben Sie den Zweck der Geschäftsreise..."
                className="mt-1"
                rows={3}
              />
              {errors.purpose && (
                <p className="text-sm text-destructive mt-1">{errors.purpose.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Startdatum *</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register("start_date")}
                  className="mt-1"
                />
                {errors.start_date && (
                  <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="end_date">Enddatum *</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register("end_date")}
                  className="mt-1"
                />
                {errors.end_date && (
                  <p className="text-sm text-destructive mt-1">{errors.end_date.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget & Kostenstelle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget & Kosten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="estimated_cost">Geschätzte Gesamtkosten (€) *</Label>
              <Input
                id="estimated_cost"
                type="number"
                step="0.01"
                {...register("estimated_cost", { valueAsNumber: true })}
                placeholder="z.B. 1250.00"
                className="mt-1"
              />
              {errors.estimated_cost && (
                <p className="text-sm text-destructive mt-1">{errors.estimated_cost.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cost_center">Kostenstelle</Label>
              <Input
                id="cost_center"
                {...register("cost_center")}
                placeholder="z.B. Sales, Marketing"
                className="mt-1"
              />
            </div>

            {budgetWarning && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">{budgetWarning}</p>
              </div>
            )}

            {/* AI-Vorschlag Simulation */}
            {estimatedCost > 0 && estimatedCost <= 1500 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-1">🤖 AI-Vorschlag</h4>
                <p className="text-sm text-blue-800">
                  Für {watch("destination")} gibt es Flüge ab €{Math.floor(estimatedCost * 0.4)}, 
                  Hotels ab €{Math.floor(estimatedCost * 0.3)}/Nacht. Soll ich das vorausfüllen?
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Präferenzen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Reisepräferenzen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flugpräferenzen */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Plane className="h-4 w-4" />
                Flugpräferenzen
              </h4>
              
              <div>
                <Label htmlFor="flight_class">Klasse</Label>
                <select
                  id="flight_class"
                  {...register("flight_preferences.class")}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                >
                  <option value="economy">Economy</option>
                  <option value="premium-economy">Premium Economy</option>
                  <option value="business">Business</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="direct_flights"
                  onCheckedChange={(checked) => 
                    setValue("flight_preferences.direct_flights_only", checked)
                  }
                />
                <Label htmlFor="direct_flights">Nur Direktflüge</Label>
              </div>
            </div>

            {/* Hotelpräferenzen */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Hotelpräferenzen
              </h4>
              
              <div>
                <Label htmlFor="hotel_category">Kategorie</Label>
                <select
                  id="hotel_category"
                  {...register("hotel_preferences.category")}
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md"
                >
                  <option value="3-4-star">3-4 Sterne</option>
                  <option value="4-5-star">4-5 Sterne</option>
                  <option value="boutique">Boutique Hotel</option>
                </select>
              </div>

              <div>
                <Label htmlFor="hotel_location">Lage-Präferenz</Label>
                <Input
                  id="hotel_location"
                  {...register("hotel_preferences.location_preference")}
                  placeholder="z.B. Stadtzentrum, Flughafennähe"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Mietwagen */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Car className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="car_rental">Mietwagen benötigt</Label>
                <p className="text-sm text-muted-foreground">
                  Soll ein Mietwagen für die Reise gebucht werden?
                </p>
              </div>
            </div>
            <Switch
              id="car_rental"
              checked={carRentalNeeded}
              onCheckedChange={(checked) => setValue("car_rental_needed", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isCreating}
        >
          Abbrechen
        </Button>
        <Button
          type="submit"
          disabled={isCreating}
          className="min-w-[120px]"
        >
          {isCreating ? "Wird eingereicht..." : "Antrag einreichen"}
        </Button>
      </div>
    </form>
  );
};