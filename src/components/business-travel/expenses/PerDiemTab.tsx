import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  RefreshCw,
  Calculator,
  Edit,
  Globe,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";

const countryFlags: Record<string, string> = {
  DE: "🇩🇪",
  AT: "🇦🇹",
  CH: "🇨🇭",
  FR: "🇫🇷",
  US: "🇺🇸",
  GB: "🇬🇧",
  IT: "🇮🇹",
  ES: "🇪🇸",
  NL: "🇳🇱",
  BE: "🇧🇪",
};

export function PerDiemTab() {
  const [viewMode, setViewMode] = useState<"rates" | "calculator">("rates");
  const [activeSubTab, setActiveSubTab] = useState<"pauschalen" | "rechner" | "kurse" | "settings">("pauschalen");
  const queryClient = useQueryClient();

  // Calculator state
  const [calcDestination, setCalcDestination] = useState("");
  const [calcDays, setCalcDays] = useState(1);
  const [calcFullDays, setCalcFullDays] = useState(0);
  const [calcHalfDays, setCalcHalfDays] = useState(0);
  const [breakfastDeduction, setBreakfastDeduction] = useState(false);
  const [lunchDeduction, setLunchDeduction] = useState(false);
  const [dinnerDeduction, setDinnerDeduction] = useState(false);

  const { data: rates = [], isLoading } = useQuery({
    queryKey: ["per-diem-rates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("per_diem_rates")
        .select("*")
        .order("country");
      if (error) throw error;
      return data || [];
    },
  });

  const updateRateMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("per_diem_rates")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["per-diem-rates"] });
      toast.success("Status aktualisiert");
    },
  });

  // Calculate per diem
  const selectedRate = rates.find((r: any) => r.id === calcDestination);
  const calculatePerDiem = () => {
    if (!selectedRate) return 0;
    let total = (calcFullDays * selectedRate.full_day_rate) + (calcHalfDays * selectedRate.half_day_rate);
    
    // Apply deductions
    const fullDayDeductions = calcFullDays * selectedRate.full_day_rate;
    if (breakfastDeduction) total -= fullDayDeductions * 0.25;
    if (lunchDeduction) total -= fullDayDeductions * 0.40;
    if (dinnerDeduction) total -= fullDayDeductions * 0.40;
    
    return Math.max(0, total);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tagessätze (Per Diem)</h2>
          <p className="text-muted-foreground">Verwalten Sie Verpflegungspauschalen nach amtlichen Sätzen</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sätze aktualisieren
          </Button>
          <Button className="bg-primary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Neuer Satz
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "rates" ? "default" : "outline"}
          onClick={() => setViewMode("rates")}
        >
          <Globe className="h-4 w-4 mr-2" />
          Sätze-Übersicht
        </Button>
        <Button
          variant={viewMode === "calculator" ? "default" : "outline"}
          onClick={() => setViewMode("calculator")}
        >
          <Calculator className="h-4 w-4 mr-2" />
          € Rechner
        </Button>
      </div>

      {/* Sub-Tabs */}
      <div className="flex border-b">
        {[
          { key: "pauschalen", label: "Tagespauschalen" },
          { key: "rechner", label: "Rechner" },
          { key: "kurse", label: "Wechselkurse" },
          { key: "settings", label: "Einstellungen" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSubTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeSubTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Rates Overview */}
      {viewMode === "rates" && activeSubTab === "pauschalen" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Aktuelle Tagespauschalen</CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Pauschale hinzufügen
            </Button>
          </CardHeader>
          <CardContent>
            {rates.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Keine Tagessätze vorhanden</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Fügen Sie Tagessätze für verschiedene Länder hinzu.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ersten Satz hinzufügen
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Land/Stadt</TableHead>
                    <TableHead className="text-right">Ganzer Tag</TableHead>
                    <TableHead className="text-right">Halber Tag</TableHead>
                    <TableHead className="text-right">EUR-Gegenwert</TableHead>
                    <TableHead>Quelle</TableHead>
                    <TableHead>Gültig ab</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rates.map((rate: any) => (
                    <TableRow key={rate.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{countryFlags[rate.country_code] || "🌍"}</span>
                          <div>
                            <p className="font-medium">{rate.country}</p>
                            {rate.city && <p className="text-sm text-muted-foreground">{rate.city}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {rate.full_day_rate?.toLocaleString("de-DE", { minimumFractionDigits: 2 })} {rate.currency}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {rate.half_day_rate?.toLocaleString("de-DE", { minimumFractionDigits: 2 })} {rate.currency}
                      </TableCell>
                      <TableCell className="text-right">
                        {rate.currency !== "EUR" && rate.eur_equivalent_full ? (
                          <span className="text-muted-foreground">
                            {rate.eur_equivalent_full?.toLocaleString("de-DE", { minimumFractionDigits: 2 })} € / {rate.eur_equivalent_half?.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Amtlich
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rate.valid_from && format(new Date(rate.valid_from), "dd.MM.yyyy", { locale: de })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Calculator */}
      {(viewMode === "calculator" || activeSubTab === "rechner") && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Per-Diem-Rechner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Reiseziel</Label>
                <Select value={calcDestination} onValueChange={setCalcDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Land/Stadt auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {rates.map((rate: any) => (
                      <SelectItem key={rate.id} value={rate.id}>
                        {countryFlags[rate.country_code] || "🌍"} {rate.country} {rate.city ? `- ${rate.city}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Anzahl Tage</Label>
                <Input
                  type="number"
                  min={1}
                  value={calcDays}
                  onChange={(e) => setCalcDays(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ganze Tage</Label>
                <Input
                  type="number"
                  min={0}
                  value={calcFullDays}
                  onChange={(e) => setCalcFullDays(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Anreisetag/Abreisetag (halbe Tage)</Label>
                <Input
                  type="number"
                  min={0}
                  value={calcHalfDays}
                  onChange={(e) => setCalcHalfDays(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Kürzungsregeln</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Frühstück gestellt</p>
                    <p className="text-sm text-muted-foreground">-25% der Tagespauschale</p>
                  </div>
                  <Switch checked={breakfastDeduction} onCheckedChange={setBreakfastDeduction} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Mittagessen gestellt</p>
                    <p className="text-sm text-muted-foreground">-40% der Tagespauschale</p>
                  </div>
                  <Switch checked={lunchDeduction} onCheckedChange={setLunchDeduction} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Abendessen gestellt</p>
                    <p className="text-sm text-muted-foreground">-40% der Tagespauschale</p>
                  </div>
                  <Switch checked={dinnerDeduction} onCheckedChange={setDinnerDeduction} />
                </div>
              </div>
            </div>

            {selectedRate && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Berechneter Betrag</p>
                    <p className="text-3xl font-bold text-primary">
                      {calculatePerDiem().toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{calcFullDays} volle Tage × {selectedRate.full_day_rate} €</p>
                    <p>{calcHalfDays} halbe Tage × {selectedRate.half_day_rate} €</p>
                    {(breakfastDeduction || lunchDeduction || dinnerDeduction) && (
                      <p className="text-red-600">- Kürzungen angewandt</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-medium text-blue-900">Hinweis zu Tagessätzen</p>
          <p className="text-sm text-blue-700">
            Die Tagessätze basieren auf den amtlichen Verpflegungspauschalen des Bundesfinanzministeriums. 
            Bei Mahlzeitenstellung durch den Arbeitgeber oder Dritte sind die entsprechenden Kürzungen vorzunehmen.
          </p>
        </div>
      </div>
    </div>
  );
}
