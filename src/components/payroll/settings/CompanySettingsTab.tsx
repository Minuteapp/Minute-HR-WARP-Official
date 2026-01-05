import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Pencil } from "lucide-react";

interface Location {
  id: string;
  name: string;
}

export const CompanySettingsTab = () => {
  // Keine Mock-Daten - leerer Zustand bis echte Firmendaten geladen werden
  const [companyData, setCompanyData] = useState({
    name: "",
    taxNumber: "",
    businessNumber: "",
    ikNumber: "",
    address: "",
  });

  // Keine Mock-Standorte - echte Standorte werden aus der Datenbank geladen
  const [locations] = useState<Location[]>([]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Unternehmensdaten</h2>
        <p className="text-sm text-muted-foreground">Stammdaten für die Lohnabrechnung</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Company Data Card */}
        <Card className="border bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Stammdaten</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Firmenname</Label>
              <Input 
                id="companyName"
                value={companyData.name}
                onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxNumber">Steuernummer</Label>
              <Input 
                id="taxNumber"
                value={companyData.taxNumber}
                onChange={(e) => setCompanyData(prev => ({ ...prev, taxNumber: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessNumber">Betriebsnummer</Label>
              <Input 
                id="businessNumber"
                value={companyData.businessNumber}
                onChange={(e) => setCompanyData(prev => ({ ...prev, businessNumber: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ikNumber">IK-Nummer</Label>
              <Input 
                id="ikNumber"
                value={companyData.ikNumber}
                onChange={(e) => setCompanyData(prev => ({ ...prev, ikNumber: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Anschrift</Label>
              <Input 
                id="address"
                value={companyData.address}
                onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <Button className="w-full mt-4">Änderungen speichern</Button>
          </CardContent>
        </Card>

        {/* Locations Card */}
        <Card className="border bg-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">Standorte</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {locations.map((location) => (
                <div 
                  key={location.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-medium text-foreground">{location.name}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              + Standort hinzufügen
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
