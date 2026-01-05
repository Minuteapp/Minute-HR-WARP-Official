import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Building, MapPin, Plus, Trash2, Edit } from "lucide-react";

export const CompanyStructure = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Gespeichert",
        description: "Die Unternehmensstruktur wurde erfolgreich aktualisiert.",
      });
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Abteilungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Geschäftsführung', 'Entwicklung', 'Vertrieb', 'Marketing'].map((dept, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{dept}</h3>
                    <Badge variant="secondary">— Mitarbeiter</Badge>
                  </div>
                  <Button variant="outline" size="sm">Bearbeiten</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Wird gespeichert..." : "Speichern"}
        </Button>
      </div>
    </div>
  );
};