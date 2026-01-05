import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

const TimeTrackingSettings = () => {
  const [forgottenTimeReminders, setForgottenTimeReminders] = useState(true);
  const [breakReminders, setBreakReminders] = useState(true);
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");
  const [locationTracking, setLocationTracking] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">System-Einstellungen</h2>

      {/* Benachrichtigungen */}
      <Card className="border bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Benachrichtigungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm">Erinnerungen bei vergessener Zeiterfassung</p>
              <p className="text-sm text-muted-foreground">
                Erhalte eine Benachrichtigung, wenn du vergessen hast, deine Zeit zu erfassen
              </p>
            </div>
            <Checkbox
              checked={forgottenTimeReminders}
              onCheckedChange={(checked) => setForgottenTimeReminders(checked as boolean)}
              className="mt-1"
            />
          </div>
          
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm">Pausenerinnerungen</p>
              <p className="text-sm text-muted-foreground">
                Erhalte Erinnerungen für gesetzlich vorgeschriebene Pausen
              </p>
            </div>
            <Checkbox
              checked={breakReminders}
              onCheckedChange={(checked) => setBreakReminders(checked as boolean)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Standardarbeitszeiten */}
      <Card className="border bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Standardarbeitszeiten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Arbeitsbeginn</label>
              <div className="relative">
                <input
                  type="time"
                  value={workStart}
                  onChange={(e) => setWorkStart(e.target.value)}
                  className="w-full px-3 py-2 pr-10 bg-gray-800 text-white rounded-lg border-0 focus:ring-2 focus:ring-primary"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Arbeitsende</label>
              <div className="relative">
                <input
                  type="time"
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                  className="w-full px-3 py-2 pr-10 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datenschutz & Sicherheit */}
      <Card className="border bg-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Datenschutz & Sicherheit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="font-medium text-sm">Standortverfolgung</p>
              <p className="text-sm text-muted-foreground">
                Erlaubt automatische Standorterkennung
              </p>
            </div>
            <Checkbox
              checked={locationTracking}
              onCheckedChange={(checked) => setLocationTracking(checked as boolean)}
              className="mt-1"
            />
          </div>
          
          <Button variant="outline" className="w-full">
            Alle gespeicherten Daten anzeigen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTrackingSettings;
