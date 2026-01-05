
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Palette, Plus, Trash2, Save, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const CalendarEventTypes = () => {
  const { toast } = useToast();
  const [eventTypes, setEventTypes] = useState([
    { id: 1, name: "Meeting", color: "#3B82F6", icon: "👥", description: "Standard Meetings" },
    { id: 2, name: "Training", color: "#10B981", icon: "📚", description: "Schulungen & Weiterbildung" },
    { id: 3, name: "Betriebsrat", color: "#F59E0B", icon: "⚖️", description: "Betriebsratssitzungen" },
    { id: 4, name: "Projekt", color: "#8B5CF6", icon: "🚀", description: "Projektbesprechungen" },
    { id: 5, name: "Personal", color: "#EF4444", icon: "🏠", description: "Persönliche Termine" }
  ]);

  const [newEventType, setNewEventType] = useState({
    name: "",
    color: "#3B82F6",
    icon: "📅",
    description: ""
  });

  const colors = [
    "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444",
    "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6B7280"
  ];

  const addEventType = () => {
    if (!newEventType.name) return;
    
    const eventType = {
      id: Date.now(),
      ...newEventType
    };
    
    setEventTypes([...eventTypes, eventType]);
    setNewEventType({ name: "", color: "#3B82F6", icon: "📅", description: "" });
    
    toast({
      title: "Termintyp hinzugefügt",
      description: `${eventType.name} wurde erfolgreich erstellt.`
    });
  };

  const removeEventType = (id: number) => {
    setEventTypes(eventTypes.filter(type => type.id !== id));
    toast({
      title: "Termintyp entfernt",
      description: "Der Termintyp wurde erfolgreich gelöscht."
    });
  };

  const handleSave = () => {
    toast({
      title: "Termintypen gespeichert",
      description: "Alle Änderungen wurden erfolgreich gespeichert."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bestehende Termintypen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {eventTypes.map((type) => (
              <div key={type.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="text-lg">{type.icon}</span>
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeEventType(type.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Neuen Termintyp hinzufügen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name des Termintyps</Label>
              <Input 
                value={newEventType.name}
                onChange={(e) => setNewEventType(prev => ({...prev, name: e.target.value}))}
                placeholder="z.B. Kunde Meeting"
              />
            </div>
            <div className="space-y-2">
              <Label>Icon/Emoji</Label>
              <Input 
                value={newEventType.icon}
                onChange={(e) => setNewEventType(prev => ({...prev, icon: e.target.value}))}
                placeholder="📅"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Beschreibung</Label>
            <Input 
              value={newEventType.description}
              onChange={(e) => setNewEventType(prev => ({...prev, description: e.target.value}))}
              placeholder="Kurze Beschreibung des Termintyps"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Farbe auswählen
            </Label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    newEventType.color === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewEventType(prev => ({...prev, color}))}
                />
              ))}
            </div>
          </div>

          <Button onClick={addEventType} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Termintyp hinzufügen
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Alle Änderungen speichern
        </Button>
      </div>
    </div>
  );
};

export default CalendarEventTypes;
