
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings, Plus, Type, Calendar, Hash } from "lucide-react";

const ProfileFieldSettings = () => {
  const fields = [
    { id: 1, name: "Vorname", type: "Text", required: true, visible: true, category: "Persönlich" },
    { id: 2, name: "Nachname", type: "Text", required: true, visible: true, category: "Persönlich" },
    { id: 3, name: "Geburtsdatum", type: "Datum", required: false, visible: true, category: "Persönlich" },
    { id: 4, name: "Mitarbeiternummer", type: "Nummer", required: true, visible: true, category: "Arbeit" },
    { id: 5, name: "Notfallkontakt", type: "Text", required: false, visible: false, category: "Notfall" }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Datum':
        return Calendar;
      case 'Nummer':
        return Hash;
      default:
        return Type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Profilfelder konfigurieren</h2>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Neues Feld hinzufügen
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Verfügbare Felder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fields.map((field) => {
              const TypeIcon = getTypeIcon(field.type);
              return (
                <div key={field.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <TypeIcon className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{field.name}</div>
                      <div className="text-sm text-gray-600">{field.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={field.type === 'Text' ? 'default' : 'secondary'}>
                      {field.type}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Erforderlich</span>
                      <Switch checked={field.required} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Sichtbar</span>
                      <Switch checked={field.visible} />
                    </div>
                    <Button variant="outline" size="sm">
                      Bearbeiten
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileFieldSettings;
