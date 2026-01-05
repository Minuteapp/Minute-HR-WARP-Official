
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, MapPin, Calendar, DollarSign } from "lucide-react";
import type { GlobalMobilityRequest } from '@/types/global-mobility';

interface GlobalMobilityRequestsListProps {
  requests: GlobalMobilityRequest[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'submitted':
      return 'bg-blue-100 text-blue-800';
    case 'under_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'in_progress':
      return 'bg-purple-100 text-purple-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'draft':
      return 'Entwurf';
    case 'submitted':
      return 'Eingereicht';
    case 'under_review':
      return 'In Prüfung';
    case 'approved':
      return 'Genehmigt';
    case 'rejected':
      return 'Abgelehnt';
    case 'in_progress':
      return 'In Bearbeitung';
    case 'completed':
      return 'Abgeschlossen';
    case 'cancelled':
      return 'Storniert';
    default:
      return status;
  }
};

const getRequestTypeText = (type: string) => {
  switch (type) {
    case 'relocation':
      return 'Umzug';
    case 'assignment':
      return 'Entsendung';
    case 'transfer':
      return 'Versetzung';
    case 'visa_support':
      return 'Visa Support';
    case 'remote_work':
      return 'Remote Arbeit';
    default:
      return type;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-blue-100 text-blue-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'urgent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const GlobalMobilityRequestsList: React.FC<GlobalMobilityRequestsListProps> = ({
  requests
}) => {
  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Keine Anträge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-10 text-muted-foreground">
            Noch keine Global Mobility Anträge vorhanden.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{request.title}</h3>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </Badge>
                  <Badge variant="outline">
                    {getRequestTypeText(request.request_type)}
                  </Badge>
                  <Badge className={getPriorityColor(request.priority)}>
                    {request.priority.toUpperCase()}
                  </Badge>
                </div>
                {request.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {request.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Anzeigen
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Bearbeiten
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div className="text-sm">
                  <span className="text-gray-500">Von:</span> {request.current_location || 'Nicht angegeben'}
                  <br />
                  <span className="text-gray-500">Nach:</span> {request.destination_location || 'Nicht angegeben'}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div className="text-sm">
                  {request.start_date && (
                    <>
                      <span className="text-gray-500">Start:</span> {new Date(request.start_date).toLocaleDateString()}
                      <br />
                    </>
                  )}
                  {request.end_date && (
                    <>
                      <span className="text-gray-500">Ende:</span> {new Date(request.end_date).toLocaleDateString()}
                    </>
                  )}
                </div>
              </div>
              
              {request.estimated_cost && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div className="text-sm">
                    <span className="text-gray-500">Geschätzte Kosten:</span>
                    <br />
                    €{request.estimated_cost.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t text-xs text-gray-500">
              Erstellt: {new Date(request.created_at).toLocaleDateString()} | 
              Aktualisiert: {new Date(request.updated_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
