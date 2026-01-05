import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, Users, DollarSign, FileText, Plane } from "lucide-react";

interface RequestDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
  onApprove?: (requestId: string, comment?: string) => void;
  onReject?: (requestId: string, reason: string) => void;
}

export default function RequestDetailView({ 
  open, 
  onOpenChange, 
  request, 
  onApprove, 
  onReject 
}: RequestDetailViewProps) {
  const [comment, setComment] = useState('');

  if (!request) return null;

  const Icon = request.icon;
  const isOpen = request.status === 'open';

  const handleApprove = () => {
    if (onApprove) {
      onApprove(request.id, comment || undefined);
      setComment('');
    }
  };

  const handleReject = () => {
    if (comment.trim()) {
      if (onReject) {
        onReject(request.id, comment);
        setComment('');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${request.iconBg} flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${request.iconColor}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle>{request.title}</DialogTitle>
                <span className="text-sm text-muted-foreground">{request.id}</span>
                <Badge variant="outline" className={request.statusBadge.class}>
                  {request.statusBadge.text}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Antragsteller */}
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={request.submitter.avatar} />
                <AvatarFallback>{request.submitter.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{request.submitter.name}</p>
                <p className="text-sm text-muted-foreground">{request.submitter.department}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Antragsdatum</span>
                </div>
                <p className="font-medium">{request.submittedDate}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Zeitraum</span>
                </div>
                <p className="font-medium">{request.dateRange || request.date}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Status</span>
                </div>
                <Badge variant="outline" className={request.statusBadge.class}>
                  {request.statusBadge.text}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Beschreibung</span>
                </div>
                <p className="font-medium text-sm">{request.subtitle}</p>
              </div>
            </div>

            {/* Typ-spezifische Details */}
            {request.type === 'vacation' && request.details && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <h4 className="font-semibold text-blue-900">Urlaubsdetails</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Anzahl Tage</p>
                    <p className="font-semibold text-blue-900">{request.details.daysCount} Tage</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Verbleibende Urlaubstage</p>
                    <p className="font-semibold text-blue-900">{request.details.remainingDays} Tage</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Vertretung</p>
                    <p className="font-semibold text-blue-900">{request.details.substitute}</p>
                  </div>
                </div>
              </div>
            )}

            {request.type === 'expense' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
                <h4 className="font-semibold text-green-900">Spesendetails</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-green-700">Betrag</p>
                    <p className="font-semibold text-green-900">{request.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Belege</p>
                    <p className="font-semibold text-green-900">{request.receipts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Kategorie</p>
                    <p className="font-semibold text-green-900">Geschäftsreise</p>
                  </div>
                </div>
              </div>
            )}

            {request.type === 'overtime' && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-3">
                <h4 className="font-semibold text-purple-900">Überstundendetails</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-purple-700">Stunden</p>
                    <p className="font-semibold text-purple-900">{request.hours}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">Datum</p>
                    <p className="font-semibold text-purple-900">{request.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-700">Projekt</p>
                    <p className="font-semibold text-purple-900">Cloud Migration</p>
                  </div>
                </div>
              </div>
            )}

            {/* Verlauf */}
            <div className="space-y-3">
              <h4 className="font-semibold">Verlauf</h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Antrag eingereicht</p>
                    <p className="text-xs text-muted-foreground">
                      {request.submittedDate} von {request.submitter.name}
                    </p>
                  </div>
                </div>
                {request.status === 'approved' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Antrag genehmigt</p>
                      <p className="text-xs text-muted-foreground">
                        {request.submittedDate} von Vorgesetzter
                      </p>
                    </div>
                  </div>
                )}
                {request.status === 'rejected' && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Antrag abgelehnt</p>
                      <p className="text-xs text-muted-foreground">
                        {request.submittedDate} von Vorgesetzter
                      </p>
                      {request.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1">{request.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Kommentar */}
            {isOpen && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Kommentar oder Begründung (optional)</label>
                <Textarea
                  placeholder="Fügen Sie einen Kommentar oder eine Begründung hinzu..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
        </ScrollArea>

        {isOpen && (
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button 
              variant="outline" 
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleReject}
              disabled={!comment.trim()}
            >
              Ablehnen
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleApprove}
            >
              Genehmigen
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
