
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "lucide-react";

const ThirdPartySettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Drittanbieter Integrationen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie Integrationen mit Drittanbietern verwalten.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThirdPartySettings;
