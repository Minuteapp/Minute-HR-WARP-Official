import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Users } from "lucide-react";
import { useMyHelpdeskTickets } from '@/hooks/useHelpdesk';
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface MyRequestsTableProps {
  onCreateTicket?: () => void;
}

export const MyRequestsTable = ({ onCreateTicket }: MyRequestsTableProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: tickets, isLoading } = useMyHelpdeskTickets();

  // Nur echte Datenbank-Daten anzeigen
  const displayTickets = tickets || [];

  const filteredTickets = displayTickets.filter(ticket => 
    ticket.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
    ticket.title?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      open: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      in_progress: 'bg-orange-50 text-orange-700 border-orange-200',
      resolved: 'bg-green-50 text-green-700 border-green-200',
      closed: 'bg-gray-50 text-gray-700 border-gray-200',
      escalated: 'bg-red-50 text-red-700 border-red-200',
      waiting_for_response: 'bg-orange-50 text-orange-700 border-orange-200',
    };
    
    const labels: Record<string, string> = {
      open: 'Offen',
      in_progress: 'In Bearbeitung',
      resolved: 'Gelöst',
      closed: 'Geschlossen',
      escalated: 'Eskaliert',
      waiting_for_response: 'Wartend',
    };
    
    return (
      <Badge variant="outline" className={variants[status] || 'bg-gray-50 text-gray-700 border-gray-200'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Meine Anfragen</h2>
          <p className="text-sm text-muted-foreground">{filteredTickets.length} Tickets</p>
        </div>
        <Button onClick={onCreateTicket} className="bg-black hover:bg-black/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Neue Anfrage erstellen
        </Button>
      </div>

      {/* Info-Box mit Link-Styling */}
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Users className="h-4 w-4 text-blue-600" />
        <span className="text-sm text-blue-600">Sie sehen alle Anfragen im System ({filteredTickets.length} Tickets)</span>
      </div>

      {/* Suchfeld */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-muted/30 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">ID</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Betreff</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Kategorie</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Erstellt</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ersteller</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Bearbeiter</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Aktionen</th>
            </tr>
          </thead>
          <tbody className="bg-background">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  Keine Anfragen gefunden
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <span className="text-sm font-medium">{ticket.ticket_number}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{ticket.title}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-muted-foreground">{ticket.category}</span>
                  </td>
                  <td className="p-4">{getStatusBadge(ticket.status)}</td>
                  <td className="p-4 text-sm">
                    {format(new Date(ticket.created_at), 'dd.MM.yyyy', { locale: de })}
                  </td>
                  <td className="p-4 text-sm">{ticket.requester_name || 'Sie'}</td>
                  <td className="p-4 text-sm">{ticket.assigned_to || 'Nicht zugewiesen'}</td>
                  <td className="p-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/helpdesk/${ticket.id}`)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
