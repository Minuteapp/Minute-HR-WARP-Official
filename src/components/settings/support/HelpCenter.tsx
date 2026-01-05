
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const HelpCenter = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Hilfe-Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier finden Sie Hilfe und Dokumentation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpCenter;
