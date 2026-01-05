
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LocationZone, LocationDetection, ZoneEvent } from '@/types/location-zones.types';
import { useToast } from '@/hooks/use-toast';
import { locationZoneService } from '@/services/locationZoneService';

export const useLocationZones = () => {
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [currentDetection, setCurrentDetection] = useState<LocationDetection | null>(null);
  const [detectedNetworks, setDetectedNetworks] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Lade alle Zonen
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['location-zones'],
    queryFn: locationZoneService.getZones,
    refetchInterval: 60000
  });

  // Lade Zone-Events mit korrigierter QueryFunction
  const { data: recentEvents = [] } = useQuery({
    queryKey: ['zone-events'],
    queryFn: () => locationZoneService.getRecentEvents(),
    refetchInterval: 30000
  });

  // GPS-Position überwachen
  useEffect(() => {
    let watchId: number;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          console.log('GPS Position updated:', position);
          setCurrentLocation(position);
          detectZone(position);
        },
        (error) => {
          console.error('GPS Error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [zones]);

  // WLAN-Netzwerke erkennen (vereinfacht)
  useEffect(() => {
    const detectWifiNetworks = async () => {
      try {
        // In einer echten Implementierung würde hier die Navigator.wifi API verwendet
        // Für Demo-Zwecke simulieren wir bekannte Netzwerke
        const simulatedNetworks = ['Büro-WLAN', 'CompanyWiFi', 'OfficeNetwork'];
        setDetectedNetworks(simulatedNetworks);
      } catch (error) {
        console.error('WLAN Detection Error:', error);
      }
    };

    detectWifiNetworks();
    const interval = setInterval(detectWifiNetworks, 60000);
    return () => clearInterval(interval);
  }, []);

  const detectZone = async (position: GeolocationPosition) => {
    if (!zones.length) return;

    console.log('Detecting zone for position:', position);

    let bestMatch: LocationDetection | null = null;
    let minDistance = Infinity;

    // GPS-basierte Erkennung
    for (const zone of zones) {
      if (!zone.coordinates || !zone.is_active) continue;

      const distance = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        zone.coordinates.latitude,
        zone.coordinates.longitude
      );

      if (distance <= zone.coordinates.radius && distance < minDistance) {
        minDistance = distance;
        bestMatch = {
          zone,
          distance,
          detection_method: 'gps',
          confidence: Math.max(0, 100 - (distance / zone.coordinates.radius) * 50),
          gps_accuracy: position.coords.accuracy
        };
      }
    }

    // WLAN-basierte Erkennung
    for (const zone of zones) {
      if (!zone.wifi_networks?.length || !zone.is_active) continue;

      const matchingNetwork = zone.wifi_networks.find(network => 
        detectedNetworks.includes(network)
      );

      if (matchingNetwork) {
        bestMatch = {
          zone,
          wifi_network: matchingNetwork,
          detection_method: 'wifi',
          confidence: 95
        };
        break; // WLAN hat höhere Priorität
      }
    }

    if (bestMatch && bestMatch.zone) {
      console.log('Zone detected:', bestMatch);
      setCurrentDetection(bestMatch);
      
      // Prüfe auf Zone-Wechsel
      if (!currentDetection || currentDetection.zone?.id !== bestMatch.zone.id) {
        await handleZoneEnter(bestMatch.zone);
      }
    } else if (currentDetection) {
      console.log('Exited zone:', currentDetection.zone);
      await handleZoneExit(currentDetection.zone!);
      setCurrentDetection(null);
    }
  };

  const handleZoneEnter = async (zone: LocationZone) => {
    console.log('Entering zone:', zone.name);
    
    try {
      await locationZoneService.recordZoneEvent({
        zone_id: zone.id,
        event_type: 'enter',
        detection_method: currentDetection?.detection_method || 'gps'
      });

      // Nur Benachrichtigung zeigen wenn keine Auto-Start Funktion aktiv ist
      if (!zone.auto_start_tracking) {
        toast({
          title: `Zone betreten: ${zone.name}`,
          description: "Möchten Sie die Zeiterfassung starten?",
        });
      }

      // Auto-Start wenn konfiguriert
      if (zone.auto_start_tracking) {
        // Hier würde die Zeiterfassung automatisch gestartet
        console.log('Auto-starting time tracking for zone:', zone.name);
      }

      queryClient.invalidateQueries({ queryKey: ['zone-events'] });
    } catch (error) {
      console.error('Error handling zone enter:', error);
    }
  };

  const handleZoneExit = async (zone: LocationZone) => {
    console.log('Exiting zone:', zone.name);
    
    try {
      await locationZoneService.recordZoneEvent({
        zone_id: zone.id,
        event_type: 'exit',
        detection_method: currentDetection?.detection_method || 'gps'
      });

      toast({
        title: `Zone verlassen: ${zone.name}`,
        description: zone.auto_stop_tracking 
          ? "Zeiterfassung wird automatisch beendet"
          : "Möchten Sie die Zeiterfassung beenden?",
      });

      // Auto-Stop wenn konfiguriert
      if (zone.auto_stop_tracking) {
        // Hier würde die Zeiterfassung automatisch beendet
        console.log('Auto-stopping time tracking for zone:', zone.name);
      }

      queryClient.invalidateQueries({ queryKey: ['zone-events'] });
    } catch (error) {
      console.error('Error handling zone exit:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Erdradius in Metern
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  return {
    zones,
    currentLocation,
    currentDetection,
    detectedNetworks,
    recentEvents,
    isLoading
  };
};
