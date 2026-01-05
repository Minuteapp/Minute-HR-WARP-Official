import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ComplianceDomain {
  id: string;
  name: string;
  enabled: boolean;
}

interface GeneralSettingsProps {
  domains?: ComplianceDomain[];
  riskScale?: string;
  reportLanguage?: string;
  onDomainChange?: (domainId: string, enabled: boolean) => void;
  onRiskScaleChange?: (value: string) => void;
  onLanguageChange?: (value: string) => void;
}

const defaultDomains: ComplianceDomain[] = [
  { id: "worktime", name: "Arbeitszeit-Compliance", enabled: false },
  { id: "expenses", name: "Spesen & Corporate Cards", enabled: false },
  { id: "privacy", name: "Datenschutz & DSGVO", enabled: false },
  { id: "training", name: "Schulungen & Zertifikate", enabled: false },
  { id: "esg", name: "ESG & Social Compliance", enabled: false },
  { id: "policies", name: "Richtlinien-Management", enabled: false },
];

export const GeneralSettings = ({
  domains = defaultDomains,
  riskScale = "",
  reportLanguage = "",
  onDomainChange,
  onRiskScaleChange,
  onLanguageChange,
}: GeneralSettingsProps) => {
  return (
    <div className="space-y-6">
      {/* Aktivierte Compliance-Domänen */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Aktivierte Compliance-Domänen</h3>
        <div className="grid grid-cols-2 gap-4">
          {domains.map((domain) => (
            <Card key={domain.id} className="border bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{domain.name}</span>
                <Checkbox
                  checked={domain.enabled}
                  onCheckedChange={(checked) => onDomainChange?.(domain.id, checked as boolean)}
                  className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Risiko-Skala und Sprache */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Risiko-Skala</Label>
          <Select value={riskScale} onValueChange={onRiskScaleChange}>
            <SelectTrigger>
              <SelectValue placeholder="Risiko-Skala auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 (Numerisch)</SelectItem>
              <SelectItem value="1-5">1-5 (Vereinfacht)</SelectItem>
              <SelectItem value="text">Kritisch-Niedrig (Text)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-foreground">Standard-Sprache für Reports</Label>
          <Select value={reportLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sprache auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
