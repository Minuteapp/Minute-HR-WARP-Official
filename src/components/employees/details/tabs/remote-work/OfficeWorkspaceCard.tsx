import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Calendar } from "lucide-react";
import type { DeskBooking, DeskBookingEntry } from "@/integrations/supabase/hooks/useEmployeeRemoteWork";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { BookDeskDialog } from "./dialogs/BookDeskDialog";

interface OfficeWorkspaceCardProps {
  deskBooking?: DeskBooking;
  bookingEntries?: DeskBookingEntry[];
}

export const OfficeWorkspaceCard = ({ deskBooking, bookingEntries }: OfficeWorkspaceCardProps) => {
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  
  if (!deskBooking) return null;

  const getWorkspaceModelLabel = (model: string) => {
    switch (model) {
      case 'desk_sharing':
        return 'Flexibler Arbeitsplatz nach Verfügbarkeit';
      case 'fixed_desk':
        return 'Fester Arbeitsplatz';
      case 'hot_desking':
        return 'Hot Desking';
      default:
        return model;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 text-white rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl">Arbeitsplatz im Büro</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Arbeitsplatz-Modell:</span>
            <Badge className="bg-purple-500 text-white">
              {deskBooking.badge_label || 'Desk Sharing'}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {getWorkspaceModelLabel(deskBooking.workspace_model)}
          </p>
          
          <div className="border-t pt-3 space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground">Bevorzugtes Stockwerk:</span>
              <span className="text-sm font-medium text-right">
                {deskBooking.preferred_floor}
                <span className="text-xs text-muted-foreground ml-1">(Präferenz)</span>
              </span>
            </div>
            
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground">Arbeitsplatz-Typ:</span>
              <span className="text-sm font-medium text-right">
                {deskBooking.workspace_type}
                <span className="text-xs text-muted-foreground ml-1">(Bereich)</span>
              </span>
            </div>
            
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground">Schließfach:</span>
              <span className="text-sm font-medium text-right">
                {deskBooking.locker_assigned ? 'Zugeteilt' : 'Nicht zugeteilt'}
                {deskBooking.locker_number && (
                  <span className="text-xs text-muted-foreground ml-1">
                    , {deskBooking.locker_number}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
        
        {bookingEntries && bookingEntries.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Nächste Buchungen</h4>
            <div className="space-y-2">
              {bookingEntries.map((entry) => (
                <div key={entry.id} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(entry.booking_date), 'EEEE, dd.MM.yyyy', { locale: de })}
                      </p>
                      {entry.floor && (
                        <p className="text-xs text-muted-foreground">{entry.floor}</p>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-blue-500 text-white">
                    {entry.status === 'gebucht' ? 'Gebucht' : entry.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          className="w-full bg-black hover:bg-black/90 text-white"
          onClick={() => setBookDialogOpen(true)}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Arbeitsplatz buchen
        </Button>
      </CardContent>

      <BookDeskDialog
        open={bookDialogOpen}
        onOpenChange={setBookDialogOpen}
        employeeId={deskBooking.employee_id}
        preferredFloor={deskBooking.preferred_floor}
        deskBookingId={deskBooking.id}
      />
    </Card>
  );
};
