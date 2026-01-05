
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Settings, 
  Key,
  BarChart,
  Download 
} from "lucide-react";

const VoicemailAdmin = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-[#FF6B00]" />
          <h2 className="text-lg font-semibold text-gray-900">Administration</h2>
        </div>
        <Button className="gap-2 bg-[#FF6B00] hover:bg-[#E66000] text-white">
          <Download className="h-4 w-4" />
          Bericht exportieren
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-base font-medium mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-[#FF6B00]" />
            Benutzer & Zugriffsrechte
          </h3>
          <div className="space-y-4">
          {([] as { name: string; role: string; active: boolean }[]).map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={user.active ? "default" : "secondary"}>
                    {user.active ? "Aktiv" : "Inaktiv"}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-medium mb-4 flex items-center gap-2">
            <BarChart className="h-4 w-4 text-[#FF6B00]" />
            System-Einstellungen
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>API-Schlüssel</Label>
              <div className="flex gap-2">
                <Input value="****-****-****-****" readOnly />
                <Button variant="outline">Erneuern</Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Debug-Modus</Label>
                  <p className="text-sm text-gray-500">
                    Aktiviert erweiterte Protokollierung
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Wartungsmodus</Label>
                  <p className="text-sm text-gray-500">
                    System für Wartungsarbeiten sperren
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VoicemailAdmin;
