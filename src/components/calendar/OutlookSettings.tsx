import { Card } from "@/components/ui/card";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const OutlookSettings = () => {
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Microsoft Outlook Integration</h3>
        <p className="text-sm text-muted-foreground">
          Die Outlook-Integration erfordert eine sichere Konfiguration auf Server-Ebene.
        </p>
      </div>

      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Sicherheitshinweis</AlertTitle>
        <AlertDescription>
          API-Schlüssel und Secrets dürfen aus Sicherheitsgründen nicht im Browser gespeichert werden. 
          Diese Konfiguration muss über die Backend-Secrets-Verwaltung erfolgen.
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Konfiguration erforderlich</AlertTitle>
        <AlertDescription>
          Bitte kontaktieren Sie Ihren Systemadministrator, um die Outlook-Integration 
          sicher über die Supabase Secrets-Verwaltung zu konfigurieren.
        </AlertDescription>
      </Alert>
    </Card>
  );
};


export default OutlookSettings;