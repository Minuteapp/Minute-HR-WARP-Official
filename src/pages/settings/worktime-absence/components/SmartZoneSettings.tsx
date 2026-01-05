import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Wifi, Settings, Plus, Eye, EyeOff } from 'lucide-react';
import { useLocationZones } from '@/hooks/location-zones/useLocationZones';
import ZoneManagementDialog from '@/components/time/zones/ZoneManagementDialog';
import { useToast } from '@/hooks/use-toast';

const SmartZoneSettings = () => {
  const { zones, currentDetection } = useLocationZones();
  const { toast } = useToast();
  const [smartZoneEnabled, setSmartZoneEnabled] = useState(true);
  const [showZoneManagement, setShowZoneManagement] = useState(false);
  const [globalAutoStart, setGlobalAutoStart] = useState(false);
  const [globalAutoStop, setGlobalAutoStop] = useState(false);

  const handleToggleSmartZone = (enabled: boolean) => {
    setSmartZoneEnabled(enabled);
    toast({
      title: enabled ? "Smart Zone Detection aktiviert" : "Smart Zone Detection deaktiviert",
      description: enabled 
        ? "Die automatische Standorterkennung ist jetzt aktiv."
        : "Die automatische Standorterkennung wurde deaktiviert.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Haupteinstellungen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Smart Zone Detection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Smart Zone Detection aktivieren</Label>
              <p className="text-sm text-muted-foreground">
                Ermöglicht die automatische Erkennung von Arbeitsplätzen basierend auf GPS und WLAN
              </p>
            </div>
            <Switch
              checked={smartZoneEnabled}
              onCheckedChange={handleToggleSmartZone}
            />
          </div>

          {smartZoneEnabled && (
            <>
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Globaler Auto-Start</Label>
                    <p className="text-sm text-muted-foreground">
                      Zeiterfassung automatisch starten beim Betreten einer Zone
                    </p>
                  </div>
                  <Switch
                    checked={globalAutoStart}
                    onCheckedChange={setGlobalAutoStart}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Globaler Auto-Stop</Label>
                    <p className="text-sm text-muted-foreground">
                      Zeiterfassung automatisch beenden beim Verlassen einer Zone
                    </p>
                  </div>
                  <Switch
                    checked={globalAutoStop}
                    onCheckedChange={setGlobalAutoStop}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Konfigurierte Zonen</h3>
                  <Button onClick={() => setShowZoneManagement(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Zone hinzufügen
                  </Button>
                </div>

                {zones.length > 0 ? (
                  <div className="space-y-3">
                    {zones.map((zone) => (
                      <Card key={zone.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {zone.coordinates ? (
                                  <MapPin className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Wifi className="h-4 w-4 text-green-600" />
                                )}
                                <div>
                                  <div className="font-medium">{zone.name}</div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      {zone.type === 'office' ? 'Büro' :
                                       zone.type === 'home' ? 'Home Office' :
                                       zone.type === 'client' ? 'Kunde' : 'Unterwegs'}
                                    </Badge>
                                    {zone.auto_start_tracking && (
                                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                        Auto-Start
                                      </Badge>
                                    )}
                                    {zone.auto_stop_tracking && (
                                      <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                                        Auto-Stop
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {currentDetection?.zone.id === zone.id && (
                                <Badge variant="success" className="flex items-center gap-1">
                                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                  Aktiv
                                </Badge>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setShowZoneManagement(true)}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {zone.address && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              {zone.address}
                            </div>
                          )}

                          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                            {zone.coordinates && (
                              <span>
                                GPS: {zone.coordinates.latitude.toFixed(4)}, {zone.coordinates.longitude.toFixed(4)}
                                (Radius: {zone.coordinates.radius}m)
                              </span>
                            )}
                            {zone.wifi_networks && zone.wifi_networks.length > 0 && (
                              <span>
                                WLAN: {zone.wifi_networks.join(', ')}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Keine Zonen konfiguriert</h3>
                      <p className="text-muted-foreground mb-4">
                        Erstellen Sie Ihre erste Zone, um die automatische Standorterkennung zu nutzen.
                      </p>
                      <Button onClick={() => setShowZoneManagement(true)}>
                        Erste Zone erstellen
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}

          {!smartZoneEnabled && (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="p-6 text-center">
                <EyeOff className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Smart Zone Detection ist deaktiviert. Aktivieren Sie die Funktion, um automatische Standorterkennung zu nutzen.
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Erweiterte Einstellungen */}
      {smartZoneEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Erweiterte Einstellungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Erkennungsgenauigkeit</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-3/4"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">Hoch</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Aktualisierungsintervall</Label>
                <div className="text-sm text-muted-foreground">30 Sekunden</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Benachrichtigungen bei Zonenwechsel</Label>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie Benachrichtigungen beim Betreten oder Verlassen von Zonen
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Standortverlauf speichern</Label>
                <p className="text-sm text-muted-foreground">
                  Speichert den Verlauf der erkannten Standorte für Berichte
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      )}

      <ZoneManagementDialog 
        open={showZoneManagement}
        onOpenChange={setShowZoneManagement}
      />
    </div>
  );
};

export default SmartZoneSettings;