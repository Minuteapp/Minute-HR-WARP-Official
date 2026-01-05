
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

const EmailTemplateSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-Mail Template Einstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Hier können Sie E-Mail-Templates verwalten.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTemplateSettings;
