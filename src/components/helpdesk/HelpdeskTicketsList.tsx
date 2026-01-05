
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Clock, User, AlertTriangle } from "lucide-react";
import { useHelpdeskTickets } from '@/hooks/useHelpdesk';
import type { HelpdeskTicket } from '@/types/helpdesk';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface HelpdeskTicketsListProps {
  filterType?: 'all' | 'created' | 'assigned';
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'open':
      return 'bg-blue-100 text-blue-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'waiting_for_response':
      return 'bg-orange-100 text-orange-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'closed':
      return 'bg-gray-100 text-gray-800';
    case 'escalated':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'draft':
      return 'Entwurf';
    case 'open':
      return 'Offen';
    case 'in_progress':
      return 'In Bearbeitung';
    case 'waiting_for_response':
      return 'Wartet auf Antwort';
    case 'resolved':
      return 'Gelöst';
    case 'closed':
      return 'Geschlossen';
    case 'escalated':
      return 'Eskaliert';
    default:
      return status;
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

const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'low':
      return 'Niedrig';
    case 'medium':
      return 'Mittel';
    case 'high':
      return 'Hoch';
    case 'urgent':
      return 'Dringend';
    default:
      return priority;
  }
};

export const HelpdeskTicketsList: React.FC<HelpdeskTicketsListProps> = ({
  filterType = 'all'
}) => {
  const { data: tickets, isLoading, error } = useHelpdeskTickets();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lade Tickets...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fehler beim Laden</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Die Tickets konnten nicht geladen werden.</p>
        </CardContent>
      </Card>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Keine Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-10 text-muted-foreground">
            Noch keine Helpdesk-Tickets vorhanden.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{ticket.title}</h3>
                  <Badge className={getStatusColor(ticket.status)}>
                    {getStatusText(ticket.status)}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {getPriorityText(ticket.priority)}
                  </Badge>
                  {ticket.escalation_level && ticket.escalation_level > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Eskaliert
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">#{ticket.ticket_number}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {ticket.requester_name || 'Unbekannt'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(ticket.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </span>
                </div>
                {ticket.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {ticket.description}
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
              <div className="text-sm">
                <span className="text-gray-500">Kategorie:</span> {ticket.category}
                {ticket.subcategory && (
                  <>
                    <br />
                    <span className="text-gray-500">Unterkategorie:</span> {ticket.subcategory}
                  </>
                )}
              </div>
              
              <div className="text-sm">
                <span className="text-gray-500">Geschäftsauswirkung:</span> {ticket.business_impact}
                {ticket.affected_employees && (
                  <>
                    <br />
                    <span className="text-gray-500">Betroffene Mitarbeiter:</span> {ticket.affected_employees}
                  </>
                )}
              </div>
              
              {ticket.sla_due_date && (
                <div className="text-sm">
                  <span className="text-gray-500">SLA Fällig:</span>
                  <br />
                  {format(new Date(ticket.sla_due_date), 'dd.MM.yyyy HH:mm', { locale: de })}
                </div>
              )}
            </div>
            
            {ticket.tags && ticket.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1">
                {ticket.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
