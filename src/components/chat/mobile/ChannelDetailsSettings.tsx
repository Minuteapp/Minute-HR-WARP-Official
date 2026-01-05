import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Edit, Archive } from "lucide-react";

export default function ChannelDetailsSettings() {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Sektion 1: Benachrichtigungen */}
        <div className="space-y-4">
          <h3 className="font-semibold">Benachrichtigungen</h3>

          {/* Alle Nachrichten */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Alle Nachrichten</h4>
              <p className="text-sm text-muted-foreground">
                Bei jeder neuen Nachricht benachrichtigen
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          {/* Nur Erwähnungen */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Nur Erwähnungen</h4>
              <p className="text-sm text-muted-foreground">
                Nur bei @Erwähnungen benachrichtigen
              </p>
            </div>
            <Switch />
          </div>
        </div>

        <Separator />

        {/* Sektion 2: Kanal-Einstellungen */}
        <div className="space-y-4">
          <h3 className="font-semibold">Kanal-Einstellungen</h3>

          {/* An Seitenleiste anheften */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium">An Seitenleiste anheften</h4>
            <Switch defaultChecked />
          </div>

          {/* Thread-Benachrichtigungen */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Thread-Benachrichtigungen</h4>
            <Switch defaultChecked />
          </div>
        </div>

        <Separator />

        {/* Sektion 3: Kanal verwalten */}
        <div className="space-y-3">
          <h3 className="font-semibold">Kanal verwalten</h3>

          {/* Kanal bearbeiten */}
          <Button variant="outline" className="w-full justify-start gap-3">
            <Edit className="w-4 h-4" />
            Kanal bearbeiten
          </Button>

          {/* Kanal archivieren */}
          <Button variant="outline" className="w-full justify-start gap-3">
            <Archive className="w-4 h-4" />
            Kanal archivieren
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
