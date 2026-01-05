
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, AlertTriangle, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TimeApprovalEntry {
  id: string;
  employeeName: string;
  date: string;
  originalHours: number;
  correctedHours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  project?: string;
  location?: string;
}

const TimeApprovalWorkflow = () => {
  const [pendingApprovals, setPendingApprovals] = useState<TimeApprovalEntry[]>([
    {
      id: '1',
      employeeName: 'Max Mustermann',
      date: '2024-01-15',
      originalHours: 8.0,
      correctedHours: 9.5,
      reason: 'Projektmeeting ging länger als geplant',
      status: 'pending',
      submittedAt: '2024-01-16T09:15:00',
      project: 'Website Redesign',
      location: 'Büro'
    },
    {
      id: '2',
      employeeName: 'Anna Schmidt',
      date: '2024-01-14',
      originalHours: 7.5,
      correctedHours: 8.0,
      reason: 'Zeiterfassung vergessen zu stoppen',
      status: 'pending',
      submittedAt: '2024-01-15T16:30:00',
      project: 'Kundensupport',
      location: 'Home Office'
    }
  ]);

  const [selectedEntry, setSelectedEntry] = useState<TimeApprovalEntry | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');

  const { toast } = useToast();

  const handleApproval = (entryId: string, action: 'approve' | 'reject') => {
    const entry = pendingApprovals.find(e => e.id === entryId);
    if (!entry) return;

    setSelectedEntry(entry);
    setApprovalAction(action);
    setShowApprovalDialog(true);
  };

  const confirmApproval = () => {
    if (!selectedEntry) return;

    if (approvalAction === 'reject' && !rejectionReason.trim()) {
      toast({
        variant: "destructive",
        title: "Begründung erforderlich",
        description: "Bitte geben Sie eine Begründung für die Ablehnung an.",
      });
      return;
    }

    setPendingApprovals(prev => 
      prev.map(entry => 
        entry.id === selectedEntry.id 
          ? { ...entry, status: approvalAction === 'approve' ? 'approved' : 'rejected' }
          : entry
      )
    );

    toast({
      title: approvalAction === 'approve' ? "Zeiterfassung genehmigt" : "Zeiterfassung abgelehnt",
      description: `Die Zeitkorrektur von ${selectedEntry.employeeName} wurde ${approvalAction === 'approve' ? 'genehmigt' : 'abgelehnt'}.`,
    });

    setShowApprovalDialog(false);
    setSelectedEntry(null);
    setRejectionReason('');
  };

  const formatTime = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-500',
      'approved': 'bg-green-500',
      'rejected': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Zeiterfassung Genehmigungen
            {pendingApprovals.filter(e => e.status === 'pending').length > 0 && (
              <Badge variant="destructive">
                {pendingApprovals.filter(e => e.status === 'pending').length} offen
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Keine Genehmigungen ausstehend
            </div>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{entry.employeeName}</span>
                      <Badge className={getStatusColor(entry.status)}>
                        {entry.status === 'pending' && 'Ausstehend'}
                        {entry.status === 'approved' && 'Genehmigt'}
                        {entry.status === 'rejected' && 'Abgelehnt'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(entry.submittedAt).toLocaleDateString('de-DE')} {new Date(entry.submittedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Datum:</span>
                      <div className="font-medium">{new Date(entry.date).toLocaleDateString('de-DE')}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Original:</span>
                      <div className="font-medium">{formatTime(entry.originalHours)}h</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Korrigiert:</span>
                      <div className="font-medium text-blue-600">{formatTime(entry.correctedHours)}h</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Differenz:</span>
                      <div className={`font-medium ${entry.correctedHours > entry.originalHours ? 'text-red-600' : 'text-green-600'}`}>
                        {entry.correctedHours > entry.originalHours ? '+' : ''}{formatTime(entry.correctedHours - entry.originalHours)}h
                      </div>
                    </div>
                  </div>

                  {(entry.project || entry.location) && (
                    <div className="flex gap-4 text-sm">
                      {entry.project && (
                        <div>
                          <span className="text-gray-600">Projekt:</span>
                          <span className="ml-2 font-medium">{entry.project}</span>
                        </div>
                      )}
                      {entry.location && (
                        <div>
                          <span className="text-gray-600">Standort:</span>
                          <span className="ml-2 font-medium">{entry.location}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-gray-50 p-3 rounded">
                    <span className="text-gray-600 text-sm">Begründung:</span>
                    <div className="mt-1">{entry.reason}</div>
                  </div>

                  {entry.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproval(entry.id, 'approve')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Genehmigen
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleApproval(entry.id, 'reject')}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Ablehnen
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Zeiterfassung genehmigen' : 'Zeiterfassung ablehnen'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium">{selectedEntry.employeeName}</div>
                <div className="text-sm text-gray-600">
                  {new Date(selectedEntry.date).toLocaleDateString('de-DE')} • 
                  {formatTime(selectedEntry.originalHours)}h → {formatTime(selectedEntry.correctedHours)}h
                </div>
                <div className="mt-2 text-sm">{selectedEntry.reason}</div>
              </div>

              {approvalAction === 'reject' && (
                <div>
                  <label className="text-sm font-medium">Begründung für Ablehnung</label>
                  <Textarea
                    className="mt-1"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Bitte geben Sie eine Begründung für die Ablehnung an..."
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={confirmApproval}
                  className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                  variant={approvalAction === 'reject' ? 'destructive' : 'default'}
                >
                  {approvalAction === 'approve' ? 'Genehmigen' : 'Ablehnen'}
                </Button>
                <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                  Abbrechen
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeApprovalWorkflow;
