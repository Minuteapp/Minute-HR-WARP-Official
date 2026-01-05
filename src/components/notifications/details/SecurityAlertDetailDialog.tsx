import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, MapPin, Shield } from "lucide-react";
import { Notification } from "@/types/notifications";

interface SecurityAlertDetailDialogProps {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SecurityAlertDetailDialog({ notification, open, onOpenChange }: SecurityAlertDetailDialogProps) {
  if (!notification) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-xl">{notification.title}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="destructive" className="bg-red-600">
                  Kritische Sicherheitswarnung
                </Badge>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                  Sicherheit
                </Badge>
                <span className="text-sm text-muted-foreground">
                  13.10.2025, 12:38:21
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Alert Box */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-semibold text-red-900">Verdächtige Anmeldeaktivität erkannt</h3>
                <p className="text-sm text-red-800">
                  Unser System hat 2 fehlgeschlagene Anmeldeversuche von einem unbekannten Standort (Moskau, Russland) innerhalb von 3 Minuten erkannt. Dies könnte auf einen unbefugten Zugriffsversuch hinweisen.
                </p>
              </div>
            </div>
          </div>

          {/* Threat Details */}
          <div className="space-y-3">
            <h3 className="font-semibold">Bedrohungsdetails</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-orange-500" />
                  <span>Bedrohungsstufe</span>
                </div>
                <p className="font-medium">Hoch</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Zeitfenster</span>
                </div>
                <p className="font-medium">Letzte 30 Minuten</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>Fehlversuche</span>
                </div>
                <p className="font-medium">2 aus unbekanntem Standort</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span>Verdächtiger Standort</span>
                </div>
                <p className="font-medium">Moskau, RU</p>
              </div>
            </div>
          </div>

          {/* Login History */}
          <div className="space-y-3">
            <h3 className="font-semibold">Anmeldeverlauf</h3>
            <div className="space-y-2">
              {/* Successful Login */}
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">Erfolgreich</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Berlin, Deutschland</span>
                        <span>•</span>
                        <span>Windows 10 - Chrome</span>
                        <span>•</span>
                        <span className="font-mono">185.244.123.45</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">13.10.2025, 14:32 Uhr</span>
                  </div>
                </div>
              </div>

              {/* Failed Login 1 */}
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">Fehlgeschlagen</p>
                        <Badge variant="destructive" className="text-xs">Verdächtig</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="text-red-700 font-medium">Moskau, Russland</span>
                        <span>•</span>
                        <span>Unknown Device</span>
                        <span>•</span>
                        <span className="font-mono">91.234.56.78</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">13.10.2025, 14:28 Uhr</span>
                  </div>
                </div>
              </div>

              {/* Failed Login 2 */}
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">Fehlgeschlagen</p>
                        <Badge variant="destructive" className="text-xs">Verdächtig</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="text-red-700 font-medium">Moskau, Russland</span>
                        <span>•</span>
                        <span>Unknown Device</span>
                        <span>•</span>
                        <span className="font-mono">91.234.56.78</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">13.10.2025, 14:25 Uhr</span>
                  </div>
                </div>
              </div>

              {/* Older Successful Login */}
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">Erfolgreich</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>Berlin, Deutschland</span>
                        <span>•</span>
                        <span>Windows 10 - Chrome</span>
                        <span>•</span>
                        <span className="font-mono">185.244.123.45</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">13.10.2025, 08:15 Uhr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
