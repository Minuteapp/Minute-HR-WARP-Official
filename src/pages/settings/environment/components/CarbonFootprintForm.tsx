
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const CarbonFootprintForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    emissions_value: "",
    source: "",
    unit: "kg CO2e",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('carbon_footprint')
        .insert({
          date: formData.date,
          emissions_value: Number(formData.emissions_value),
          source: formData.source,
          unit: formData.unit,
          notes: formData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Erfolgreich",
        description: "CO2-Daten wurden erfolgreich gespeichert",
      });

      // Reset form
      setFormData({
        date: "",
        emissions_value: "",
        source: "",
        unit: "kg CO2e",
        notes: "",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Daten konnten nicht gespeichert werden: " + error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Datum</Label>
          <Input
            id="date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emissions_value">Emissionswert</Label>
          <Input
            id="emissions_value"
            type="number"
            step="0.01"
            required
            value={formData.emissions_value}
            onChange={(e) => setFormData({ ...formData, emissions_value: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="source">Quelle</Label>
          <Input
            id="source"
            required
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notizen</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Wird gespeichert..." : "Speichern"}
        </Button>
      </form>
    </Card>
  );
};
