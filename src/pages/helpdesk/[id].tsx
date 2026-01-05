import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Share2, Archive, Clock, MessageSquare, FileText, Activity, Loader2 } from "lucide-react";
import { TicketConversationTab } from '@/components/helpdesk/ticket-detail/TicketConversationTab';
import { TicketDetailsTab } from '@/components/helpdesk/ticket-detail/TicketDetailsTab';
import { TicketActivityTab } from '@/components/helpdesk/ticket-detail/TicketActivityTab';
import { useHelpdeskTicket } from '@/hooks/useHelpdesk';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Echte Daten aus der Datenbank laden
  const { data: ticket, isLoading, error } = useHelpdeskTicket(id || '');
  
  const [status, setStatus] = useState('open');
  const [priority, setPriority] = useState('medium');
  const [assignee, setAssignee] = useState('');

  // State mit echten Daten initialisieren wenn geladen
  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status || 'open');
      setPriority(ticket.priority || 'medium');
      setAssignee(ticket.assigned_to || '');
    }
  }, [ticket]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Ticket wird geladen...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Ticket nicht gefunden</p>
          <Button onClick={() => navigate('/helpdesk')} className="mt-4">
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      open: 'Offen',
      in_progress: 'In Bearbeitung',
      resolved: 'Gelöst',
      closed: 'Geschlossen',
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      low: 'Niedrig',
      medium: 'Normal',
      high: 'Hoch',
      urgent: 'Kritisch',
    };
    return labels[priority] || priority;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="p-4">
          {/* Top Row: Vorschau Badge + Back Link */}
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="text-xs bg-muted">Vorschau</Badge>
            <button 
              onClick={() => navigate('/helpdesk')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </button>
          </div>

          {/* Title Row */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-foreground mb-1">{ticket.title}</h1>
              <p className="text-sm text-muted-foreground">
                {ticket.ticket_number} • {ticket.category}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* SLA Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">SLA: {ticket.sla_hours}h</span>
              </div>

              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <Share2 className="h-4 w-4" />
                Teilen
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                <Archive className="h-4 w-4" />
                Archivieren
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left: Tabs Content */}
        <div className="flex-1 p-6">
          <Tabs defaultValue="conversation" className="space-y-4">
            <TabsList className="bg-muted/50 p-1 rounded-lg h-auto w-fit">
              <TabsTrigger 
                value="conversation" 
                className="rounded-md px-4 py-2 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <MessageSquare className="h-4 w-4" />
                Konversation
              </TabsTrigger>
              <TabsTrigger 
                value="details"
                className="rounded-md px-4 py-2 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <FileText className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="rounded-md px-4 py-2 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Activity className="h-4 w-4" />
                Aktivität
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversation">
              <TicketConversationTab ticket={ticket} />
            </TabsContent>

            <TabsContent value="details">
              <TicketDetailsTab ticket={ticket} />
            </TabsContent>

            <TabsContent value="activity">
              <TicketActivityTab ticket={ticket} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Sidebar */}
        <div className="w-80 border-l bg-muted/20 p-6 space-y-6">
          <h3 className="font-semibold text-foreground">Ticket-Eigenschaften</h3>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue>{getStatusLabel(status)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Offen</SelectItem>
                <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                <SelectItem value="resolved">Gelöst</SelectItem>
                <SelectItem value="closed">Geschlossen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priorität */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Priorität</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue>{getPriorityLabel(priority)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Niedrig</SelectItem>
                <SelectItem value="medium">Normal</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="urgent">Kritisch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ersteller */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Ersteller</label>
            <div className="flex items-center gap-3 p-2 bg-background rounded-lg border">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-100 text-blue-700">M1</AvatarFallback>
              </Avatar>
              <div className="text-sm font-medium">{ticket.requester_name}</div>
            </div>
          </div>

          {/* Bearbeiter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Bearbeiter</label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <span>{ticket.assigned_to}</span>
              </SelectTrigger>
              <SelectContent>
                {/* ZERO-DATA: Bearbeiter aus DB laden */}
                <SelectItem value="placeholder" disabled>Bearbeiter laden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Kategorie */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Kategorie</label>
            <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
              {ticket.category}
            </Badge>
          </div>

          {/* Letzte Aktualisierung */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Letzte Aktualisierung</label>
            <p className="text-sm">Vor 1 Std.</p>
          </div>

          {/* Save Button */}
          <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Änderungen speichern
          </Button>
        </div>
      </div>
    </div>
  );
}
