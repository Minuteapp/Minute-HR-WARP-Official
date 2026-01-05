
// Ich erstelle eine minimale Implementierung, um den Fehler zu beheben
import { PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ReportsIntegration = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Berichtsintegrationen</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Verteilung der Integrationen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Integrationsinhalte werden hier angezeigt</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsIntegration;
