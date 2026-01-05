import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, FileBarChart } from "lucide-react";

export const CostIntegrationBox = () => {
  return (
    <Card className="mt-6 bg-muted/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Integration mit Budget & Forecast</p>
              <p className="text-sm text-muted-foreground">
                Automatische Synchronisation mit dem Budgetmodul aktiviert
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <FileBarChart className="h-4 w-4 mr-2" />
            Zum Budgetmodul
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
