
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const ProjectRoiRiskSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ROI & Risikomanagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Berechnungsregeln für ROI und Risikobewertung von Projekten festlegen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectRoiRiskSettings;
