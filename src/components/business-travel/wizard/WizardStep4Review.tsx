import { UseFormWatch } from "react-hook-form";
import { TripFormData } from "@/types/business-travel";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plane, 
  Train, 
  Car, 
  Package, 
  MapPin, 
  Calendar, 
  Users, 
  Info,
  Euro,
  AlertCircle
} from "lucide-react";

interface WizardStep4Props {
  watch: UseFormWatch<TripFormData>;
  register: any;
}

const transportLabels: Record<string, { label: string; icon: React.ElementType }> = {
  plane: { label: "Flug", icon: Plane },
  train: { label: "Bahn", icon: Train },
  car: { label: "PKW", icon: Car },
  public_transport: { label: "Sonstige", icon: Package },
  taxi: { label: "Taxi", icon: Car },
  rental_car: { label: "Mietwagen", icon: Car },
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const WizardStep4Review = ({ watch, register }: WizardStep4Props) => {
  const title = watch("title") || "-";
  const destination = watch("destination") || "-";
  const startDate = watch("start_date");
  const endDate = watch("end_date");
  const transport = watch("transport");
  const estimatedCost = watch("estimated_cost") || 0;
  const expenses = watch("wizard_expenses") || [];
  const advanceRequested = watch("advance_requested");
  const advancePayment = watch("advance_payment") || 0;
  const supervisor = watch("supervisor") || "Sarah Miller";

  const transportInfo = transportLabels[transport] || { label: transport, icon: Package };
  const TransportIcon = transportInfo.icon;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCost = estimatedCost + totalExpenses;

  return (
    <div className="space-y-6">
      {/* Reisedetails */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Reisedetails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Titel</p>
              <p className="font-medium">{title}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ziel</p>
              <p className="font-medium">{destination}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Abreise</p>
              <p className="font-medium">{formatDate(startDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rückkehr</p>
              <p className="font-medium">{formatDate(endDate)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Verkehrsmittel</p>
              <p className="font-medium flex items-center gap-1">
                <TransportIcon className="h-4 w-4" />
                {transportInfo.label}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Teilnehmer</p>
              <p className="font-medium">-</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kostenzusammenfassung */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Euro className="h-4 w-4" />
            Kostenzusammenfassung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Geschätzte Kosten</span>
            <span>{estimatedCost.toLocaleString('de-DE')} €</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bereits erfasste Spesen</span>
            <span>{totalExpenses.toLocaleString('de-DE')} €</span>
          </div>
          <div className="flex justify-between font-semibold text-green-600 pt-2 border-t">
            <span>Gesamtkosten</span>
            <span>{totalCost.toLocaleString('de-DE')} €</span>
          </div>
          {advanceRequested && advancePayment > 0 && (
            <div className="flex justify-between text-sm text-orange-600">
              <span>Vorschuss beantragt</span>
              <span>{advancePayment.toLocaleString('de-DE')} €</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Zusätzliche Anmerkungen */}
      <div className="space-y-2">
        <Label htmlFor="notes">Zusätzliche Anmerkungen (optional)</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Weitere Informationen für den Genehmiger..."
          rows={3}
        />
      </div>

      {/* Genehmigungsprozess */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-1">Genehmigungsprozess</h4>
              <p className="text-sm text-muted-foreground">
                Ihr Reiseantrag wird an Ihren direkten Vorgesetzten ({supervisor}) zur Genehmigung weitergeleitet.
                {totalCost > 2000 && (
                  <span className="text-orange-600 block mt-1">
                    <AlertCircle className="h-3 w-3 inline mr-1" />
                    Bei Kosten über 2.000 € ist zusätzlich eine Budget-Freigabe durch Finance erforderlich.
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WizardStep4Review;
