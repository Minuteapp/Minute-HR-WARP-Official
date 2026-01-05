import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Globe, Shield } from "lucide-react";
import { EAPAccess } from "@/integrations/supabase/hooks/useEmployeeHealth";

interface EAPCardProps {
  eap?: EAPAccess;
}

export const EAPCard = ({ eap }: EAPCardProps) => {
  if (!eap) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Employee Assistance Program (EAP)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Kein EAP-Zugang verfügbar</p>
        </CardContent>
      </Card>
    );
  }

  const topics = eap.available_topics || [];

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-purple-600" />
          Employee Assistance Program (EAP)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-white/50 dark:bg-background/50">
            <p className="text-sm text-muted-foreground mb-1">Verfügbare Beratungen</p>
            <p className="text-2xl font-bold">24/7</p>
            <p className="text-xs text-muted-foreground">Kostenlos & vertraulich</p>
          </div>
          <div className="border rounded-lg p-4 bg-white/50 dark:bg-background/50">
            <p className="text-sm text-muted-foreground mb-1">Beratungsstunden/Jahr</p>
            <p className="text-2xl font-bold">{eap.hours_per_year} Stunden</p>
            <p className="text-xs text-muted-foreground">Pro Mitarbeiter</p>
          </div>
          <div className="border rounded-lg p-4 bg-white/50 dark:bg-background/50">
            <p className="text-sm text-muted-foreground mb-1">Anbieter</p>
            <p className="text-lg font-bold">{eap.provider_name}</p>
            {eap.provider_since && (
              <p className="text-xs text-muted-foreground">
                Seit {new Date(eap.provider_since).getFullYear()}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Beratungsthemen</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {topics.map((topic, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span className="text-sm">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-white/50 dark:bg-background/50 space-y-3">
          <h4 className="font-medium">Kontakt</h4>
          <div className="space-y-2 text-sm">
            {eap.hotline_number && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Hotline (24/7):</span>
                <span>{eap.hotline_number}</span>
              </div>
            )}
            {eap.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">E-Mail:</span>
                <span>{eap.email}</span>
              </div>
            )}
            {eap.portal_url && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Online-Portal:</span>
                <span className="text-blue-600 hover:underline cursor-pointer">
                  {eap.portal_url.replace('https://', '')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="border border-purple-200 rounded-lg p-4 bg-purple-50/50 dark:bg-purple-950/20">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                💜 Vertraulichkeit garantiert
              </h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Alle Beratungen sind streng vertraulich. Der Arbeitgeber erhält keinerlei 
                Informationen über die Inanspruchnahme oder Beratungsinhalte. Die Nutzung 
                hat keinerlei Einfluss auf das Arbeitsverhältnis.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
