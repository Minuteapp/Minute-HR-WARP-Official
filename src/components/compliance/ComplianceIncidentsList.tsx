
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, AlertTriangle, Eye, Edit } from "lucide-react";
import { useComplianceIncidents } from '@/hooks/useCompliance';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ComplianceIncidentsListProps {
  limit?: number;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-600';
    case 'high': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'reported': return 'bg-blue-500';
    case 'investigating': return 'bg-yellow-500';
    case 'resolved': return 'bg-green-500';
    case 'escalated': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const ComplianceIncidentsList = ({ limit }: ComplianceIncidentsListProps) => {
  const { data: incidents, isLoading } = useComplianceIncidents();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIncidents = incidents?.filter(incident => 
    incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.incident_number.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, limit);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: limit || 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (limit) {
    // Kompakte Ansicht für Dashboard
    return (
      <div className="space-y-3">
        {filteredIncidents?.map((incident) => (
          <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`h-4 w-4 ${incident.severity === 'critical' ? 'text-red-600' : 'text-orange-500'}`} />
              <div>
                <p className="font-medium text-sm">{incident.title}</p>
                <p className="text-xs text-gray-500">{incident.incident_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`text-white ${getSeverityColor(incident.severity)} text-xs`}>
                {incident.severity === 'critical' && 'Kritisch'}
                {incident.severity === 'high' && 'Hoch'}
                {incident.severity === 'medium' && 'Mittel'}
                {incident.severity === 'low' && 'Niedrig'}
              </Badge>
              <Badge className={`text-white ${getStatusColor(incident.investigation_status)} text-xs`}>
                {incident.investigation_status === 'reported' && 'Gemeldet'}
                {incident.investigation_status === 'investigating' && 'Wird untersucht'}
                {incident.investigation_status === 'resolved' && 'Gelöst'}
                {incident.investigation_status === 'escalated' && 'Eskaliert'}
              </Badge>
            </div>
          </div>
        ))}
        
        {filteredIncidents?.length === 0 && (
          <p className="text-center text-gray-500 py-4">Keine aktuellen Vorfälle</p>
        )}
      </div>
    );
  }

  // Vollständige Listenansicht
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Compliance-Vorfälle</CardTitle>
              <CardDescription>
                Meldung und Verwaltung von Compliance-Verstößen und -Vorfällen
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Vorfall melden
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Vorfälle durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredIncidents?.map((incident) => (
              <Card key={incident.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <h3 className="font-semibold text-lg">{incident.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {incident.incident_number}
                        </Badge>
                        <Badge className={`text-white ${getSeverityColor(incident.severity)}`}>
                          {incident.severity === 'critical' && 'Kritisch'}
                          {incident.severity === 'high' && 'Hoch'}
                          {incident.severity === 'medium' && 'Mittel'}
                          {incident.severity === 'low' && 'Niedrig'}
                        </Badge>
                        <Badge className={`text-white ${getStatusColor(incident.investigation_status)}`}>
                          {incident.investigation_status === 'reported' && 'Gemeldet'}
                          {incident.investigation_status === 'investigating' && 'Wird untersucht'}
                          {incident.investigation_status === 'resolved' && 'Gelöst'}
                          {incident.investigation_status === 'escalated' && 'Eskaliert'}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {incident.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Typ: {incident.incident_type}</span>
                        {incident.department && <span>Abteilung: {incident.department}</span>}
                        <span>Gemeldet: {format(new Date(incident.incident_date), 'dd.MM.yyyy', { locale: de })}</span>
                        {incident.is_anonymous && (
                          <Badge variant="outline" className="text-xs">
                            Anonym
                          </Badge>
                        )}
                        {incident.notification_authorities && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                            Behörden informiert
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredIncidents?.length === 0 && (
              <div className="text-center py-10">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Keine Vorfälle gefunden</p>
                <p className="text-sm text-gray-400">
                  Melden Sie einen neuen Vorfall oder passen Sie die Suchbegriffe an
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
