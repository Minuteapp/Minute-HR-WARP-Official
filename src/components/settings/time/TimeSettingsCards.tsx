
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Plus } from "lucide-react";

export const TimeModelCard = () => {
  const timeModels = [
    { name: "Vollzeit", hours: "40h/Woche", status: "aktiv" },
    { name: "Teilzeit", hours: "20h/Woche", status: "aktiv" },
    { name: "Gleitzeit", hours: "Flexibel", status: "aktiv" }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Arbeitszeitmodelle
        </CardTitle>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Neues Modell
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {timeModels.map((model, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{model.name}</h4>
                <p className="text-sm text-gray-500">{model.hours}</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {model.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const AbsenceRulesCard = () => {
  const absenceTypes = [
    { name: "Urlaub", days: "30 Tage/Jahr", color: "bg-blue-100 text-blue-800" },
    { name: "Krankheit", days: "Unbegrenzt", color: "bg-red-100 text-red-800" },
    { name: "Fortbildung", days: "5 Tage/Jahr", color: "bg-purple-100 text-purple-800" }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Abwesenheitstypen
        </CardTitle>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Neuer Typ
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {absenceTypes.map((type, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">{type.name}</h4>
                <p className="text-sm text-gray-500">{type.days}</p>
              </div>
              <Badge className={type.color}>
                Konfiguriert
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
