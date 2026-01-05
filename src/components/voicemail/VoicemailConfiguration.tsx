
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Settings2, Volume2 } from "lucide-react";

const VoicemailConfiguration = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Voicemail-Einstellungen</h2>
        <Button variant="outline" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Speichern
        </Button>
      </div>

      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-base font-medium mb-4">Audioeinstellungen</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Automatische Anpassung der Lautstärke</Label>
                <p className="text-sm text-gray-500">
                  Optimiert die Lautstärke der Aufnahmen automatisch
                </p>
              </div>
              <Switch />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Aufnahmelautstärke</Label>
                <Volume2 className="h-4 w-4 text-gray-500" />
              </div>
              <Slider
                defaultValue={[75]}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-medium mb-4">Benachrichtigungen</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>E-Mail-Benachrichtigungen</Label>
                <p className="text-sm text-gray-500">
                  Erhalten Sie E-Mails bei neuen Voicemails
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>SMS-Benachrichtigungen</Label>
                <p className="text-sm text-gray-500">
                  Erhalten Sie SMS bei neuen Voicemails
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VoicemailConfiguration;
