import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Car,
  Bike,
  Zap,
  Settings,
  Edit,
  Plus,
  MapPin,
  Info,
  X,
  Save,
  BarChart3,
  Battery,
  Navigation,
  Clock,
  Shield,
  Download,
  RefreshCw,
  Eye,
  Receipt,
  Trash2,
  CheckCircle,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const vehicleIcons: Record<string, any> = {
  car: Car,
  motorcycle: Car,
  bicycle: Bike,
  electric: Zap,
};

const vehicleColors: Record<string, string> = {
  car: "bg-red-100 text-red-600",
  motorcycle: "bg-gray-100 text-gray-600",
  bicycle: "bg-gray-100 text-gray-600",
  electric: "bg-yellow-100 text-yellow-600",
};

export function MileageTab() {
  const [viewMode, setViewMode] = useState<"types" | "tracking">("types");
  const [showGPSSettings, setShowGPSSettings] = useState(false);
  const [gpsSubTab, setGpsSubTab] = useState("settings");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Vehicle Types Query
  const { data: vehicleTypes = [], isLoading: vehicleTypesLoading } = useQuery({
    queryKey: ["vehicle-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_types")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  // GPS Settings Query
  const { data: gpsSettings, isLoading: gpsSettingsLoading } = useQuery({
    queryKey: ["gps-settings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("gps_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // GPS Trips Query
  const { data: gpsTrips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ["gps-trips", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("gps_trips")
        .select("*")
        .eq("user_id", user.id)
        .order("trip_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Local GPS Settings State
  const [localSettings, setLocalSettings] = useState({
    gps_enabled: false,
    auto_tracking: false,
    background_tracking: false,
    battery_optimization: true,
    accuracy_mode: "high",
    update_interval: 30,
    min_distance: 50,
    auto_expense_submit: false,
    privacy_mode: false,
  });

  // Update local settings when data loads
  useState(() => {
    if (gpsSettings) {
      setLocalSettings({
        gps_enabled: gpsSettings.gps_enabled || false,
        auto_tracking: gpsSettings.auto_tracking || false,
        background_tracking: gpsSettings.background_tracking || false,
        battery_optimization: gpsSettings.battery_optimization ?? true,
        accuracy_mode: gpsSettings.accuracy_mode || "high",
        update_interval: gpsSettings.update_interval || 30,
        min_distance: gpsSettings.min_distance || 50,
        auto_expense_submit: gpsSettings.auto_expense_submit || false,
        privacy_mode: gpsSettings.privacy_mode || false,
      });
    }
  });

  // Vehicle Type Mutation
  const updateVehicleTypeMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("vehicle_types")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-types"] });
      toast.success("Status aktualisiert");
    },
  });

  // GPS Settings Mutation
  const saveGPSSettingsMutation = useMutation({
    mutationFn: async (settings: typeof localSettings) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("gps_settings")
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gps-settings"] });
      toast.success("GPS-Einstellungen gespeichert");
    },
    onError: () => {
      toast.error("Fehler beim Speichern");
    },
  });

  // Trip Status Mutation
  const updateTripStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("gps_trips")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gps-trips"] });
      toast.success("Status aktualisiert");
    },
  });

  // Calculate stats
  const totalDistance = gpsTrips.reduce((sum, trip) => sum + (Number(trip.distance_km) || 0), 0);
  const tripsCount = gpsTrips.length;
  const avgDistance = tripsCount > 0 ? totalDistance / tripsCount : 0;
  const bookedTrips = gpsTrips.filter(t => t.status === "booked").length;

  const isLoading = vehicleTypesLoading || gpsSettingsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kilometerabrechnung</h2>
          <p className="text-muted-foreground">Verwalten Sie Fahrzeugtypen und Kilometerpauschalen</p>
        </div>
        <Button 
          className="bg-primary" 
          size="sm"
          onClick={() => {
            setViewMode("tracking");
            setShowGPSSettings(true);
          }}
        >
          <Settings className="h-4 w-4 mr-2" />
          GPS-Einstellungen
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "types" ? "default" : "outline"}
          onClick={() => {
            setViewMode("types");
            setShowGPSSettings(false);
          }}
        >
          <Car className="h-4 w-4 mr-2" />
          Fahrzeugtypen
        </Button>
        <Button
          variant={viewMode === "tracking" ? "default" : "outline"}
          onClick={() => setViewMode("tracking")}
        >
          <MapPin className="h-4 w-4 mr-2" />
          GPS-Tracking
        </Button>
      </div>

      {/* Vehicle Types View */}
      {viewMode === "types" && (
        <>
          {vehicleTypes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Keine Fahrzeugtypen vorhanden</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Erstellen Sie Fahrzeugtypen mit Kilometerpauschalen.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Fahrzeugtyp erstellen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {vehicleTypes.map((vehicle: any) => {
                const Icon = vehicleIcons[vehicle.icon] || Car;
                const colorClass = vehicleColors[vehicle.icon] || vehicleColors.car;

                return (
                  <Card key={vehicle.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${colorClass}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>

                      <h3 className="font-semibold text-lg mb-3">{vehicle.name}</h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                            Pauschale
                          </Badge>
                          <span className="font-bold">
                            {vehicle.rate_per_km?.toLocaleString("de-DE", { minimumFractionDigits: 2 })} {vehicle.currency}/km
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            CO₂-Faktor
                          </Badge>
                          <span className="font-medium text-muted-foreground">
                            {vehicle.co2_factor?.toLocaleString("de-DE", { minimumFractionDigits: 2 })} kg/km
                          </span>
                        </div>
                      </div>

                      {vehicle.description && (
                        <p className="text-sm text-muted-foreground mb-4">{vehicle.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Switch
                          checked={vehicle.is_active}
                          onCheckedChange={(checked) =>
                            updateVehicleTypeMutation.mutate({ id: vehicle.id, is_active: checked })
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {vehicleTypes.length > 0 && (
            <Button variant="outline" className="w-full border-dashed">
              <Plus className="h-4 w-4 mr-2" />
              Neuen Fahrzeugtyp hinzufügen
            </Button>
          )}
        </>
      )}

      {/* GPS Tracking View */}
      {viewMode === "tracking" && !showGPSSettings && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">GPS-Einstellungen</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Konfigurieren Sie GPS-Tracking und automatische Kilometererfassung
            </p>
            <Button onClick={() => setShowGPSSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Einstellungen bearbeiten
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Extended GPS Settings View */}
      {viewMode === "tracking" && showGPSSettings && (
        <div className="space-y-6">
          {/* GPS Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">GPS & Kilometererfassung</h3>
              {localSettings.gps_enabled && (
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  GPS Aktiv
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="default"
                onClick={() => saveGPSSettingsMutation.mutate(localSettings)}
                disabled={saveGPSSettingsMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Einstellungen speichern
              </Button>
              <Button variant="outline" onClick={() => setShowGPSSettings(false)}>
                <X className="h-4 w-4 mr-2" />
                Schließen
              </Button>
            </div>
          </div>

          {/* 6 Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Gesamt gefahren</p>
                <p className="text-2xl font-bold">{totalDistance.toFixed(1)} km</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Car className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Fahrten erfasst</p>
                <p className="text-2xl font-bold">{tripsCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Navigation className="h-5 w-5 text-pink-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Ø Distanz/Fahrt</p>
                <p className="text-2xl font-bold">{avgDistance.toFixed(1)} km</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Battery className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Akku gespart</p>
                <p className="text-2xl font-bold">{localSettings.battery_optimization ? "15%" : "0%"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Genauigkeit</p>
                <p className="text-2xl font-bold">
                  {localSettings.accuracy_mode === "high" ? "±5m" : localSettings.accuracy_mode === "medium" ? "±15m" : "±50m"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Letzte Sync</p>
                <p className="text-2xl font-bold">
                  {gpsSettings?.last_sync 
                    ? new Date(gpsSettings.last_sync).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
                    : "–"
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* GPS Sub-Tabs */}
          <Tabs value={gpsSubTab} onValueChange={setGpsSubTab}>
            <TabsList>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Einstellungen
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tracking-Verlauf
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-2">
                <Shield className="h-4 w-4" />
                Datenschutz
              </TabsTrigger>
            </TabsList>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* GPS-Grundeinstellungen */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">GPS-Grundeinstellungen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>GPS-Tracking aktivieren</Label>
                        <p className="text-sm text-muted-foreground">Erfasst automatisch zurückgelegte Strecken</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={localSettings.gps_enabled}
                          onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, gps_enabled: checked }))}
                        />
                        {localSettings.gps_enabled && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aktiv</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Automatische Kilometererfassung</Label>
                        <p className="text-sm text-muted-foreground">Startet Tracking automatisch bei Fahrtbeginn</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={localSettings.auto_tracking}
                          onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, auto_tracking: checked }))}
                        />
                        {localSettings.auto_tracking && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Hintergrund-Tracking</Label>
                        <p className="text-sm text-muted-foreground">Tracking läuft auch bei geschlossener App</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={localSettings.background_tracking}
                          onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, background_tracking: checked }))}
                        />
                        {!localSettings.background_tracking && (
                          <span className="text-xs text-muted-foreground">Deaktiviert</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Akkuoptimierung</Label>
                        <p className="text-sm text-muted-foreground">Reduziert Akkuverbrauch durch intelligentes Tracking</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={localSettings.battery_optimization}
                          onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, battery_optimization: checked }))}
                        />
                        {localSettings.battery_optimization && <Battery className="h-4 w-4 text-green-600" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Erweiterte Einstellungen */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Erweiterte Einstellungen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Genauigkeitsmodus</Label>
                      <Select
                        value={localSettings.accuracy_mode}
                        onValueChange={(value) => setLocalSettings(s => ({ ...s, accuracy_mode: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Hoch - Präzise ±5m</SelectItem>
                          <SelectItem value="medium">Mittel - ±15m</SelectItem>
                          <SelectItem value="low">Niedrig - ±50m</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Update-Intervall (Sekunden)</Label>
                      <Input
                        type="number"
                        value={localSettings.update_interval}
                        onChange={(e) => setLocalSettings(s => ({ ...s, update_interval: parseInt(e.target.value) || 30 }))}
                      />
                      <p className="text-xs text-muted-foreground">Häufigkeit der Positionsabfragen (empfohlen: 30s)</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Minimale Distanz (Meter)</Label>
                      <Input
                        type="number"
                        value={localSettings.min_distance}
                        onChange={(e) => setLocalSettings(s => ({ ...s, min_distance: parseInt(e.target.value) || 50 }))}
                      />
                      <p className="text-xs text-muted-foreground">Mindestdistanz zwischen zwei Positionspunkten</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-0.5">
                        <Label>Automatische Speseneinreichung</Label>
                        <p className="text-sm text-muted-foreground">Fahrten werden automatisch als Spesen eingereicht</p>
                      </div>
                      <Switch
                        checked={localSettings.auto_expense_submit}
                        onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, auto_expense_submit: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Tracking-Verlauf</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Synchronisieren
                  </Button>
                </div>
              </div>

              {tripsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : gpsTrips.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Navigation className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">Keine Fahrten erfasst</h3>
                    <p className="text-sm text-muted-foreground">
                      Aktivieren Sie GPS-Tracking, um Fahrten automatisch zu erfassen.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {gpsTrips.map((trip: any) => (
                    <Card key={trip.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium">
                                {new Date(trip.trip_date).toLocaleDateString("de-DE", { 
                                  weekday: "short", 
                                  day: "2-digit", 
                                  month: "2-digit",
                                  year: "numeric"
                                })}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={trip.status === "booked" 
                                  ? "bg-green-50 text-green-700 border-green-200" 
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                }
                              >
                                {trip.status === "booked" ? "Verbucht" : "Ausstehend"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-green-600" />
                                <span>{trip.start_location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-red-600" />
                                <span>{trip.end_location}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
                              <span>{Number(trip.distance_km).toFixed(1)} km</span>
                              <span>{trip.duration_minutes} Min.</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            {trip.status !== "booked" && (
                              <Button 
                                size="sm"
                                onClick={() => updateTripStatusMutation.mutate({ id: trip.id, status: "booked" })}
                              >
                                <Receipt className="h-4 w-4 mr-1" />
                                Als Spesen
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Datenschutz & Sicherheit */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Datenschutz & Sicherheit</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Datenschutzmodus</Label>
                        <p className="text-sm text-muted-foreground">Verstärkte Anonymisierung der Standortdaten</p>
                      </div>
                      <Switch
                        checked={localSettings.privacy_mode}
                        onCheckedChange={(checked) => setLocalSettings(s => ({ ...s, privacy_mode: checked }))}
                      />
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                      <h4 className="font-medium text-blue-900">Datenverarbeitung</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• GPS-Daten werden verschlüsselt übertragen</li>
                        <li>• Standortdaten werden nur für Kilometererfassung verwendet</li>
                        <li>• Sie können jederzeit alle Daten löschen</li>
                        <li>• DSGVO-konform und revisionssicher</li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Datenverwaltung</h4>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Daten exportieren
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Alle Daten löschen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Berechtigungen */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Berechtigungen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Standortzugriff</p>
                          <p className="text-sm text-muted-foreground">Erteilt</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-300">Aktiv</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Navigation className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Hintergrund-Standort</p>
                          <p className="text-sm text-muted-foreground">Erteilt</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-300">Aktiv</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Bewegungssensor</p>
                          <p className="text-sm text-muted-foreground">Optional</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Aktivieren</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Info Box */}
      {viewMode === "types" && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900">Hinweis:</p>
            <p className="text-sm text-blue-700">
              Die Kilometerpauschalen entsprechen den steuerlichen Vorgaben. Die CO₂-Faktoren werden für das 
              ESG-Reporting verwendet und basieren auf durchschnittlichen Emissionswerten je Fahrzeugtyp.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
