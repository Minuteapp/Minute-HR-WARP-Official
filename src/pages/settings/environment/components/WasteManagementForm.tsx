
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export const WasteManagementForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    amount: "",
    waste_type: "",
    recycling_rate: "",
    unit: "kg",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('waste_management')
        .insert({
          date: formData.date,
          amount: Number(formData.amount),
          waste_type: formData.waste_type,
          recycling_rate: formData.recycling_rate ? Number(formData.recycling_rate) : null,
          unit: formData.unit,
          notes: formData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Erfolgreich",
        description: "Abfalldaten wurden erfolgreich gespeichert",
      });

      // Reset form
      setFormData({
        date: "",
        amount: "",
        waste_type: "",
        recycling_rate: "",
        unit: "kg",
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
          <Label htmlFor="amount">Menge</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waste_type">Abfallart</Label>
          <Select 
            value={formData.waste_type}
            onValueChange={(value) => setFormData({ ...formData, waste_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Abfallart auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paper">Papier</SelectItem>
              <SelectItem value="plastic">Kunststoff</SelectItem>
              <SelectItem value="organic">Organisch</SelectItem>
              <SelectItem value="metal">Metall</SelectItem>
              <SelectItem value="glass">Glas</SelectItem>
              <SelectItem value="electronic">Elektronik</SelectItem>
              <SelectItem value="hazardous">Gefährliche Abfälle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recycling_rate">Recyclingquote (%)</Label>
          <Input
            id="recycling_rate"
            type="number"
            min="0"
            max="100"
            value={formData.recycling_rate}
            onChange={(e) => setFormData({ ...formData, recycling_rate: e.target.value })}
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
