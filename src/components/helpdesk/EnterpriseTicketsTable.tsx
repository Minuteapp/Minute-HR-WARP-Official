import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Eye, Sparkles, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useHelpdeskTicketsPaginated, useHelpdeskKPIs } from '@/hooks/useHelpdesk';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface EnterpriseTicketsTableProps {
  onCreateTicket?: () => void;
}

export const EnterpriseTicketsTable = ({ onCreateTicket }: EnterpriseTicketsTableProps) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState('');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Inline Filter States
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const { data, isLoading } = useHelpdeskTicketsPaginated({
    page,
    pageSize,
    search,
  });

  const { data: kpis } = useHelpdeskKPIs();

  const getSLADisplay = (slaDate: string | null) => {
    if (!slaDate) return { text: '-', color: 'text-muted-foreground' };
    
    const now = new Date();
    const sla = new Date(slaDate);
    const hoursRemaining = (sla.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursRemaining <= 0) {
      return { text: '0h', color: 'text-red-600 font-bold' };
    }
    
    if (hoursRemaining < 6) {
      return { text: `${Math.round(hoursRemaining)}h`, color: 'text-red-600' };
    }
    
    if (hoursRemaining < 12) {
      return { text: `${Math.round(hoursRemaining)}h`, color: 'text-orange-600' };
    }
    
    return { text: `${Math.round(hoursRemaining)}h`, color: 'text-green-600' };
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      escalated: 'bg-red-100 text-red-800',
      waiting_for_response: 'bg-orange-100 text-orange-800',
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
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    
    const labels: Record<string, string> = {
      low: 'Niedrig',
      medium: 'Normal',
      high: 'Hoch',
      urgent: 'Kritisch',
    };
    
    return (
      <Badge className={variants[priority] || 'bg-gray-100 text-gray-800'}>
        {labels[priority] || priority}
      </Badge>
    );
  };

  // Nur echte Datenbank-Daten anzeigen
  const displayTickets = data?.tickets || [];
  const totalPages = Math.ceil((data?.totalCount || 0) / pageSize);
  const totalTickets = data?.totalCount || 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header mit Titel und Status-Badges */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Posteingang - Enterprise</h2>
          <p className="text-sm text-muted-foreground">{totalTickets} Tickets</p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onCreateTicket} className="bg-foreground hover:bg-foreground/90 text-background">
            <Plus className="h-4 w-4 mr-2" />
            Neue Anfrage erstellen
          </Button>
          
          {/* Status-Badges als Outline-Buttons */}
          <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 px-3 py-1.5">
            {kpis?.open || 0} Offen
          </Badge>
          <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50 px-3 py-1.5">
            {kpis?.inProgress || 0} In Bearbeitung
          </Badge>
          <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50 px-3 py-1.5">
            {kpis?.slaCritical || 0} SLA-Kritisch
          </Badge>
        </div>
      </div>

      {/* Suchzeile mit Filter-Button */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ticket-ID, Betreff..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filter
          {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Ausklappbare Filter als 2x3 Grid */}
      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent className="pt-2">
          <div className="grid grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Alle Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="open">Offen</SelectItem>
                  <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                  <SelectItem value="resolved">Gelöst</SelectItem>
                  <SelectItem value="closed">Geschlossen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Priorität</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Alle Prioritäten" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Prioritäten</SelectItem>
                  <SelectItem value="low">Niedrig</SelectItem>
                  <SelectItem value="medium">Normal</SelectItem>
                  <SelectItem value="high">Hoch</SelectItem>
                  <SelectItem value="urgent">Kritisch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Kategorie</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Alle Kategorien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  <SelectItem value="Lohn & Gehalt">Lohn & Gehalt</SelectItem>
                  <SelectItem value="Urlaub">Urlaub & Abwesenheit</SelectItem>
                  <SelectItem value="IT-Support">IT-Support</SelectItem>
                  <SelectItem value="Dokumente">Dokumente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Team</label>
              <Select value={teamFilter} onValueChange={setTeamFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Alle Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Teams</SelectItem>
                  <SelectItem value="hr">HR-Team</SelectItem>
                  <SelectItem value="it">IT-Team</SelectItem>
                  <SelectItem value="payroll">Payroll-Team</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Abteilung</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Alle Abteilungen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Abteilungen</SelectItem>
                  <SelectItem value="Vertrieb">Vertrieb</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Entwicklung">Entwicklung</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Standort</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Alle Standorte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Standorte</SelectItem>
                  <SelectItem value="Berlin">Berlin</SelectItem>
                  <SelectItem value="München">München</SelectItem>
                  <SelectItem value="Hamburg">Hamburg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Tabelle */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 w-12">
                    <Checkbox />
                  </th>
                  <th className="text-left p-4 text-sm font-medium">ID</th>
                  <th className="text-left p-4 text-sm font-medium">Betreff</th>
                  <th className="text-left p-4 text-sm font-medium">Kategorie</th>
                  <th className="text-left p-4 text-sm font-medium">Priorität</th>
                  <th className="text-left p-4 text-sm font-medium">Status</th>
                  <th className="text-left p-4 text-sm font-medium">Abteilung</th>
                  <th className="text-left p-4 text-sm font-medium">Standort</th>
                  <th className="text-left p-4 text-sm font-medium">Bearbeiter</th>
                  <th className="text-left p-4 text-sm font-medium">SLA</th>
                  <th className="text-left p-4 text-sm font-medium">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {displayTickets.map((ticket: any, index: number) => {
                  const sla = getSLADisplay(ticket.sla_due_date || null);
                  // KI-Icon für bestimmte Tickets (z.B. jedes 3. Ticket)
                  const showAIIcon = index % 3 === 0;
                  
                  return (
                    <tr key={ticket.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <Checkbox 
                          checked={selectedTickets.includes(ticket.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTickets([...selectedTickets, ticket.id]);
                            } else {
                              setSelectedTickets(selectedTickets.filter(id => id !== ticket.id));
                            }
                          }}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {showAIIcon && <Sparkles className="h-3.5 w-3.5 text-violet-500" />}
                          <span className="text-sm font-medium">{ticket.ticket_number}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium truncate">{ticket.title}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {ticket.requester_name || 'Unbekannt'}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {ticket.category}
                        </Badge>
                      </td>
                      <td className="p-4">{getPriorityBadge(ticket.priority)}</td>
                      <td className="p-4">{getStatusBadge(ticket.status)}</td>
                      <td className="p-4 text-sm">{(ticket as any).department || '-'}</td>
                      <td className="p-4 text-sm">{(ticket as any).location || '-'}</td>
                      <td className="p-4 text-sm">{ticket.assigned_to || '-'}</td>
                      <td className="p-4">
                        <span className={`text-sm font-medium ${sla.color}`}>
                          {sla.text}
                        </span>
                      </td>
                      <td className="p-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/helpdesk/${ticket.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginierung */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalTickets)} von {totalTickets} Tickets
              </span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 pro Seite</SelectItem>
                  <SelectItem value="50">50 pro Seite</SelectItem>
                  <SelectItem value="100">100 pro Seite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronUp className="h-4 w-4 rotate-[-90deg]" />
              </Button>
              {Array.from({ length: Math.min(5, totalPages || 10) }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page >= (totalPages || 10)}
                onClick={() => setPage(page + 1)}
              >
                <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
