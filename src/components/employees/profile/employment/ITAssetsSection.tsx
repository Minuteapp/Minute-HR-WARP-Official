import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Smartphone, Monitor, AlertCircle } from "lucide-react";
import { Employee } from "@/types/employee.types";
import { Badge } from "@/components/ui/badge";

interface ITAssetsSectionProps {
  employee: Employee | null;
}

export const ITAssetsSection = ({ employee }: ITAssetsSectionProps) => {
  // No mock data - IT assets should be loaded from database
  const assets: Array<{
    icon: typeof Laptop;
    name: string;
    details: string;
    serial: string;
    assigned: string;
  }> = [];

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Laptop className="h-4 w-4" />
          IT-Assets & Ausstattung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine IT-Assets zugewiesen
          </p>
        ) : (
          <>
            {assets.map((asset, index) => {
              const IconComponent = asset.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{asset.name}</h4>
                      <Badge className="bg-black text-white text-xs">
                        aktiv
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{asset.details}</p>
                    <p className="text-xs text-muted-foreground">{asset.serial}</p>
                    <p className="text-xs text-muted-foreground">{asset.assigned}</p>
                  </div>
                </div>
              );
            })}

            <div className="p-3 bg-gray-50 border-l-4 border-l-primary rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Asset-Verantwortung</p>
                <p className="text-xs text-muted-foreground">
                  Der Mitarbeiter ist für die Pflege und den Erhalt der zugewiesenen IT-Assets verantwortlich. 
                  Bei Verlust oder Beschädigung ist die IT-Abteilung umgehend zu informieren.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
