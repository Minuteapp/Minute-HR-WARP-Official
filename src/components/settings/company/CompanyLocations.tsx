import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Clock,
  Phone,
  Mail,
  Users,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export const CompanyLocations = () => {
  const { toast } = useToast();
  const { tenantCompany } = useTenant();
  const companyId = tenantCompany?.id;
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Standorte laden
  const { data: locations = [], isLoading: locationsLoading } = useQuery({
    queryKey: ['company-locations', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_locations')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

      if (error) throw error;
      
      // Mitarbeiteranzahl pro Standort zählen
      const locationsWithCount = await Promise.all(
        (data || []).map(async (loc) => {
          const { count } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('location_id', loc.id);
          
          return { ...loc, employeeCount: count || 0 };
        })
      );
      
      return locationsWithCount;
    },
    enabled: !!companyId
  });

  // Feiertage laden
  const { data: holidays = [], isLoading: holidaysLoading } = useQuery({
    queryKey: ['company-holidays', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('absence_holidays')
        .select('*')
        .eq('company_id', companyId)
        .order('holiday_date');

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId
  });

  const isLoading = locationsLoading || holidaysLoading;

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      headquarters: 'Hauptsitz',
      office: 'Büro',
      branch: 'Niederlassung',
      remote: 'Remote'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      headquarters: 'bg-purple-500',
      office: 'bg-blue-500',
      branch: 'bg-green-500',
      remote: 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const selectedLocationData = locations.find(loc => loc.id === selectedLocation);

  const handleAddLocation = () => {
    toast({
      title: "Standort hinzufügen",
      description: "Diese Funktion wird implementiert.",
    });
  };

  const handleSyncHolidays = () => {
    toast({
      title: "Feiertage synchronisieren",
      description: "Diese Funktion wird implementiert.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Standortverwaltung</h3>
          <p className="text-sm text-muted-foreground">
            Verwalten Sie alle Unternehmensstandorte und deren Feiertagskalender.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSyncHolidays} variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Feiertage synchronisieren
          </Button>
          <Button onClick={handleAddLocation} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Standort hinzufügen
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Standorte Liste */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Standorte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {locations.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Building className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Keine Standorte vorhanden</p>
                <p className="text-sm mt-1">Fügen Sie Ihren ersten Standort hinzu.</p>
              </div>
            ) : (
              locations.map((location: any) => (
                <div 
                  key={location.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedLocation === location.id ? 'bg-accent border-primary' : 'hover:bg-accent'
                  }`}
                  onClick={() => setSelectedLocation(location.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getTypeColor(location.type || 'office')}`} />
                        <span className="font-medium">{location.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {location.city}, {location.country}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {getTypeLabel(location.type || 'office')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{location.employeeCount}</p>
                      <p className="text-xs text-muted-foreground">Mitarbeiter</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Standort Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {selectedLocationData?.name || 'Standort Details'}
              </div>
              {selectedLocationData && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedLocationData ? (
              <div className="space-y-6">
                {/* Allgemeine Informationen */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Adresse</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedLocationData.address}<br />
                        {selectedLocationData.city}, {selectedLocationData.country}
                      </p>
                    </div>
                    
                    {selectedLocationData.timezone && (
                      <div>
                        <Label className="text-sm font-medium">Zeitzone</Label>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {selectedLocationData.timezone}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selectedLocationData.phone && (
                      <div>
                        <Label className="text-sm font-medium">Telefon</Label>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {selectedLocationData.phone}
                        </p>
                      </div>
                    )}
                    
                    {selectedLocationData.email && (
                      <div>
                        <Label className="text-sm font-medium">E-Mail</Label>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {selectedLocationData.email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Kontaktperson und Mitarbeiter */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">Ansprechpartner</Label>
                    <p className="text-sm text-muted-foreground">
                      {selectedLocationData.contact_person || 'Nicht zugewiesen'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Mitarbeiteranzahl</Label>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {selectedLocationData.employeeCount} Mitarbeiter
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Feiertagskalender */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-sm font-medium">Feiertagskalender</Label>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Feiertag hinzufügen
                    </Button>
                  </div>
                  
                  {holidays.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Keine Feiertage konfiguriert</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {holidays.map((holiday: any) => (
                        <div key={holiday.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4" />
                            <div>
                              <p className="text-sm font-medium">{holiday.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(holiday.holiday_date), 'dd.MM.yyyy', { locale: de })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {holiday.is_public_holiday && (
                              <Badge variant="outline" className="text-xs">Öffentlich</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {locations.length === 0 
                    ? 'Fügen Sie Ihren ersten Standort hinzu'
                    : 'Wählen Sie einen Standort aus der Liste aus'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
