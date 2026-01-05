import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Tag, Building2 } from "lucide-react";

interface TicketDetailsTabProps {
  ticket: any;
}

export const TicketDetailsTab: React.FC<TicketDetailsTabProps> = ({ ticket }) => {
  return (
    <div className="space-y-4">
      {/* Beschreibung */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Beschreibung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">
            {ticket.description}
          </p>
        </CardContent>
      </Card>

      {/* Organisationsdetails - 3-Spalten-Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Organisationsdetails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Users className="h-3 w-3" />
                Team
              </div>
              <div className="text-sm font-medium">{ticket.team}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Tag className="h-3 w-3" />
                Abteilung
              </div>
              <div className="text-sm font-medium">{ticket.department}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Building2 className="h-3 w-3" />
                Standort
              </div>
              <div className="text-sm font-medium">{ticket.location}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadaten - 2x2 Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Metadaten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Ticket-ID</div>
              <div className="text-sm font-medium">{ticket.ticket_number}</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Kategorie</div>
              <Badge variant="outline">
                {ticket.category}
              </Badge>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Erstellt am</div>
              <div className="text-sm font-medium">Heute</div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">Letzte Aktualisierung</div>
              <div className="text-sm font-medium">Vor 1 Std.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
