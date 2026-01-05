
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Shield } from "lucide-react";

const ProfileValidationSettings = () => {
  const validationRules = [
    { id: 1, field: "E-Mail", rule: "Gültiges E-Mail-Format", status: "Aktiv", violations: 0 },
    { id: 2, field: "Telefonnummer", rule: "Deutsche Telefonnummer", status: "Aktiv", violations: 3 },
    { id: 3, field: "Postleitzahl", rule: "5-stellige PLZ", status: "Aktiv", violations: 1 },
    { id: 4, field: "IBAN", rule: "Gültige IBAN", status: "Inaktiv", violations: 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Validierungsregeln</h2>
        <Button className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Neue Regel erstellen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">12</div>
            <div className="text-sm text-gray-600">Aktive Regeln</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-600">4</div>
            <div className="text-sm text-gray-600">Verstöße heute</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">98.5%</div>
            <div className="text-sm text-gray-600">Erfolgsrate</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Konfigurierte Validierungsregeln</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validationRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{rule.field}</div>
                  <div className="text-sm text-gray-600">{rule.rule}</div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={rule.status === 'Aktiv' ? 'default' : 'secondary'}>
                    {rule.status}
                  </Badge>
                  <div className="text-sm">
                    {rule.violations > 0 ? (
                      <span className="text-red-600">{rule.violations} Verstöße</span>
                    ) : (
                      <span className="text-green-600">Keine Verstöße</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Bearbeiten
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileValidationSettings;
