import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface PolicyCategory {
  id: string;
  name: string;
}

interface PoliciesSettingsProps {
  categories?: PolicyCategory[];
  requireConfirmation?: boolean;
  reminderFrequency?: string;
  escalationDays?: number;
  onCategoryEdit?: (categoryId: string) => void;
  onConfirmationChange?: (value: boolean) => void;
  onFrequencyChange?: (value: string) => void;
  onEscalationDaysChange?: (value: number) => void;
}

const defaultCategories: PolicyCategory[] = [
  { id: "worktime", name: "Arbeitszeit & Überstunden" },
  { id: "homeoffice", name: "Homeoffice & Remote Work" },
  { id: "travel", name: "Reisekosten & Spesen" },
  { id: "cards", name: "Firmenkarten-Nutzung" },
  { id: "it", name: "IT & Datensicherheit" },
  { id: "conduct", name: "Code of Conduct" },
  { id: "harassment", name: "Anti-Harassment" },
  { id: "esg", name: "ESG-Richtlinien" },
];

export const PoliciesSettings = ({
  categories = defaultCategories,
  requireConfirmation = false,
  reminderFrequency = "",
  escalationDays,
  onCategoryEdit,
  onConfirmationChange,
  onFrequencyChange,
  onEscalationDaysChange,
}: PoliciesSettingsProps) => {
  return (
    <div className="space-y-6">
      {/* Richtlinien-Kategorien */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Richtlinien-Kategorien</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <Card key={category.id} className="border bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{category.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCategoryEdit?.(category.id)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  Bearbeiten
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pflichtbestätigungen */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Pflichtbestätigungen</h3>
        <div className="flex items-center space-x-3">
          <Checkbox
            id="requireConfirmation"
            checked={requireConfirmation}
            onCheckedChange={(checked) => onConfirmationChange?.(checked as boolean)}
            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
          />
          <Label htmlFor="requireConfirmation" className="text-sm text-foreground">
            Mitarbeiter müssen neue Richtlinien bestätigen
          </Label>
        </div>
      </div>

      {/* Erinnerungsfrequenz und Eskalation */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Erinnerungsfrequenz</Label>
          <Select value={reminderFrequency} onValueChange={onFrequencyChange}>
            <SelectTrigger>
              <SelectValue placeholder="Frequenz auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Täglich</SelectItem>
              <SelectItem value="weekly">Wöchentlich</SelectItem>
              <SelectItem value="monthly">Monatlich</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Eskalation nach (Tagen)</Label>
          <Input
            type="number"
            value={escalationDays ?? ""}
            onChange={(e) => onEscalationDaysChange?.(parseInt(e.target.value) || 0)}
            placeholder="z.B. 7"
          />
        </div>
      </div>
    </div>
  );
};
