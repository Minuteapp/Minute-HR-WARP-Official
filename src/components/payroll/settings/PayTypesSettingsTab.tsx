import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PayTypeItem {
  id: string;
  name: string;
  enabled: boolean;
}

export const PayTypesSettingsTab = () => {
  const [salaryComponents, setSalaryComponents] = useState<PayTypeItem[]>([
    { id: "1", name: "Grundgehalt", enabled: true },
    { id: "2", name: "Überstundenzuschlag", enabled: true },
    { id: "3", name: "Nachtarbeitszuschlag", enabled: false },
    { id: "4", name: "Sonntagszuschlag", enabled: false },
    { id: "5", name: "Weihnachtsgeld", enabled: true },
    { id: "6", name: "Urlaubsgeld", enabled: true },
  ]);

  const [deductions, setDeductions] = useState<PayTypeItem[]>([
    { id: "1", name: "Lohnsteuer", enabled: true },
    { id: "2", name: "Solidaritätszuschlag", enabled: true },
    { id: "3", name: "Kirchensteuer", enabled: true },
    { id: "4", name: "Krankenversicherung", enabled: true },
    { id: "5", name: "Rentenversicherung", enabled: true },
    { id: "6", name: "Arbeitslosenversicherung", enabled: true },
  ]);

  const toggleSalaryComponent = (id: string) => {
    setSalaryComponents(prev => prev.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  const toggleDeduction = (id: string) => {
    setDeductions(prev => prev.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">Lohnarten & Berechnungen</h2>
        <p className="text-sm text-muted-foreground">Konfiguration der Abrechnungskomponenten</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Salary Components */}
        <Card className="border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Gehaltskomponenten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {salaryComponents.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <Label htmlFor={`salary-${item.id}`} className="text-foreground cursor-pointer">
                  {item.name}
                </Label>
                <Switch 
                  id={`salary-${item.id}`}
                  checked={item.enabled}
                  onCheckedChange={() => toggleSalaryComponent(item.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Deductions */}
        <Card className="border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Abzüge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deductions.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <Label htmlFor={`deduction-${item.id}`} className="text-foreground cursor-pointer">
                  {item.name}
                </Label>
                <Switch 
                  id={`deduction-${item.id}`}
                  checked={item.enabled}
                  onCheckedChange={() => toggleDeduction(item.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
