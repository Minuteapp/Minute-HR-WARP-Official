import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Building2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSupportTickets } from "@/hooks/useSupportTickets";
import { CreateTicketDialog } from "@/components/admin/support/CreateTicketDialog";

const getPriorityBadge = (priority: string) => {
  const map: Record<string, { label: string; className: string }> = {
    critical: { label: "Kritisch", className: "bg-red-100 text-red-700 border-red-200" },
    high: { label: "Hoch", className: "bg-orange-100 text-orange-700 border-orange-200" },
    medium: { label: "Mittel", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    low: { label: "Niedrig", className: "bg-gray-100 text-gray-700 border-gray-200" },
  };
  const info = map[priority] || { label: priority, className: "bg-gray-100 text-gray-700" };
  return <Badge className={info.className}>{info.label}</Badge>;
};

const getStatusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    new: { label: "Neu", className: "bg-blue-100 text-blue-700 border-blue-200" },
    in_progress: { label: "In Bearbeitung", className: "bg-primary/10 text-primary border-primary/20" },
    waiting: { label: "Wartet", className: "bg-orange-100 text-orange-700 border-orange-200" },
    resolved: { label: "Gelöst", className: "bg-green-100 text-green-700 border-green-200" },
    closed: { label: "Geschlossen", className: "bg-gray-100 text-gray-700 border-gray-200" },
  };
  const info = map[status] || { label: status, className: "bg-gray-100 text-gray-700" };
  return <Badge className={info.className}>{info.label}</Badge>;
};

const SupportTicketsTab = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: tickets, isLoading } = useSupportTickets({
    priority: priorityFilter,
    status: statusFilter
  });

  const filteredTickets = (tickets || []).filter(ticket => {
    const search = searchQuery.toLowerCase();
    return ticket.title.toLowerCase().includes(search) ||
           ticket.ticket_number.toLowerCase().includes(search) ||
           (ticket.company_name || '').toLowerCase().includes(search);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3">Lade Tickets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tickets durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Prioritäten" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Prioritäten</SelectItem>
            <SelectItem value="critical">Kritisch</SelectItem>
            <SelectItem value="high">Hoch</SelectItem>
            <SelectItem value="medium">Mittel</SelectItem>
            <SelectItem value="low">Niedrig</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="new">Neu</SelectItem>
            <SelectItem value="in_progress">In Bearbeitung</SelectItem>
            <SelectItem value="waiting">Wartet</SelectItem>
            <SelectItem value="resolved">Gelöst</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Neues Ticket
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Priorität</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mandant</TableHead>
                <TableHead>Modul</TableHead>
                <TableHead>Aktualisiert</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Keine Tickets gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id} 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/admin/support/tickets/${ticket.ticket_number}`)}
                  >
                    <TableCell>
                      <div>
                        <span className="text-primary font-medium hover:underline">{ticket.ticket_number}</span>
                        <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{ticket.title}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{ticket.category || '-'}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm">{ticket.company_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{ticket.module || '-'}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(ticket.updated_at).toLocaleString('de-DE')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-500">{filteredTickets.length} Tickets</p>

      <CreateTicketDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </div>
  );
};

export default SupportTicketsTab;
