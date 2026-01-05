
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const EnergyConsumptionForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    consumption_value: "",
    type: "electricity",
    unit: "kWh",
    cost: "",
    location: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('energy_consumption')
        .insert({
          date: formData.date,
          consumption_value: Number(formData.consumption_value),
          type: formData.type,
          unit: formData.unit,
          cost: formData.cost ? Number(formData.cost) : null,
          location: formData.location || null,
          notes: formData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Erfolgreich",
        description: "Energieverbrauchsdaten wurden erfolgreich gespeichert",
      });

      // Reset form
      setFormData({
        date: "",
        consumption_value: "",
        type: "electricity",
        unit: "kWh",
        cost: "",
        location: "",
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
          <Label htmlFor="consumption_value">Verbrauchswert</Label>
          <Input
            id="consumption_value"
            type="number"
            step="0.01"
            required
            value={formData.consumption_value}
            onChange={(e) => setFormData({ ...formData, consumption_value: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Energieart</Label>
          <Select 
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Energieart auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electricity">Strom</SelectItem>
              <SelectItem value="gas">Gas</SelectItem>
              <SelectItem value="heating">Heizung</SelectItem>
              <SelectItem value="renewable">Erneuerbare Energie</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Kosten (€)</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Standort</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
