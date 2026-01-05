
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Clock, TrendingUp, Calendar, Euro } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface OvertimeData {
  currentMonth: number;
  currentWeek: number;
  total: number;
  pending: number;
  approved: number;
  compensated: number;
}

interface OvertimeRequest {
  id: string;
  hours: number;
  type: 'payout' | 'time_off' | 'flex_time';
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  reason: string;
}

const OvertimeManagement = () => {
  const [overtimeData, setOvertimeData] = useState<OvertimeData>({
    currentMonth: 12.5,
    currentWeek: 3.2,
    total: 45.7,
    pending: 8.5,
    approved: 25.2,
    compensated: 12.0
  });

  const [requests, setRequests] = useState<OvertimeRequest[]>([]);

  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    hours: '',
    type: 'time_off' as 'payout' | 'time_off' | 'flex_time',
    reason: ''
  });

  const { toast } = useToast();

  const handleSubmitRequest = () => {
    if (!newRequest.hours || !newRequest.reason) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte alle Felder ausfüllen.",
      });
      return;
    }

    const request: OvertimeRequest = {
      id: Date.now().toString(),
      hours: parseFloat(newRequest.hours),
      type: newRequest.type,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0],
      reason: newRequest.reason
    };

    setRequests(prev => [...prev, request]);
    setShowRequestDialog(false);
    setNewRequest({ hours: '', type: 'time_off', reason: '' });

    toast({
      title: "Antrag eingereicht",
      description: `Ihr Überstunden-Antrag über ${newRequest.hours}h wurde eingereicht.`,
    });
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'payout': 'Auszahlung',
      'time_off': 'Freizeitausgleich',
      'flex_time': 'Gleitzeitkonto'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-500',
      'approved': 'bg-green-500',
      'rejected': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const calculateOvertimeValue = (hours: number, hourlyRate: number = 25) => {
    return (hours * hourlyRate * 1.25).toFixed(2); // 25% Zuschlag
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Überstunden-Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {overtimeData.currentWeek}h
              </div>
              <div className="text-sm text-gray-600">Diese Woche</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {overtimeData.currentMonth}h
              </div>
              <div className="text-sm text-gray-600">Dieser Monat</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {overtimeData.total}h
              </div>
              <div className="text-sm text-gray-600">Gesamt</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {overtimeData.pending}h
              </div>
              <div className="text-sm text-gray-600">Offen</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Aufschlüsselung:</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-green-50">
                  Genehmigt: {overtimeData.approved}h
                </Badge>
                <Badge variant="outline" className="bg-blue-50">
                  Ausgeglichen: {overtimeData.compensated}h
                </Badge>
                <Badge variant="outline" className="bg-yellow-50">
                  Ausstehend: {overtimeData.pending}h
                </Badge>
              </div>
            </div>

            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Clock className="h-4 w-4 mr-2" />
                  Antrag stellen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Überstunden-Antrag</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Anzahl Stunden</label>
                    <input
                      type="number"
                      step="0.5"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      value={newRequest.hours}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, hours: e.target.value }))}
                      placeholder="z.B. 8.5"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Ausgleichsart</label>
                    <Select
                      value={newRequest.type}
                      onValueChange={(value) => setNewRequest(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time_off">Freizeitausgleich</SelectItem>
                        <SelectItem value="flex_time">Gleitzeitkonto</SelectItem>
                        <SelectItem value="payout">Auszahlung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newRequest.type === 'payout' && newRequest.hours && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <Euro className="h-4 w-4" />
                        <span className="font-medium">
                          Auszahlungsbetrag: €{calculateOvertimeValue(parseFloat(newRequest.hours))}
                        </span>
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        (inkl. 25% Überstundenzuschlag)
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Begründung</label>
                    <Textarea
                      className="mt-1"
                      value={newRequest.reason}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Grund für die Überstunden (z.B. Projektabschluss, Vertretung...)"
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleSubmitRequest} className="w-full">
                    Antrag einreichen
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meine Anträge</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Keine Anträge vorhanden
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {request.hours}h - {getTypeLabel(request.type)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {request.reason}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Eingereicht am {new Date(request.requestDate).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status === 'pending' && 'Ausstehend'}
                    {request.status === 'approved' && 'Genehmigt'}
                    {request.status === 'rejected' && 'Abgelehnt'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OvertimeManagement;
