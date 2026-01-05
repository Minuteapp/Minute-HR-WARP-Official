
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Users, DollarSign, TrendingUp, Filter } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CountryData {
  country: string;
  code: string;
  activeAssignments: number;
  totalCost: number;
  riskLevel: 'low' | 'medium' | 'high';
  coordinates: [number, number];
  assignments: Array<{
    id: string;
    employeeName: string;
    position: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
}

// Hook für echte Daten aus der Datenbank
const useGlobalMobilityData = () => {
  return useQuery({
    queryKey: ['global-mobility-map'],
    queryFn: async () => {
      // Versuche echte Daten aus international_assignments zu laden
      const { data: assignments, error } = await supabase
        .from('international_assignments')
        .select('*')
        .eq('status', 'active');
      
      if (error || !assignments || assignments.length === 0) {
        return [] as CountryData[];
      }
      
      // Gruppiere nach Land
      const countryMap = new Map<string, CountryData>();
      
      for (const assignment of assignments) {
        const countryCode = assignment.destination_country || 'XX';
        const countryName = assignment.destination_country || 'Unbekannt';
        
        if (!countryMap.has(countryCode)) {
          countryMap.set(countryCode, {
            country: countryName,
            code: countryCode,
            activeAssignments: 0,
            totalCost: 0,
            riskLevel: 'low',
            coordinates: [0, 0],
            assignments: []
          });
        }
        
        const countryData = countryMap.get(countryCode)!;
        countryData.activeAssignments += 1;
        countryData.totalCost += assignment.total_cost || 0;
        countryData.assignments.push({
          id: assignment.id,
          employeeName: assignment.employee_name || 'Unbekannt',
          position: assignment.position || 'Unbekannt',
          startDate: assignment.start_date || '',
          endDate: assignment.end_date || '',
          status: assignment.status || 'active'
        });
      }
      
      return Array.from(countryMap.values());
    }
  });
};

// Leeres Array als Fallback - echte Daten kommen aus dem Hook

export const GlobalMobilityMap: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [viewMode, setViewMode] = useState<'assignments' | 'costs' | 'risk'>('assignments');
  
  // Echte Daten aus der Datenbank
  const { data: countryData = [] } = useGlobalMobilityData();

  const getBubbleSize = (country: CountryData) => {
    switch (viewMode) {
      case 'assignments':
        return Math.max(20, country.activeAssignments * 4);
      case 'costs':
        return Math.max(20, (country.totalCost / 100000) * 2);
      case 'risk':
        return country.riskLevel === 'high' ? 40 : country.riskLevel === 'medium' ? 30 : 20;
      default:
        return 20;
    }
  };

  const getBubbleColor = (country: CountryData) => {
    switch (viewMode) {
      case 'assignments':
        return country.activeAssignments > 10 ? 'bg-blue-600' : country.activeAssignments > 5 ? 'bg-blue-400' : 'bg-blue-200';
      case 'costs':
        return country.totalCost > 2000000 ? 'bg-green-600' : country.totalCost > 1000000 ? 'bg-green-400' : 'bg-green-200';
      case 'risk':
        return country.riskLevel === 'high' ? 'bg-red-500' : country.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500';
      default:
        return 'bg-blue-400';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Global Mobility Map</h2>
          <p className="text-sm text-gray-600">Weltweite Verteilung der Mitarbeiterentsendungen</p>
        </div>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="assignments">Entsendungen</SelectItem>
              <SelectItem value="costs">Kosten</SelectItem>
              <SelectItem value="risk">Risiko</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Weltweite Verteilung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-slate-50 rounded-lg h-96 overflow-hidden">
                {/* Simplified world map background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-slate-100">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-lg font-medium">Interaktive Weltkarte</p>
                      <p className="text-sm">Visualisierung der globalen Mobility-Daten</p>
                    </div>
                  </div>
                </div>

                {/* Country Bubbles - Simplified positioning */}
                {countryData.map((country, index) => (
                  <div
                    key={country.code}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 rounded-full ${getBubbleColor(country)} opacity-80 hover:opacity-100 transition-all duration-200 flex items-center justify-center text-white font-semibold text-xs`}
                    style={{
                      width: `${getBubbleSize(country)}px`,
                      height: `${getBubbleSize(country)}px`,
                      left: `${20 + (index * 20)}%`,
                      top: `${30 + (index * 15)}%`
                    }}
                    onClick={() => setSelectedCountry(country)}
                    title={`${country.country}: ${country.activeAssignments} Entsendungen`}
                  >
                    {country.activeAssignments}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span>Bubble-Größe = {viewMode === 'assignments' ? 'Anzahl Entsendungen' : viewMode === 'costs' ? 'Gesamtkosten' : 'Risiko-Level'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
                  <span>Niedrig</span>
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span>Mittel</span>
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>Hoch</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Country Details Panel */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {selectedCountry ? `${selectedCountry.country} Details` : 'Land auswählen'}
              </CardTitle>
              <CardDescription>
                {selectedCountry ? 'Detailansicht der Mobility-Daten' : 'Klicken Sie auf ein Land in der Karte'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCountry ? (
                <div className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-blue-900">{selectedCountry.activeAssignments}</div>
                      <div className="text-xs text-blue-600">Aktive Entsendungen</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <div className="text-2xl font-bold text-green-900">
                        €{(selectedCountry.totalCost / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-xs text-green-600">Gesamtkosten</div>
                    </div>
                  </div>

                  {/* Risk Level */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risiko-Level:</span>
                    <Badge className={getRiskBadgeColor(selectedCountry.riskLevel)} variant="secondary">
                      {selectedCountry.riskLevel.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Aktuelle Entsendungen</h4>
                    {selectedCountry.assignments.length > 0 ? (
                      <div className="space-y-3">
                        {selectedCountry.assignments.map((assignment) => (
                          <div key={assignment.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-medium text-sm">{assignment.employeeName}</div>
                            <div className="text-xs text-gray-600">{assignment.position}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Keine detaillierten Daten verfügbar</p>
                    )}
                  </div>

                  <Button className="w-full" variant="outline">
                    Detailbericht anzeigen
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Wählen Sie ein Land aus der Karte aus, um Details anzuzeigen</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamt Entsendungen</p>
                <p className="text-2xl font-bold">
                  {countryData.reduce((sum, country) => sum + country.activeAssignments, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Gesamtkosten</p>
                <p className="text-2xl font-bold">
                  €{(countryData.reduce((sum, country) => sum + country.totalCost, 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Länder</p>
                <p className="text-2xl font-bold">{countryData.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoch-Risiko Länder</p>
                <p className="text-2xl font-bold text-red-600">
                  {countryData.filter(c => c.riskLevel === 'high').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
