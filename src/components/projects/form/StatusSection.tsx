
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StatusSectionProps {
  status: string;
  priority: string;
  onChange: (field: string, value: any) => void;
}

export const StatusSection = ({ status, priority, onChange }: StatusSectionProps) => {
  // Status-Wert in einen gültigen Wert umwandeln
  const displayStatus = status || 'pending';
  
  const handleStatusChange = (value: string) => {
    // Übergeben des ausgewählten Wertes direkt an die übergeordnete Komponente
    onChange('status', value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status & Priorität</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={displayStatus}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Status auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Anstehend</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="review">Überprüfung</SelectItem>
              <SelectItem value="blocked">Blockiert</SelectItem>
              <SelectItem value="completed">Abgeschlossen</SelectItem>
              <SelectItem value="archived">Archiviert</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priority">Priorität</Label>
          <Select
            value={priority || "medium"}
            onValueChange={(value) => onChange('priority', value)}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="Priorität auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Hoch</SelectItem>
              <SelectItem value="medium">Mittel</SelectItem>
              <SelectItem value="low">Niedrig</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
