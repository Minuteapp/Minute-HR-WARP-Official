import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMapboxToken } from '@/hooks/map/useMapboxToken';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Globe, Maximize2, Search, Filter, Plane, CheckCircle, 
  AlertTriangle, Clock, Users, TrendingUp
} from 'lucide-react';

interface TravelerLocation {
  id: string;
  employee_id: string;
  employee_name: string;
  current_lat: number;
  current_lng: number;
  destination_lat: number;
  destination_lng: number;
  destination_name: string;
  origin_name: string;
  status: string;
  flight_number: string;
  delay_minutes: number;
  department: string;
}

export function LiveMapTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPaths, setShowPaths] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Get Mapbox token
  const { token: mapboxToken, loading: tokenLoading, error: tokenError } = useMapboxToken();

  // Fetch traveler locations
  const { data: travelers = [], isLoading } = useQuery({
    queryKey: ['traveler-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traveler_locations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as TravelerLocation[];
    }
  });

  // Calculate stats
  const travelersToday = travelers.length;
  const activeFlights = travelers.filter(t => t.status === 'in_air').length;
  const onTimeCount = travelers.filter(t => t.status === 'on_time' || t.delay_minutes === 0).length;
  const onTimePercentage = travelersToday > 0 ? Math.round((onTimeCount / travelersToday) * 100) : 100;
  const delayedCount = travelers.filter(t => t.delay_minutes > 0).length;
  const avgDelay = delayedCount > 0 
    ? Math.round(travelers.filter(t => t.delay_minutes > 0).reduce((sum, t) => sum + t.delay_minutes, 0) / delayedCount)
    : 0;

  // Filter travelers
  const filteredTravelers = travelers.filter(traveler => {
    const matchesSearch = !searchTerm || 
      traveler.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traveler.destination_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || traveler.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || traveler.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Get unique departments
  const departments = [...new Set(travelers.map(t => t.department).filter(Boolean))];

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      projection: 'globe',
      zoom: 2,
      center: [10, 50], // Center on Europe
      pitch: 20,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add atmosphere
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(255, 255, 255)',
        'high-color': 'rgb(200, 200, 225)',
        'horizon-blend': 0.2,
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxToken]);

  // Update markers when travelers change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredTravelers.forEach(traveler => {
      if (traveler.current_lat && traveler.current_lng) {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'traveler-marker';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.borderRadius = '50%';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        
        // Set color based on status
        switch (traveler.status) {
          case 'in_air':
            el.style.backgroundColor = '#3b82f6'; // blue
            break;
          case 'on_time':
            el.style.backgroundColor = '#22c55e'; // green
            break;
          case 'delayed':
            el.style.backgroundColor = '#ef4444'; // red
            break;
          default:
            el.style.backgroundColor = '#8b5cf6'; // purple
        }

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div style="padding: 8px;">
            <strong>${traveler.employee_name || 'Unbekannt'}</strong>
            <p style="margin: 4px 0; font-size: 12px; color: #666;">
              ${traveler.origin_name || 'Start'} → ${traveler.destination_name || 'Ziel'}
            </p>
            ${traveler.flight_number ? `<p style="font-size: 11px; color: #888;">Flug: ${traveler.flight_number}</p>` : ''}
            ${traveler.delay_minutes > 0 ? `<p style="font-size: 11px; color: #ef4444;">Verspätung: ${traveler.delay_minutes} min</p>` : ''}
          </div>
        `);

        const marker = new mapboxgl.Marker(el)
          .setLngLat([traveler.current_lng, traveler.current_lat])
          .setPopup(popup)
          .addTo(map.current!);

        markersRef.current.push(marker);

        // Draw flight path if destination is set and paths are enabled
        if (showPaths && traveler.destination_lat && traveler.destination_lng) {
          const sourceId = `path-${traveler.id}`;
          const layerId = `path-layer-${traveler.id}`;

          // Remove existing source/layer if exists
          if (map.current!.getLayer(layerId)) {
            map.current!.removeLayer(layerId);
          }
          if (map.current!.getSource(sourceId)) {
            map.current!.removeSource(sourceId);
          }

          // Add new source and layer
          map.current!.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [traveler.current_lng, traveler.current_lat],
                  [traveler.destination_lng, traveler.destination_lat]
                ]
              }
            }
          });

          map.current!.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#8b5cf6',
              'line-width': 2,
              'line-dasharray': [2, 2]
            }
          });
        }
      }
    });
  }, [filteredTravelers, showPaths, mapboxToken]);

  if (tokenLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Globe className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Mapbox Token nicht konfiguriert</p>
          <p className="text-muted-foreground text-center max-w-md">
            Bitte fügen Sie Ihren Mapbox Public Token als Supabase Edge Function Secret hinzu (MAPBOX_PUBLIC_TOKEN).
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Globe className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Live-Karte</h2>
            <p className="text-muted-foreground">
              Echtzeit-Tracking von {travelersToday} Mitarbeitern auf Geschäftsreise
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Alle Reisenden" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Reisenden</SelectItem>
              <SelectItem value="active">Nur aktive</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reisende heute</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{travelersToday}</p>
                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">Live</Badge>
                </div>
                <p className="text-xs text-muted-foreground">+0 seit gestern</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Plane className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktive Flüge</p>
                <p className="text-2xl font-bold">{activeFlights}</p>
                <p className="text-xs text-muted-foreground">{travelersToday} Mitarbeiter gesamt</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Plane className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pünktlichkeit</p>
                <p className="text-2xl font-bold text-green-600">{onTimePercentage}%</p>
                <p className="text-xs text-muted-foreground">+0% vs. Vorwoche</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verspätungen</p>
                <p className="text-2xl font-bold text-red-600">{delayedCount}</p>
                <p className="text-xs text-muted-foreground">Ø {avgDelay} min</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Suche Reisende..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Alle Abteilungen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="in_air">In der Luft</SelectItem>
            <SelectItem value="on_time">Pünktlich</SelectItem>
            <SelectItem value="delayed">Verspätet</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          variant={showPaths ? "default" : "outline"}
          onClick={() => setShowPaths(!showPaths)}
        >
          Pfade {showPaths ? 'an' : 'aus'}
        </Button>
      </div>

      {/* Map Container */}
      <div className={`relative rounded-lg overflow-hidden border ${isFullscreen ? 'fixed inset-4 z-50' : 'h-[500px]'}`}>
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs font-medium mb-2">Status-Legende</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs">In der Luft</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Pünktlich</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs">Verspätet</span>
            </div>
          </div>
        </div>

        {/* Close fullscreen button */}
        {isFullscreen && (
          <Button 
            className="absolute top-4 right-4"
            onClick={() => setIsFullscreen(false)}
          >
            Schließen
          </Button>
        )}
      </div>

      {/* No travelers message */}
      {filteredTravelers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Keine Reisenden gefunden</p>
            <p className="text-muted-foreground">
              {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all' 
                ? 'Keine Ergebnisse für Ihre Filter' 
                : 'Aktuell sind keine Mitarbeiter auf Geschäftsreise'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}