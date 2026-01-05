import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export const HierarchyInfoBox = () => {
  return (
    <Card className="bg-purple-50 border-purple-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-purple-600 mt-0.5" />
          <p className="text-sm text-purple-700">
            <strong>Strategische Unternehmensziele</strong> werden über <strong>Bereichs-</strong> und <strong>Teamziele</strong> bis zu <strong>individuellen Zielen</strong> heruntergebrochen. 
            Jedes Ziel trägt zur Erreichung übergeordneter Ziele bei.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
