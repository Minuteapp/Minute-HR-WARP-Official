import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plug, Settings, CheckCircle, XCircle } from "lucide-react";

export const CompanyIntegrations = () => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Gespeichert",
        description: "Die Integrationseinstellungen wurden erfolgreich aktualisiert.",
      });
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plug className="h-5 w-5" />
            Aktive Integrationen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'DATEV', status: 'connected', category: 'Buchhaltung' },
              { name: 'Microsoft 365', status: 'connected', category: 'Produktivität' },
              { name: 'Slack', status: 'disconnected', category: 'Kommunikation' }
            ].map((integration, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {integration.status === 'connected' ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <XCircle className="h-4 w-4 text-gray-400" />
                    }
                    <div>
                      <h3 className="font-medium">{integration.name}</h3>
                      <Badge variant="outline">{integration.category}</Badge>
                    </div>
                  </div>
                  <Switch defaultChecked={integration.status === 'connected'} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Wird gespeichert..." : "Speichern"}
        </Button>
      </div>
    </div>
  );
};