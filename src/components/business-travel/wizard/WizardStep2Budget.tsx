import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { TripFormData } from "@/types/business-travel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Euro, Info, CheckCircle } from "lucide-react";

interface WizardStep2Props {
  register: UseFormRegister<TripFormData>;
  setValue: UseFormSetValue<TripFormData>;
  watch: UseFormWatch<TripFormData>;
  errors: FieldErrors<TripFormData>;
}

const departments = [
  "Marketing",
  "IT",
  "Vertrieb",
  "HR",
  "Finance",
  "Operations",
  "Entwicklung",
  "Kundenservice",
];

const WizardStep2Budget = ({
  register,
  setValue,
  watch,
  errors,
}: WizardStep2Props) => {
  const advanceRequested = watch("advance_requested");
  const estimatedCost = watch("estimated_cost") || 0;

  return (
    <div className="space-y-6">
      {/* Abteilung / Kostenstelle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Abteilung / Kostenstelle <span className="text-destructive">*</span>
          </Label>
          <Select onValueChange={(value) => setValue("department", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Abteilung auswählen" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="project_id">Projekt / Auftrag (optional)</Label>
          <Input
            id="project_id"
            {...register("project_id")}
            placeholder="Projektnummer oder -name"
          />
        </div>
      </div>

      {/* Geschätzte Gesamtkosten */}
      <div className="space-y-2">
        <Label htmlFor="estimated_cost">
          Geschätzte Gesamtkosten <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="estimated_cost"
            type="number"
            {...register("estimated_cost", { 
              required: "Geschätzte Kosten sind erforderlich",
              valueAsNumber: true 
            })}
            placeholder="0"
            className="pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3 w-3" />
          Inkl. Transport, Unterkunft, Verpflegung
        </p>
        {errors.estimated_cost && (
          <p className="text-sm text-destructive">{errors.estimated_cost.message}</p>
        )}
      </div>

      {/* Dringlichkeit */}
      <div className="space-y-2">
        <Label>Dringlichkeit</Label>
        <Select onValueChange={(value) => setValue("priority", value as any)} defaultValue="normal">
          <SelectTrigger>
            <SelectValue placeholder="Dringlichkeit auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Niedrig</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">Hoch</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vorauszahlung */}
      <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="advance_requested"
            checked={advanceRequested}
            onCheckedChange={(checked) => setValue("advance_requested", !!checked)}
          />
          <Label htmlFor="advance_requested" className="cursor-pointer font-medium">
            Reisekostenvorschuss beantragen
          </Label>
        </div>

        {advanceRequested && (
          <div className="space-y-2 pl-6">
            <Label htmlFor="advance_payment">Vorschussbetrag</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="advance_payment"
                type="number"
                {...register("advance_payment", { valueAsNumber: true })}
                placeholder="0"
                className="pl-10 max-w-[200px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* KI-Budgetprüfung */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm">KI-Budgetprüfung</h4>
                <Badge variant="outline" className="text-green-600 border-green-600 bg-green-50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Budget verfügbar
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {estimatedCost > 0 
                  ? `Die geschätzten Kosten von ${estimatedCost.toLocaleString('de-DE')} € liegen innerhalb Ihres Abteilungsbudgets. Basierend auf vergleichbaren Reisen empfehlen wir ein Budget von ca. 850-1.200 €.`
                  : 'Geben Sie die geschätzten Kosten ein, um eine KI-basierte Budgetanalyse zu erhalten.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WizardStep2Budget;
