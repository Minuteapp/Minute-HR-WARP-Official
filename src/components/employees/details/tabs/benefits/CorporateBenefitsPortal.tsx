import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift } from "lucide-react";

export const CorporateBenefitsPortal = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Corporate Benefits Portal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Keine Benefits konfiguriert</p>
          <p className="text-xs text-muted-foreground">
            Corporate Benefits werden vom Unternehmen eingerichtet und hier angezeigt.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
