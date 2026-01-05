
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { absenceService } from "@/services/absenceService";

interface SickLeaveTabProps {
  employeeId: string;
}

export const SickLeaveTab = ({ employeeId }: SickLeaveTabProps) => {
  const [showNewSickLeaveDialog, setShowNewSickLeaveDialog] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

      const { data: sickLeaves, isLoading } = useQuery({
        queryKey: ['sickLeaves', employeeId, 'absence-requests'],
        queryFn: () => absenceService.getSickLeaves(employeeId)
      });

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte Start- und Enddatum angeben",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await absenceService.createSickLeave({
        user_id: employeeId,
        start_date: startDate,
        end_date: endDate,
        description,
        notes
      });

      if (result) {
        toast({
          title: "Erfolg",
          description: "Krankmeldung wurde gespeichert",
        });
        
        setShowNewSickLeaveDialog(false);
        
        queryClient.invalidateQueries({ queryKey: ['sickLeaves', employeeId] });
        queryClient.invalidateQueries({ queryKey: ['absence-requests'] });
        queryClient.invalidateQueries({ queryKey: ['recent-absence-requests'] });
        queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
        
        setStartDate("");
        setEndDate("");
        setDescription("");
        setNotes("");
      }
    } catch (error) {
      console.error('Error saving sick leave:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Krankmeldung konnte nicht gespeichert werden",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return "bg-yellow-100 text-yellow-800";
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'cancelled':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return "Aktiv";
      case 'completed':
        return "Abgeschlossen";
      case 'cancelled':
        return "Storniert";
      default:
        return status;
    }
  };

  const filteredSickLeaves = sickLeaves?.filter(sickLeave => 
    !searchQuery || 
    (sickLeave.description && sickLeave.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (sickLeave.notes && sickLeave.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (sickLeave.employee_name && sickLeave.employee_name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Krankmeldungen</h2>
        <Button onClick={() => setShowNewSickLeaveDialog(true)}>
          Neue Krankmeldung
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Krankmeldungsübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative flex-1 max-w-sm">
              <Input
                type="text"
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4 text-center">Daten werden geladen...</div>
            ) : !filteredSickLeaves || filteredSickLeaves.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'Keine passenden Krankmeldungen gefunden' : 'Keine Krankmeldungen gefunden'}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Zeitraum</th>
                    <th className="text-left py-3 px-4">Mitarbeiter</th>
                    <th className="text-left py-3 px-4">Beschreibung</th>
                    <th className="text-left py-3 px-4">Notizen</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSickLeaves.map((sickLeave) => (
                    <tr key={sickLeave.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {format(new Date(sickLeave.start_date), 'dd.MM.yyyy')} - {format(new Date(sickLeave.end_date), 'dd.MM.yyyy')}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{sickLeave.employee_name || 'Unbekannt'}</div>
                          {sickLeave.department && (
                            <div className="text-sm text-gray-500">{sickLeave.department}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{sickLeave.description || '-'}</td>
                      <td className="py-3 px-4">{sickLeave.notes || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(sickLeave.status)}>
                          {getStatusLabel(sickLeave.status)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showNewSickLeaveDialog} onOpenChange={setShowNewSickLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neue Krankmeldung</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Startdatum</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Enddatum</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Grund der Krankmeldung..."
              />
            </div>
            <div className="space-y-2">
              <Label>Notizen</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Zusätzliche Informationen..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSickLeaveDialog(false)} disabled={isSubmitting}>
              Abbrechen
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
