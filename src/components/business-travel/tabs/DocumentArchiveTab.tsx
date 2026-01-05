import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Archive, Search, Calendar, Filter, FileText, Download, 
  Shield, Clock, Euro, User, ArrowRight, CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function DocumentArchiveTab() {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch archived trips
  const { data: archivedTrips = [], isLoading } = useQuery({
    queryKey: ['archived-trips', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('archived_trips')
        .select(`
          *,
          employee:employees(first_name, last_name)
        `)
        .order('archived_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`trip_number.ilike.%${searchTerm}%,destination.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate stats
  const totalTrips = archivedTrips.length;
  const totalVolume = archivedTrips.reduce((sum, trip) => sum + (Number(trip.total_cost) || 0), 0);
  const avgAuditScore = archivedTrips.length > 0 
    ? Math.round(archivedTrips.reduce((sum, trip) => sum + (trip.audit_score || 0), 0) / archivedTrips.length)
    : 0;

  const getAuditScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAuditScoreLabel = (score: number) => {
    if (score >= 90) return 'Sehr gut';
    if (score >= 70) return 'Gut';
    if (score >= 50) return 'Ausreichend';
    return 'Mangelhaft';
  };

  const getEmployeeName = (employee: any) => {
    if (!employee) return 'Unbekannt';
    return `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unbekannt';
  };

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
          <h2 className="text-2xl font-bold">Archiv</h2>
          <p className="text-muted-foreground">
            Abgeschlossene Reisen mit Audit-Trail und Exportfunktion
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          DATEV Export
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Suchen nach Reise-Nr., Ziel..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Zeitraum
        </Button>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Erweiterte Filter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Archivierte Reisen</p>
                <p className="text-2xl font-bold">{totalTrips}</p>
                <p className="text-xs text-muted-foreground">Gesamt</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesamtvolumen</p>
                <p className="text-2xl font-bold">
                  {totalVolume.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €
                </p>
                <p className="text-xs text-muted-foreground">Alle Jahre</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Euro className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ø Audit-Score</p>
                <p className={`text-2xl font-bold ${getAuditScoreColor(avgAuditScore)}`}>
                  {avgAuditScore}/100
                </p>
                <p className={`text-xs ${getAuditScoreColor(avgAuditScore)}`}>
                  {getAuditScoreLabel(avgAuditScore)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Retention</p>
                <p className="text-2xl font-bold">10 Jahre</p>
                <p className="text-xs text-muted-foreground">DSGVO-konform</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Archived Trips List */}
      <div className="space-y-4">
        {archivedTrips.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Archive className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Keine archivierten Reisen</p>
              <p className="text-muted-foreground">
                {searchTerm ? 'Keine Ergebnisse für Ihre Suche' : 'Abgeschlossene Reisen werden hier archiviert'}
              </p>
            </CardContent>
          </Card>
        ) : (
          archivedTrips.map((trip: any) => (
            <Card key={trip.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-sm font-medium">{trip.trip_number}</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Abgeschlossen
                      </Badge>
                      <Badge variant="outline" className={getAuditScoreColor(trip.audit_score || 0)}>
                        Audit: {trip.audit_score || 0}/100
                      </Badge>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-2 text-lg font-medium mb-3">
                      <span>{trip.origin || 'Start'}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span>{trip.destination || 'Ziel'}</span>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {getEmployeeName(trip.employee)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {trip.start_date && trip.end_date ? (
                          <>
                            {format(new Date(trip.start_date), 'dd.MM.yyyy', { locale: de })} - {format(new Date(trip.end_date), 'dd.MM.yyyy', { locale: de })}
                          </>
                        ) : (
                          'Datum unbekannt'
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Euro className="h-4 w-4" />
                        {Number(trip.total_cost || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                      </div>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-3">
                      Archiviert: {trip.archived_at ? format(new Date(trip.archived_at), 'dd.MM.yyyy', { locale: de }) : '-'}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Audit-Trail
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Compliance-Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export (PDF)
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}