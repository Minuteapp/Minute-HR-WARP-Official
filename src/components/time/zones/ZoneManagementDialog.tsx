
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Wifi, Plus, Edit, Trash2 } from "lucide-react";
import { LocationZone } from '@/types/location-zones.types';
import { useLocationZones } from '@/hooks/location-zones/useLocationZones';
import { locationZoneService } from '@/services/locationZoneService';
import { useToast } from '@/hooks/use-toast';

interface ZoneManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ZoneManagementDialog = ({ open, onOpenChange }: ZoneManagementDialogProps) => {
  const { zones } = useLocationZones();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingZone, setEditingZone] = useState<LocationZone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'office' as LocationZone['type'],
    latitude: '',
    longitude: '',
    radius: '100',
    wifi_networks: '',
    address: '',
    auto_start_tracking: false,
    auto_stop_tracking: false,
    default_project: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'office',
      latitude: '',
      longitude: '',
      radius: '100',
      wifi_networks: '',
      address: '',
      auto_start_tracking: false,
      auto_stop_tracking: false,
      default_project: ''
    });
    setEditingZone(null);
    setShowCreateForm(false);
  };

  const handleCreate = () => {
    setShowCreateForm(true);
    resetForm();
  };

  const handleEdit = (zone: LocationZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      type: zone.type,
      latitude: zone.coordinates?.latitude.toString() || '',
      longitude: zone.coordinates?.longitude.toString() || '',
      radius: zone.coordinates?.radius.toString() || '100',
      wifi_networks: zone.wifi_networks?.join(', ') || '',
      address: zone.address || '',
      auto_start_tracking: zone.auto_start_tracking || false,
      auto_stop_tracking: zone.auto_stop_tracking || false,
      default_project: zone.default_project || ''
    });
    setShowCreateForm(true);
  };

  const handleSave = async () => {
    try {
      const zoneData = {
        name: formData.name,
        type: formData.type,
        coordinates: formData.latitude && formData.longitude ? {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          radius: parseInt(formData.radius)
        } : undefined,
        wifi_networks: formData.wifi_networks 
          ? formData.wifi_networks.split(',').map(n => n.trim()).filter(n => n)
          : [],
        address: formData.address,
        is_active: true,
        auto_start_tracking: formData.auto_start_tracking,
        auto_stop_tracking: formData.auto_stop_tracking,
        default_project: formData.default_project
      };

      if (editingZone) {
        await locationZoneService.updateZone(editingZone.id, zoneData);
        toast({
          title: "Zone aktualisiert",
          description: `${formData.name} wurde erfolgreich aktualisiert.`
        });
      } else {
        await locationZoneService.createZone(zoneData);
        toast({
          title: "Zone erstellt",
          description: `${formData.name} wurde erfolgreich erstellt.`
        });
      }

      resetForm();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Zone konnte nicht gespeichert werden."
      });
    }
  };

  const handleDelete = async (zone: LocationZone) => {
    try {
      await locationZoneService.deleteZone(zone.id);
      toast({
        title: "Zone gelöscht",
        description: `${zone.name} wurde erfolgreich gelöscht.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Zone konnte nicht gelöscht werden."
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Zone Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!showCreateForm ? (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Konfigurierte Zonen</h3>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Neue Zone
                </Button>
              </div>

              <div className="grid gap-4">
                {zones.map((zone) => (
                  <Card key={zone.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {zone.coordinates ? (
                            <MapPin className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Wifi className="h-4 w-4 text-green-600" />
                          )}
                          {zone.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(zone)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(zone)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {zone.type === 'office' ? 'Büro' :
                           zone.type === 'home' ? 'Home Office' :
                           zone.type === 'client' ? 'Kunde' : 'Unterwegs'}
                        </Badge>
                        {zone.auto_start_tracking && (
                          <Badge variant="success" className="text-xs">Auto-Start</Badge>
                        )}
                        {zone.auto_stop_tracking && (
                          <Badge variant="warning" className="text-xs">Auto-Stop</Badge>
                        )}
                      </div>
                      
                      {zone.address && (
                        <div className="text-sm text-gray-600">{zone.address}</div>
                      )}
                      
                      {zone.coordinates && (
                        <div className="text-xs text-gray-500">
                          GPS: {zone.coordinates.latitude.toFixed(4)}, {zone.coordinates.longitude.toFixed(4)} 
                          (Radius: {zone.coordinates.radius}m)
                        </div>
                      )}
                      
                      {zone.wifi_networks && zone.wifi_networks.length > 0 && (
                        <div className="text-xs text-gray-500">
                          WLAN: {zone.wifi_networks.join(', ')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {editingZone ? 'Zone bearbeiten' : 'Neue Zone erstellen'}
                </h3>
                <Button variant="ghost" onClick={resetForm}>
                  Abbrechen
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Hauptbüro München"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Typ</Label>
                  <Select value={formData.type} onValueChange={(value: LocationZone['type']) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Büro</SelectItem>
                      <SelectItem value="home">Home Office</SelectItem>
                      <SelectItem value="client">Kunde</SelectItem>
                      <SelectItem value="mobile">Unterwegs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Vollständige Adresse"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Breitengrad</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="48.1351"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Längengrad</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="11.5820"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="radius">Radius (m)</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={formData.radius}
                    onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wifi">WLAN-Netzwerke (kommagetrennt)</Label>
                <Textarea
                  id="wifi"
                  value={formData.wifi_networks}
                  onChange={(e) => setFormData({ ...formData, wifi_networks: e.target.value })}
                  placeholder="Büro-WLAN, CompanyWiFi, OfficeNetwork"
                  rows={2}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-start"
                    checked={formData.auto_start_tracking}
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_start_tracking: checked })}
                  />
                  <Label htmlFor="auto-start">Zeiterfassung automatisch starten</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-stop"
                    checked={formData.auto_stop_tracking}
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_stop_tracking: checked })}
                  />
                  <Label htmlFor="auto-stop">Zeiterfassung automatisch beenden</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Standard-Projekt</Label>
                <Input
                  id="project"
                  value={formData.default_project}
                  onChange={(e) => setFormData({ ...formData, default_project: e.target.value })}
                  placeholder="z.B. office-work"
                />
              </div>
            </div>
          )}
        </div>

        {showCreateForm && (
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Abbrechen
            </Button>
            <Button onClick={handleSave}>
              {editingZone ? 'Aktualisieren' : 'Erstellen'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ZoneManagementDialog;
