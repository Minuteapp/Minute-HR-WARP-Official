import { useState } from 'react';
import { Calendar, Clock, MapPin, FileText, Paperclip, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { ApprovalRequest } from './ApprovalCard';

interface ApprovalDetailDialogProps {
  request: ApprovalRequest | null;
  open: boolean;
  onClose: () => void;
  onApprove: (id: string, comment?: string) => void;
  onReject: (id: string, comment?: string) => void;
}

const ApprovalDetailDialog = ({ request, open, onClose, onApprove, onReject }: ApprovalDetailDialogProps) => {
  const [comment, setComment] = useState('');

  if (!request) return null;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'urlaub': return 'Urlaub';
      case 'homeoffice': return 'Homeoffice';
      case 'zeitkorrektur': return 'Zeitkorrektur';
      case 'sonderurlaub': return 'Sonderurlaub';
      default: return type;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleApprove = () => {
    onApprove(request.id, comment);
    setComment('');
    onClose();
  };

  const handleReject = () => {
    onReject(request.id, comment);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🏖️</span>
            Genehmigungs-Antrag
          </DialogTitle>
          <DialogDescription>
            Prüfen Sie die Details und treffen Sie eine Entscheidung
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type and Status Badges */}
          <div className="flex gap-2">
            <Badge variant="outline">
              {getTypeLabel(request.type)}
            </Badge>
            <Badge variant="outline" className="border-red-300 text-red-600">
              Ausstehend
            </Badge>
          </div>

          {/* Employee Info Card */}
          <div className="bg-yellow-50 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-yellow-200">
              <Avatar className="h-10 w-10 bg-primary">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(request.employeeName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{request.employeeName}</p>
                <p className="text-sm text-muted-foreground">ID: {request.employeeId}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Zeitraum:</span>
                <span className="font-medium">{request.dateRange}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Dauer:</span>
                <span className="font-medium">{request.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Standort:</span>
                <span className="font-medium">{request.location}</span>
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Begründung</span>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm">{request.reason}</p>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Weitere Details</span>
            </div>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground">{request.details}</p>
            </div>
          </div>

          {/* Attachments Section */}
          {request.attachments.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">Anhänge</span>
              </div>
              <div className="bg-muted rounded-lg p-3">
                {request.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{attachment}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comment Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Kommentar (optional)</span>
            </div>
            <Textarea 
              placeholder="Fügen Sie einen Kommentar hinzu..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Genehmigen
            </Button>
            <Button 
              variant="destructive"
              className="flex-1"
              onClick={handleReject}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Ablehnen
            </Button>
            <Button 
              variant="outline"
              onClick={onClose}
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDetailDialog;
